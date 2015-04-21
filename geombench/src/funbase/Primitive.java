/*
 * Primitive.java
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

import java.util.*;
import java.io.*;
import java.lang.reflect.*;
import java.lang.annotation.*;

import funbase.Evaluator.*;
import funbase.Value.FunValue;
import funbase.Value.WrongKindException;

/** A value that represents a primitive function like 'sqrt' or '+'. */
public abstract class Primitive extends Function {
    /** Name of the primitive */
    public final String name;

    protected Primitive(String name, int arity) {
	super(arity);
	this.name = name;
    }

    // Putting these casting methods here makes them available for use
    // in any primitive.  Errors are reported with a message that names
    // the primitive concerned.

    /** Report error when argument is not what we expected */
    public void expect(String expected) {
	Evaluator.expect(name, expected);
    }

    /** Fetch value of a NumValue object, or throw EvalException */
    public double number(Value a) {
	try {
	    return a.asNumber();
	}
	catch (WrongKindException _) {
	    expect("a numeric");
	    return 0.0;
	}
    }

    /** Fetch value of a StringValue object, or throw EvalException */ 
    public String string(Value a) {
	Value.StringValue s = 
	    cast(Value.StringValue.class, a, "a string");
	return s.text;
    }
    
    /** Cast an argument to type Name */
    public Name name(Value a) {
	return cast(Name.class, a, "a name");
    }

    /** Fetch head of a ConsValue object, or throw EvalException */ 
    public Value head(Value xs) {
	Value.ConsValue cell = 
	    cast(Value.ConsValue.class, xs, "a list");
	return cell.head;
    }

    /** Fetch tail of a ConsValue object, or throw EvalException */ 
    public Value tail(Value xs) {
	Value.ConsValue cell = 
	    cast(Value.ConsValue.class, xs, "a list");
	return cell.tail;
    }

    /** Test if a value is a cons */
    public boolean isCons(Value xs) {
	return xs instanceof Value.ConsValue;
    }

    /** Compute length of a list argument */ 
    public int listLength(Value xs) {
	Value ys = xs;
	int n = 0; 
        while (isCons(ys)) {
            ys = tail(ys); n++;
        }
        if (! ys.equals(Value.nil)) expect("a list");
        return n;
    }

    /** Cast an argument to some specified class */
    public <T> T cast(Class<T> cl, Value v, String expected) {
        try {
            return cl.cast(v);
        }
        catch (ClassCastException _) {
            expect(expected);
            return null;
        }
    }

    /** Convert list argument to array */
    public Value[] toArray(Value xs) {
	return toArray(Value.class, xs, "a list");
    }

    /** Convert list argument to array of specified class */
    public <T extends Value> T[] 
		      toArray(Class<T> cl, Value xs, String expected) {
	List<T> elems = new ArrayList<T>();

	while (isCons(xs)) {
	    elems.add(cast(cl, head(xs), expected));
	    xs = tail(xs);
	}

	if (! xs.equals(Value.nil)) expect(expected);

	@SuppressWarnings("unchecked")
	T result[] = (T[]) Array.newInstance(cl, elems.size());
	return elems.toArray(result);
    }

    /* Primitives are replaced by Memento objects when making a serialized 
     * stream. This provides independence of the stream from the particular 
     * classes that are used to implement the primitives. */
    
    protected Object writeReplace() {
	return new Memento(this);
    }
    
    /** A primitive with zero arguments. */
    public static abstract class Prim0 extends Primitive {
	public Prim0(String name) { super(name, 0); }

	@Override
	public abstract Value apply0();

	@Override
	public Value apply(Value args[], int base, int nargs) {
	    if (nargs != 0) Evaluator.err_nargs(name, nargs, 0);
	    return apply0();
	}
    }

    /** A primitive with one argument. */
    public static abstract class Prim1 extends Primitive {
	public Prim1(String name) { super(name, 1); }

	@Override
	public abstract Value apply1(Value x);

	@Override
	public Value apply(Value args[], int base, int nargs) {
	    if (nargs != 1) Evaluator.err_nargs(name, nargs, 1);
	    return apply1(args[base+0]);
	}
    }

    /** A primitive with two arguments. */
    public static abstract class Prim2 extends Primitive {
	public Prim2(String name) { super(name, 2); }

	@Override
	public abstract Value apply2(Value x, Value y);

