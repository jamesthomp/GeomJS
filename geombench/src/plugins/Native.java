/*
 * Native.java
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

import java.io.*;

/** A factory for platform-dependent graphical elements */
public abstract class Native {
    /** Return the native representation of a color */
    public abstract Object color(ColorValue c);

    /** Return the native representation of a vector */
    public abstract Object vector(Vec2D v);

    /** Return the native representation of a transform */
    public abstract Object transform(Tran2D t);

    /** Simple interface to a pixel image */
    public interface Image {
	public int getWidth();
	public int getHeight();
	public int getRGB(int x, int y);
	public void setRGB(int x, int y, int rgb);
	public Object getNative();
    }

    /** Create a blank image */
    public abstract Image image(int w, int h);

    /** Render a drawable picture as a pixel image */
    public abstract Image render(Stylus.Drawable pic, int width, int height, 
				 float slider, ColorValue background);

    /** Render a drawable picture with specified mean size */
    public Image render(Stylus.Drawable pic, int meanSize, float slider,
			ColorValue background) {
	float aspect = pic.getAspect();
    	float sqrtAspect = (float) Math.sqrt(aspect);
    	int width = Math.round(meanSize * sqrtAspect);
    	int height = Math.round(meanSize / sqrtAspect);
	return render(pic, width, height, slider, background);
    }

    /** Read an image from a file */
    public abstract Image readImage(InputStream in) throws IOException;

    /** Write an image to an output stream in a specified format */
    public abstract void writeImage(Image image, String format, 
				    OutputStream out) throws IOException;

    /** Write an image on a file */
    public void writeImage(Image image, String format, File file)
							throws IOException {
	OutputStream out = new FileOutputStream(file);
	writeImage(image, format, out);
	out.close();
    }

    /** The installed factory object for platform-dependent objects */
    private static Native factory;

    /** Register a concrete factory object */
    public static void register(Native factory) {
	Native.factory = factory;
    }

    /** Retreive the singleton factory */
    public static Native instance() {
	return factory;
    }
}
