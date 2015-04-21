/*
 * GraphBox.java
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
import java.awt.print.*;
import java.io.*;
import javax.swing.*;
import javax.swing.event.*;

import funbase.Evaluator;
import plugins.Stylus;
import plugins.ColorValue;
import plugins.Native;
import geomlab.Command.CommandException;

/** A panel for displaying a Picture object */
public class GraphBox extends JPanel {
    protected Stylus.Drawable picture = null;

    protected final JComponent canvas = new JComponent() {
	@Override
	public void paintComponent(Graphics g) {
	    if (picture == null) return;
	    
	    try {
		float aspect = picture.getAspect();
	    
		if (aspect == 0.0) return;

		Dimension dim = getSize();
		int w = dim.width, h = dim.height;
	    
		/* Determine hh <= h and ww <= w so that hh = h or ww = w
		 * and ww/hh ~= aspect */ 
		int ww = w, hh = h;
		if (h * aspect >= w)
		    hh = (int) (w / aspect + 0.5f);
		else
		    ww = (int) (h * aspect + 0.5f);
	    
		Graphics2D g2 = (Graphics2D) g;
		g2.setRenderingHint(RenderingHints.KEY_ANTIALIASING,
				    RenderingHints.VALUE_ANTIALIAS_ON);
	    
		g2.translate((w - ww)/2, (h + hh)/2); g2.scale(1, -1);
                plugins.Stylus s = new ScreenStylus(g2, sliderValue());
		picture.draw(s, ww, hh, ColorValue.white);
	    }
	    catch (Throwable e) {
		GeomBase.theApp.failure(e);
		picture = null;
	    }
	}
    };
    
    private JSlider slider = new JSlider();
    
    private Worker worker = new Worker();

    public GraphBox() {
	worker.start();
	
	setLayout(new BorderLayout());
	canvas.setBackground(Color.lightGray);
	canvas.setPreferredSize(new Dimension(400, 400));
	add(canvas, "Center");
	add(slider, "South");
	slider.setVisible(false);
	
	slider.addChangeListener(new ChangeListener() {
	    @Override
	    public void stateChanged(ChangeEvent e) {
		prerender(picture);
	    }
	});
    }
    
    public void setPicture(Stylus.Drawable pic) {
	picture = null;
	slider.setVisible(pic != null && pic.isInteractive());
	slider.revalidate();
	prerender(pic);
    }
    
    public float sliderValue() { return slider.getValue() / 100.0f; }
    
    protected void prerender(Stylus.Drawable pic) {
	worker.prerender(pic, sliderValue());
    }
    
    private class Worker extends Thread {
	private Stylus.Drawable picture = null, newpic;
	private float slider, newslider;
	
	public Worker() { }
	
	public synchronized void prerender(Stylus.Drawable p, float s) {
	    newpic = p; newslider = s;
	    notify();
	}
	
	@Override
	public void run() {
	    for (;;) {
		synchronized(this) {
		    while (newpic == null 
			    || (picture == newpic && slider == newslider)) {
			// Up to date: wait to be woken
			try {
			    wait();
			}	
			catch (InterruptedException _) {
			    return;
			}
		    }
		    
		    picture = newpic; slider = newslider;
		}
		
		try {
		    picture.prerender(slider);
		}
		catch (Evaluator.EvalError e) {
		    GeomBase.theApp.runtimeError(e);
		    newpic = null;
		}
                catch (Throwable e) {
                    GeomBase.theApp.failure(e);
                    newpic = null;
                }
		
		if (picture == newpic) {
		    GraphBox.this.picture = picture;
		    repaint();
		}
	    }
	}
    }

    /** Command -- print the current picture */
    public void print() throws CommandException {
        if (picture == null) 
            throw new CommandException("#nopicture");
        
        PrinterJob job = PrinterJob.getPrinterJob();
        if (job == null)
            throw new CommandException("#noprint");
        
        job.setPrintable(new Printable() {
            @Override
            public int print(Graphics g, PageFormat fmt, int n) {
        	if (n > 0) return Printable.NO_SUCH_PAGE;
        	double width = fmt.getImageableWidth();
        	double height = fmt.getImageableHeight();
        	double x = fmt.getImageableX(), y = fmt.getImageableY();
        	float aspect = picture.getAspect();
        	
        	if (height * aspect >= width)
        	    height = width / aspect;
        	else
        	    width = height * aspect;
        	
                int ww = (int) width, hh = (int) height;

        	Graphics2D g2 = (Graphics2D) g;
        	g2.translate(x, y+hh); g2.scale(1, -1);
        	Stylus s = new ScreenStylus(g2, sliderValue());
        	picture.draw(s, ww, hh, ColorValue.white);
        	return Printable.PAGE_EXISTS;
            }
        });
        
        if (! job.printDialog()) return;
        
        try {
            job.print();
        }
        catch (PrinterException e) {
            throw new CommandException("#printfail");
        }
    }

    public boolean isPicture() { return picture != null; }

    private static final int imageMean = 400;

    public void writePicture(File file) throws IOException {
	Native factory = Native.instance();
	float slider = sliderValue();
	picture.prerender(slider);
	Native.Image image = 
	    factory.render(picture, imageMean, slider, ColorValue.white);
	factory.writeImage(image, "png", file);
    }
}   
