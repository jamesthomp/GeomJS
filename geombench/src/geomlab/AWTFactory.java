/*
 * AWTFactory.java
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

import java.awt.Color;
import java.awt.geom.AffineTransform;
import java.awt.image.BufferedImage;
import java.awt.Graphics2D;
import java.awt.RenderingHints;

import java.io.*;
import javax.imageio.ImageIO;

import plugins.Native;
import plugins.ColorValue;
import plugins.Vec2D;
import plugins.Tran2D;
import plugins.Stylus;

/** A Native factory for Java2D graphics */
public class AWTFactory extends Native {
    @Override
    public Object color(ColorValue c) {
	return new Color(c.rgb);
    }

    @Override
    public Object vector(Vec2D v) {
	return null;
    }

    @Override
    public Object transform(Tran2D t) {
	return new AffineTransform(t.m_xx, t.m_yx, t.m_xy, 
				   t.m_yy, t.m_x, t.m_y);
    }

    /** A GeomLab image implemented as an AWT BufferedImage */
    private static class AWTImage implements Image {
	private final BufferedImage image;

	public AWTImage(BufferedImage image) {
	    this.image = image;
	}

	@Override
	public int getWidth() { return image.getWidth(); }
	
	@Override
	public int getHeight() { return image.getHeight(); }
	
	@Override
	public int getRGB(int x, int y) { return image.getRGB(x, y); }
	
	@Override
	public void setRGB(int x, int y, int rgb) { image.setRGB(x, y, rgb); }
	
	@Override
	public Object getNative() { return image; }
    }

    private BufferedImage createImage(int w, int h) {
	return new BufferedImage(w, h, BufferedImage.TYPE_INT_RGB);
    }

    @Override
    public Image image(int w, int h) {
	return new AWTImage(createImage(w, h));
    }

    @Override
    public Image render(Stylus.Drawable pic, int width, int height, 
			float slider, ColorValue background) {
    	BufferedImage image = createImage(width, height);
    	Graphics2D g = (Graphics2D) image.getGraphics();
    	g.setRenderingHint(RenderingHints.KEY_ANTIALIASING,
			   RenderingHints.VALUE_ANTIALIAS_ON);
	g.translate(0, height); g.scale(1, -1);
        Stylus s = new ScreenStylus(g, slider);
   	pic.draw(s, width, height, background);
	return new AWTImage(image);
    }

    @Override
    public Image readImage(InputStream in) throws IOException {
	return new AWTImage(ImageIO.read(in));
    }
    
    @Override
    public void writeImage(Image image, String format, OutputStream out) 
	    						throws IOException {
	ImageIO.write((BufferedImage) image.getNative(), format, out);
    }
}
