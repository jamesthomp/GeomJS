/*
 * GeomLab.java
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

import funbase.Name;
import funbase.Value;
import funbase.Evaluator;
import geomlab.Command.CommandException;
import plugins.Stylus.Drawable;
import plugins.Native;

import java.awt.*;
import java.awt.event.ActionEvent;
import java.awt.event.ActionListener;
import java.io.*;
import javax.swing.*;
import javax.swing.UIManager.*;

/** The main application class for GeomLab.
 * 
 *  The Geomlab application is made up of three parts: (i) an interpreter for
 *  the core of the GeomLab language, (iii) a graphical interface where you can
 *  enter GeomLab expressions and have them submitted to the interpreter,
 *  and (iii) a collection of classes that implement primitives that are
 *  included in the initial environment of the interpreter.  These pieces are
 *  quite independent of each other: for example, the interpreter knows
 *  nothing about the data type of pictures that's implemented by the
 *  Picture class.  The GUI knows how to display pictures that satisfy the
 *  Drawable interface (as instances of Picture do), but does not
 *  know any details of how pictures are made up.
 */
public class GeomLab extends GeomBase {
    public AppFrame frame;
    
    private File currentFile = null;

    public void activate() {
	try {
	    SwingUtilities.invokeAndWait(new Runnable() {
		public void run() {
		    frame = new AppFrame(properties.getProperty("appname"));
		    loadFontResource();
		    setLog(frame.getLogWriter());

		    frame.setJMenuBar(Command.makeAppMenuBar(GeomLab.this));
		    frame.pack();

		    frame.addActionListener(new ActionListener() {
			@Override
			public void actionPerformed(ActionEvent e) {
			    evaluate();
			}
		    });

		    frame.setVisible(true);
		    frame.input.requestFocusInWindow();
		}
	    });
	}
	catch (Exception e) {
	    throw new Error(e);
	}
    }
    
    /** Update the picture display */
    protected void displayUpdate(Value val) {
	if (val != null && (val instanceof Drawable))
	    frame.setPicture((Drawable) val);
	else
	    frame.setPicture(null);
    }
    
    public void setCurrentFile(File file) {
        currentFile = file;
        frame.setFilename(file.getName());
    }

    public File getCurrentFile() { return currentFile; }

    /** Load file into the input area */
    public void loadInput(File file) throws CommandException {
        try {
            Reader in = new FileReader(file);
            frame.loadInput(in);
            in.close();

            setCurrentFile(file);
        }
        catch (IOException _) {
            throw new CommandException("#readerr");
        }
    }

    /** Save input area to file */
    public void saveInput(File file) throws CommandException {
        try {
            Writer out = new FileWriter(file);
            frame.saveInput(out);
            out.close();

            setCurrentFile(file);
        }
        catch (IOException _) {
            throw new CommandException("#writeerr");
        }
    }

    /** Display location of syntax error. */
    @Override
    public void syntaxError(funbase.Scanner.SyntaxError e) {
	evalError("Oops: ", formatError(e), e.errtag);
	frame.showError(e.start, e.end);	
    }

    /** Command -- evaluate expressions */
    public void evaluate() {
	/* This runs the commands in another thread to allow
	 * display updates during evaluation */
	
	String command = frame.input.getText();
	
	frame.setEnabled(false);
	frame.results.setText("");

	final StringReader reader = new StringReader(command);
	
	Thread evalThread = new Thread() {
	    @Override
	    public void run() {
                funbase.Name.reset();
		eval_loop(reader, true);
		EventQueue.invokeLater(new Runnable() {
		    @Override
		    public void run() {
			frame.spinner.stop();
			displayUpdate(last_val);
			frame.setEnabled(true);
		    }
		});
	    }
	};
	
	frame.spinner.start();
	evalThread.start();
    }

    /** Command -- paste a list of global names into the log */
    public void listNames() {
	java.util.List<String> names = Name.getGlobalNames();
	
	log.println();
	if (names.size() == 0)
	    log.print("(no global definitions)");
	else {
	    final int MAX = 40;
	    String s = names.get(0);
	    int w = s.length(); 
	    log.print(s);
	    for (int i = 1; i < names.size(); i++) {
		s = names.get(i);
		if (w + s.length() + 2 < MAX) {
		    w += 2; log.print(", ");
		} else {
		    w = 0; log.println(",");
		}
		w += s.length();
		log.print(s);
	    }
	}
	log.println();
	log.flush();
    }

