///<reference path="../references.ts"/>
module GeomJS.Funbase {
  "use strict";
  /** This class provides the context for evaluating paragraphs: it imposes
    *  resource limits, and deals with errors that occur during evaluation.
    */
  export class Evaluator {
    private static runFlag: boolean;
    private static steps: number;
    private static conses: number;
    private static endTimeUtc: number;

    public static debug = 0;
    /* Debug levels:
       1 -- see ASTs before code gen
       2 -- see funcode */

    public static QUANTUM = 10000;
    public static quantum = 10000;

    private static timeLimit = 30000;
    private static stepLimit = 500000000;
    private static consLimit = 10000000;

    public static execute(fun: Func, ...args: Value[]): Value {
      this.runFlag = true;
      this.steps = 0;
      this.conses = 0;
      this.endTimeUtc = Date.now() + this.timeLimit;
      Interp.get.initStack();
      var result = fun.apply(args, args.length, 0);
      this.checkpoint();

      return result;
    }

    public static reset() {
      this.quantum = this.QUANTUM;
      this.steps = this.conses = 0;
    }

    public static checkpoint(): void {
      this.steps += (this.QUANTUM - this.quantum); // quantum interats with interp.ts
      if (this.stepLimit > 0 && this.steps > this.stepLimit) {
        this.error("#steps");
      }
      if (!this.runFlag) {
        this.error("#time");
      }

      this.quantum = this.QUANTUM;
    }

    public static countCons(): void {
      this.conses += 1;
      if (this.consLimit > 0 && this.conses > this.consLimit) {
        this.error("#memory");
      }
    }

    public static setLimits(timeLimit: number, stepLimit: number, consLimit: number): void {
      Evaluator.timeLimit = timeLimit;
      Evaluator.stepLimit = stepLimit;
      Evaluator.consLimit = consLimit;
    }

    public static printStats(): void {
     console.log("(" + this.steps + " step(s)" + ", " + this.conses + "conse(s)" + ")");
    }

    public static error(errtag: string, ...args: any[]): void {
      //var context: string[] = FunCode.getContext(null);
      console.log(errtag);
      console.log(args);
      throw new Evaluator.EvalError(errtag, args, "");
    }

    public static expect(name: string, expected: string): void {
      //var context: string[] = FunCode.getContext(null);
      this.error("#expect", "", expected);
    }

    // Complain about calling a non-function
    public static errApply(): void {
      this.error("#apply");
    }

    // Complain about pattern-matching with a non-constructor
    public static errMatch(): void {
      this.error("#constr");
    }

    // Complain when the wrong number of arguments is provided
    public static errNargs(name: string, nargs: number, arity: number): void {
      if (nargs === 1) {
        this.error("#numargs1", name, arity);
      } else {
        this.error("#numargs", name, nargs, arity);
      }
    }

    // Complain when no pattern matches in a function definition
    public static errNoMatch(args: Value[], base: number, arity: number): void {
      var buf = "";
      if (arity > 0) {
        buf += Value.print(args[base + 0]);
        for (var i: number = 1; i < arity; i++) {
          buf += (", " + Value.print(args[base + i]));
        }
      }

      if (arity === 1) {
        this.error("#match1", buf);
      } else {
        this.error("#match", buf);
      }
    }

    // Complain about an undefined name
    public static errNotDef(x: Name): void {
      this.error("#undef", x);
    }

    // Complain about a non-boolean guard or 'if' condition
    public static errBoolCond(): void {
      this.error("#condbool");
    }

    /* Complain about matching against a constructor with the
     *  wrong number of argument patterns
     */
    public static errPatNargs(name: string): void {
      this.error("#patnargs", name);
    }

    public static listFail(xs: Value, msg: string): void {
      this.error(msg, xs.type === Type.Nil ? "this empty list" : "a non-list");
    }
  }

  Primitive.store("_error", (tag: Value, args: Value): Value => {
    Evaluator.error(Value.string(tag), Value.array(args));
    return null;
  });

  Primitive.store("_limit", (time: Value, steps: Value, conses: Value): Value => {
    Evaluator.setLimits(
      Value.asNumber(time),
      Value.asNumber(steps),
      Value.asNumber(conses));
    return Value.nil;
  });
}

// The TypeScript way of doing nested classes
module GeomJS.Funbase.Evaluator {
  "use strict";
  // An exception raised because of a run-time error
  export class EvalError {
    public errtag: string;
    public args: any[];
    public context: string;

    constructor(errtag: string, args: any[]= null, context: string = null) {
      this.errtag = errtag;
      this.args = args;
      this.context = context;
    }
  }
}
