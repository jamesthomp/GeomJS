/*
 * InlineTranslator.java
 * 
 * This file is part of GeomLab
 * Copyright (c) 2005 J. M. Spivey
 * All rights reserved
 * 
 * Redistribution and use in source and binary forms, with or without 
 * modification, are permitted provided that the following conditions are met:
 * 
 * 1. Redistributions of source code must retain the above copyright notice, 
 *    this list of conditions and the following disclaimer.      
 * 2. Redistributions in binary form must reproduce the above copyright notice, 
 *    this list of conditions and the following disclaimer in the documentation 
 *    and/or other materials provided with the distribution.
 * 3. The name of the author may not be used to endorse or promote products 
 *    derived from this software without specific prior written permission.
 *    
 * THIS SOFTWARE IS PROVIDED BY THE AUTHOR ``AS IS'' AND ANY EXPRESS OR 
 * IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES 
 * OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. 
 * IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, 
 * SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, 
 * PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; 
 * OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, 
 * WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR 
 * OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF 
 * ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

package funjit;

import funbase.Primitive;
import funbase.Value;
import funbase.Name;
import funbase.Function;
import funbase.FunCode.Opcode;
import funbase.Value.WrongKindException;

import static funjit.Opcodes.*;
import static funjit.Opcodes.Op.*;
import static funjit.Type.*;

import java.util.*;

/** A JIT translator with inlining of some primitives, allowing unboxed
    intermediate values in expressions. */
public class InlineTranslator extends JitTranslator {
    /** Extra class names */
    private static final String
	cell_cl = "plugins/Cell",
	color_cl = "plugins/ColorValue";

    /** Stack to track inlinable primitives in a nest of calls */
    private Stack<Inliner> funstack = new Stack<Inliner>();
    
    /** Dictionary mapping primitive names to their inline
        code generators */
    private Map<String, Inliner> primdict = new HashMap<String, Inliner>();

    /** Register an inline code generator */
    private void register(Inliner c) {
	primdict.put(c.name, c);
    }

