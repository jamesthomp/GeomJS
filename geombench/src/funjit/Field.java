/*
 * Field.java
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

/** A field in a class that is being assembled. */
class Field {
    /** Access flags of this field. */
    private int access;

    /** Constant pool item for the field name */
    private final ConstPool.Item name;

    /** Constant pool item for the field's descriptor */
    private final ConstPool.Item desc;
    
    /** Constant pool item for the initializer, if any */
    private ConstPool.Item init = null;

    /** Constant pool for the enclosing class */
    private final ConstPool pool;
    
    /** The UTF8 string "ConstantValue", if needed */
    private ConstPool.Item _ConstantValue_;

    public Field(ConstPool pool, int access, String name, Type ty) {
        this.pool = pool;
        this.access = access;
        this.name = pool.utf8Item(name);
        this.desc = pool.utf8Item(ty.desc);
    }

    /** Set the ConstantValue attribute of a static field */
    public void setInit(Object x) {
	_ConstantValue_ = pool.utf8Item("ConstantValue");
	init = pool.constItem(x);
    }

    /** Return the size of the classfile representation of this field */
    public int getSize() {
	int size = 8;
	if (init != null) size += 8;
	return size;
    }

    /** Put this field into the given byte vector. */
    public void put(ByteVector out) {
        out.putShort(access);
        out.putShort(name.index);
        out.putShort(desc.index);
        int attributeCount = 0;
	if (init != null) attributeCount++;
        out.putShort(attributeCount);
	if (init != null) {
	    out.putShort(_ConstantValue_.index);
	    out.putInt(2);
	    out.putShort(init.index);
	}
    }
}
