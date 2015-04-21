/*
 * Name.java
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

import funbase.Primitive.PRIMITIVE;

import java.io.PrintWriter;
import java.io.IOException;
import java.io.ObjectInputStream;
import java.io.ObjectOutputStream;
import java.io.BufferedWriter;
import java.io.FileWriter;

import java.util.Map;
import java.util.HashMap;
import java.util.List;
import java.util.ArrayList;
import java.util.Collections;

/** Names in the Fun program are represented by unique Name objects.
 *  These contain a shallow binding to their value in the global
 *  environment. */
public final class Name extends Value implements Comparable<Name> {
    private static final long serialVersionUID = 1L;
	
    /** The name as a string */
    public final String tag;
    
    /** The definition in the global environment, or null */
    public transient Value glodef = null;
    
    /** For user-defined names, the text of the definition */
    private String deftext = null;
    
    /** True for names that are system-defined and may not be changed */
    private boolean frozen = false;
    
    /** True if the global definition was loaded with the session */
    private transient boolean inherited = false;

    private Name(String tag) {
	this.tag = tag;
	nameTable.put(this.tag, this);
    }
    
    /** Set the global definition and defining text */
    public void setGlodef(Value v, String text) { 
	glodef = v;
	deftext = text;
        inherited = false;
	if (freezer) frozen = true; 
    }
    
    /** Get the global definition of a name */
    public Value getGlodef() { return glodef; }
    
    /** Get the defining text */
    public String getDeftext() { return deftext; }
    
    /** Test if the global definition is unmodifiable */
    public boolean isFrozen() { return frozen && !freezer; }
    
    @Override
    public int compareTo(Name other) {
	if (this == other) return 0;
	return this.tag.compareTo(other.tag);
    }
    
    @Override
    public boolean equals(Object other) {
	if (other instanceof String)
	    return tag.equals(other);
	else
	    return this == other;
    }

    @Override
    public String toString() { return tag; }
    
    @Override
    public void printOn(PrintWriter out) {
	out.printf("#%s", tag);
    }
    
    @Override
    public void dumpJava(int indent, PrintWriter out) {
	out.printf("name(\"%s\")", tag);
    }

    @Override
    public void dumpJavascript(int indent, PrintWriter out) {
        out.printf("{ \"type\": \"name\", \"name\": \"%s\"}", tag);
    }

    /** A global mapping of strings to Name objects */
    private static Map<String, Name> nameTable = new HashMap<String, Name>(200);
    
    /** Find or create the unique Name with a given spelling */
    public static Name find(String tag) {
	Name name = nameTable.get(tag);
	if (name == null)
	    name = new Name(tag);
	return name;
    }

    /** Discard all names */
    public static void clearNameTable() {
	nameTable.clear();
        freezer = true;
    }

    /** Read global definitions from a serialized stream */
    public static void readNameTable(ObjectInputStream in) 
    		throws IOException, ClassNotFoundException {
        freezer = (Boolean) in.readObject();
	for (;;) {
	    Name x = (Name) in.readObject();
	    if (x == null) break;
	    x.glodef = (Value) in.readObject();
            x.inherited = true;
	}
    }

    /** Write global definitions to a serialized stream */
    public static void writeNameTable(ObjectOutputStream out) 
    		throws IOException {
        out.writeObject(freezer);
	for (Name x : nameTable.values()) {
	    if (x.glodef != null) {
		out.writeObject(x); 
		out.writeObject(x.glodef);
	    }
	}
	out.writeObject(null);
    }
    
    private Object readResolve() {
	/* Careful control of sharing is needed for serialization to
	   work properly.  That's why the glodef field of a Name is
	   marked transient and restored separately after the Name
	   itself: that way, references to the name from inside its
	   own global definition are linked to the unique Name object,
	   not to its temporary proxy. */

	Name x = find(this.tag);
	x.deftext = this.deftext;
	x.frozen = this.frozen;
	return x;
    }

    /** Initial definitions become frozen once this is set to false */
    public static boolean freezer = true;

