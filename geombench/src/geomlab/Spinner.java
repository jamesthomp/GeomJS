/*
 * Spinner.java
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
import java.awt.Graphics;
import java.awt.Graphics2D;
import java.awt.RenderingHints;
import java.awt.geom.AffineTransform;
import java.awt.geom.Area;
import java.awt.geom.Ellipse2D;
import java.awt.geom.Rectangle2D;

import javax.swing.JComponent;

/** A spinner that can be displayed during long-running evaluations. */
public class Spinner extends JComponent implements Runnable {
    protected boolean running = false;
    protected int level = 0;
    protected int angle = 0;
    
    Thread animate = new Thread(this);
    
    public static final int MAX = 20;
    public static final int tick = 100;
    public static final int NBARS = 12;
    
    /** The radial bars that make up the spinner. */
    private static final Area bars[] = new Area[NBARS];
    
    static {
        Area bar = new Area(new Rectangle2D.Float(22, -2, 16, 4));
        bar.add(new Area(new Ellipse2D.Float(20, -2, 4, 4)));
        bar.add(new Area(new Ellipse2D.Float(36, -2, 4, 4)));
        for (int i = 0; i < NBARS; i++) {
    	AffineTransform rot = 
    	    AffineTransform.getRotateInstance(-2*Math.PI*i/NBARS);
    	bars[i] = bar.createTransformedArea(rot);
        }
    }
    
    @Override
    public void run() {
        try {
    	for (;;) {
    	    // Wait until an evaluation is running
    	    synchronized (this) {
    		while (!running) {
    		    level = 0;
    		    wait();
    		}
    	    }
    		
    	    // Delay for 1s before showing the spinner
    	    if (level == 0)
    		Thread.sleep(1000);

    	    // Fade in the spinner gradually
    	    if (running && level < MAX) 
    		level++;

    	    angle = (angle+1)%NBARS;
    	    repaint();
    	    Thread.sleep(tick);
    	}
        } catch (InterruptedException _) {
    	// Die
        }
    }
    
    public Spinner() {
        animate.start();
    }
    
    public synchronized void start() {
        running = true;
        setVisible(true);
        notify();
    }
    
    public synchronized void stop() {
        running = false;
        setVisible(false);
    }
    
    @Override
    public void paintComponent(Graphics g) {
        Graphics2D g2 = (Graphics2D) g;
        g2.setRenderingHint(RenderingHints.KEY_ANTIALIASING,
    		RenderingHints.VALUE_ANTIALIAS_ON);
        g2.translate(getWidth()/2.0, getHeight()/2.0);
        g2.rotate(2*Math.PI*angle/NBARS);
        for (int i = 0; i < NBARS; i++) {
    	int grey = i * 255 / NBARS;
    	g2.setColor(new Color(grey, grey, grey, (255 * level) / MAX));
    	g2.fill(bars[i]);
        }
    }
}
