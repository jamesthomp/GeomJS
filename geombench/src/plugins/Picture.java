/*
 * Picture.java
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

package plugins;

import java.io.PrintWriter;

import funbase.Evaluator;
import funbase.Primitive;
import funbase.Primitive.PRIMITIVE;
import funbase.Value;
import funbase.FunCode;

/* The pictures that GeomLab works with do not have a fixed size, but
 may be scaled uniformly to achieve any desired height or
 width.  Thus the aspect ratio (width/height) is fixed even if the
 size is not.  When two pictures are put side-by-side, there is a
 constraint that they should have the same height, and this removes
 one degree of freedom in the scaling; similarly when pictures are put
 one above another.  Each picture thus has a total of one degree of 
 freedom for scaling.
 
 Pictures are drawn in two layers: first the coloured fills, then
 black outlines over the top.  The colours used for the fills rotate
 as the pictures themselves are rotated: this makes Escher tilings
 work neatly. */

/** A rectangular graphical object of scalable size but fixed aspect ratio */
public class Picture extends Value implements Stylus.Drawable {
    private static final long serialVersionUID = 1L;

    public final float aspect;	       // = width / height
    private final boolean interactive; // whether we use slider value
    
    protected Picture(float aspect) { this(aspect, false); }
    
    protected Picture(float aspect, boolean interactive) {
	Evaluator.countCons();
	this.aspect = aspect;
	this.interactive = interactive;
    }
    
    @Override
    public float getAspect() { return aspect; }
    
    @PRIMITIVE
    public static Value aspect(Primitive prim, Value x) {
	Picture pic = prim.cast(Picture.class, x, "a picture");
	return NumValue.getInstance(pic.aspect);
    }

    @Override
    public boolean isInteractive() { return interactive; }
    
    @Override
    public void prerender(float slider) { }
    
    @Override
    public void draw(Stylus g, int ww, int hh, ColorValue background) {
        Tran2D t = Tran2D.scaling(ww, hh);
        draw(g, t, background);
    }

    @Override
    public void draw(Stylus gc, Tran2D t, ColorValue background) {
	gc.setTrans(t);
	gc.fillOutline(unitsquare, background);
	paintPart(FILL, -1, gc, t);
	paintPart(DRAW, -1, gc, t);
    }
    
    public static final int DRAW = 1, FILL = 2;
    
    public static final Vec2D unitsquare[] = { 
	new Vec2D(0, 0), new Vec2D(1, 0), new Vec2D(1, 1), new Vec2D(0, 1) 
    };
    
    public final void paintPart(int layer, int col, Stylus g, Tran2D t) { 
	// Give up if the drawing space is negligibly small
	if (g.isTiny(t)) {
	    if (layer == DRAW) {
		g.setTrans(t);
		g.fillOutline(unitsquare, ColorValue.black);
	    }
	    return;
	}
	
	this.paint(layer, col, g, t);
    }
    
    /** Draw the picture with a specified Stylus.  Subclasses
     *  should override this method to implement their own
     *  drawing. Use paintPart() to draw sub-pictures so that they are
     *  replaced with a solid fill if they are negligibly small.
     *
     *  paint is called with a transform t that takes into account
     *  the desired aspect ratio of the picture: thus the picture
     *  should draw itself in a rectangle that is the image of the 
     *  unit square under t.  In the case of stretched pictures, 
     *  this rectangle will have an aspect ratio that is different from
     *  the picture's own aspect ratio. */
    protected void paint(int layer, int col, Stylus g, Tran2D t) {
	// Default: paint nothing
    }
    
    @Override
    public void printOn(PrintWriter out) {
	out.print("<picture>");
    }
    
    public static final Picture nullPicture = new Picture(0.0f);

    @PRIMITIVE
    public static Value _null(Primitive prim) {
	return nullPicture;
    }

    /** A picture that combines two other pictures.
     * 
     *  The picture is drawn by drawing each of the components separately. */
    private static class BinaryPicture extends Picture {
	private static final long serialVersionUID = 1L;

	/** One of the component pictures. */
	protected final Picture left, right;
	
	private BinaryPicture(float aspect, Picture left, Picture right) {
	    super(aspect, left.isInteractive() || right.isInteractive());
	    this.left = left; this.right = right;
	}
	
	@Override
	public void prerender(float slider) {
	    left.prerender(slider);
	    right.prerender(slider);
	}

