/*
 * Cell.java
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

import funbase.Evaluator;
import funbase.Primitive;
import funbase.Primitive.PRIMITIVE;
import funbase.Value;

/** An assignable cell, as in ML.
 * 
 *  Assignable variables aren't an official feature of the GeomLab
 *  language, but the compiler makes heavy use of them for convenience.
 *  Do as I day, not as I do! */
public class Cell extends Value {
    private static final long serialVersionUID = 1L;

    /** Contents of the cell */
    public Value val;
    
    private Cell(Value val) { 
	this.val = val; 
    }
   
    public static Value newInstance(Value val) {
        return new Cell(val);
    }

    @Override
    public void printOn(PrintWriter out) {
	out.print("ref ");
	val.printOn(out);
    }
    
    @PRIMITIVE
    public static Value _new(Primitive prim, Value x) {
	Evaluator.countCons();
	return new Cell(x); 
    }

    @PRIMITIVE
    public static Value _get(Primitive prim, Value v) {
	Cell x = prim.cast(Cell.class, v, "a cell");
	return x.val;
    }

    @PRIMITIVE
    public static Value _set(Primitive prim, Value v, Value y) {
	Cell x = prim.cast(Cell.class, v, "a cell");
	return (x.val = y);
    }
}
