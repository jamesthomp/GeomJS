/*
 * Interp.java
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

package funbase;

import java.io.BufferedWriter;
import java.io.FileWriter;
import java.io.IOException;
import java.util.Stack;
import java.lang.reflect.Method;

import funbase.Value.WrongKindException;
import plugins.Cell;
import plugins.Hash;

/** A trivial runtime translator that interprets the funcode */
public class Interp implements FunCode.Jit {
    private static Stack<FunCode> stack = new Stack<FunCode>();
    private FunCode root = null;

    /** Create a function factory that builds interpreted closures */
    @Override
    public Function.Factory translate(final FunCode funcode) {
	return new Function.Factory() {
	    @Override
	    public Function newClosure(Value func, Value fvars[]) {
		return new InterpFunction(funcode.arity, funcode, fvars);
	    }
	};
    }  

    /** Use reflection to create a primitive */
    public Primitive primitive(String name, int arity, Method meth) {
	return Primitive.reflect(name, arity, meth);
    }

    @Override
    public void initStack() {
	stack.clear();
	this.root = null;
    }

    @Override
    public void setRoot(Value root) { 
	Value.FunValue f = (Value.FunValue) root;
	Function.Closure cl = (Function.Closure) f.subr;
	this.root = cl.getCode();
    }

    @Override
    public String[] getContext(String me) {
	String caller = null, callee = me;

	for (int i = stack.size()-1; i >= 0; i--) {
	    FunCode f = stack.get(i);
	    if (f == root) break;

	    if (f.frozen) 
		callee = f.name;
	    else {
		caller = f.name;
		break;
	    }
	}

	return new String[] { caller, callee };
    }

    /** A closure containing an interpreter for funcode */
    public static class InterpFunction extends Function.Closure {
	public InterpFunction(int arity, FunCode code, Value fvars[]) {
	    super(arity, code, fvars);
	}

	private static void LogValue(Value val) {
		if (val != null) {
			if (val instanceof Value.FunValue) {
				if (val.subr instanceof Primitive)
					logg(((Primitive)val.subr).name + "\n");
				else
					logg(((InterpFunction)val.subr).code.name + "\n");
			}
			else if(val instanceof Name)
				logg(((Name)val).tag + "\n");
			else if(val instanceof Value.BoolValue)
				logg(((Value.BoolValue)val).asBoolean() + "\n");
			else if(val instanceof Hash)
				logg("hash\n");
			else if(val.equals(Value.nil))
				logg("nil\n");
			else if(val instanceof FunCode)
				logg(((FunCode)val).name + "\n");
			else if(val instanceof Cell) {
				logg("Cell: ");
				LogValue(((Cell) val).val);
				logg("\n");
			}
			else if(val instanceof Value.NumValue) {
				double num = ((Value.NumValue) val).asNumber();
				if ((num % 1) == 0)
					logg(((int)num) + "\n");
				else
					logg(num + "\n");
			}
			else if(val instanceof Value.ConsValue) {
				logg("Cons(");
				LogValue(((Value.ConsValue) val).head);
				logg(", ");
				LogValue(((Value.ConsValue) val).tail);
				logg(")");
			}
			else
				logg("un\n");
		}  else {
			logg("undef\n");
		}
	}

	private static BufferedWriter logg;
	private static int count = 0;

	private static void logg(String s) {
		if(logg == null)
			try {
				logg = new BufferedWriter(new FileWriter("C:\\Users\\James\\Documents\\diff\\1.txt", true));
			} catch (IOException e) {
				e.printStackTrace();
			}
		/*try {
			logg.write(s);
		} catch (IOException e) {
			e.printStackTrace();
		}*/
	}

