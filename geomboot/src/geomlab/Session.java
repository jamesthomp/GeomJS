/*
 * Session.java
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

import funbase.Name;
import funbase.Primitive;
import funbase.Scanner;
import funbase.Primitive.PRIMITIVE;
import funbase.FunCode;
import funbase.FunCode.Opcode;
import funbase.Value;
import funbase.Value.FunValue;

import geomlab.Command.CommandException;

import java.io.*;
import java.lang.reflect.*;
import java.util.List;
import java.util.ArrayList;

/** This class provides static methods for serializing the GeomLab session
 *  state into a file, and reloading a saved session state.   The saved state
 *  consists of the set of loaded plugins and all global definitions, also the
 *  syntax table from the lexer, but does not include the command history. 
 *
 *  Other bits of global state that are not saved: the time and space
 *  limits in Evaluator, the palette of colours in Picture. */
public class Session {
    /** Signature for saved sessions (spells "GEOM") */
    private static final int SIG = 0x47454f4d;
    
    /** Version ID for saved sessions */
    private static final int VERSION = 10000; 
    
    /** Table of loaded plugins */
    private static List<String> plugins = new ArrayList<String>(10);
    
    /** Load the basic classes for bootstrapping */
    public static void loadBasics() throws CommandException {
    }

    /** Load a class containing primitives */
    public static void loadPlugin(Class<?> plugin) throws CommandException {
	if (plugins.contains(plugin.getName())) return;
	plugins.add(plugin.getName());

	try {
	    // Look for the PRIMITIVE annotation on methods
	    for (Method m : plugin.getDeclaredMethods()) {
		PRIMITIVE spec = m.getAnnotation(PRIMITIVE.class);
		if (spec != null) {
		    String name = spec.value();
		    if (name.equals("")) name = m.getName();
		    Class params[] = m.getParameterTypes();
		    // Cross your fingers
		    int arity = params.length-1;
		    Primitive p = FunCode.primitive(name, arity, m);
		    Primitive.register(p);
		}
	    }

	    // Class variables too
	    for (Field f : plugin.getDeclaredFields()) {
		PRIMITIVE spec = f.getAnnotation(PRIMITIVE.class);
		if (spec != null) {
		    Primitive p = (Primitive) f.get(null);
		    Primitive.register(p);
		}
	    }
	}
	catch (Exception e) {
	    throw new CommandException(e.toString(), "#nohelp"); 
	}
    }

    /** Load saved session state from a file */
    public static void loadSession(File file) throws CommandException {
        String name = file.getName();
	try {
            InputStream inraw = 
        	new BufferedInputStream(new FileInputStream(file));
            loadSession(name, inraw);
        }
        catch (FileNotFoundException e) {
            throw new CommandException(
        	    "Can't read " + name, "#nofile");
        }
    }
    
    /** Load from a resource in the classpath (e.g. the prelude file) */
    protected static void loadResource(String name) 
    		throws CommandException {
        ClassLoader loader = Session.class.getClassLoader();
        InputStream stream = loader.getResourceAsStream(name);

        if (stream == null)
            throw new CommandException(
        	    "Can't read resource " + name, "#noresource");

        loadSession(name, stream);
    }

    @SuppressWarnings("unchecked")
    private static void loadSession(String name, InputStream inraw)
	    throws CommandException {
	try {
	    ObjectInputStream in = new ObjectInputStream(inraw);
	    int sig = in.readInt();
	    if (sig != SIG)
		throw new CommandException("Sorry, file " + name 
					   + " is not a saved session",
					   "#badformat");
	    int version = in.readInt();
	    if (version != VERSION)
		throw new CommandException("Sorry, file " + name
		    + "was saved by a different version of GeomLab",
		    "#badversion");
	
	    // Install the same plugins
	    plugins.clear();
            Name.clearNameTable();
	    List<String> sessionPlugins = (List<String>) in.readObject();
	    for (String x : sessionPlugins)
                loadPlugin(Class.forName(x));
	
	    // Read definitions for global names
	    Name.readNameTable(in);
	    
	    // Read contents of edit buffer
	    GeomBase.theApp.setEditText((String) in.readObject());
	}
	catch (IOException e) {
	    throw new CommandException("I/O failed while reading " + name
		+ " - " + e, "#readfail");
	}
	catch (ClassNotFoundException e) {
	    throw new CommandException(
		"Couldn't find class " + e.getMessage(),
		"#missingclass");
	}
	finally {
	    try { inraw.close(); } catch (IOException e) { /* Ignore */ }
	}
    }
    