    public InlineTranslator() {
	// Add hooks to the parent to spot specific code sequences,
	// general ones before specific ones

	/* Hook to watch for other PUTARG instructions */
	addHook(new CodeHook(Opcode.PUTARG) {
	    @Override
	    public boolean compile(int rands[], int ip) {
		return convertArg(rands[ip], Kind.VALUE);
	    }
	});

	/* Hook for other CALL instructions */
	addHook(new CodeHook(Opcode.CALL) {
	    @Override
            public boolean compile(int rands[], int ip) {
		Inliner gen = funstack.pop(); // Pop anyway
		Kind k = gen.call();
		if (k != Kind.NONE) {
                    convValue(k);
                    nstack.pop();
                    return true;
                }
                return false;
	    }
	});

	/** Hook to watch for GLOBAL / PREP pairs */
	addHook(new CodeHook(Opcode.GLOBAL, Opcode.PREP) {
	    @Override
            public boolean compile(int rands[], int ip) {
		Name f = (Name) funcode.consts[rands[ip]];
                Value v = f.getGlodef();

		if (f.isFrozen() && v != null && v instanceof Value.FunValue) {
		    Function fun = ((Value.FunValue) v).subr;
		    if ((fun instanceof Primitive) 
                        && fun.arity == rands[ip+1]) {
			Primitive p = (Primitive) fun;
			Inliner c = primdict.get(p.name);
			if (c != null) {
			    funstack.push(c);
                            nstack.push(0);
			    return true;
			}
		    }
		}

		return false;
	    }
	});

	addHook(new CodeHook(Opcode.QUOTE, Opcode.PUTARG) {
	    @Override
            public boolean compile(int rands[], int ip) {
		Inliner gen = funstack.peek();
		Value v = funcode.consts[rands[ip]];
		Kind k = gen.argkind(rands[ip+1]);

		// Put numeric constants in the JVM constant pool
		if (k == Kind.NUMBER) {
		    try {
			code.gen(CONST, v.asNumber());
			return true;
		    }
		    catch (WrongKindException _) { /* PUNT */ }
		}
		
		return false;
	    }
	});

	/* Hook to watch for CALL / PUTARG */
	addHook(new CodeHook(Opcode.CALL, Opcode.PUTARG) {
	    @Override
            public boolean compile(int rands[], int ip) {
		Inliner gen = funstack.peek();
                int i = rands[ip+1];
		Kind k = gen.call();
		if (k != Kind.NONE) {
		    funstack.pop();
                    nstack.pop();
                    if (!convertArg(i, k)) genPutarg(i);
                    return true;
		}
		return false;
	    }
	});

	addHook(new CodeHook(Opcode.CALL, Opcode.JFALSE) {
	    @Override
            public boolean compile(int rands[], int ip) {
		Inliner gen = funstack.peek();
		if (gen.jcall(rands[ip+1])) {
		    funstack.pop();
                    nstack.pop();
		    return true;
		}
		return false;
	    }
	});
	
	/* Notice FVAR 0 / PREP, but leave it to the existing rule to
	   translate it */
	addHook(new CodeHook(Opcode.FVAR, Opcode.PREP) {
	    @Override
            public boolean compile(int rands[], int ip) {
		if (rands[ip] == 0) funstack.push(nullInliner);
		return false;
	    }
	});

	/* Also notice other PREP instructions */
	addHook(new CodeHook(Opcode.PREP) {
	    @Override
	    public boolean compile(int rands[], int nargs) {
		funstack.push(nullInliner);
		return false;
	    }
	});

        /* And also FRAME instructions */
	addHook(new CodeHook(Opcode.FRAME) {
	    @Override
	    public boolean compile(int rands[], int nargs) {
		funstack.push(nullInliner);
		return false;
	    }
	});

        /* And then again CLOSURE instructions */
	addHook(new CodeHook(Opcode.CLOSURE) {
	    @Override
	    public boolean compile(int rands[], int nargs) {
		funstack.pop();
		return false;
	    }
	});

	// Inliners for various common primitives
	register(new Equality("=", true));
	register(new Equality("<>", false));
	register(new Operator("+", DADD));
	register(new Operator("-", DSUB));
	register(new Operator("*", DMUL));
	register(new Operator("_uminus", DNEG));
	register(new Comparison("<", DCMPG, IFGE));
	register(new Comparison("<=", DCMPG, IFGT));
	register(new Comparison(">", DCMPL, IFLE));
	register(new Comparison(">=", DCMPG, IFLT));
	register(new ListSelect("head", "#head"));
	register(new ListSelect("tail", "#tail"));
	register(new Selector("rpart", color_cl, "colour", Kind.NUMBER));
	register(new Selector("gpart", color_cl, "colour", Kind.NUMBER));
	register(new Selector("bpart", color_cl, "colour", Kind.NUMBER));

	register(new SimpleInliner(":") {
	    @Override 
	    public Kind call() {
		code.gen(INVOKESTATIC, consval_cl, "getInstance", fun_VV_V_t);
		return Kind.VALUE;
	    }
	});

	register(new SimpleInliner("rgb", Kind.NUMBER) {
	    @Override 
	    public Kind call() {
		code.gen(INVOKESTATIC, color_cl, "getInstance",  fun_DDD_V_t);
		return Kind.VALUE;
	    }
	});

	register(new SimpleInliner("_new") {
	    @Override 
	    public Kind call() {
		code.gen(INVOKESTATIC, cell_cl, "newInstance", fun_V_V_t);
		return Kind.VALUE;
	    }
	});

	register(new Selector("_get", cell_cl, "cell", "val", Kind.VALUE));

	register(new SimpleInliner("_set") {
	    @Override 
	    public boolean putArg(int i, Kind k) {
		convValue(k);
		if (i == 0)
		    cast(cell_cl, new Expect("_set", "cell"));
		return true;
	    }

	    @Override 
	    public Kind call() {
		code.gen(DUP_X1);
		code.gen(PUTFIELD, cell_cl, "val", value_t);
		return Kind.VALUE;
	    }
	});
    }

