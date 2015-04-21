/*
 * ScreenStylus.java
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

package geomlab;

import java.awt.*;
import java.awt.geom.*;
import java.awt.image.BufferedImage;

import plugins.*;

/** Painting context for drawing on the screen */
public class ScreenStylus extends Stylus {
    private Graphics2D gcxt;

    public ScreenStylus(Graphics2D g, float slider) {
	super(slider);
	gcxt = g;
    }
        
    // drawStroke and fillOutline use our careful rounding

    @Override
    public void drawStroke(Vec2D stroke[]) {
	int n = stroke.length;
	int xx[] = new int[n], yy[] = new int[n];
	for (int j = 0; j < n; j++) {
	    xx[j] = trans.scaleX(stroke[j]);
	    yy[j] = trans.scaleY(stroke[j]);
	}
	gcxt.setColor(Color.black);
	gcxt.drawPolyline(xx, yy, n);
    }

    @Override
    public void fillOutline(Vec2D outline[], ColorValue color) {
	int n = outline.length;
	int xx[] = new int[n], yy[] = new int[n];
	for (int j = 0; j < n; j++) {
	    xx[j] = trans.scaleX(outline[j]);
	    yy[j] = trans.scaleY(outline[j]); 
	}
	gcxt.setColor((Color) color.getNative());
	gcxt.fillPolygon(xx, yy, n);
    }
    
    // drawLine and drawArc can use the rounding from Java2D

    @Override
    public void drawLine(Vec2D from, Vec2D to, ColorValue color) {
	Vec2D a = trans.transform(from), b = trans.transform(to);
	gcxt.setColor((Color) color.getNative());
	gcxt.draw(new Line2D.Float(a.x, a.y, b.x, b.y));
    }

    @Override
    public void drawArc(Vec2D centre, float xrad, float yrad,
	    float start, float extent, ColorValue color) {
	// Java assumes a barbarian coordinate system, so we must negate
	// the angles here:
	Shape arc0 = 
	    new Arc2D.Float(centre.x-xrad, centre.y-yrad, 
		    2*xrad, 2*yrad, -start, -extent, Arc2D.OPEN);
	AffineTransform tt = (AffineTransform) trans.getNative();
	Path2D.Float arc = new Path2D.Float();
	arc.append(arc0.getPathIterator(tt), false);
	gcxt.setColor((Color) color.getNative());
	gcxt.draw(arc);
    }
    
    @Override
    public void fillOval(Vec2D centre, float xrad, float yrad, 
			 ColorValue color) {
	Shape oval = new Ellipse2D.Float(centre.x-xrad, centre.y-yrad,
					 2*xrad, 2*yrad);
	AffineTransform t = (AffineTransform) trans.getNative();
	Path2D.Float path = new Path2D.Float();
	path.append(oval.getPathIterator(t), false);
	gcxt.setColor((Color) color.getNative());
	gcxt.fill(path);
    }

    @Override
    public void setStroke(float width) {
	gcxt.setStroke(new BasicStroke(width, BasicStroke.CAP_ROUND, 
				       BasicStroke.JOIN_ROUND));
    }

    @Override
    public void drawImage(Native.Image image) {
	int w = image.getWidth(), h = image.getHeight();
//	/* We draw the photo slightly large, so that it overlaps the
//	 * bounding box slightly on all sides.  This avoids unsightly
//	 * white lines between adjacent photos. */
//	float u = trans.getXaxis().length(), v = trans.getYaxis().length();
//	final float m = 1;  // Overlap in pixels
//	Tran2D t1 = trans.scale(1/u, 1/v).translate(-m, v+m)
//					.scale((u+2*m)/w, -(v+2*m)/h);
        Tran2D t1 = trans.translate(0.0f, 1.0f).scale(1.0f/w, -1.0f/h);
	gcxt.drawImage((BufferedImage) image.getNative(), 
		       (AffineTransform) t1.getNative(), null);
    }

    @Override
    public boolean isTiny(Tran2D t) {
	return t.isTiny(2.0f);
    }
}
