/*
 * AppFrame.java
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
import java.awt.event.*;
import java.io.*;
import javax.swing.*;
import javax.swing.border.*;
import java.util.*;
import javax.imageio.*;

/** The main GUI frame for the GeomLab application */
public class AppFrame extends JFrame {
    protected final CodeInput input = new CodeInput(20, 50);
    protected final JTextArea results = new JTextArea(20, 50);
    protected final Spinner spinner = new Spinner();
    protected JTabbedPane output = new JTabbedPane();

    private final JButton clearButton = 
	makeButton("Clear", new ActionListener() {
	    @Override
	    public void actionPerformed(ActionEvent e) {
		input.clear();
	    }
    });
    
    private final JButton goButton = makeButton("Go", new ActionListener() {
	@Override
	public void actionPerformed(ActionEvent e) {
	    input.performAction();
	}
    });

    private static final int b = 5;

    private static String icons[] = {
	"icon16", "icon32", "icon64", "icon128"
    };

    public AppFrame() {
	super("GeomLab");
	setLocation(50, 50);
	setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
	setGlassPane(spinner);

	//try {
	    ClassLoader loader = AppFrame.class.getClassLoader();
	    java.util.List<Image> images = new ArrayList<Image>();
	    for (int i = 0; i < icons.length; i++) {
		//InputStream in = loader.getResourceAsStream(icons[i] + ".png");
		//images.add(ImageIO.read(in));
		//in.close();
	    }
	    setIconImages(images);
	//}
	//catch (IOException _) { }

	Border bevel = BorderFactory.createBevelBorder(BevelBorder.LOWERED);
	Border spacer = BorderFactory.createEmptyBorder(b, b, b, b);
	Border myborder = BorderFactory.createCompoundBorder(bevel, spacer);
	
	JPanel buttons = new JPanel(new VariGridLayout(1, 4));
	buttons.add(clearButton);
	buttons.add(goButton);

	input.setLineWrap(true);
	input.setBorder(myborder);
	input.setMinimumSize(new Dimension(100, 100));

	JPanel controls = new JPanel(new BorderLayout());
	controls.add(input, "Center");
	controls.add(buttons, "South");

	JTabbedPane left = new JTabbedPane();
	left.addTab("Input", controls);

	results.setEditable(false);
	results.setLineWrap(true);
	results.setBorder(spacer);
	JScrollPane scroller = 	
	    new JScrollPane(results,
		ScrollPaneConstants.VERTICAL_SCROLLBAR_ALWAYS,
	        ScrollPaneConstants.HORIZONTAL_SCROLLBAR_NEVER);
	scroller.setBorder(bevel);

	output.addTab("Results", scroller);

	JSplitPane split = 
	    new JSplitPane(JSplitPane.HORIZONTAL_SPLIT, true,
			   left, output);

	Container content = getContentPane();
	content.add(split, "Center");
    }

    public void addActionListener(ActionListener listener) {
	input.addActionListener(listener);
    }
    
    private static JButton makeButton(String text, ActionListener action) {
	JButton button = new JButton(text);
	button.addActionListener(action);
	return button;
    }
    
    @Override
    public void setFont(Font font) {
	super.setFont(font);
        results.setFont(font);
        input.setFont(font);
    }

    @Override
    public void setEnabled(boolean enabled) {
        super.setEnabled(enabled);
        input.setEnabled(enabled);
        clearButton.setEnabled(enabled);
        goButton.setEnabled(enabled);
        
        JMenuBar menubar = getJMenuBar();
        if (menubar != null) {
	    int n = menubar.getComponentCount();
	    for (int i = 0; i < n; i++) {
		Component menu = menubar.getComponent(i);
		menu.setEnabled(enabled);
	    }
	}
    }
    
    public void showError(int start, int end) {
	input.setEnabled(true);
	input.setSelectionStart(start);
	input.setSelectionEnd(end);
    }

    public PrintWriter getLogWriter() { 
	Writer writer = new Writer() {
		@Override
		public void write(char buf[], int base, int len) {
		    final String s = new String(buf, base, len);
		    SwingUtilities.invokeLater(new Runnable() { 
			public void run() { 
			    results.append(s); 
			} 
		    });
		}
	    
		@Override
		public void flush() {
		    javax.swing.text.Document doc = results.getDocument();
		    results.setCaretPosition(doc.getLength());
		    output.setSelectedIndex(0);
		}
	    
		@Override
		public void close() { /* Do nothing */ }
	    };
	
	return new PrintWriter(new BufferedWriter(writer)); 
    }
}
