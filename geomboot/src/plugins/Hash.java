/*
 * Hash.java
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

package plugins;

import java.io.PrintWriter;
import java.util.*;

import funbase.Evaluator;
import funbase.Primitive;
import funbase.Primitive.PRIMITIVE;
import funbase.Value;

/** A mutable table. */
public class Hash extends Value {
    private static final long serialVersionUID = 1L;

    private Map<Value, Value> mapping;
    
    private Hash() { 
        mapping = new HashMap<Value, Value>();
    }
   
    private Hash(Map<Value, Value> parent) {
        mapping = new HashMap<Value, Value>(parent);
    }

    public static Hash newInstance() {
	Evaluator.countCons();
	return new Hash(); 
    }

    @Override
    public void printOn(PrintWriter out) {
	out.print("<hash>");
    }
    
    @PRIMITIVE
    public static Value _hash(Primitive prim) {
        return newInstance();
    }

    @PRIMITIVE
    public static Value _clone(Primitive prim, Value m) {
        Hash t = prim.cast(Hash.class, m, "a hash");
        Evaluator.countCons();
        return new Hash(t.mapping);
    }

    @PRIMITIVE
    public static Value _lookup(Primitive prim, Value m, Value x) {
	Hash t = prim.cast(Hash.class, m, "a hash");
        Value y = t.mapping.get(x);
        if (y != null)
            return y;
        else
            return Value.nil;
    }

    @PRIMITIVE
    public static Value _update(Primitive prim, Value m, Value x, Value y) {
	Hash t = prim.cast(Hash.class, m, "a hash");
        t.mapping.put(x, y);
	return y;
    }
}
