///<reference path="../references.ts"/>
module GeomJS.Funbase {
  "use strict";
  export interface FunCode extends Value {
    name: string; /** Name of function */
    arity: number; /** Arity of function */
    ops: number[]; /** Opcodes for the instructions */
    rands: number[]; /** Operands for the instructions */
    consts?: Value[];  /** Constant pool */
    frozen: boolean; /** Can the function be modified? */
  }

  /** Assemble a list of instructions into a function body */
  Primitive.store("_assemble", (name: Value, arity: Value, code: Value): Value => {
    var instrs: FunCode.Opcode[] = [];
    var rands: number[] = [];
    var ip = 0;
    var consts: Value[] = [];

    for (var xs = code; Value.isCons(xs); xs = Value.tail(xs)) {
      var inst = Value.head(xs);
      var x = Value.name(Value.head(inst)).name;
      var op = FunCode.Opcode[x];
      var args = Value.tail(inst);
      var rand: number;

      if (!Value.isCons(args)) {
        /* No argument */
        rand = FunCode.NO_RAND;
      } else {
        var v = Value.head(args);
        switch (op) {
          case FunCode.Opcode.GLOBAL:
          case FunCode.Opcode.QUOTE:
          case FunCode.Opcode.MPLUS:
            /* An argument that goes in the constant pool */
            rand = consts.indexOf(v);
            if (rand < 0) {
              rand = consts.length;
              consts.push(v);
            }
            break;
          default:
            /* An integer argument */
            rand = Value.asNumber(v);
            break;
        }
      }

      instrs[ip] = op;
      rands[ip] = rand;
      ip++;
    }
    var thisName = name.type === Type.String ?
      Value.string(name) :
      Value.name(name).name; //Its fine, I checked.
    return FunCode.create(thisName, Value.asNumber(arity), instrs, rands, consts);
  });

  export module FunCode {
    "use strict";
    export var NO_RAND = 0x8000000;
    export function create(name: string, arity: number, ops: number[], rands: number[], consts: Value[] = null): Funbase.FunCode {
      var ret = {
        "type": Type.Funcode,
        "arity": arity,
        "name": name,
        "ops": ops,
        "rands": rands,
        "subr": Func.nullFunction(),
        "frozen": Name.getFreezer()
    };
      if (consts) {
        ret["consts"] = consts;
      }
      return ret;
    }

    /** Construct a wrapped closure and tie the knot for local recursion */
    export function makeClosure(code: FunCode, fvars: Value[]) : Value {
      var result = {
        type: Type.Funvalue,
        name: code.name,
        subr: Interp.get.translate(code, fvars)
      };
      fvars[0] = result;
      return result;
    }

    /** Enumerated type of opcodes for the Fun machine */
    export enum Opcode {
      GLOBAL,      /* [#global, x] becomes GLOBAL i where consts[i] = x:
			                push value of global name x */
      LOCAL,       /* [#local, n]: push value of local variable n */
      ARG,	       /* [#arg, n]: push value of argument n */
      FVAR,        /* [#fvar, n]: push value of free variable n */
      BIND,        /* [#bind, n]: pop value and store as local n */
      POP,         /* [#pop]: pop and discard a value */
      QUOTE,       /* [#quote, x] becomes QUOTE i where consts[i] = x:
		                    push the constant x */
      NIL,	       /* [#nil]: push the empty list */
      CONS,        /* [#cons]: pop a tail then a head, push a cons */
      TRAP,        /* [#trap, lab] becomes TRAP i: set trap register */
      FAIL,        /* [#fail]: die with "no clause matched" */
      JFALSE,      /* [#jfalse, lab] becomes JFALSE n:
		     	              pop a boolean and jump if false */
      JUMP,        /* [#jump, lab] becomes JUMP n:
		     	              jump to instruction at offset n */
      RETURN,      /* [#return]: return from function */
      MPLUS,       /* [#mplus, k]: match an n+k pattern by popping integer
		     	              x with x >= k and pushing x-k; otherwise trap */
      MEQ,         /* [#meq]: pop two values and trap if not equal */
      MNIL,        /* [#mnil]: pop the empty list; otherwise trap */
      MCONS,       /* [#mcons]: pop a cons cell and push its tail and head */
      GETTAIL,     /* [#gettail]: fetch tail following MCONS */
      TCALL,       /* [#tcall, n]: tail recursive call */
      PREP,        /* [#prep, n]: prepare for a call with n arguments */
      FRAME,       /* [#frame, n]: create a free var frame with n slots */
      PUTARG,      /* [#putarg, i]: mark i'th argument of a call */
      CALL,        /* [#call, n]: call a function with n arguments */
      CLOSURE,     /* [#closure, n]: form a closure with n free variables */
      MPRIM        /* [#mprim, n]: pattern match a constructor with n args */
    }
  }
}