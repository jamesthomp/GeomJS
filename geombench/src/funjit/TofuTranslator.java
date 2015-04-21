/*
 * TofuTranslator.java
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

import funbase.*;

/** Wrapper that delays another translator until each function is first used. */
public class TofuTranslator implements FunCode.Jit {
    /** The wrapped translator */
    protected FunCode.Jit translator;
    
    public TofuTranslator(FunCode.Jit translator) {
	this.translator = translator;
    }
    
    /* Some care is needed to avoid repeated work.  Several closures
       containing the same code may be created before any one of them
       is invoked, and then the code has already been translated by
       the time the second and subsequent closures are activated.

       Also, nested calls mean that the |subr| field of an object may
       have been fetched for an outer call before the translation is
       done by an inner call; then the special closure will be invoked
       twice, and the second invocation will find that the closure has
       already been replaced. */

    /** Translate a function.  Just makes a special closure for later. */
    @Override
    public Function.Factory translate(final FunCode funcode) {
	return new Function.Factory() {
	    protected final Function.Factory this_factory = this;

	    @Override
	    public Function newClosure(final Value func, Value fvars[]) {
		return new Function.Closure(funcode.arity, funcode, fvars) {
		    @Override
		    public Value apply(Value args[], int base, int nargs) {
			// Translate the code
			if (code.jitcode == this_factory)
			    code.jitcode = translator.translate(code);
		
			// Make a fresh closure for this instance
			if (func.subr == this)
			    func.subr = code.jitcode.newClosure(func, fvars);

			// Call the new closure
			return func.subr.apply(args, base, nargs);
		    }
		};
	    }
	};
    }

    /** Use reflection to create a primitive */
    public Primitive primitive(String name, int arity, 
			       java.lang.reflect.Method meth) {
	return translator.primitive(name, arity, meth);
    }

    @Override
    public String[] getContext(String me) {
	return translator.getContext(me);
    }

    @Override
    public void initStack() {
	translator.initStack();
    }

    @Override
    public void setRoot(Value root) {
	translator.setRoot(root);
    }
}
