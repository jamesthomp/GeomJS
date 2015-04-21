/*
 * StringPrims.java
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

import funbase.Primitive;
import funbase.Primitive.PRIMITIVE;
import funbase.Value;
import funbase.Value.*;

public class StringPrims {
    /** Concatenate two strings */
    @PRIMITIVE("^")
    public static Value concat(Primitive prim, Value s1, Value s2) {
	return StringValue.getInstance(prim.string(s1) + prim.string(s2));
    }

    /** Split a string into a list of single-character strings */
    @PRIMITIVE
    public static Value explode(Primitive prim, Value x) {
	String s = prim.string(x);
	Value result = Value.nil;
	for (int i = s.length()-1; i >= 0; i--)
	    result = Value.cons(StringValue.getInstance(s.charAt(i)), result);
	return result;
    }

    /** Concatenate a list of strings into a single string */
    @PRIMITIVE
    public static Value implode(Primitive prim, Value ys) {
	StringBuffer result = new StringBuffer();
	for (Value xs = ys; ! (xs instanceof Value.NilValue); 
	     xs = prim.tail(xs))
	    result.append(prim.string(prim.head(xs)));
	return StringValue.getInstance(result.toString());
    }

    /** Make character with specified ASCII code */
    @PRIMITIVE
    public static Value chr(Primitive prim, Value x) {
	return StringValue.getInstance((char) prim.number(x));
    }

    /** Return ASCII code of first character */
    @PRIMITIVE
    public static Value ord(Primitive prim, Value x) {
	String s = prim.string(x);
	return NumValue.getInstance(s.length() == 0 ? 0 : s.charAt(0));
    }
}
