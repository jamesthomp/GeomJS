///<reference path="../references.ts"/>
module GeomJS.Funbase {
  "use strict";

  /** A simple runtime translator that interprets the funcode */
  export class Interp {
    public static get: Interp = new Interp();
    private static backtrace: FunCode[];
    private root: FunCode = null;

    // turns funcode into a func that can be applied
    public translate(funcode: FunCode, fvars: Value[]): Func {
      return {
        type: Type.Func,
        arity: funcode.arity,
        apply: (args: Value[], nargs: number, base: number): Value => this.apply(funcode.arity, funcode, fvars, args, base, nargs),
        pattMatch: (obj: Value, nargs: number): Value[] => null,
        code: funcode
      };
    }

    public initStack(): void {
      Interp.backtrace = [];
      this.root = null;
    }

    public setRoot(root: Value): void {
      this.root = Value.funcode(root);
    }

    // interprets FunCode instructions
    public apply(arity: number, code: FunCode, fvars: Value[], args: Value[], base: number, nargs: number): Value {
      Interp.backtrace.push(code);

      if (nargs !== arity)
        Evaluator.errNargs(code.name, nargs, arity);

      if (--Evaluator.quantum <= 0) Evaluator.checkpoint();

      var instrs: FunCode.Opcode[] = code.ops;
      var rands: number[] = code.rands;
      var frame: Value[] = new Array(256);
      var pc = 0;
      var trap = -1;
      var sp = 0;

      for (; ;) {
        var op: FunCode.Opcode = instrs[pc];
        var rand: number = rands[pc];

        pc++;

        switch (op) {
          case FunCode.Opcode.GLOBAL: {
            var x: Name = Value.name(code.consts[rand]);
            var v = Name.getGlodef(x);
            if (!v || v.type === Type.Name) {
              Evaluator.errNotDef(x);
            }
            frame[sp++] = v;
            break;
          }

          case FunCode.Opcode.LOCAL:
            frame[sp++] = frame[frame.length - rand - 1];
            break;

          case FunCode.Opcode.ARG:
            frame[sp++] = args[base + rand];
            break;

          case FunCode.Opcode.FVAR:
            frame[sp++] = fvars[rand];
            break;

          case FunCode.Opcode.BIND:
            frame[frame.length - rand - 1] = frame[--sp];
            break;

          case FunCode.Opcode.POP:
            sp--;
            break;

          case FunCode.Opcode.QUOTE:
            frame[sp++] = code.consts[rand];
            break;

          case FunCode.Opcode.NIL:
            frame[sp++] = Value.nil;
            break;

          case FunCode.Opcode.CONS:
            sp--;
            frame[sp - 1] = Value.cons(frame[sp - 1], frame[sp]);
            break;

          case FunCode.Opcode.CALL:
            sp -= rand;
            var fun: Value = frame[sp - 1];
            frame[sp - 1] = fun.subr.apply(frame, rand, sp);
            break;

          case FunCode.Opcode.TCALL:
            if (rand !== nargs)
              Evaluator.errNargs(code.name, rand, nargs);
            sp -= rand;
            Common.arraycopy(frame, sp, args, base, nargs);
            pc = 0; trap = -1; sp = 0;
            if (--Evaluator.quantum <= 0) Evaluator.checkpoint();
            break;

          case FunCode.Opcode.CLOSURE: {
            sp -= rand - 1;
            var body: FunCode = Value.funcode(frame[sp - 1]);
            var fvars2: Value[] = new Array(rand);
            Common.arraycopy(frame, sp, fvars2, 1, rand - 1);
            frame[sp - 1] = FunCode.makeClosure(body, fvars2);
            break;
          }

          case FunCode.Opcode.TRAP:
            trap = rand;
            break;

          case FunCode.Opcode.FAIL:
            Evaluator.errNoMatch(args, base, code.arity);
            break;

          case FunCode.Opcode.JFALSE:
            var b = frame[--sp];
            if (b === BoolValue.False) {
              pc = rand;
            } else if (b !== BoolValue.True) {
              // Error: Not a boolean.
              Evaluator.errBoolCond();
            }
            break;

          case FunCode.Opcode.JUMP:
            pc = rand;
            break;

          case FunCode.Opcode.RETURN:
            Interp.backtrace.splice(Interp.backtrace.length - 1, 1);
            return frame[--sp];

          case FunCode.Opcode.MPLUS:
            sp -= 1;
            var a: Value = frame[sp];
            if (a.type !== Type.Number || code.consts[rand].type !== Type.Number) {
              pc = trap;
            } else {
              var v2: Value = Value.matchPlus(a, code.consts[rand]);
              if (v2)
                frame[sp++] = v2;
              else
                pc = trap;
            }
            break;

          case FunCode.Opcode.MEQ:
            sp -= 2;
            if (!Common.objectEquals(frame[sp],(frame[sp + 1])))
              pc = trap;
            break;

          case FunCode.Opcode.MNIL:
            if (frame[--sp].type !== Type.Nil)
              pc = trap;
            break;

          case FunCode.Opcode.MCONS: {
            if (frame[sp - 1].type !== Type.List) {
              sp--;
              pc = trap;
            } else {
              var cell: Value = frame[sp - 1];
              frame[sp] = Value.head(cell);
              sp += 1;
            }
            break;
          }

          case FunCode.Opcode.GETTAIL:
            frame[sp - 1] = Value.tail(frame[sp - 1]);
            break;

          case FunCode.Opcode.MPRIM: {
            var cons = frame[--sp];
            var obj = frame[--sp];
            var vs = cons.subr.pattMatch(obj, rand);
            if (!vs)
              pc = trap;
            else {
              Common.arraycopy(vs, 0, frame, sp, rand);
              sp += rand;
            }
            break;
          }

          case FunCode.Opcode.PREP:
          case FunCode.Opcode.PUTARG:
          case FunCode.Opcode.FRAME:
            // Used only by JIT
            break;

          default:
            throw new Error("bad opcode " + op);
        }
      }
    }
  }
}