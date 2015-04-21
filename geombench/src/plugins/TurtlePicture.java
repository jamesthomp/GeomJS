/*
 * TurtlePicture.java
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

import java.io.PrintWriter;

import funbase.Evaluator;
import funbase.Primitive;
import funbase.Primitive.PRIMITIVE;
import funbase.Value;


/** A picture drawn with a sequence of left, ahead, right commands. */
public class TurtlePicture extends Picture {
    private static final long serialVersionUID = 1L;
    
    public final Command commands[];
    public final float xmin, xmax, ymin, ymax;
    
    public static final float R = 0.5f;

    public TurtlePicture(Command commands[]) {
	super(calcAspect(commands));
	this.commands = commands;
	this.xmin = _xmin; this.xmax = _xmax;
	this.ymin = _ymin; this.ymax = _ymax;
    }

    // Global variables (yuck!) for values returned by calcAspect
    private static float _xmin, _xmax, _ymin, _ymax;

    /** Calculate aspect ratio and set _xmin, etc. */
    public static float calcAspect(Command commands[]) {
	float x = 0, y = 0, dir = 0;
	float xmin = -1, xmax = 1, ymin = -1, ymax = 1;
	
	for (Command cmd : commands) {
	    switch (cmd.kind) {
		case Command.LEFT: {
		    float a = cmd.arg;
		    float xc = x - R * Vec2D.sind(dir);
		    float yc = y + R * Vec2D.cosd(dir);
		    x = xc + R * Vec2D.sind(dir+a); 
		    y = yc - R * Vec2D.cosd(dir+a);
		    dir += a;
		    break;
		}

		case Command.RIGHT: {
		    float a = cmd.arg;
		    float xc = x + R * Vec2D.sind(dir);
		    float yc = y - R * Vec2D.cosd(dir);
		    x = xc - R * Vec2D.sind(dir-a); 
		    y = yc + R * Vec2D.cosd(dir-a);
		    dir -= a;
		    break;
		}

		case Command.AHEAD:
		    x += cmd.arg * Vec2D.cosd(dir);
		    y += cmd.arg * Vec2D.sind(dir);
		    break;

		case Command.TURN:
		    dir += cmd.arg;
		    break;

		case Command.PEN:
		    break;
	    }

	    // Update min/max values
	    if (x-1 < xmin) xmin = x-1;
	    if (x+1 > xmax) xmax = x+1;
	    if (y-1 < ymin) ymin = y-1;
	    if (y+1 > ymax) ymax = y+1;
	}
	
	_xmin = xmin; _xmax = xmax;
	_ymin = ymin; _ymax = ymax; 
	return (xmax - xmin)/(ymax - ymin); 
    }
    
    /** Make a vector by scaling coords */
    private Vec2D posVec(float x, float y) {
	return new Vec2D((x-xmin)/(xmax-xmin), (y-ymin)/(ymax-ymin));
    }
    
    @Override
    protected void paint(int layer, int c, Stylus g, Tran2D t) {
	if (layer == DRAW) {
	    g.setTrans(t);
	    g.drawPath(this);
	}
    }
    
    public void defaultDraw(Stylus g) {
	float x = 0, y = 0, dir = 0;
	boolean pen = true;

	g.setStroke(2);

	for (Command cmd : commands) {
	    switch (cmd.kind) {
		case Command.LEFT: {
		    float a = cmd.arg;
		    float xc = x - R * Vec2D.sind(dir);
		    float yc = y + R * Vec2D.cosd(dir);
		    Vec2D centre = posVec(xc, yc);
		    if (pen) 
			g.drawArc(centre, R/(xmax-xmin), R/(ymax-ymin),
				  dir-90, a, ColorValue.black);
		    x = xc + R * Vec2D.sind(dir+a); 
		    y = yc - R * Vec2D.cosd(dir+a);
		    dir += a;
		    break;
		}

		case Command.RIGHT: {
		    float a = cmd.arg;
		    float xc = x + R * Vec2D.sind(dir);
		    float yc = y - R * Vec2D.cosd(dir);
		    Vec2D centre = posVec(xc, yc);
		    if (pen) g.drawArc(centre, R/(xmax-xmin), R/(ymax-ymin), 
				       dir+90, -a, ColorValue.black);
		    x = xc - R * Vec2D.sind(dir-a); 
		    y = yc + R * Vec2D.cosd(dir-a);
		    dir -= a;
		    break;
		}
		    
		case Command.AHEAD: {
		    Vec2D oldpos = posVec(x, y);
		    x += cmd.arg * Vec2D.cosd(dir); 
		    y += cmd.arg * Vec2D.sind(dir);
		    Vec2D pos = posVec(x, y);
		    if (pen) g.drawLine(oldpos, pos, ColorValue.black);
		    break;
		}

		case Command.TURN:
		    dir += cmd.arg;
		    break;

		case Command.PEN:
		    pen = (cmd.arg != 0);
		    break;
	    }
	}
    }
    
    @PRIMITIVE
    public static Value turtle(Primitive prim, Value xs) {
	Command commands[] = 
	    prim.toArray(Command.class, xs, "a command list");
	return new TurtlePicture(commands);
    }	    
	
    /** A turtle command */
    public static class Command extends Value {
	/** Values for kind */
	public static final int 
	    LEFT = 0, RIGHT = 1, AHEAD = 2, TURN = 3, PEN = 4;
	
	/** The kind of command */
	public final int kind;

	/** Argument for the command */
	public final float arg;
	
	/** Name of the constructor */
	public final String name;

	public Command(int kind, float arg, String name) {
	    Evaluator.countCons();
	    this.kind = kind;
	    this.arg = arg;
	    this.name = name;
	}
	
	@Override
	public void printOn(PrintWriter pr) {
	    pr.print(name);
	    pr.print("(");
	    Value.printNumber(pr, arg);
	    pr.print(")");
	}

	@Override
	public boolean equals(Object a) {
	    return (a instanceof Command && this.equals((Command) a));
	}

	public boolean equals(Command a) {
	    return (this.kind == a.kind && this.arg == a.arg);
	}
    }

    /** A constructor primitive for commands */
    private static class CommandPrimitive extends Primitive.Prim1 {
	private int kind;
	
	public CommandPrimitive(String name, int kind) {
	    super(name);
	    this.kind = kind;
	}
	
	@Override
	public Value apply1(Value arg) {
	    return new Command(kind, (float) number(arg), name);
	}
	
	private Value args[] = new Value[1];

	@Override
	public Value[] pattMatch(Value obj, int nargs) {
	    if (nargs != 1) Evaluator.err_patnargs(name);
	    try {
		Command c = (Command) obj;
		if (c.kind != kind) return null;
		args[0] = NumValue.getInstance(c.arg);
		return args;
	    }
	    catch (ClassCastException _) {
		return null;
	    }
	}
    }
    
    @PRIMITIVE
    public static final Primitive 
	ahead = new CommandPrimitive("ahead", Command.AHEAD),
	left = new CommandPrimitive("left", Command.LEFT),
	right = new CommandPrimitive("right", Command.RIGHT),
	turn = new CommandPrimitive("turn", Command.TURN),
	pen = new CommandPrimitive("pen", Command.PEN);
}