    /** Save the session state on a file */
    public static void saveSession(File file) throws CommandException {
        try {
            OutputStream outraw =
        	new BufferedOutputStream(new FileOutputStream(file));
            try {
        	ObjectOutputStream out = new ObjectOutputStream(outraw);
        	out.writeInt(SIG);
        	out.writeInt(VERSION);
        	out.writeObject(plugins);
        	Name.writeNameTable(out);
        	out.writeObject(GeomBase.theApp.getEditText());
        	out.flush();
            }
            catch (IOException e) {
        	throw new CommandException(
        		"I/O failed while writing " + file.getName()
        		+ " - " + e,
        		"#writefail");
            }
            finally {
        	try { outraw.close(); } catch (IOException e) { /* Ignore */ }
            }
        }
        catch (FileNotFoundException e) { 
            throw new CommandException("Couldn't write " + file.getName(),
        	    "#nowrite");
        }
    }

    public static abstract class Bootstrap {
        public static void define(String name, Value val) {
            Name x = Name.find(name);
            x.setGlodef(val, null);
        }

        public static class Instr { 
            public Opcode op;
            public int arg;

            public Instr(Opcode op, int arg) {
                this.op = op; this.arg = arg;
            }
        }

        public static class Body {
            public Instr instrs[];

            public Body(Instr instrs[]) {
                this.instrs = instrs;
            }
        }

        public static Value number(double x) {
            return Value.NumValue.getInstance(x);
        }

        public static Value truth = Value.BoolValue.truth,
            falsity = Value.BoolValue.falsity;

        public static Value string(String x) {
            return Value.StringValue.getInstance(x);
        }

        public static Body body(Instr... instrs) {
            return new Body(instrs);
        }

        public static Instr instr(Opcode op) {
            return new Instr(op, FunCode.NO_RAND);
        }

        public static Instr instr(Opcode op, int arg) {
            return new Instr(op, arg);
        }

        public static Value[] consts(Value... lits) {
            return lits;
        }

        public static FunCode funcode(String name, int arity, int fsize, 
                                      int ssize, Body body, Value consts[]) {
            Instr code[] = body.instrs;
            int nops = code.length;
            Opcode ops[] = new Opcode[nops];
            int rands[] = new int[nops];

            for (int i = 0; i < nops; i++) {
                ops[i] = code[i].op;
                rands[i] = code[i].arg;
            }

            return new FunCode(name, arity, fsize, ssize, ops, rands, consts);
        }

        public static Value closure(FunCode body) {
            return body.makeClosure(new Value[1]);
        }

        public static Name name(String s) {
            return Name.find(s);
        }

        public abstract void boot();
    }

    public static void bootStrap(String bootname) {
        try {
            Class<?> cl = Class.forName(bootname);
            Bootstrap boot = (Bootstrap) cl.newInstance();

            loadPlugin(geomlab.GeomBase.class);
            loadPlugin(funbase.FunCode.class);
            loadPlugin(funbase.Name.class);
            loadPlugin(funbase.Evaluator.class);
            loadPlugin(funbase.Function.class);
            loadPlugin(plugins.BasicPrims.class);
            loadPlugin(plugins.StringPrims.class);
            loadPlugin(plugins.Cell.class);
            loadPlugin(plugins.Hash.class);

            boot.boot();
        }
        catch (Exception e) {
            throw new Error(e);
        }
    }
}