    /** Get alphabetical list of globally defined names */
    public static List<String> getGlobalNames() {
        ArrayList<String> names = new ArrayList<String>(100);
        for (Name x : nameTable.values()) {
            String xx = x.tag;
            if (x.getGlodef() != null && ! xx.startsWith("_"))
        	names.add(xx);	    
        }
	Collections.sort(names);
        return names;
    }
    
    /** Save globally defined names in bootstrap format for java */
    public static void dumpNamesJava(PrintWriter out) {
	// Sort the entries to help us reach a fixpoint
	ArrayList<String> names = new ArrayList<String>(nameTable.size());
	names.addAll(nameTable.keySet());
	Collections.sort(names);

        out.printf("import static funbase.FunCode.Opcode.*;\n\n");
        out.printf("public class GeomBoot"
                   + " extends geomlab.Session.Bootstrap {\n");
        out.printf("    @Override\n");
        out.printf("    public void boot() {\n");
	for (String k : names) {
            if (k.equals("_syntax")) continue;

	    Name x = find(k);
	    if (x.glodef != null && !x.inherited 
                && !(x.glodef.subr instanceof Primitive)) {
		out.printf("        define(\"%s\", ", x.tag);
		x.glodef.dumpJava(5, out);
                out.printf(");\n");
	    }
	}
	out.printf("    }\n");
        FunCode.postDumpJava(out);
	out.printf("}\n");
	out.close();
    }

    /** Save globally defined names in bootstrap format for javascript */
    public static void dumpNamesJavascript(PrintWriter out) {
        // Sort the entries to help us reach a fixpoint
        ArrayList<String> names = new ArrayList<String>(nameTable.size());
        names.addAll(nameTable.keySet());
        Collections.sort(names);

        out.printf("{\n");
        boolean first = true;
        for (String k : names) {
            if (k.equals("_syntax")) continue;

            Name x = find(k);
            if (x.glodef != null && !x.inherited
                    && !(x.glodef.subr instanceof Primitive)) {
                if (first) {
                    out.printf("  \"%s\": ", x.tag);
                    first = false;
                } else {
                    out.printf(",\n  \"%s\": ", x.tag);
                }
                x.glodef.dumpJavascript(5, out);
            }
        }
        out.printf("}\n");
        out.close();
    }

    @PRIMITIVE
    public static Value _defined(Primitive prim, Value x) {
        Name n = prim.name(x);
        return Value.BoolValue.getInstance(n.getGlodef() != null);
    }

    @PRIMITIVE
    public static Value _glodef(Primitive prim, Value x) {
	Name n = prim.name(x);
	Value v = n.getGlodef();
	if (v == null) Evaluator.err_notdef(n);
	return v;
    }

    @PRIMITIVE
    public static Value _freeze(Primitive prim) {
	freezer = false;
	return Value.nil;
    }

    @PRIMITIVE
    public static Value _redefine(Primitive prim, Value x) {
	Name n = prim.name(x);
	if (n.isFrozen())
	    Evaluator.error("#redef", x);
	return Value.nil;
    }

    @PRIMITIVE
    public static Value _spelling(Primitive prim, Value x) {
	Name n = prim.name(x);
	return StringValue.getInstance(n.toString());
    }

    private static int g = 0;

    @PRIMITIVE
    public static Value _gensym(Primitive prim) {
	return find(String.format("$g%d", ++g));
    }

    @PRIMITIVE
    public static Value _dump(Primitive prim, Value x) {
	try {
	    String fname = prim.string(x);
	    PrintWriter out = 
		new PrintWriter(new BufferedWriter(new FileWriter(fname)));
	    dumpNamesJava(out);
	    return Value.nil;
	} catch (IOException e) {
	    throw new Error(e);
	}
    }

    @PRIMITIVE
    public static Value _dumpJavascript(Primitive prim, Value x) {
        try {
            String fname = prim.string(x);
            PrintWriter out =
                    new PrintWriter(new BufferedWriter(new FileWriter(fname)));
            dumpNamesJavascript(out);
            return Value.nil;
        } catch (IOException e) {
            throw new Error(e);
        }
    }
}
