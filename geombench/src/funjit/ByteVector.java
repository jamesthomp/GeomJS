/*
 * ByteVector.java
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

/** A dynamically extensible vector of bytes, used to assemble
 *  a class file image in memory */
class ByteVector {
    /** The contents of the vector. */
    private byte data[];

    /** Number of bytes occupied. */
    private int length = 0;

    /** Whether the array can be expanded: false if the backing
     *  array has been pre-allocated. */
    private boolean elastic = true;

    /** A new vector with default initial capacity. */
    public ByteVector() { this(128); }

    /** A new vector with a specified initial capacity. */
    public ByteVector(int initialCapacity) {
        data = new byte[initialCapacity];
    }

    /** A new vector backed by a specified array */
    public ByteVector(byte data[]) {
	this.data = data;
	this.elastic = false;
    }

    /** Get the current length */
    public int length() { return length; }

    /** Add a byte */
    public void putByte(int b) {
	need(1);
        data[length++] = (byte) b;
    }

    public void putByte(Opcodes.Op b) {
	putByte(b.byteval);
    }

    /** Add a short as two bytes */
    public void putShort(int s) {
	need(2);
        putShort(s, length);
        length += 2;
    }

    public void putShort(ConstPool.Item i) {
	putShort((i != null ? i.index : 0));
    }

    /** Overwrite with a short at specified offset */
    public void putShort(int s, int offset) {
        data[offset++] = (byte) (s >>> 8);
        data[offset++] = (byte) s;
    }

    /** Add a four-byte int */
    public void putInt(int i) {
	need(4);
        putInt(i, length);
        length += 4;
    }

    /** Overwrite an int at specified offset */
    public void putInt(int i, int offset) {
        data[offset++] = (byte) (i >>> 24);
        data[offset++] = (byte) (i >>> 16);
        data[offset++] = (byte) (i >>> 8);
        data[offset++] = (byte) i;
    }

    /** Add an eight-byte long */
    public void putLong(long l) {
	putInt((int) (l >>> 32));
	putInt((int) l);
    }

    /** Add a string in UTF8 */
    public void putUTF8(String s) {
        int charLength = s.length();
        need(charLength + 2);
        int start = length;
        length += 2;
        
        for (int i = 0; i < charLength; ++i) {
            need(3);
            char c = s.charAt(i);
            if (c >= '\001' && c <= '\177')
                data[length++] = (byte) c;
            else if (c <= '\u07ff') {
                data[length++] = (byte) (0xC0 | c >> 6 & 0x1F);
                data[length++] = (byte) (0x80 | c & 0x3F);
            } else {
                data[length++] = (byte) (0xE0 | c >> 12 & 0xF);
                data[length++] = (byte) (0x80 | c >> 6 & 0x3F);
                data[length++] = (byte) (0x80 | c & 0x3F);
            }
        }
        
        int byteLength = length - start - 2;
        putShort(byteLength, start);
    }

    /** Add an array of bytes */
    public void putByteArray(byte b[], int off, int len)
    {
        if (len > 0) {
            need(len);
            System.arraycopy(b, off, data, length, len);
            length += len;
        }
    }
    
    /** Add the contents of another byte vector */
    public void put(ByteVector out) {
	out.putByteArray(data, 0, length);
    }

    /** Make sure there is room for n more bytes. */
    private void need(int n) {
	if (length + n > data.length) { 
	    if (! elastic) throw new Error("can't expand Bytevector");
	    byte[] newData = new byte[Math.max(2 * data.length, length + n)];
	    System.arraycopy(data, 0, newData, 0, length);
	    data = newData;
	}
    }
}
