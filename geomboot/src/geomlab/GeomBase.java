/*
 * GeomBase.java
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

import java.io.BufferedReader;
import java.io.File;
import java.io.FileNotFoundException;
import java.io.FileReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.PrintWriter;
import java.io.Reader;

import java.util.Properties;

import funbase.Evaluator;
import funbase.Name;
import funbase.Primitive;
import funbase.Primitive.PRIMITIVE;
import funbase.Scanner;
import funbase.Value;
import funbase.Value.NumValue;
import funbase.FunCode;

/** Common superclass for classes that provide a read-eval-print loop */
public class GeomBase {
    protected boolean statsFlag = false;
    protected String errtag = "";
    protected int status = 0;
    private File currentFile = null;
    protected boolean echo;
    protected boolean display;
    protected PrintWriter log;
    protected Value last_val = null;
    protected Scanner scanner;
    public static final Properties properties = new Properties();

    /** Read application properties */
    public static void loadProperties() {
	ClassLoader loader = GeomLab.class.getClassLoader();
	InputStream propStream = loader.getResourceAsStream("properties");
	if (propStream != null) {
	    try {
		properties.load(propStream);
		propStream.close();
	    }
	    catch (IOException _) { 
		System.out.println("Panic -- couldn't find properties file");
		System.exit(2);
	    }
	}
    }

    public void setLog(PrintWriter log) {
        this.log = log;
    }

    public void logWrite(String s) {
	log.println(s);
	log.flush();
    }

    public void logWrite(Value v) {
	v.printOn(log);
	log.println();
	log.flush();
    }

    public void logMessage(String msg) {
	logWrite("[" + msg + "]");
    }

    public void errorMessage(String msg, String errtag) {
	logMessage(msg);
	if (status < 1) status = 1;
	this.errtag = errtag;
    }

    public void evalError(String prefix, String message, String errtag) {
	log.print(prefix); log.println(message); log.flush();
	if (status < 2) status = 2;
	this.errtag = errtag;
    }
 
    /** Called when a phrase has been parsed */
    protected void showPhrase() {
	if (echo) {
	    logWrite(scanner.getText());
	}
    }

    /** Called when evaluation of a top-level expression is complete */
    protected void exprValue(Value v) {
	last_val = v;
	if (display) {
	    log.print("--> ");
	    v.printOn(log);
	    log.println();
	}
    }

    /** Called when elaboration of a top-level definition is complete */
    protected void defnValue(Name n, Value v) {
	last_val = v;
	n.setGlodef(v, scanner.getText());
	if (display) {
	    log.format("--- %s = ", n);
	    v.printOn(log);
	    log.println();
	}
    }

    protected Value scan() {
	return scanner.nextToken();
    }

    public String formatError(String tag, Object args[]) {
	String msg = properties.getProperty("err"+tag, tag);
	return String.format(msg, args);
    }

    public void runtimeError(Evaluator.EvalError e) {
	String cxt = (e.context == null ? "" :
		      String.format(" in function '%s'", e.context));
	evalError("Aargh: ", 
		  formatError(e.errtag, e.args) + cxt, 
		  e.errtag);
    }

    public void syntaxError(Scanner.SyntaxError e) {
	evalError("Oops: ", 
		  String.format("%s (at %s on line %d)",
				formatError(e.errtag, e.args), 
				e.errtok, e.line), 
		  e.errtag);
    }

    public void failure(Throwable e) {
	e.printStackTrace(log);
	evalError("Failure: ", e.toString(), "#failure");
    }

    protected boolean eval_loop(Reader reader, boolean display) {
	return eval_loop(reader, display, display);
    }

    protected boolean eval_loop(Reader reader, boolean echo, boolean display) {
	Name top = Name.find("_top");
	Value.FunValue topdef = (Value.FunValue) top.glodef;
	Scanner scanner = new Scanner(reader);
	errtag = "";
	last_val = null;

	while (true) {
	    try {
		scanner.resetText();
		this.scanner = scanner;
		this.echo = echo;
		this.display = display;
		if (Evaluator.execute(topdef.subr) != Value.BoolValue.truth)
		    return true;

		if (display) {
		    if (statsFlag) Evaluator.printStats(log);
		    log.flush();
		}
	    }
	    catch (Scanner.SyntaxError e) {
		syntaxError(e);
		return false;
	    }
	    catch (Evaluator.EvalError e) {
		runtimeError(e);
		return false;
	    }
	    catch (Throwable e) {
		failure(e);
	        return false;
	    }
	}
    }