	@Override
	public void paint(int layer, int col, Stylus g, Tran2D t) {
	    left.paintPart(layer, col, g, t);
	    right.paintPart(layer, col, g, t);
	}
    }

    @PRIMITIVE
    public static Value _combine(Primitive prim, Value x, Value y, Value z) {
	return new BinaryPicture((float) prim.number(x), 
				 prim.cast(Picture.class, y, "a picture"),
				 prim.cast(Picture.class, z, "a picture"));
    }

    private static class BesidePicture extends BinaryPicture {
        private Tran2D tleft, tright;

        public BesidePicture(Picture left, Picture right) {
            this(left, left.getAspect(), right, right.getAspect());
        }

        private BesidePicture(Picture left, float la, Picture right, float ra) {
            super(la+ra, left, right);
            tleft = new Tran2D(la/(la+ra), 0, 0, 1, 0, 0);
            tright = new Tran2D(ra/(la+ra), 0, 0, 1, la/(la+ra), 0);
        }            

        @Override
	public void paint(int layer, int col, Stylus g, Tran2D t) {
	    left.paintPart(layer, col, g, t.concat(tleft));
            right.paintPart(layer, col, g, t.concat(tright));
	}
    }

    @PRIMITIVE
    public static Value _beside(Primitive prim, Value x, Value y) {
	return new BesidePicture(prim.cast(Picture.class, x, "a picture"),
				 prim.cast(Picture.class, y, "a picture"));
    }

    private static class AbovePicture extends BinaryPicture {
        private Tran2D ttop, tbot;

        public AbovePicture(Picture top, Picture bottom) {
            this(top, top.getAspect(), bottom, bottom.getAspect());
        }

        private AbovePicture(Picture top, float ta, Picture bottom, float ba) {
            super(ta*ba/(ta + ba), top, bottom);
            ttop = new Tran2D(1, 0, 0, ba/(ta+ba), 0, ta/(ta+ba));
            tbot = new Tran2D(1, 0, 0, ta/(ta+ba), 0, 0);
        }            

        @Override
	public void paint(int layer, int col, Stylus g, Tran2D t) {
	    left.paintPart(layer, col, g, t.concat(ttop));
            right.paintPart(layer, col, g, t.concat(tbot));
	}
    }

    @PRIMITIVE
    public static Value _above(Primitive prim, Value x, Value y) {
	return new AbovePicture(prim.cast(Picture.class, x, "a picture"),
                                prim.cast(Picture.class, y, "a picture"));
    }

    /** A picture that is drawn with a specified transformation.
     * 
     *  The picture is drawn after composing the transformation with the
     *  existing drawing transformation, and also incrementing the
     *  colour index. */
    private static class TransPicture extends Picture {
	private static final long serialVersionUID = 1L;

	/** The base picture that will be transformed */
	private final Picture base;
	
	/** The transformation to be applied. */
	private final Tran2D trans;

	/** The increment to be added to the colour index. */
	private final int inc;
	
	private TransPicture(float aspect, Picture base, 
                             Tran2D trans, int inc) {
	    super(aspect, base.isInteractive());
	    this.base = base; this.trans = trans; this.inc = inc;
	}
	
	@Override
	public void prerender(float slider) {
	    base.prerender(slider);
	}

	@Override
	public void paint(int layer, int col, Stylus g, Tran2D t) {
	    int col1 = (col >= 0 ? col+inc : col);
	    base.paintPart(layer, col1, g, t.concat(trans));
	}
    }

    @PRIMITIVE
    public static Value _transpic(Primitive prim, Value aspect, 
				  Value base, Value trans, Value inc) {
	return new TransPicture((float) prim.number(aspect),
				prim.cast(Picture.class, base, "a picture"),
				prim.cast(Tran2D.class, trans, "a transform"),
				(int) prim.number(inc));
    }

    @PRIMITIVE
    public static Value colour(Primitive prim, Value x) {
	final Picture pic = prim.cast(Picture.class, x, "a picture");
	return new Picture(pic.aspect, true) {
	    @Override
	    public void paint(int layer, int col, Stylus g, Tran2D t) {
		/* Replace the colour index (presumably -1) with
		   zero, so indexed fills are enabled */
		pic.paintPart(layer, 0, g, t);
	    }
	};
    }
}
