/*
 * JitFunction.java
 * 
 * This file is part of GeomLab
 * Copyright (c) 2010 J. M. Spivey
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

import funbase.FunCode;
import funbase.Function;
import funbase.Value;
import funbase.Evaluator;

/** Superclass for all JIT-compiled functions */
public abstract class JitFunction extends Function.Closure 
    		implements Function.Factory, Cloneable {
    /** Name of the function (used for error messages) */
    protected final String name;

    /** Pool of constant values */
    protected Value consts[];

    public JitFunction(String name, int arity) {
	super(arity);
	this.name = name;
    }

    public void init(FunCode source) {
	this.code = source;
	this.consts = source.consts;
    }

    @Override
    public Function newClosure(Value func, Value fvars[]) {
	try {
	    JitFunction body = (JitFunction) clone();
	    body.fvars = fvars;
	    return body;
	} catch (CloneNotSupportedException _) {
	    throw new Error("Couldn't clone for closure");
	}
    }

    // Subclasses for functions with a small number of arguments

    /* The class Func<n> overrrides the general apply method to check
       the number of arguments and call apply<n>.  A concrete subclass
       should override apply<n> with a method that does the work. */

    public static abstract class Func0 extends JitFunction {
	public Func0(String name) { super(name, 0); }

	@Override 
	public abstract Value apply0();

	@Override 
	public Value apply(Value args[], int base, int nargs) {
	    if (nargs != 0) Evaluator.err_nargs(name, nargs, 0);
	    return apply0();
	}
    }

    public static abstract class Func1 extends JitFunction {
	public Func1(String name) { super(name, 1); }

	@Override 
	public abstract Value apply1(Value x);

	@Override 
	public Value apply(Value args[], int base, int nargs) {
	    if (nargs != 1) Evaluator.err_nargs(name, nargs, 1);
	    return apply1(args[base+0]);
	}
    }

    public static abstract class Func2 extends JitFunction {
	public Func2(String name) { super(name, 2); }

	@Override 
	public abstract Value apply2(Value x, Value y);

	@Override 
	public Value apply(Value args[], int base, int nargs) {
	    if (nargs != 2) Evaluator.err_nargs(name, nargs, 2);
	    return apply2(args[base+0], args[base+1]);
	}
    }

    public static abstract class Func3 extends JitFunction {
	public Func3(String name) { super(name, 3); }

	@Override 
	public abstract Value apply3(Value x, Value y, Value z);

	@Override 
	public Value apply(Value args[], int base, int nargs) {
	    if (nargs != 3) Evaluator.err_nargs(name, nargs, 3);
	    return apply3(args[base+0], args[base+1], args[base+2]);
	}
    }

    public static abstract class Func4 extends JitFunction {
	public Func4(String name) { super(name, 4); }

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

    public static abstract class Func5 extends JitFunction {
	public Func5(String name) { super(name, 5); }

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

    public static abstract class Func6 extends JitFunction {
	public Func6(String name) { super(name, 6); }

	@Override 
	public abstract Value apply6(Value x, Value y, Value z,
				     Value u, Value v, Value w);

	@Override 
	public Value apply(Value args[], int base, int nargs) {
	    if (nargs != 6) Evaluator.err_nargs(name, nargs, 6);
	    return apply6(args[base+0], args[base+1], args[base+2],
			  args[base+3], args[base+4], args[base+5]);
	}
    }

    public static abstract class FuncN extends JitFunction {
	public FuncN(String name, int arity) {
	    super(name, arity);
	}

	@Override 
	public abstract Value apply(Value args[], int nargs);

	@Override 
	public Value apply(Value args[], int base, int nargs) {
	    // Allow JIT functions to be called from the interpreter
	    Value args1[] = new Value[nargs];
	    System.arraycopy(args, base, args1, 0, nargs);
	    return apply(args1, nargs);
	}
    }
}