	@Override
	public Value apply(Value args[], int base, int nargs) {
	    stack.push(code);

	    if (nargs != arity) 
		Evaluator.err_nargs(code.name, nargs, arity);

	    if (--Evaluator.quantum <= 0) Evaluator.checkpoint();

	    FunCode.Opcode instrs[] = code.instrs;
	    int rands[] = code.rands;
	    Value frame[] = new Value[code.fsize + code.ssize];
	    int pc = 0, trap = -1, sp = code.fsize;

	    for (;;) {
		FunCode.Opcode op = instrs[pc];
		int rand = rands[pc];
		pc++;

		logg(op.toString()  + " " + (this.count++) + " " + rand + " " + sp + " " + pc + "\n");
		logg(frame.length + "\n");
		for (int i = 0; i < frame.length; i++) {
			LogValue(frame[i]);
		}
		for (int i = 0; i < fvars.length; i++) {
			LogValue(fvars[i]);
		}
		logg("\n");

		switch (op) {
		    case GLOBAL: {
			Name x = (Name) code.consts[rand];
			Value v = x.getGlodef();
			if (v == null) Evaluator.err_notdef(x);
			frame[sp++] = v;
			break;
		    }

		    case LOCAL:
			frame[sp++] = frame[rand];
			break;

		    case ARG:
			frame[sp++] = args[base+rand];
			break;

		    case FVAR:
			frame[sp++] = fvars[rand];
			break;

		    case BIND:
			frame[rand] = frame[--sp];
			break;

		    case POP:
			sp--;
			break;

		    case QUOTE:
			frame[sp++] = code.consts[rand];
			break;

		    case NIL:
			frame[sp++] = Value.nil;
			break;

		    case CONS:
			sp--;
			frame[sp-1] = Value.cons(frame[sp-1], frame[sp]);
			break;

		    case CALL:
			sp -= rand;
			Value fun = frame[sp-1];
			frame[sp-1] = fun.subr.apply(frame, sp, rand);
			break;

		    case TCALL:
			if (rand != nargs)
			    Evaluator.err_nargs(code.name, rand, nargs);
			sp -= rand;
			System.arraycopy(frame, sp, args, base, nargs);
			pc = 0; trap = -1; sp = code.fsize;
			if (--Evaluator.quantum <= 0) Evaluator.checkpoint();
			break;

		    case CLOSURE: {
			sp -= rand;
			FunCode body = (FunCode) frame[sp-1];
			Value fvars2[] = new Value[rand+1];
			System.arraycopy(frame, sp, fvars2, 1, rand);
			frame[sp-1] = body.makeClosure(fvars2);
			break;
		    }

		    case TRAP:
			trap = rand;
			break;

		    case FAIL:
			Evaluator.err_nomatch(args, base, code.arity);
			break;

		    case JFALSE:
			try {
			    Value b = frame[--sp];
			    if (! b.asBoolean()) pc = rand;
			} catch (WrongKindException _) {
			    Evaluator.err_boolcond();
			}
			break;

		    case JUMP:
			pc = rand;
			break;

		    case RETURN:
			stack.pop();
			return frame[--sp];

		    case MPLUS:
			try {
			    sp -= 1;
			    Value.NumValue x = (Value.NumValue) frame[sp];
			    Value v = x.matchPlus(code.consts[rand]);
			    if (v != null)
				frame[sp++] = v;
			    else
				pc = trap;
			}
			catch (ClassCastException _) {
			    pc = trap;
			}
			break;

		    case MEQ:
			sp -= 2;
			if (! frame[sp].equals(frame[sp+1]))
			    pc = trap;
			break;

		    case MNIL:
			if (! (frame[--sp] instanceof Value.NilValue))
			    pc = trap;
			break;

		    case MCONS: {
			try {
			    Value.ConsValue cell = 
				(Value.ConsValue) frame[sp-1];
			    frame[sp++] = cell.head;
			} catch (ClassCastException _) {
			    pc = trap;
			}
			break;
		    }

		    case GETTAIL:
			frame[sp-1] = ((Value.ConsValue) frame[sp-1]).tail;
			break;

		    case MPRIM: {
			Value cons = frame[--sp];
			Value obj = frame[--sp];
			Value vs[] = cons.subr.pattMatch(obj, rand);
			if (vs == null)
			    pc = trap;
			else {
			    System.arraycopy(vs, 0, frame, sp, rand);
			    sp += rand;
			}
			break;
		    }

		    case PREP:
		    case PUTARG:
		    case CLOPREP:
		    case PUTFVAR:
			// Used only by JIT
			break;

		    default:
			throw new Error("bad opcode " + op);
		}
	    }
	}
    }
}
