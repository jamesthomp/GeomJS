/*
 * ClassFile.java
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

import java.util.LinkedList;
import java.util.List;

/** The bytecode for a class. */
class ClassFile {
    /** Version number for the class format */
    public static final int version = Opcodes.V1_5;

    /** Access flags */
    private int access;

    /** The class name as a string in the constant pool */
    private ConstPool.Item name;

    /** The superclass name */
    private ConstPool.Item superName;

    /** List of field declarations */
    private List<Field> fields = new LinkedList<Field>();

    /** List of method declarations */
    private List<Method> methods = new LinkedList<Method>();
    
    /** The constant pool */
    private ConstPool pool = new ConstPool();

    public static int debug = 0;

    public ClassFile(int access, String name, String superName) {
        this.access = access;
        this.name = pool.classItem(name);
        this.superName = superName == null ? null : pool.classItem(superName);
    }

    public Field addField(int access, String name, Type ty) {
	Field f = new Field(pool, access, name, ty);
	fields.add(f);
	return f;
    }

    public Method addMethod(int access, String name, Type ty) {
        Method m = new Method(pool, access, name, ty);
        methods.add(m);
        return m;
    }

    /** Return the class file as a byte array. */
    public byte[] toByteArray() {
	// Compute the real size of the bytecode
        int size = 24;
	for (Field f : fields) size += f.getSize();
        for (Method m : methods) size += m.getSize();
        size += pool.size();

	byte data[] = new byte[size];
        ByteVector out = new ByteVector(data);

        out.putInt(0xcafebabe);
        out.putInt(version);
        out.putShort(pool.nconsts());
        pool.put(out);
        out.putShort(access);
        out.putShort(name.index);
        out.putShort(superName.index);
        out.putShort(0); // No interfaces
        out.putShort(fields.size());
	for (Field f: fields) f.put(out);
        out.putShort(methods.size());
        for (Method m : methods) m.put(out);
        out.putShort(0); // No attributes

        assert out.length() == size;
        return data;
    }
}
