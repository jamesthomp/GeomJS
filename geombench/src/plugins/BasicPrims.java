/*
 * BasicPrims.java
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
import funbase.Value;
import funbase.Value.*;
import funbase.Name;
import funbase.FunCode;
import funbase.Evaluator;
import funbase.Scanner;
import funbase.Primitive.PRIMITIVE;

/** Basic primitives for handling numbers, booleans and lists */
public class BasicPrims {
    @PRIMITIVE("=")
    public static Value equal(Primitive prim, Value x, Value y) {
	return BoolValue.getInstance(x.equals(y));
    }
    
    @PRIMITIVE("<>")
    public static Value unequal(Primitive prim, Value x, Value y) {
	return BoolValue.getInstance(! x.equals(y));
    }
	
    @PRIMITIVE("+")
    public static Value plus(Primitive prim, Value x, Value y) {
	return NumValue.getInstance(prim.number(x) + prim.number(y));
    }

    @PRIMITIVE("-")
    public static Value minus(Primitive prim, Value x, Value y) {
	return NumValue.getInstance(prim.number(x) - prim.number(y));
    }

    @PRIMITIVE("*")
    public static Value times(Primitive prim, Value x, Value y) {
	return NumValue.getInstance(prim.number(x) * prim.number(y));
    }

    @PRIMITIVE("/")
    public static Value divide(Primitive prim, Value x, Value y) {
	double yy = prim.number(y);
	if (yy == 0.0) Evaluator.error("#divzero");
	return NumValue.getInstance(prim.number(x) / yy);
    }
	
    @PRIMITIVE("~")
    public static Value uminus(Primitive prim, Value x) {
        return NumValue.getInstance(- prim.number(x));
    };

    @PRIMITIVE("<")
    public static Value less(Primitive prim, Value x, Value y) {
	return BoolValue.getInstance(prim.number(x) < prim.number(y));
    }

    @PRIMITIVE("<=")
    public static Value lesseq(Primitive prim, Value x, Value y) {
	return BoolValue.getInstance(prim.number(x) <= prim.number(y));
    }

    @PRIMITIVE(">")
    public static Value greater(Primitive prim, Value x, Value y) {
	return BoolValue.getInstance(prim.number(x) > prim.number(y));
    }

    @PRIMITIVE(">=")
    public static Value greatereq(Primitive prim, Value x, Value y) {
	return BoolValue.getInstance(prim.number(x) >= prim.number(y));
    }

    @PRIMITIVE
    public static Value numeric(Primitive prim, Value x) {
	return BoolValue.getInstance(x instanceof Value.NumValue);
    }
	
    @PRIMITIVE("int")
    public static Value intpart(Primitive prim, Value x) {
	return NumValue.getInstance(Math.floor(prim.number(x)));
    }

    @PRIMITIVE
    public static Value sqrt(Primitive prim, Value x) {
	double arg = prim.number(x);
	if (arg < 0.0) Evaluator.error("#sqrt");
	return NumValue.getInstance(Math.sqrt(arg));
    }

    @PRIMITIVE
    public static Value exp(Primitive prim, Value x) {
	return NumValue.getInstance(Math.exp(prim.number(x)));
    }

    @PRIMITIVE
    public static Value sin(Primitive prim, Value x) {
	return NumValue.getInstance(Math.sin(prim.number(x) * Math.PI / 180));
    }
	
    @PRIMITIVE
    public static Value cos(Primitive prim, Value x) {
	return NumValue.getInstance(Math.cos(prim.number(x) * Math.PI / 180));
    }
	
    @PRIMITIVE
    public static Value tan(Primitive prim, Value x) {
	return NumValue.getInstance(Math.tan(prim.number(x) * Math.PI / 180));
    }
	
    @PRIMITIVE
    public static Value atan2(Primitive prim, Value y, Value x) {
	return NumValue.getInstance(Math.atan2(prim.number(y), prim.number(x)) 
				  * 180 / Math.PI);
    }

    @PRIMITIVE
    public static Value random(Primitive prim) {
	return NumValue.getInstance(Math.random());
    }

    @PRIMITIVE
    public static Value name(Primitive prim, Value x) {
	return Name.find(prim.string(x));
    }

    @PRIMITIVE
    public static final Primitive cons = new Primitive.Prim2(":") {
	@Override
	public Value apply2(Value hd, Value tl) {
	    if (! isCons(tl) && ! tl.equals(Value.nil)) expect("a list");
	    return Value.cons(hd, tl);
	}
	    
	private Value args[] = new Value[2];

	@Override
	public Value[] pattMatch(Value obj, int nargs) {
	    if (nargs != 2) Evaluator.err_patnargs(name);
	    try {
		Value.ConsValue cell = (Value.ConsValue) obj;
		args[0] = cell.tail;
		args[1] = cell.head;
		return args;
	    }
	    catch (ClassCastException _) {
		return null;
	    }
	}
    };

    @PRIMITIVE
    public static Value head(Primitive prim, Value x) {
	try {
	    Value.ConsValue xs = (Value.ConsValue) x;
	    return xs.head;
	}
	catch (ClassCastException _) {
	    Evaluator.list_fail(x, "#head");
	    return null;
	}
    }
	
    @PRIMITIVE
    public static Value tail(Primitive prim, Value x) {
	try {
	    Value.ConsValue xs = (Value.ConsValue) x;
	    return xs.tail;
	}
	catch (ClassCastException _) {
	    Evaluator.list_fail(x, "#tail");
	    return null;
	}
    }
}
