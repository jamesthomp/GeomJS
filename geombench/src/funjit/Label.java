/*
 * Label.java
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

import java.util.ArrayList;
import java.util.List;

/** A label represents a position in the bytecode of a method. */
class Label {
    private final int serial;

    /** Whether the label has been placed */
    private boolean resolved = false;
    
    /** The position of this label in the code, if known. */
    private int addr;

    /** Information about forward references. */
    private List<Fixup> fixups;

    /** Stack depth at the label */
    private int depth = -1;

    private static int labcount = 0;

    public Label() { this.serial = ++labcount; }

    @Override
    public String toString() { return String.format("L%d", serial); }

    private void putRef(ByteVector code, int source, int pos) {
	int offset = addr - source;
	if (offset < Short.MIN_VALUE || offset > Short.MAX_VALUE)
	    throw new Error("Method code too large");
	code.putShort(offset, pos);
    }

    /** Put a reference to this label into a method as a displacement. */
    public void put(ByteVector code, int source) {
	int pos = code.length();

	code.putShort(-1);

        if (! resolved) {
            if (fixups == null) fixups = new ArrayList<Fixup>(2);
	    fixups.add(new Fixup(source, pos));
        } else {
	    putRef(code, source, pos);
        }
    }

    /** Put the label value into a byte vector */
    public void put(ByteVector out) {
	if (! resolved) throw new Error("unresolved label");
	out.putShort(addr);
    }

    /** Resolve forward references to this label. */
    public void resolve(int addr, ByteVector code) {
        this.resolved = true;
        this.addr = addr;
        if (fixups == null) return;
        for (Fixup f : fixups) f.resolve(code);
    }

    private class Fixup {
	private int source;
	private int pos;
	
	public Fixup(int source, int pos) {
	    this.source = source; this.pos = pos;
	}

	public void resolve(ByteVector code) {
	    putRef(code, source, pos);
	}
    }

    public void setDepth(int stack) {
	if (depth < 0)
	    depth = stack;
	else if (stack >= 0 && depth != stack)
	    throw new Error("inconsistent depth info");
    }

    public int getDepth() {
	if (depth < 0)
	    throw new Error("unknown label depth");

	return depth;
    }
}