	@Override
	public Value apply(Value args[], int base, int nargs) {
	    if (nargs != 2) Evaluator.err_nargs(name, nargs, 2);
	    return apply2(args[base+0], args[base+1]);
	}
    }

    /** A primitive with three arguments. */
    public static abstract class Prim3 extends Primitive {
	public Prim3(String name) { super(name, 3); }

	@Override
	public abstract Value apply3(Value x, Value y, Value z);

	@Override
	public Value apply(Value args[], int base, int nargs) {
	    if (nargs != 3) Evaluator.err_nargs(name, nargs, 3);
	    return apply3(args[base+0], args[base+1], args[base+2]);
	}
    }

    /** A primitive with four arguments. */
    public static abstract class Prim4 extends Primitive {
	public Prim4(String name) { super(name, 4); }

	@Override
	public abstract Value apply4(Value x, Value y, Value z,
				     Value u);

	@Override
	public Value apply(Value args[], int base, int nargs) {
	    if (nargs != 4) Evaluator.err_nargs(name, nargs, 4);
	    return apply4(args[base+0], args[base+1], args[base+2],
			  args[base+3]);
	}
    }

    /** A primitive with five arguments. */
    public static abstract class Prim5 extends Primitive {
	public Prim5(String name) { super(name, 5); }

	@Override
	public abstract Value apply5(Value x, Value y, Value z,
				     Value u, Value v);

	@Override
	public Value apply(Value args[], int base, int nargs) {
	    if (nargs != 5) Evaluator.err_nargs(name, nargs, 5);
	    return apply5(args[base+0], args[base+1], args[base+2],
			  args[base+3], args[base+4]);
	}
    }

    /** A primitive with six arguments. */
    public static abstract class Prim6 extends Primitive {
	public Prim6(String name) { super(name, 6); }

	@Override
	public abstract Value apply6(Value x, Value y, Value z,
				     Value u, Value v, Value w);

	@Override
	public Value apply(Value args[], int base, int nargs) {
	    if (nargs != 6) Evaluator.err_nargs(name, nargs, 3);
	    return apply6(args[base+0], args[base+1], args[base+2],
			  args[base+3], args[base+4], args[base+5]);
	}
    }

    /** A primitive with N arguments */
    public static abstract class PrimN extends Primitive {
	public PrimN(String name, int arity) { super(name, arity); }

	/** Invoke the primitive with arguments args[base..) */ 
	protected abstract Value applyN(Value args[], int base);

	@Override
	public Value apply(Value args[], int base, int nargs) {
	    if (nargs != arity) Evaluator.err_nargs(name, nargs, arity);
	    return applyN(args, base);
	}
    }

    public static Primitive reflect(String name, int arity, final Method meth) {
	// We could gain some efficiency by defining reflect0 ... reflect6,
	// but it's better to use dynamic code generation to avoid reflection
	// entirely.

	return new PrimN(name, arity) {
	    public Value applyN(Value args[], int base) {
		Object theArgs[] = new Object[arity+1];
		theArgs[0] = this;
		System.arraycopy(args, base, theArgs, 1, arity);
		try {
		    return (Value) meth.invoke(null, theArgs);
		}
		catch (InvocationTargetException e) {
		    Throwable e0 = e.getCause();
		    if (e0 instanceof Error)
			throw (Error) e0;
		    else if (e0 instanceof RuntimeException)
			throw (RuntimeException) e0;
		    else
			throw new Error(e0);
		}
		catch (IllegalAccessException _) {
		    throw new Error("reflection failed for " + name);
		}
	    }
	};
    }

    @Retention(RetentionPolicy.RUNTIME)
    public @interface PRIMITIVE {
	public String value() default "";
    }

    /** Register a new primitive */
    public static void register(Primitive p) {
        Name n = Name.find(p.name);
        n.setGlodef(FunValue.getInstance(p));
    }
    
    /** Find a registered primitive */
    public static Primitive find(String name) {
        Name n = Name.find(name);
        Value v = n.getGlodef();
        try {
            return (Primitive) v.subr;
        }
        catch (ClassCastException e) {
	    throw new Error(String.format("Primitive %s is not defined", name));
        }
    }
    
    /** Serialized substitute for a primitive */
    private static class Memento implements Serializable {
	private static final long serialVersionUID = 1L;
	
	private String name;
	
	public Memento(Primitive prim) {
	    this.name = prim.name;
	}
	
	private Object readResolve() throws ObjectStreamException {
	    /* Replace the memento by the genuine primitive */
            return find(name);
	}
    }
}
