/*
 * Opcodes.java
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

/** Opcodes and other constants for the JVM */
class Opcodes {
    // versions
    public static final int V1_5 = 49, V1_6 = 50;

    // access flags
    public static final int 
    	ACC_PUBLIC = 0x0001,  // class, field, method
        ACC_PRIVATE = 0x0002,  // class, field, method
        ACC_PROTECTED = 0x0004,  // class, field, method
        ACC_STATIC = 0x0008,  // field, method
        ACC_FINAL = 0x0010,  // class, field, method
        ACC_SUPER = 0x0020,  // class
        ACC_SYNCHRONIZED = 0x0020,  // method
        ACC_VOLATILE = 0x0040,  // field
        ACC_BRIDGE = 0x0040,  // method
        ACC_VARARGS = 0x0080,  // method
        ACC_TRANSIENT = 0x0080,  // field
        ACC_NATIVE = 0x0100,  // method
        ACC_INTERFACE = 0x0200,  // class
        ACC_ABSTRACT = 0x0400,  // class, method
        ACC_STRICT = 0x0800,  // method
        ACC_ENUM = 0x4000; // class(?) field inner

    // types for NEWARRAY
    public static final int 
    	T_BOOLEAN = 4, T_CHAR = 5, T_FLOAT = 6, T_DOUBLE = 7, T_BYTE = 8, 
    	T_SHORT = 9, T_INT = 10, T_LONG = 11;
    
    public enum Op {
	NOP(0, 0),
	ACONST_NULL(1, 1),
	ICONST_0(3, 1),
        LCONST_0(9, 2),
        FCONST_0(11, 1),
        DCONST_0(14, 2),
	DCONST_1(15, 2),
        BIPUSH(16, 1),
        SIPUSH(17, 1),
        LDC(18, 1),
        LDC_W(19, 1),
        LDC2_W(20, 2),
        ILOAD(21, 1),
        LLOAD(22, 2),
        FLOAD(23, 1),
        DLOAD(24, 2),
        ALOAD(25, 1),
        ILOAD_0(26, 1),
        LLOAD_0(30, 2),
        FLOAD_0(34, 1),
        DLOAD_0(38, 2),
        ALOAD_0(42, 1),
        IALOAD(46, -1),
        LALOAD(47, 0),
        FALOAD(48, -1),
        DALOAD(49, 0),
        AALOAD(50, -1),
        BALOAD(51, -1),
        CALOAD(52, -1),
        SALOAD(53, -1),
        ISTORE(54, -1),
        LSTORE(55, -2),
        FSTORE(56, -1),
        DSTORE(57, -2),
        ASTORE(58, -1),
        ISTORE_0(59, -1),
	LSTORE_0(63, -2),
        FSTORE_0(67, -1),
        DSTORE_0(71, -2),
        ASTORE_0(75, -1),
        IASTORE(79, -3),
        LASTORE(80, -4),
        FASTORE(81, -3),
        DASTORE(82, -4),
        AASTORE(83, -3),
        BASTORE(84, -3),
        CASTORE(85, -3),
        SASTORE(86, -3),
        POP(87, -1),
        POP2(88, -2),
        DUP(89, 1),
        DUP_X1(90, 1),
        DUP_X2(91, 1),
        DUP2(92, 2),
        DUP2_X1(93, 2),
        DUP2_X2(94, 2),
        SWAP(95, 0),
        IADD(96, -1),
        LADD(97, -2),
        FADD(98, -1),
        DADD(99, -2),
        ISUB(100, -1),
        LSUB(101, -2),
        FSUB(102, -1),
        DSUB(103, -2),
        IMUL(104, -1),
        LMUL(105, -2),
        FMUL(106, -1),
        DMUL(107, -2),
        IDIV(108, -1),
        LDIV(109, -2),
        FDIV(110, -1),
        DDIV(111, -2),
        IREM(112, -1),
        LREM(113, -2),
        FREM(114, -1),
        DREM(115, -2),
        INEG(116, 0),
        LNEG(117, 0),
        FNEG(118, 0),
        DNEG(119, 0),
        ISHL(120, -1),
        LSHL(121, -1),
        ISHR(122, -1),
        LSHR(123, -1),
        IUSHR(124, -1),
        LUSHR(125, -1),
        IAND(126, -1),
        LAND(127, -2),
        IOR(128, -1),
        LOR(129, -2),
        IXOR(130, -1),
        LXOR(131, -2),
        IINC(132, 0),
        I2L(133, 1),
        I2F(134, 0),
        I2D(135, 1),
        L2I(136, -1),
        L2F(137, -1),
        L2D(138, 0),
        F2I(139, 0),
        F2L(140, 1),
        F2D(141, 1),
        D2I(142, -1),
        D2L(143, 0),
        D2F(144, -1),
        I2B(145, 0),
        I2C(146, 0),
        I2S(147, 0),
        LCMP(148, -3),
        FCMPL(149, -1),
        FCMPG(150, -1),
        DCMPL(151, -3),
        DCMPG(152, -3),
        IFEQ(153, -1),
        IFNE(154, -1),
        IFLT(155, -1),
        IFGE(156, -1),
        IFGT(157, -1),
        IFLE(158, -1),
        IF_ICMPEQ(159, -2),
        IF_ICMPNE(160, -2),
        IF_ICMPLT(161, -2),
        IF_ICMPGE(162, -2),
        IF_ICMPGT(163, -2),
        IF_ICMPLE(164, -2),
        IF_ACMPEQ(165, -2),
        IF_ACMPNE(166, -2),
        GOTO(167, 0),
        TABLESWITCH(170, -1),
        LOOKUPSWITCH(171, -1),
        IRETURN(172, -1),
        LRETURN(173, -2),
        FRETURN(174, -1),
        DRETURN(175, -2),
        ARETURN(176, -1),
        RETURN(177, 0),
        GETSTATIC(178, 0),
        PUTSTATIC(179, 0),
        GETFIELD(180, 0),
        PUTFIELD(181, 0),
        INVOKEVIRTUAL(182, 0),
        INVOKESPECIAL(183, 0),
        INVOKESTATIC(184, 0),
        INVOKEINTERFACE(185, 0),
        INVOKEDYNAMIC(186, 0),
        NEW(187, 1),
        NEWARRAY(188, 0),
        ANEWARRAY(189, 0),
        ARRAYLENGTH(190, 0),
        ATHROW(191, 0),
        CHECKCAST(192, 0),
        INSTANCEOF(193, 0),
        MONITORENTER(194, -1),
        MONITOREXIT(195, -1),
        WIDE(196, 0),
        MULTIANEWARRAY(197, 0),
        IFNULL(198, -1),
	IFNONNULL(199, -1),

	CONST(999, 1);

	public final int byteval;
	public final int delta;

	private Op(int byteval, int delta) {
	    this.byteval = byteval; this.delta = delta;
	}
    }
}