    /** Value representations for intermediate results */
    private enum Kind { VALUE, NUMBER, BOOL, NONE }

    /** Convert a value on the stack from kind k to kind VALUE. 
	Always succeeds. */
    private void convValue(Kind k) {
	switch (k) {
	    case VALUE:
		break;
	    case NUMBER:
		code.gen(INVOKESTATIC, numval_cl, "getInstance", fun_D_V_t);
		break;
	    case BOOL:
		code.gen(INVOKESTATIC, boolval_cl, "getInstance", fun_B_V_t);
		break;
	    default:
		throw new Error("convValue");
	}
    }

    /** Convert a value on the stack from kind k1 to kind k2.  May fail,
        naming primitive |name|. */
    private void convert(String name, Kind k1, Kind k2) {
	if (k1 == k2) return;
	
	// All useful conversions can go via Value.  Conversions between
	// NUMBER and BOOLEAN will always fail, but we generate failing
	// code without complaint.
	convValue(k1); 	
	
	switch (k2) {
	    case VALUE: 
		break;
	    case NUMBER: 
		access("asNumber", fun__D_t, new Expect(name, "numeric"));
		break;
	    case BOOL: 	
		access("asBoolean", fun__B_t, new Expect(name, "boolean"));
		break;
	    default:
		throw new Error("convert");
	}
    }

    /** Convert i'th argument to suit function being called. */
    private boolean convertArg(int i, Kind k) {
	Inliner gen = funstack.peek();
	return gen.putArg(i, k);
    }

    /** Prepare for new function */
    @Override 
    protected void init() {
	super.init();
	funstack.clear();
    }

    /** A code generator for a specific primitive */
    private abstract class Inliner {
	public final String name;

	public Inliner(String name) {
	    this.name = name;
	}

	/** Return the preferred kind for an argument */
	public Kind argkind(int i) {
	    return Kind.VALUE;
	}

	/** Compile code for an argument, return true if done */
	public abstract boolean putArg(int i, Kind k);

	/** Compile code for a call */
	public abstract Kind call();

	/** Compile code for a call followed by JFALSE */
	public boolean jcall(int addr) {
	    Kind k = call();
	    switch (k) {
		case BOOL:
		    code.gen(IFEQ, makeLabel(addr));
		    return true;
		case NONE:
		    return false;
		default:
		    convValue(k);
		    genJFalse(addr);
		    return true;
	    }
	}
    }

    /** An inline code generator with all args of the same kind */
    private abstract class SimpleInliner extends Inliner {
	private Kind argkind;

	public SimpleInliner(String name) {
	    this(name, Kind.VALUE);
	}

	public SimpleInliner(String name, Kind argkind) {
	    super(name);
	    this.argkind = argkind;
	}

	@Override
	public Kind argkind(int i) {
	    return argkind;
	}

	/** Compile code for an argument */
	@Override
	public boolean putArg(int i, Kind k) {
	    convert(name, k, argkind);
	    return true;
	}
    }

    /** An inliner that represents an ordinary, non-inlinable function */
    private Inliner nullInliner = new SimpleInliner("*null*") {
	@Override 
	public boolean putArg(int i, Kind k) {
	    // Convert argument to Value and punt
	    convValue(k);
	    return false;
	}

	@Override
	public Kind call() { 
	    // Refuse to handle the call
	    return Kind.NONE; 
	}
    };

    /** Inliner for = and <> */
    public class Equality extends SimpleInliner {
	private boolean sense;

	public Equality(String name, boolean sense) {
	    super(name);
	    this.sense = sense;
	}

