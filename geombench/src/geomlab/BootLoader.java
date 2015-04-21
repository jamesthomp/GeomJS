/*
 * BootLoader.java
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

package geomlab;

/** Bootstrap GeomLab from a saved state.
 * 
 *  Part of the process of building a working GeomLab system is to 
 *  input code for the compiler that was prepared using the previous
 *  incarnation of the system.  The code is written out using the
 *  method Name.dumpNames and the dump methods of various Value
 *  classes.  This class contains methods for reading it back.  Once
 *  the GeomLab system is working, this class is no longer needed, so
 *  the error handling is deliberately spartan. */

import funbase.Scanner;
import funbase.Name;
import funbase.Value;
import funbase.Value.NumValue;
import funbase.Value.BoolValue;
import funbase.Value.WrongKindException;
import funbase.FunCode;
import funbase.FunCode.Opcode;

import java.io.Reader;
import java.io.File;
import java.io.BufferedReader;
import java.io.FileReader;
import java.io.IOException;
import java.io.FileNotFoundException;

import java.util.List;
import java.util.ArrayList;

public class BootLoader {
    private Scanner scanner;
    
    public BootLoader(File file) {
        try {
            Reader reader = new BufferedReader(new FileReader(file));
            scanner = new Scanner(reader);
        }
        catch (FileNotFoundException e) {
            throw new Error("Can't read " + file.getName());
        }
    }
    
    private Name 
        ATOM = Name.find("atom"),
        IDENT = Name.find("ident"),
        BOOLEAN = Name.find("boolean"),
        NAME = Name.find("name"),
        STRING = Name.find("string"),
        NUMBER = Name.find("number"),
        FUNCODE = Name.find("funcode"),
        BYTECODE = Name.find("bytecode"),
        CLOSURE = Name.find("closure"),
        END = Name.find("end"),
        OP = Name.find("op"),
        MINUS = Name.find("-");

    /** Read a sequence of global value definitions. */
    public void boot() {
	scanner.scan();
	while (true) {
	    if (see(END)) break;
	    Name name = (Name) get(ATOM);
	    name.bootDef(value());
	}
    }
    
    /** Read a value from the bootfile */
    private Value value() {
	Value t = get(IDENT);
	if (t == BOOLEAN)
	    return BoolValue.getInstance(getInt() != 0);
	else if (t == NAME)
	    return get(ATOM);
	else if (t == STRING)
	    return get(STRING);
	else if (t == NUMBER)
	    return NumValue.getInstance(getInt());
	else if (t == BYTECODE)
            return bytecode();
	else if (t == CLOSURE)
            return closure((FunCode) value());
	else
	    throw new Error("BootLoader.value " + t);
    }
    
    private Value closure(FunCode body) {
        return body.makeClosure(new Value[1]);
    }

    private Value bytecode() {
        /* Bytecode for a function. */
        String name = getString();
        int arity = getInt();
        List<Opcode> ops = new ArrayList<Opcode>();
        List<Integer> rands = new ArrayList<Integer>();
        List<Value> consts = new ArrayList<Value>();

        while (true) {
            if (see(END)) break;
            Value op = get(IDENT);
            ops.add(FunCode.getOpcode(op.toString()));
            if (scanner.tok != NUMBER)
                rands.add(FunCode.NO_RAND);
            else
                rands.add(getInt());
        }
        scanner.scan();
        while (true) {
            if (see(END)) break;
            consts.add(value());
        }
        scanner.scan();

        return new FunCode(name, arity,
                           ops.toArray(new Opcode[ops.size()]), 
                           makeIntArray(rands), 
                           consts.toArray(new Value[consts.size()]));
    }

    private int[] makeIntArray(List<Integer> xs) {
        int i = 0, n = xs.size();
        int result[] = new int[n];
        for (Integer a : xs) result[i++] = a;
        return result;
    }

    private boolean see(Name t) {
        return ((scanner.tok == IDENT || scanner.tok == OP)
                && scanner.sym == t);
    }

    /** Check for a given token and return its value */
    private Value get(Name t) {
        if (scanner.tok != t) 
            throw new Error("expected " + t + " got " + scanner.tok 
                            + " " + scanner.sym + " on line " 
                            + scanner.line_num);
        Value s = scanner.sym;
        scanner.scan(); 
        return s;
    }
    
    /** Return the next token as a string */
    private String getString() {
        try {
            Value.StringValue s = (Value.StringValue) get(STRING);
            return s.text;
        }
        catch (ClassCastException _) {
            throw new Error("missing string");
        }
    }

    /** Scan and return an integer */
    private int getInt() {
        boolean neg = false;
        if (see(MINUS)) {
            scanner.scan();
            neg = true;
        }
        try {
            Value x = get(NUMBER);
            int n = (int) x.asNumber();
            return (neg ? -n : n);
        }
        catch (WrongKindException _) {
            throw new Error("missing number");
        }
    }

    public static void bootstrap(File bootfile) {
        BootLoader boot = new BootLoader(bootfile);
        Session.initialize();
        boot.boot();
    }
}
