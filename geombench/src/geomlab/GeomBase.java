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

    public void errorMessage(Command.CommandException e) {
	logMessage(formatError(e));
	if (status < 1) status = 1;
	errtag = e.errtag;
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
	n.setGlodef(v);
	if (display) {
	    log.format("--- %s = ", n);
	    v.printOn(log);
	    log.println();
	}
    }

    public void obey(Command cmd) {
	try {
	    cmd.perform();
	}
	catch (Command.CommandException ex) {
	    errorMessage(ex);
	}
    }

    protected Value scan() {
	return scanner.nextToken();
    }

    public String formatError(Evaluator.MyError err) {
        // Just print the tag literally if it isn't defined
	String msg = properties.getProperty("err"+err.errtag, err.errtag);
	return String.format(msg, err.args);
    }

    public void runtimeError(Evaluator.EvalError e) {
	String cxt = (e.context == null ? "" :
		      String.format(" in function '%s'", e.context));
	evalError("Aargh: ", formatError(e) + cxt, e.errtag);
    }

    public void syntaxError(Scanner.SyntaxError e) {
	evalError("Oops: ", 
		  String.format("%s (at %s on line %d)",
				formatError(e), e.errtok, e.line), 
		  e.errtag);
    }

    public void failure(Throwable e) {
	// e.printStackTrace(log);
	evalError("Failure: ", e.toString(), "#failure");
    }

    protected boolean eval_loop(Reader reader, boolean display) {
	return eval_loop(reader, display, display);
    }

    protected boolean eval_loop(Reader reader, boolean echo, boolean display) {
	this.scanner = new Scanner(reader);
        this.scanner = scanner;
        this.echo = echo;
        this.display = display;

	errtag = "";
	last_val = null;

	while (true) {
	    try {
                Name top = Name.find("_top");
                Value.FunValue toplev = (Value.FunValue) top.getGlodef();
                scanner.resetText();
		if (Evaluator.execute(toplev.subr) != Value.BoolValue.truth)
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
        try {
            Reader reader = new BufferedReader(new FileReader(file));
            eval_loop(reader, display);
            // logMessage("Loaded " + file.getName());
            try { reader.close(); } catch (IOException e) { /* Ignore */ }
        }
        catch (FileNotFoundException e) {
            throw new Command.CommandException("#nofile", file.getName());
        }
    }

    protected void loadFromStream(InputStream in) {
	Reader reader = new InputStreamReader(in);
	eval_loop(reader, false);
    }

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
	theApp.scanner.syntax_error(prim.string(tag), 
                                    (Object []) prim.toArray(args));
	return Value.nil;
    }

    @PRIMITIVE
    public static Value _setroot(Primitive prim, Value v) {
	FunCode.setRoot(v);
        Evaluator.reset();
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

	// Add image primitive for benchmarking purposes
	//Don't actually do convert HSV to RGB or do file IO for benchmarking purposes
	@PRIMITIVE
	public static Value image(Primitive prim, Value w, Value h, Value f, Value outName) {
		double h2 = prim.number(h);
		double w2 = prim.number(w);
		Value.FunValue fun = prim.cast(Value.FunValue.class, f, "a function");
		for (int y = (int)Math.round(h2 - 1); y >= 0; y--) {
			for (int x = 0; x < w2; x++) {
				Value args[] = new Value[2];
				args[0] = NumValue.getInstance(x);
				args[1] = NumValue.getInstance(y);
				fun.apply(args);
			}
		}
		return Value.nil;
	}
}        
