/*
 * Function.java
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

package funbase;

import funbase.Value.FunValue;
import funbase.Primitive.PRIMITIVE;

import java.io.PrintWriter;
import java.io.Serializable;

/** A function on values.  This superclass represents a dummy function
    that cannot be called; subclasses represent primitives and functions
    defined in the Fun language. */
public abstract class Function {
    private static final long serialVersionUID = 1L;
    
    public final int arity;
    
    public Function(int arity) {
	this.arity = arity;
    }

    /** Apply the function to a list of arguments. */
    public Value apply(Value args[], int nargs) {
	return apply(args, 0, nargs);
    }

    /** Apply the function to a list of arguments with base. */
    public abstract Value apply(Value args[], int base, int nargs);
    
    /* The default is for the apply<n> methods to delegate to the
       general apply method.  For JIT functions with a small number of
       arguments, one of the apply<n> methods can be overridden, so
       that calls with the correct number of arguments go directly,
       without allocating an argument array.  Then the general apply
       method will also be overridden to call the specific method if
       the number of arguments is correct.  The other apply<n> methods
       remain as delegating to the general one, and so let the general
       method give an error message when the number of arguments is
       wrong. */

    /** Apply the function to 0 arguments */
    public Value apply0() {
	return apply(null, 0);
    }

    /** Apply the function to 1 argument */
    public Value apply1(Value x) {
	return apply(new Value[] { x }, 1);
    }

    /** Apply the function to 2 arguments */
    public Value apply2(Value x, Value y) {
	return apply(new Value[] { x, y }, 2);
    }

    /** Apply the function to 3 arguments */
    public Value apply3(Value x, Value y, Value z) {
	return apply(new Value[] { x, y, z }, 3);
    }

    /** Apply the function to 4 arguments */
    public Value apply4(Value x, Value y, Value z,
			Value u) {
	return apply(new Value[] { x, y, z, u }, 4);
    }

    /** Apply the function to 5 arguments */
    public Value apply5(Value x, Value y, Value z,
			Value u, Value v) {
	return apply(new Value[] { x, y, z, u, v }, 5);
    }

    /** Apply the function to 6 arguments */
    public Value apply6(Value x, Value y, Value z,
			Value u, Value v, Value w) {
	return apply(new Value[] { x, y, z, u, v, w }, 6);
    }

    /** Match the value as a constructor */
    public Value[] pattMatch(Value obj, int nargs) {
	Evaluator.err_match();
	return null;
    }

    public void dumpJava(int indent, PrintWriter out) {
	throw new Error("dumping a dummy function");
    }

    public void dumpJavascript(int indent, PrintWriter out) {
        throw new Error("dumping a dummy function");
    }

    /** Method called by FunValue.writeReplace to determine a proxy. */
    public Object serialProxy(Value.FunValue funval) {
	return funval;
    }
    
    /** Method called by FunValue.readResolve to build a closure */
    public Function resolveProxy(Value.FunValue funval) {
	return this;
    }

    /** A (code, context) pair.  Subclasses are used to represent various
	kinds of compiled function, and instances of this superclass
	represent serialized functions that will be recompiled on loading. */
    public static class Closure extends Function {
	private static final long serialVersionUID = 1L;

        /** Code for the function body */
        protected FunCode code;
    
        /** Values for the free variables of the closure */
        protected Value fvars[];
        
        public Closure(int arity) { super(arity); }
    
        public Closure(int arity, FunCode code, Value fvars[]) {
            super(arity);
            this.code = code;
            this.fvars = fvars;
        }

	public FunCode getCode() { return code; }

	@Override
	public Value apply(Value args[], int base, int arity) {
	    throw new Error("Calling an abstract closure");
	}

        @Override
        public void dumpJava(int indent, PrintWriter out) {
            if (fvars != null && fvars.length > 1)
        	throw new Error("Dumping a closure with free variables");
            out.printf("closure(");
            code.dumpJava(indent, out);
            out.printf(")");
        }

        @Override
        public void dumpJavascript(int indent, PrintWriter out) {
            if (fvars != null && fvars.length > 1)
                throw new Error("Dumping a closure with free variables");
            code.dumpJavascript(indent, out);
        }

        @Override
        public Value serialProxy(Value.FunValue funval) {
            /* All user functions serialize as funcode, and are rebuilt on
	       loading. For JIT functions, that means that they are 
	       translated again, typically on first use.  An interpreter
	       function can be serialized in one instance of GeomLab
	       and then become a JIT function when it is deserialized
	       in an other instance. */
            
            // Must copy the fvars before tying the knot.
            Value fvars1[] = new Value[fvars.length];
            System.arraycopy(fvars, 1, fvars1, 1, fvars.length-1);
            Value result = 
        	FunValue.getInstance(new Function.Closure(arity, code, fvars1));
            fvars1[0] = result;
            return result;
        }

        /* There's potentially a big problem here: because the closure
           graph can be cyclic in arbitrary ways, we need to be
           sure that there are no other references to this memento 
           that are deserialized before readResolve() gets to replace 
           the memento with a proper JIT translation.  But it's all OK, 
           because the only reference to the memento is from the FunValue 
           wrapper that surrounds it.  The FunValue wrapper is not 
           readResolved, so it can safely be shared. */
    
        @Override
        public Function resolveProxy(Value.FunValue funval) {
            // Ask the body to build a closure.
            return code.buildClosure(funval, fvars);
        }
    }

    public interface Factory {
	public Function newClosure(Value func, Value fvars[]);
    }

    public static final Function nullFunction = new Function(-1) {
	@Override
	public Value apply(Value args[], int base, int nargs) {
	    Evaluator.err_apply();
	    return null;
	}

	public Object readResolve() {
	    return nullFunction;
	}
    };

    @PRIMITIVE
    public static Value _apply(Primitive prim, Value x, Value y) {
        Value args[] = prim.toArray(y);
        return x.apply(args);
    }

    @PRIMITIVE
    public static Value _closure(Primitive prim, Value x) {
	FunCode body = prim.cast(FunCode.class, x, "a funcode");
	return body.makeClosure(new Value[1]);
    }
}
