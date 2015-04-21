/*
 * TilePicture.java
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

import funbase.Primitive;
import funbase.Primitive.PRIMITIVE;
import funbase.Value;

/** A picture with fills and strokes specified by lists of coordinates */
public class TilePicture extends Picture {
    private static final long serialVersionUID = 1L;

    private static int ntiles = 0;
    
    public final int tileid = ntiles++;
    protected Vec2D strokes[][];
    protected Vec2D outlines[][];
    protected Object colours[];

    private TilePicture(float aspect, Vec2D strokes[][], 
                        Vec2D outlines[][], Object colours[]) {
	super(aspect);
	this.strokes = strokes;
	this.outlines = outlines;
	this.colours = colours;
    }
    
    @Override
    public void paint(int layer, int col, Stylus g, Tran2D t) {
	g.setTrans(t);
	g.drawTile(this, layer, col);
    }

    /** Palette for Escher picture */
    protected static float hbase = 0.3f, hstep = 0.1f, 
	svalue = 0.5f, bvalue = 1.0f;

    public static ColorValue[] makePalette(float slider) {
	ColorValue palette[] = new ColorValue[4];
	float base = hbase + 2.0f * slider - 1.0f;
	for (int i = 0; i < 4; i++)
	    palette[i] = 
		ColorValue.getHSB(base + i * hstep, svalue, bvalue);
	return palette;
    }
	    
    public void defaultDraw(int layer, int col, Stylus g) {
	switch (layer) {
	case Picture.DRAW:
	    g.setStroke(2);
	    for (int i = 0; i < strokes.length; i++)
		g.drawStroke(strokes[i]);
	    break;

	case Picture.FILL:
	    for (int i = 0; i < outlines.length; i++)
		g.fillOutline(outlines[i], colours[i], col);
	    break;
	}
    }

    @PRIMITIVE
    public static Value _tile(Primitive prim, Value a, Value ss, Value fs) {
	float aspect = (float) prim.number(a);
	int nStrokes = prim.listLength(ss);
	int nOutlines = prim.listLength(fs);
	Vec2D strokes[][] = new Vec2D[nStrokes][], 
	    outlines[][] = new Vec2D[nOutlines][];
	Object colours[] = new Object[nOutlines];
	Value xss;

	xss = ss;
	for (int i = 0; i < nStrokes; i++) {
	    strokes[i] = 
		prim.toArray(Vec2D.class, prim.head(xss), "a vector list");
	    xss = prim.tail(xss);
	}

	xss = fs;
	for (int i = 0; i < nOutlines; i++) {
	    Value xs = prim.head(xss);
	    Value spec = prim.head(xs);

	    if (spec instanceof Value.NumValue)
		colours[i] = (int) prim.number(spec);
	    else if (spec instanceof ColorValue)
		colours[i] = spec;
	    else
		prim.expect("a colour or integer");

	    outlines[i] = 
		prim.toArray(Vec2D.class, prim.tail(xs), "a vector list");
	    xss = prim.tail(xss);
	}

	return new TilePicture(aspect, strokes, outlines, colours);
    }

    /** Set the palette of colours used for rendering Escher picture. */
    @PRIMITIVE
    public static Value _palette(Primitive prim, Value base, 
				 Value step, Value sval, Value bval) {
	hbase = (float) prim.number(base);
	hstep = (float) prim.number(step);
	svalue = (float) prim.number(sval);
	bvalue = (float) prim.number(bval);
	return Value.nil;
    }
}
