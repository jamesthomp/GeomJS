/*
 * CodeInput.java
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
import javax.swing.event.CaretEvent;
import javax.swing.event.CaretListener;
import javax.swing.event.UndoableEditEvent;
import javax.swing.event.UndoableEditListener;
import javax.swing.text.*;
import javax.swing.undo.CannotUndoException;
import javax.swing.undo.CompoundEdit;
import javax.swing.undo.UndoManager;

/** A TextArea that can register ActionListeners that are notified
 *  when the user presses Shift-Enter.  Other features: uses a document
 *  model where replacing text is a single undoable action, allows
 *  highlighting the region between brackets when a closing bracket is
 *  typed. */
public class CodeInput extends JTextArea {
    private ActionListener actionListener = null;
    private MyHighlightPainter lowlightPainter = new MyHighlightPainter();
    private Object lowlight = null;
    protected boolean showMatches = false;
    
    public CodeInput(int rows, int columns) {
	super(new ClumpUndoDocument(), "", rows, columns);
	installKeymap();
	
	Document doc = getDocument();
	doc.addUndoableEditListener(new UndoListener());
	
	// Remove the highlight whenever the insertion point moves
	addCaretListener(new CaretListener() {
	    @Override
	    public void caretUpdate(CaretEvent e) {
		removeLowlight();
	    }
	});
    }
    
    
    private void installKeymap() {
	Keymap keymap = JTextComponent.addKeymap(null, getKeymap());
	
	for (int i = 0; i < closers.length(); i++) {
	    final char ch = closers.charAt(i);
	    keymap.addActionForKeyStroke(
		KeyStroke.getKeyStroke(ch),
		new AbstractAction("insert-closer") {
		    @Override
		    public void actionPerformed(ActionEvent e) {
			replaceSelection(String.valueOf(ch));
			if (showMatches)
			    showMatch(getCaretPosition()-1);
		    }
		});
	}
	
	keymap.addActionForKeyStroke(
	    KeyStroke.getKeyStroke(KeyEvent.VK_ENTER, 
		    InputEvent.SHIFT_MASK),
		    new AbstractAction("perform-action") {
		@Override
		public void actionPerformed(ActionEvent e) {
		    performAction();
		}
	    });
	
	setKeymap(keymap);
    }
       
    @Override
    public void setText(String s) {
	removeLowlight();
	super.setText(s);
    }
    
    public void clear() {
	setText("");
    }
    
    public void setShowMatches(boolean showMatches) {
	this.showMatches = showMatches;
    }
    
    public boolean isShowMatches() {
	return showMatches;
    }
    
    private final String openers = "([{", closers = ")]}";
    
    public void showMatch(int j) {
	String text = this.getText();
	int depth = 1, i = j;
	
	while (i > 0 && depth > 0) {
	    i--;
	    char c = text.charAt(i);
	    if (openers.indexOf(c) >= 0)
		depth--;
	    else if (closers.indexOf(c) >= 0)
		depth++;
	}
	
	boolean ok = (depth == 0 && openers.indexOf(text.charAt(i)) 
		== closers.indexOf(text.charAt(j)));
	
	addLowLight(i, j+1, !ok);
    }
    
    public void addLowLight(int i1, int i2, boolean bad) {
	Highlighter h = getHighlighter();
	try {
	    lowlightPainter.setColor(bad ? Color.red : getSelectionColor());
	    lowlight = h.addHighlight(i1, i2, lowlightPainter);
	}
	catch (BadLocationException e) { /* Hope for the best */ }
    }
    
    public void removeLowlight() {
	Highlighter h = getHighlighter();
	if (lowlight != null) h.removeHighlight(lowlight);
	lowlight = null;
    }
    
    public void performAction() {
	removeLowlight();
	
	String command = this.getText();
	
	if (actionListener != null) {
	    actionListener.actionPerformed(
		    new ActionEvent(CodeInput.this, 
			    ActionEvent.ACTION_PERFORMED, 
			    command));
	}
    }
    
    public void addActionListener(ActionListener l) {
	actionListener = AWTEventMulticaster.add(actionListener, l);
    }
    
    public void removeActionListener(ActionListener l) {
	actionListener = AWTEventMulticaster.remove(actionListener, l);
    }
    
    private static class MyHighlightPainter 
    				extends LayeredHighlighter.LayerPainter {
	Color color = null;
	
	public MyHighlightPainter() { super(); }
	
	public void setColor(Color color) {
	    this.color = color;
	}
	
	@Override
	public void paint(Graphics g, int p0, int p1, 
		Shape bounds, JTextComponent c) {
	    // Never used
	    throw new Error("paint not implemented");
	}
	
	@Override
	public Shape paintLayer(Graphics g, int offs0, int offs1,
		Shape bounds, JTextComponent c, View view) {
	    // This returns the rectangle with the text, not the actual
	    // shape of the painted highlight.  Doesn't seem to matter.

	    // This could be speeded up in special cases, e.g. if the
	    // highlight coincides with bounds, or of the computed
	    // shape is a rectangle.
	    
	    final int thick = 2;
	    
	    try {
		Shape shape =
		    view.modelToView(offs0, Position.Bias.Forward,
			    offs1, Position.Bias.Backward, bounds);
		Rectangle r = shape.getBounds();
		g.setColor(color);
		g.fillRect(r.x, r.y + r.height - thick, r.width, thick);
		return r;
	    } 
	    catch (BadLocationException e) {
		return null;
	    }
	}
    }
    
    protected UndoManager undoManager = new UndoManager();

    private class UndoListener implements UndoableEditListener {
	public UndoListener() { }
	
	@Override	
	public void undoableEditHappened(UndoableEditEvent e) {
	    undoManager.addEdit(e.getEdit());
	}
    }
    
    public void undo() {
	try {
	    undoManager.undo();
	}
	catch (CannotUndoException e) { 
	    // Ignore
	}
    }

    public void clearUndo() {
	undoManager.discardAllEdits();
    }
    
    /** A variant of PlainDocument where the replace action generates
     *  a single undo event */
    private static class ClumpUndoDocument extends PlainDocument {
	private CompoundEdit clump = null;
	
	public ClumpUndoDocument() { }
	
	private void startClumping() {
	    clump = new CompoundEdit();
	}
	
	private void stopClumping() {
	    clump.end();
	    super.fireUndoableEditUpdate(new UndoableEditEvent(this, clump));
	    clump = null;
	}

	@Override
	public void replace(int start, int end, String text, AttributeSet as)
					throws BadLocationException {
	    startClumping();
	    try {
		super.replace(start, end, text, as);
	    }
	    finally {
		stopClumping();
	    }
	}
	
	@Override
	protected void fireUndoableEditUpdate(UndoableEditEvent e) {
	    if (clump != null)
		clump.addEdit(e.getEdit());
	    else
		super.fireUndoableEditUpdate(e);
	}
    }
}
