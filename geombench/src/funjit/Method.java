/*
 * Method.java
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

import static funjit.Opcodes.*;
import static funjit.Opcodes.Op.*;
import java.util.LinkedList;
import java.util.List;

/** A method in a class that is being assembled. */
class Method {
    /** Access flags of this method. */
    private int access;

    /** Constant pool item for the method name */
    private final ConstPool.Item name;

    /** Constant pool item for the method descriptor */
    private final ConstPool.Item desc;
    
    /** The bytecode of this method. */
    private ByteVector code = new ByteVector();

    /** Constant pool for the enclosing class */
    private final ConstPool pool;
    
    /** Exception handlers */
    private List<Handler> handlers = new LinkedList<Handler>();

    /** The UTF8 string "Code" */
    private ConstPool.Item _Code_;

    /** Current stack size */
    private int stack = 0;

    /** Maximum stack size of this method. */
    private int maxStack = 0;

    /** Maximum number of local variables for this method. */
    private int maxLocals;
    
    public Method(ConstPool pool, int access, String name, Type ty) {
        this.pool = pool;
        this.access = access;
        this.name = pool.utf8Item(name);
        this.desc = pool.utf8Item(ty.desc);
	this._Code_ = pool.utf8Item("Code");

        int argsize = ty.asize;
        if ((access & ACC_STATIC) == 0) argsize++;
        maxLocals = argsize;
    }

    /** Note that a local slot is being used. */
    private void useLocal(int addr, int size) {
	maxLocals = Math.max(maxLocals, addr + size);
    }

    /** Adjust stack size following an instruction */
    private void stackOp(Op op) {
	stackChange(op.delta);
    }

    /** Note a change in stack size */
    private void stackChange(int delta) {
	stack += delta;
	if (stack > maxStack) maxStack = stack;
    }
    
    /** Instructions with no operand */
    public void gen(Op op) {
	if (ClassFile.debug > 0) 
	    System.out.printf("%s\n", op);
	stackOp(op);
	
	switch (op) {
	    case IRETURN:
	    case LRETURN:
	    case FRETURN:
	    case DRETURN:
	    case ARETURN:
	    case RETURN:
		code.putByte(op);
		unreachable();
		break;

	    case AALOAD:
	    case AASTORE:
	    case ACONST_NULL:
	    case DADD:
	    case DMUL:
	    case DSUB:
	    case DNEG:
	    case DCMPL:
	    case DCMPG:
	    case DUP:
	    case DUP_X1:
	    case DUP_X2:
	    case IADD:
	    case ISUB:
	    case IXOR:
	    case POP:
	    case SWAP:
		code.putByte(op);
		break;
	    default:
		throw new Error("gen " + op);
	}
    }

    /** Instructions with integer operand */
    public void gen(Op op, int rand) {
	if (ClassFile.debug > 0) 
	    System.out.printf("%s %d\n", op, rand);

	switch (op) {
	    case CONST:
		stackOp(op);
		if (rand >= -1 && rand <= 5) {
		    code.putByte(ICONST_0.byteval + rand);
		} else if (rand >= Byte.MIN_VALUE && rand <= Byte.MAX_VALUE) {
		    code.putByte(BIPUSH);
		    code.putByte(rand);
		} else if (rand >= Short.MIN_VALUE && rand <= Short.MAX_VALUE) {
		    code.putByte(SIPUSH);
		    code.putShort(rand);
		} else {
		    genconst(new Integer(rand));
		}
		break;
	    case NEWARRAY:
		stackOp(op);
		code.putByte(op);
		code.putByte(rand);
		break;
	    case ILOAD:
		genVar(ILOAD, ILOAD_0, rand, 1);
		break;
	    case LLOAD:
		genVar(LLOAD, LLOAD_0, rand, 2);
		break;
	    case FLOAD:
		genVar(FLOAD, FLOAD_0, rand, 1);
		break;
	    case DLOAD:
		genVar(DLOAD, DLOAD_0, rand, 2);
		break;
	    case ALOAD:
		genVar(ALOAD, ALOAD_0, rand, 1);
		break;
	    case ISTORE:
		genVar(ISTORE, ISTORE_0, rand, 1);
		break;
	    case LSTORE:
		genVar(LSTORE, LSTORE_0, rand, 2);
		break;
	    case FSTORE:
		genVar(FSTORE, FSTORE_0, rand, 1);
		break;
	    case DSTORE:
		genVar(DSTORE, DSTORE_0, rand, 2);
		break;
	    case ASTORE:
		genVar(ASTORE, ASTORE_0, rand, 1);
		break;
	    default:
		throw new Error("gen " + op);
	}
    }
    
    /** Instructions for local variable access */
    private void genVar(Op op, Op op0, int addr, int size) {
	stackOp(op);
	useLocal(addr, size);
	if (addr < 4)
	    code.putByte(op0.byteval + addr);
	else if (addr < 256) {
	    code.putByte(op);
	    code.putByte(addr);
	} else {
	    code.putByte(WIDE);
	    code.putByte(op);
	    code.putShort(addr);
	}
    }
    
    /** Instructions with a classname operand */
    public void gen(Op op, String cl) {
	if (ClassFile.debug > 0) 
	    System.out.printf("%s %s\n", op, cl);

	switch (op) {
	    case NEW:
	    case ANEWARRAY:
	    case CHECKCAST:
	    case INSTANCEOF:
		stackOp(op);
	        code.putByte(op);
		code.putShort(pool.classItem(cl));
		break;
	    case CONST:
		/* False overloading */
		genconst(cl);
		break;
	    default:
		throw new Error("gen " + op);
        }
    }

