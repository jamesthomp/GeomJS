/*
 * Command.java
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
import javax.swing.*;

import funbase.Primitive;
import funbase.Primitive.PRIMITIVE;
import funbase.Value;

import java.io.File;
import java.io.IOException;

/** A command that may be appear on a menu.  Static methods of this class
 *  create the menus for the application */
public abstract class Command extends AbstractAction {
    private GeomLab app;
    
    private static int modifier =
	Toolkit.getDefaultToolkit().getMenuShortcutKeyMask();

    public Command(String text, GeomLab app) {
	super(text);
	this.app = app;
    }
    
    public Command(String text, int mnemonic, GeomLab app) {
	super(text);
	putValue(MNEMONIC_KEY, new Integer(mnemonic));
	this.app = app;
    }
    
    public Command(String text, int mnemonic, int accel, GeomLab app) {
	this(text, mnemonic, app);
	putValue(ACCELERATOR_KEY, KeyStroke.getKeyStroke(accel, modifier));
    }
    
    @Override
    public void actionPerformed(ActionEvent e) {
	try {
	    perform();
	}
	catch (CommandException ex) {
	    app.errorMessage(ex.getMessage(), ex.getErrtag());
	}
    }
    
    public abstract void perform() throws CommandException;
    
    private static JMenu examples;
    
    /** Create the menu bar for the application */
    public static JMenuBar makeAppMenuBar(GeomLab app) {
	JMenuBar menuBar = new JMenuBar();
	menuBar.add(makeFileMenu(app));
	menuBar.add(makeEditMenu(app));
	menuBar.add(makeToolsMenu(app));
	examples = makeExamplesMenu(app);
	menuBar.add(examples);
	menuBar.add(makeOptionsMenu(app));
	menuBar.add(Box.createHorizontalGlue());
	menuBar.add(makeHelpMenu(app));
	return menuBar;
    }
    
    private static JMenu makeFileMenu(final GeomLab app) {
	JMenu menu = new JMenu("File");
        menu.setMnemonic(KeyEvent.VK_F);
        menu.add(new Command("Load...", KeyEvent.VK_L, app) { 
            @Override
	    public void perform() throws CommandException {
        	JFileChooser loadDialog = new MyFileChooser();
		if (loadDialog.showOpenDialog(app.frame) 
			== JFileChooser.APPROVE_OPTION) {
		    File file = loadDialog.getSelectedFile();
		    app.loadFileCommand(file);
		}
            }
        });
        menu.addSeparator();
        menu.add(new Command("Load session ...", KeyEvent.VK_O, app) { 
            @Override
	    public void perform() throws CommandException {
        	JFileChooser loadDialog = new MyFileChooser(".gls");
		if (loadDialog.showOpenDialog(app.frame)
			== JFileChooser.APPROVE_OPTION) {
		    File file = loadDialog.getSelectedFile();
		    Session.loadSession(file);
		    app.logMessage("Loaded session from " + file.getName());
		}
            }
        });
        menu.add(new Command("Save session ...", KeyEvent.VK_S, app) { 
            @Override
	    public void perform() throws CommandException {
        	JFileChooser saveDialog = new MyFileChooser(".gls");
		if (saveDialog.showSaveDialog(app.frame)
			== JFileChooser.APPROVE_OPTION) {
		    File file = saveDialog.getSelectedFile();
		    Session.saveSession(file);
		    app.logMessage("Saved session as " + file.getName());
		}
            }
        }); 	 
        menu.addSeparator();
        menu.add(new Command("Exit", KeyEvent.VK_X, app) {
            @Override
            public void perform() { app.exit(); }
        });
	return menu;
    }

    private static JMenu makeEditMenu(final GeomLab app) {
	JMenu menu = new JMenu("Edit");
	menu.add(new Command("Undo", KeyEvent.VK_U, KeyEvent.VK_Z, app) {
	    @Override
	    public void perform() { app.frame.input.undo(); }
	});
	menu.add(new Command("Cut", KeyEvent.VK_T, KeyEvent.VK_X, app) {
	    @Override
	    public void perform() { app.frame.input.cut(); }
	});
	menu.add(new Command("Copy", KeyEvent.VK_C, KeyEvent.VK_C, app) {
	    @Override
	    public void perform() { app.frame.input.copy(); }
	});
	menu.add(new Command("Paste", KeyEvent.VK_P, KeyEvent.VK_V, app) {
	    @Override
	    public void perform() { app.frame.input.paste(); }
	});
        menu.add(new Command("Clear expression", KeyEvent.VK_E, app) {
            @Override
            public void perform() { app.frame.input.clear(); }
        });
	return menu;
    }