    /** Load from a file */
    protected void loadFromFile(File file, boolean display) {
        File save_currentFile = currentFile;
        try {
            Reader reader = new BufferedReader(new FileReader(file));
            currentFile = file;
            eval_loop(reader, display);
            logMessage("Loaded " + file.getName());
            try { reader.close(); } catch (IOException e) { /* Ignore */ }
        }
        catch (FileNotFoundException e) {
            errorMessage("Can't read " + file.getName(), "#nofile");
        } finally {
            currentFile = save_currentFile;
        }
    }

    protected void loadFromStream(InputStream in) {
	Reader reader = new InputStreamReader(in);
	eval_loop(reader, false);
    }

    public File getCurrentFile() { return currentFile; }

    public void exit() {
	System.exit(0);
    }

    public boolean getStatsFlag() { return statsFlag; }

    public void setStatsFlag(boolean statsFlag) {
        this.statsFlag = statsFlag;
    }

    public String getErrtag() { return errtag; }

    public int getStatus() { return status; }
    
    public String getEditText() { return ""; }
    
    public void setEditText(String text) {
	// Do nothing
    }

    public static GeomBase theApp;

    public static void registerApp(GeomBase app) {
	theApp = app;
    }

    @PRIMITIVE
    public static Value _scan(Primitive prim) {
	return theApp.scan();
    }

    @PRIMITIVE
    public static Value _synerror(Primitive prim, Value tag, Value args) {
	theApp.scanner.syntax_error(prim.string(tag), prim.toArray(args));
	return Value.nil;
    }

    @PRIMITIVE
    public static Value _setroot(Primitive prim, Value v) {
	FunCode.setRoot(v);
	Evaluator.startTimer();
	return Value.nil;
    }

    @PRIMITIVE
    public static Value _topval(Primitive prim, Value v) {
	theApp.exprValue(v);
	return Value.nil;
    }

    @PRIMITIVE
    public static Value _topdef(Primitive prim, Value x, Value v) {
	Name n = prim.cast(Name.class, x, "a name");
	theApp.defnValue(n, v);
	return Value.nil;
    }

    @PRIMITIVE
    public static Value _toptext(Primitive prim) {
	theApp.showPhrase();
	return Value.nil;
    }

    @PRIMITIVE
    public static Value _load(Primitive prim, Value fname0) {
	String fname = prim.string(fname0);
	File current = theApp.getCurrentFile();
	File file = (current == null ? new File(fname)
		     : new File(current.getParentFile(), fname));
	theApp.loadFromFile(file, false);
	return Value.nil;
    }

    @PRIMITIVE
    public static Value _print(Primitive prim, Value v) {
	theApp.logWrite(v);
	Thread.yield();
	return v;
    }

    @PRIMITIVE
    public static Value _debug(Primitive prim) {
	return NumValue.getInstance(funbase.Evaluator.debug);
    }

    /** Install a plug-in class with primitives. */
    @PRIMITIVE
    public static Value _install(Primitive prim, Value name) {
	String clname = prim.string(name);
	try {
	    Session.loadPlugin(Class.forName("plugins." + clname));
	}
	catch (Exception e) {
	    throw new Error(e);
	}
	return Value.nil;
    }

    @PRIMITIVE
    public static Value _save(Primitive prim, Value fname) {
	try {
	    Session.saveSession(new File(prim.string(fname)));
	    return Value.nil;
	} catch (Command.CommandException e) {
	    Evaluator.error("#save", e);
	    return null;
	}
    }
        
    @PRIMITIVE
    public static Value _restore(Primitive prim, Value fname) {
	try {
	    Session.loadSession(new File(prim.string(fname)));
	    return Value.nil;
	} catch (Command.CommandException e) {
	    Evaluator.error("#restore", e);
	    return null;
	}
    }

    @PRIMITIVE
    public static Value quit(Primitive prim) {
	theApp.exit();
	return Value.nil;
    }
}
