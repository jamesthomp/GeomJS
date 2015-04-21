///<reference path="../references.ts"/>
var GeomJS;
(function (GeomJS) {
    var Funbase;
    (function (Funbase) {
        "use strict";
        /** A simple runtime translator that interprets the funcode */
        var Interp = (function () {
            function Interp() {
                this.root = null;
            }
            // turns funcode into a func that can be applied
            Interp.prototype.translate = function (funcode, fvars) {
                var _this = this;
                return {
                    type: Funbase.Type.Func,
                    arity: funcode.arity,
                    apply: function (args, nargs, base) { return _this.apply(funcode.arity, funcode, fvars, args, base, nargs); },
                    pattMatch: function (obj, nargs) { return null; },
                    code: funcode
                };
            };
            Interp.prototype.initStack = function () {
                Interp.backtrace = [];
                this.root = null;
            };
            Interp.prototype.setRoot = function (root) {
                this.root = Funbase.Value.funcode(root);
            };
            Interp.prototype.apply = function (arity, code, fvars, args, base, nargs) {
                Interp.backtrace.push(code);
                if (nargs !== arity)
                    Funbase.Evaluator.errNargs(code.name, nargs, arity);
                if (--Funbase.Evaluator.quantum <= 0)
                    Funbase.Evaluator.checkpoint();
                var instrs = code.ops;
                var rands = code.rands;
                var frame = new Array(256);
                var pc = 0;
                var trap = -1;
                var sp = 0;
                for (;;) {
                    var op = instrs[pc];
                    var rand = rands[pc];
                    pc++;
                    switch (op) {
                        case Funbase.FunCode.Opcode.GLOBAL: {
                            var x = Funbase.Value.name(code.consts[rand]);
                            var v = Funbase.Name.getGlodef(x);
                            if (!v || v.type === Funbase.Type.Name) {
                                Funbase.Evaluator.errNotDef(x);
                            }
                            frame[sp++] = v;
                            break;
                        }
                        case Funbase.FunCode.Opcode.LOCAL:
                            frame[sp++] = frame[frame.length - rand - 1];
                            break;
                        case Funbase.FunCode.Opcode.ARG:
                            frame[sp++] = args[base + rand];
                            break;
                        case Funbase.FunCode.Opcode.FVAR:
                            frame[sp++] = fvars[rand];
                            break;
                        case Funbase.FunCode.Opcode.BIND:
                            frame[frame.length - rand - 1] = frame[--sp];
                            break;
                        case Funbase.FunCode.Opcode.POP:
                            sp--;
                            break;
                        case Funbase.FunCode.Opcode.QUOTE:
                            frame[sp++] = code.consts[rand];
                            break;
                        case Funbase.FunCode.Opcode.NIL:
                            frame[sp++] = Funbase.Value.nil;
                            break;
                        case Funbase.FunCode.Opcode.CONS:
                            sp--;
                            frame[sp - 1] = Funbase.Value.cons(frame[sp - 1], frame[sp]);
                            break;
                        case Funbase.FunCode.Opcode.CALL:
                            sp -= rand;
                            var fun = frame[sp - 1];
                            frame[sp - 1] = fun.subr.apply(frame, rand, sp);
                            break;
                        case Funbase.FunCode.Opcode.TCALL:
                            if (rand !== nargs)
                                Funbase.Evaluator.errNargs(code.name, rand, nargs);
                            sp -= rand;
                            GeomJS.Common.arraycopy(frame, sp, args, base, nargs);
                            pc = 0;
                            trap = -1;
                            sp = 0;
                            if (--Funbase.Evaluator.quantum <= 0)
                                Funbase.Evaluator.checkpoint();
                            break;
                        case Funbase.FunCode.Opcode.CLOSURE: {
                            sp -= rand - 1;
                            var body = Funbase.Value.funcode(frame[sp - 1]);
                            var fvars2 = new Array(rand);
                            GeomJS.Common.arraycopy(frame, sp, fvars2, 1, rand - 1);
                            frame[sp - 1] = Funbase.FunCode.makeClosure(body, fvars2);
                            break;
                        }
                        case Funbase.FunCode.Opcode.TRAP:
                            trap = rand;
                            break;
                        case Funbase.FunCode.Opcode.FAIL:
                            Funbase.Evaluator.errNoMatch(args, base, code.arity);
                            break;
                        case Funbase.FunCode.Opcode.JFALSE:
                            var b = frame[--sp];
                            if (b === Funbase.BoolValue.False) {
                                pc = rand;
                            }
                            else if (b.type !== Funbase.Type.Bool) {
                                Funbase.Evaluator.errBoolCond();
                            }
                            break;
                        case Funbase.FunCode.Opcode.JUMP:
                            pc = rand;
                            break;
                        case Funbase.FunCode.Opcode.RETURN:
                            Interp.backtrace.splice(Interp.backtrace.length - 1, 1);
                            return frame[--sp];
                        case Funbase.FunCode.Opcode.MPLUS:
                            sp -= 1;
                            var a = frame[sp];
                            if (a.type !== Funbase.Type.Number || code.consts[rand].type !== Funbase.Type.Number) {
                                pc = trap;
                            }
                            else {
                                var v2 = Funbase.Value.matchPlus(a, code.consts[rand]);
                                if (v2)
                                    frame[sp++] = v2;
                                else
                                    pc = trap;
                            }
                            break;
                        case Funbase.FunCode.Opcode.MEQ:
                            sp -= 2;
                            if (!GeomJS.Common.objectEquals(frame[sp], (frame[sp + 1])))
                                pc = trap;
                            break;
                        case Funbase.FunCode.Opcode.MNIL:
                            if (frame[--sp].type !== Funbase.Type.Nil)
                                pc = trap;
                            break;
                        case Funbase.FunCode.Opcode.MCONS: {
                            if (frame[sp - 1].type !== Funbase.Type.List) {
                                sp--;
                                pc = trap;
                            }
                            else {
                                var cell = frame[sp - 1];
                                frame[sp] = Funbase.Value.head(cell);
                                sp += 1;
                            }
                            break;
                        }
                        case Funbase.FunCode.Opcode.GETTAIL:
                            frame[sp - 1] = Funbase.Value.tail(frame[sp - 1]);
                            break;
                        case Funbase.FunCode.Opcode.MPRIM: {
                            var cons = frame[--sp];
                            var obj = frame[--sp];
                            var vs = cons.subr.pattMatch(obj, rand);
                            if (!vs)
                                pc = trap;
                            else {
                                GeomJS.Common.arraycopy(vs, 0, frame, sp, rand);
                                sp += rand;
                            }
                            break;
                        }
                        case Funbase.FunCode.Opcode.PREP:
                        case Funbase.FunCode.Opcode.PUTARG:
                        case Funbase.FunCode.Opcode.FRAME:
                            break;
                        default:
                            throw new Error("bad opcode " + op);
                    }
                }
            };
            Interp.get = new Interp();
            return Interp;
        })();
        Funbase.Interp = Interp;
    })(Funbase = GeomJS.Funbase || (GeomJS.Funbase = {}));
})(GeomJS || (GeomJS = {}));
//# sourceMappingURL=Interp.js.map