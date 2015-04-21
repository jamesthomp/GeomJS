/*
 * ConstPool.java
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

import java.util.HashMap;
import java.util.Map;

/** The constant pool for a class file */
class ConstPool {
    /** A type of item in a constant pool.
     * 
     *  Numeric codes are those specified by the class file format. */
    public static final int 
	UTF8 = 1, INT = 3, FLOAT = 4, LONG = 5, DOUBLE = 6, 
	CLASS = 7, STR = 8, FIELD = 9, METH = 10, IMETH = 11,
    	NAME_TYPE = 12;

    /** Number of items in the pool. */
    private int nitems = 1;
    
    /** The constant pool itself. */
    protected final ByteVector buf = new ByteVector();

    /** Uniqueness table */
    private Map<Item, Item> hashtable = new HashMap<Item, Item>();
    
    /** Generate a constant pool item for a standard value.
     * 
     *  The argument should be an instance of one of the standard wrapper
     *  classes Integer, Byte, String, Double, etc. */
    public Item constItem(Object x) {
	Item key;
	
	if (x instanceof Integer) 
	    key = new Item((Integer) x);
	else if (x instanceof Byte) 
	    key = new Item((Byte) x);
	else if (x instanceof Character) 
	    key = new Item((Character) x);
	else if (x instanceof Short) 
	    key = new Item((Short) x);
	else if (x instanceof Boolean) 
	    key = new Item((Boolean) x);
	else if (x instanceof Float) 
	    key = new Item((Float) x);
	else if (x instanceof Long) 
	    key = new Item((Long) x);
	else if (x instanceof Double) 
	    key = new Item((Double) x);
	else if (x instanceof String) 
	    key = new Item(STR, (String) x, null, null);
        else
            throw new IllegalArgumentException("value " + x);
	
	return save(key);
    }
    
    /** Generate a constant pool item for a UTF8 string */
    public Item utf8Item(String value) {
	return save(new Item(UTF8, value, null, null));
    }
    
    /** Generate a constant pool item representing a class */
    public Item classItem(String value) {
        return save(new Item(CLASS, value, null, null));
    }

    /** Generate a constant pool item representing a field reference */
    public Item fieldItem(String owner, String name, String desc) {
        return save(new Item(FIELD, owner, name, desc));
    }

    /** Generate a constant pool item representing a method invocation */
    public Item methodItem(int type, String owner, String name, String desc) {
        return save(new Item(type, owner, name, desc));
    }
    
    /** Generate a constant pool item representing a (name, type) pair */
    public Item nameTypeItem(String name, String desc) {
        return save(new Item(NAME_TYPE, name, desc, null));
    }

    /** Save an item in the pool, or return an existing copy */
    private Item save(Item key) {
	Item result = hashtable.get(key);
	if (result != null) return result;
	key.putDefinition();
	key.index = nitems;
	nitems += key.size;
	hashtable.put(key, key);
	return key;
    }

    /** Store the constant pool into a byte vector */
    public void put(ByteVector out) {
        buf.put(out);
    }

    /** Return the size of the constant pool in bytes */
    public int size() {
        return buf.length();
    }
    
    /** Return the number of items in the pool. */
    public int nconsts() {
	return nitems;
    }

    /** A record representing an item in a constant pool. */
    public class Item {
	public int index;
	public final int type;
	public int intVal;
	private long longVal;
	private String strVal1, strVal2, strVal3;
	public final int size;
	private final int hashCode;

	private Item(int type, int size, int hash) {
	    this.type = type;
	    this.size = size;
	    this.hashCode = (type + 16 * hash) & 0x7FFFFFFF;
	}

	protected Item(int intVal) {
	    this(INT, 1, intVal);
	    this.intVal = intVal;
	}

	protected Item(long longVal) {
	    this(LONG, 2, (int) longVal);
	    this.longVal = longVal;
	}

	Item(float floatVal) {
	    this(FLOAT, 1, (int) floatVal);
	    this.intVal = Float.floatToRawIntBits(floatVal);
	}

	Item(double doubleVal) {
	    this(DOUBLE, 2, (int) doubleVal);
	    this.longVal = Double.doubleToRawLongBits(doubleVal);
	}

	Item(boolean boolVal) {
	    this(boolVal ? 1 : 0);
	}
	
	Item(int type, String strVal1, String strVal2, String strVal3) {
	    this(type, 1, hash3(strVal1, strVal2, strVal3));
	    this.strVal1 = strVal1;
	    this.strVal2 = strVal2;
	    this.strVal3 = strVal3;
	}	    
	
	private void define(Item x) {
	    buf.putByte(type);
	    buf.putShort(x.index);
	}
	
	private void define(Item x, Item y) {
	    buf.putByte(type);
	    buf.putShort(x.index);
	    buf.putShort(y.index);
	}
	
	public void putDefinition() {
	    switch (type) {
		case INT:
		case FLOAT:
		    buf.putByte(type);
		    buf.putInt(intVal);
		    break;
		case LONG:
		case DOUBLE:
		    buf.putByte(type);
		    buf.putLong(longVal);
		    break;
		case UTF8:
		    buf.putByte(UTF8);
		    buf.putUTF8(strVal1);
		    break;
		case STR:
		case CLASS:
		    define(utf8Item(strVal1));
		    break;
		case NAME_TYPE:
		    define(utf8Item(strVal1), utf8Item(strVal2));
		    break;
		case FIELD:
		case METH:
		case IMETH:
		    define(classItem(strVal1), 
			   nameTypeItem(strVal2, strVal3));
		    break;
		default:
		    throw new Error("putDefinition");
	    }
	}

	public boolean equals(Item i) {
	    if (type != i.type) return false;

	    switch (type) {
		case INT:
		case FLOAT:
		    return i.intVal == intVal;
		case LONG:
		case DOUBLE:
		    return i.longVal == longVal;
		case UTF8:
		case STR:
		case CLASS:
		    return i.strVal1.equals(strVal1);
		case NAME_TYPE:
		    return i.strVal1.equals(strVal1) 
		    	&& i.strVal2.equals(strVal2);
		case FIELD:
		case METH:
		case IMETH:
		    return i.strVal1.equals(strVal1) 
		    	&& i.strVal2.equals(strVal2)
		    	&& i.strVal3.equals(strVal3);
		default:
		    throw new Error("bad const pool type");
	    }
	}

	@Override
	public boolean equals(Object z) {
	    return (z instanceof Item && this.equals((Item) z));
	}

	@Override
	public int hashCode() {
	    return hashCode;
	}
    }

    /** Compute a hash code from three strings */
    protected static int hash3(String str1, String str2, String str3) {
	int hash = str1.hashCode();
	if (str2 != null) hash *= str2.hashCode()+1;
	if (str3 != null) hash *= str3.hashCode()+2;
	return hash;
    }
}