	@Override 
	public Kind call() {
	    code.gen(INVOKEVIRTUAL, object_cl, "equals", fun_O_B_t);
	    if (! sense) {
		code.gen(CONST, 1); code.gen(IXOR);
	    }
	    return Kind.BOOL;
	}

	@Override 
	public boolean jcall(int addr) {
	    code.gen(INVOKEVIRTUAL, object_cl, "equals", fun_O_B_t);
	    code.gen((sense ? IFEQ : IFNE), makeLabel(addr));
	    return true;
	}
    }

    /** Inliner for numeric operations */
    public class Operator extends SimpleInliner {
	private Op op;

	public Operator(String name, Op op) {
	    super(name, Kind.NUMBER);
	    this.op = op;
	}

	@Override
	public Kind call() {
	    code.gen(op);
	    return Kind.NUMBER;
	}
    }

    /** Inliner for numeric comparisons */
    public class Comparison extends SimpleInliner {
	private Op cmp_op;	// Double comparison op DCMPL or DCMPG
	private Op jump_op;	// Conditional branch if condition false

	public Comparison(String name, Op cmp_op, Op jump_op) {
	    super(name, Kind.NUMBER);
	    this.cmp_op = cmp_op; this.jump_op = jump_op;
	}

	@Override 
	public Kind call() {
	    Label lab = new Label(), lab2 = new Label();    
	    code.gen(cmp_op);
	    code.gen(jump_op, lab);
	    code.gen(CONST, 1);
	    code.gen(GOTO, lab2);
	    code.label(lab);
	    code.gen(CONST, 0);
	    code.label(lab2);
	    return Kind.BOOL;
	}

	@Override 
	public boolean jcall(int addr) {
	    code.gen(cmp_op);
	    code.gen(jump_op, makeLabel(addr));
	    return true;
	}
    }

    /** Inliner for head and tail */
    public class ListSelect extends SimpleInliner {
	String errtag;

	public ListSelect(String name, String errtag) {
	    super(name);
	    this.errtag = errtag;
	}

	@Override 
	public Kind call() {
	    code.gen(DUP);
	    code.gen(ASTORE, _temp);
	    cast(consval_cl, new Handler(name, "list") {
		    @Override 
		    public void compile() {
			// Evaluator.list_fail(<msg>);
			code.gen(ALOAD, _temp);
			code.gen(CONST, errtag);
			code.gen(INVOKESTATIC, evaluator_cl, "list_fail", 
				 fun_VS_t);
		    }
		});
	    code.gen(GETFIELD, consval_cl, name, value_t);
	    return Kind.VALUE;
	}
    }	

    /** Inliner for generic field selection function */
    public class Selector extends SimpleInliner {
	private final String cl, cl_name, field;
	private final Kind kind;

	public Selector(String name, String cl, String cl_name, Kind kind) {
	    this(name, cl, cl_name, name, kind);
	}

	public Selector(String name, String cl, String cl_name,
			String field, Kind kind) {
	    super(name);
	    this.cl = cl; this.cl_name = cl_name; 
	    this.field = field; this.kind = kind;
	}

	@Override 
	public Kind call() {
	    Type ty;

	    switch (kind) {
		case VALUE: 
		    ty = value_t; break;
		case NUMBER: 
		    ty = double_t; break;
		case BOOL: 
		    ty = bool_t; break;
		default: 
		    throw new Error("Selector.call");
	    }

	    cast(cl, new Expect(name, cl_name));
	    code.gen(GETFIELD, cl, field, ty);
	    return kind;
	}
    }

    private class Expect extends Handler {
	public Expect(String prim, String tyname) {
	    super(prim, tyname);
	}

	@Override 
	public void compile() {
	    // ErrContext.expect(prim, failure);
	    Primitive p = Primitive.find(prim);
	    code.gen(CONST, p.name);
	    code.gen(CONST, failure);
	    code.gen(INVOKESTATIC, evaluator_cl, "expect", fun_SS_t);
	}
    }
}