    private static JMenu makeToolsMenu(final GeomLab app) {
	JMenu menu = new JMenu("Tools");
        menu.setMnemonic(KeyEvent.VK_T);
        menu.add(new Command("Evaluate expression", KeyEvent.VK_E, 
			     KeyEvent.VK_ENTER, app) {
            @Override
            public void perform() { app.frame.input.performAction(); }
        });
        menu.add(new Command("List defined names", KeyEvent.VK_L,  app) {
            @Override
            public void perform() { app.listNames(); }
        });
        menu.add(new Command("Find definition", KeyEvent.VK_F,  app) {
            @Override
            public void perform() { app.findDefinition(); }
        });
	return menu;
    }
    
    private static JMenu makeExamplesMenu(final GeomLab app) {
	JMenu menu = new JMenu("Examples");
	menu.setMnemonic(KeyEvent.VK_X);
	menu.setVisible(false);
	return menu;
    }
    
    public static void fillExamplesMenu(String items[], final GeomLab app) {
	examples.removeAll();
	for (int i = 0; i < items.length; i++) {
	    final String ex = items[i];
	    int ix = ex.indexOf("\n");
	    if (ix < 0) ix = ex.length();
	    examples.add(new Command(String.format("%d: %s", 
		    			i+1, ex.substring(0, ix)), app) {
		@Override
		public void perform() {
		    app.frame.input.setText(ex);
		    app.frame.input.performAction();
		}
	    });
	}
	examples.setVisible(items.length > 0);
    }

    private static JMenu makeOptionsMenu(final GeomLab app) {
	JMenu menu = new JMenu("Options");
        menu.setMnemonic(KeyEvent.VK_O);
        menu.add(new Option("Match brackets", KeyEvent.VK_B) {
            @Override
	    public boolean isValue() { 
        	return app.frame.input.isShowMatches(); 
            }
            @Override
            public void setValue(boolean value) {
        	app.frame.input.setShowMatches(value);
            }
        });
        menu.add(new Command("Larger font", KeyEvent.VK_L, app) {
            @Override
            public void perform() {
        	app.fontScale(1.2f);
            }
        });
        menu.add(new Command("Smaller font", KeyEvent.VK_S, app) {
            @Override
            public void perform() {
        	app.fontScale(1/1.2f);
            }
        });
        menu.add(new Option("Count reduction steps", KeyEvent.VK_C) {
            @Override
            public boolean isValue() {
        	return app.getStatsFlag();
            }
            @Override
            public void setValue(boolean value) {
        	app.setStatsFlag(value);
            }
        });
        return menu;
    }

    private static JMenu makeHelpMenu(final GeomLab app) {
	JMenu menu = new JMenu("Help");
        menu.setMnemonic(KeyEvent.VK_H);
        menu.add(new Command("Contents ...", KeyEvent.VK_C, app) {
            @Override
            public void perform() { HelpFrame.showContents(); }
        });
        menu.add(new Command("Help after an error ...", KeyEvent.VK_E, app) {
            @Override
            public void perform() { HelpFrame.errorHelp(app.getErrtag()); }
        });
        menu.add(new Command("About GeomLab ...", KeyEvent.VK_A,  app) {
            @Override
	    public void perform() { app.aboutBox(); }
        });
	return menu;
    }

    public static class CommandException extends Exception {
	private String errtag;
	
	public CommandException(String message, String errtag) {
	    super(message);
	    this.errtag = errtag;
	}
	
	public String getErrtag() { return errtag; }
    }

    /** A boolean option that can appear on a menu. */
    private static abstract class Option extends JCheckBoxMenuItem 
    implements ActionListener {
	public Option(String text, int mnemonic) {
	    super(text);
	    setMnemonic(mnemonic);
	    setSelected(isValue());
	    addActionListener(this);
	}
	
	@Override
	public void actionPerformed(ActionEvent e) {
	    setValue(isSelected());
	}
	
	public abstract boolean isValue();
	public abstract void setValue(boolean value);
    }
        
    @PRIMITIVE
    public static Value _examples(Primitive prim, Value xs) {
	Value args[] = prim.toArray(xs);
	String examples[] = new String[args.length];
	for (int i = 0; i < args.length; i++)
	    examples[i] = prim.string(args[i]);
	GeomLab app = (GeomLab) GeomBase.theApp;
	fillExamplesMenu(examples, app);
	return Value.nil;
    }
}