    /** Method invocation or field access instructions */
    public void gen(Op op, String cl, String name, Type ty) {
	if (ClassFile.debug > 0) 
	    System.out.printf("%s %s.%s\n", op, cl, name);

	switch (op) {
            case INVOKESPECIAL:
        	genMethod(op, ConstPool.METH, cl, name, ty, 1);
        	break;
            case INVOKESTATIC:
        	genMethod(op, ConstPool.METH, cl, name, ty, 0);
        	break;
            case INVOKEVIRTUAL:
        	genMethod(op, ConstPool.METH, cl, name, ty, 1);
        	break;
            case INVOKEINTERFACE:
        	genMethod(op, ConstPool.IMETH, cl, name, ty, 1);
        	break;

            case GETSTATIC:
        	genField(op, cl, name, ty, ty.size);
        	break;
            case PUTSTATIC:
        	genField(op, cl, name, ty, -ty.size);
        	break;
            case GETFIELD:
        	genField(op, cl, name, ty, ty.size-1);
        	break;
            case PUTFIELD:
        	genField(op, cl, name, ty, -ty.size-1);
        	break;

            default:
        	throw new Error("gen " + op);
        }
    }
    
    /** A field access instruction */
    private void genField(Op op, String owner, String name,
	    		  Type ty, int delta) {
        stackChange(delta);
        code.putByte(op);
	code.putShort(pool.fieldItem(owner, name, ty.desc));
    }

    /** A method call */
    private void genMethod(Op op, int type, String owner,
	    		   String name, Type ty, int rcvr) {
        stackChange(- ty.asize - rcvr + ty.size);
        code.putByte(op);
	code.putShort(pool.methodItem(type, owner, name, ty.desc));
        if (op == INVOKEINTERFACE) {
	    code.putByte(ty.asize);
	    code.putByte(0);
	}
    }

    /** Jump instructions */
    public void gen(Op op, Label label) {
	if (ClassFile.debug > 0) 
	    System.out.printf("%s %s\n", op, label);

	stackOp(op);
	noteJump(label);
	int source = code.length();
        code.putByte(op);
        label.put(code, source);
	if (op == GOTO) unreachable();
    }

    /** CONST instruction, double operand */
    public void gen(Op op, double rand) {
	if (ClassFile.debug > 0)
	    System.out.printf("%s %g\n", op, rand);

	switch (op) {
	    case CONST:
		if (rand == 0.0) {
		    stackChange(2);
		    code.putByte(DCONST_0);
		}
		else if (rand == 1.0) {
		    stackChange(2);
		    code.putByte(DCONST_1);
		}
		else {
		    genconst(new Double(rand));
		}
		break;
	    default:
		throw new Error("gen " + op);
	}
    }

    /** CONST instruction */
    public void gen(Op op, Object rand) {
	if (ClassFile.debug > 0)
	    System.out.printf("%s %s\n", op, rand);

	switch (op) {
	    case CONST:
		genconst(rand);
		break;
	    default:
		throw new Error("gen " + op);
	}
    }

    /** Push a constant via the constant pool */
    private void genconst(Object x) {
        ConstPool.Item i = pool.constItem(x);
        
        switch (i.type) {
            case ConstPool.LONG:
            case ConstPool.DOUBLE:
        	stackChange(2);
        	code.putByte(LDC2_W);
        	code.putShort(i.index);
        	break;
            default:
        	stackChange(1);
        	if (i.index < 256) {
        	    code.putByte(LDC);
        	    code.putByte(i.index);
        	} else {
        	    code.putByte(LDC_W);
        	    code.putShort(i.index);
        	}
        }
    }
    
    /** Register a try .. catch block */
    public void tryCatchBlock(Label start, Label end, 
			      Label handler, String type) {
	handler.setDepth(1);
        handlers.add(new Handler(start, end, handler, 
        	(type != null ? pool.classItem(type) : null)));
    }

    /** Place a label */
    public void label(final Label label) {
	if (ClassFile.debug > 0)
	    System.out.printf("%s:\n", label);

        label.resolve(code.length(), code);
	label.setDepth(stack);
	stack = label.getDepth();
    }

    /** Note stack depth at jump target. */
    private void noteJump(Label target) {
	target.setDepth(stack);
    }

    /** Note that this point is unreachable. */
    private void unreachable() {
	stack = -1;
    }

    /** Return the size of the bytecode of this method. */
    public int getSize() {
        int size = 8;
        if (code.length() > 0)
            size += 18 + code.length() + 8 * handlers.size();
        return size;
    }

    /** Put the bytecode of this method into a byte vector. */
    public void put(ByteVector out) {
        out.putShort(access);
        out.putShort(name);
        out.putShort(desc);
        int attributeCount = 0;
        if (code.length() > 0) attributeCount++;
        out.putShort(attributeCount);
        if (code.length() > 0) {
            int size = 12 + code.length() + 8 * handlers.size();
            out.putShort(_Code_);
            out.putInt(size);
            out.putShort(maxStack);
            out.putShort(maxLocals);
            out.putInt(code.length());
            code.put(out);
            out.putShort(handlers.size());
            for (Handler h : handlers) h.put(out);
            out.putShort(0); // Attribute count for the code
        }
    }

    /** Information about an exception handler block. */
    private static class Handler {
        private Label start, end, handler;

        /** Constant pool item for type of exceptions or null to catch all */
        ConstPool.Item type;
        
        public Handler(Label start, Label end, Label handler, 
		       ConstPool.Item type) {
            this.start = start; this.end = end;
            this.handler = handler; this.type = type;
        }
	
	public void put(ByteVector out) {
	    start.put(out);
	    end.put(out);
	    handler.put(out);
	    out.putShort(type);
	}
    }
}