    /** Command -- show the about box */
    public void aboutBox() {
        String version = properties.getProperty("version");
	String copyright = properties.getProperty("copyright");
        String licence = properties.getProperty("licence");
        JTextArea licenceArea = new JTextArea(licence);
        licenceArea.setEditable(false);
        String javaVersion = System.getProperty("java.version");
        Object contents[] = new Object[] { version, copyright, licenceArea, 
        	"Java version " + javaVersion };
        JOptionPane.showMessageDialog(frame, contents, "About GeomLab",
        	JOptionPane.INFORMATION_MESSAGE);
    }

    private static Font fontResource = null;

    private float fontScale = 1.0f;

    public void fontScale(float s) {
	fontScale *= s;
	loadFontResource();
    }

    private void loadFontResource() {
	String fontName = properties.getProperty("fontname");
	String sizeSpec = properties.getProperty("fontsize", "14");
	float fontSize;

	try { 
	    fontSize = Float.parseFloat(sizeSpec); 
	}
	catch (NumberFormatException _) { 
	    throw new Error("bad fontsize");
	}

        if (fontName != null && fontResource == null) {
            ClassLoader loader = GeomLab.class.getClassLoader();
            InputStream stream = loader.getResourceAsStream(fontName + ".ttf");
        
            if (stream != null) {
        	try {
        	    fontResource = Font.createFont(Font.TRUETYPE_FONT, stream);
        	}
        	catch (IOException e) { /* Ignore */ } 
        	catch (FontFormatException e) { /* Keep calm */ }
        	finally { 
        	    try { stream.close(); } 
        	    catch (IOException e) { /* Carry on */ }
        	}
            }
        }
            	
    	if (fontResource != null)
    	    setFont(fontResource.deriveFont(fontScale * fontSize));
	else
    	    setFont(new Font("Default", Font.PLAIN, 
			     Math.round(fontScale * fontSize)));
    }
    
    private void setFont(Font font) {
	frame.setFont(font);
    }

    @Override
    public String getEditText() {
	return frame.input.getText();
    }

    @Override
    public void setEditText(String text) {
	frame.input.setText(text);
	frame.input.clearUndo();
    }

    public static void main(String args[]) {
	int j = 0;
	File sessfile = null;
	if (j+1 < args.length && args[j].equals("-s")) {
	    sessfile = new File(args[j+1]);
	    j += 2;
	}

	// Under Java Web Start, the default security manager doesn't allow
	// creation of new class loaders; and the policy doesn't allow
	// loading of unsigned code.
	System.setSecurityManager(null);
	java.security.Policy.setPolicy(null);
	GeomBase.loadProperties();

	// System-dependent UI tweaks
	if (System.getProperty("mrj.version") != null) {
	    // Use Mac menu bar
	    System.setProperty("apple.laf.useScreenMenuBar", "true");
	    System.setProperty(
                "com.apple.mrj.application.apple.menu.about.name", "GeomLab");
	} else {
	    // Try for a specified look and feel.
	    String spec = properties.getProperty("lookandfeel");
	    if (spec != null) {
		try {
		    for (LookAndFeelInfo info : 
			     UIManager.getInstalledLookAndFeels()) {
			if (info.getName().equals(spec)) {
			    UIManager.setLookAndFeel(info.getClassName());
			    break;
			}
		    }
		} catch (Exception e) {
		    // Stick with default L&F
		}
	    }
	}
	
	Native.register(new AWTFactory());
	GeomLab app = new GeomLab();
	GeomBase.registerApp(app);
	app.activate();
	app.logWrite("--- fac = <function(1)>\n--> 5");
	
	funbase.FunCode.install
	    (new funjit.TofuTranslator(new funjit.InlineTranslator()));

	try {
	    if (sessfile != null)
		Session.loadSession(sessfile);
	    else {
		String image = System.getProperty("jnlp.session");
		if (image == null) 
		    image = properties.getProperty("session", "geomlab.gls");
		Session.loadResource(image);
	    }
	    Session.loadPlugin(Command.class);
	}
	catch (CommandException e) {
	    app.errorMessage(e);
	}
	
        if (j < args.length) {
            try {
                app.loadInput(new File(args[j]));
            }
            catch (CommandException _) {
                JOptionPane.showMessageDialog(app.frame,
                    "Couldn't load " + args[j],
                    "Oops!", JOptionPane.ERROR_MESSAGE);
            }
        }

	Name init = Name.find("_init");
	if (init.getGlodef() != null) {
	    Value.FunValue fun = (Value.FunValue) init.getGlodef();
	    Evaluator.execute(fun.subr, new Value[0]);
	}

	app.log.flush();
    }
}
