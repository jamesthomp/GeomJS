///<reference path="../references.ts"/>
var GeomJS;
(function (GeomJS) {
    var Funbase;
    (function (Funbase) {
        "use strict";
        /** This class provides the context for evaluating paragraphs: it imposes
          *  resource limits, and deals with errors that occur during evaluation.
          */
        var Evaluator = (function () {
            function Evaluator() {
            }
            Evaluator.execute = function (fun) {
                var args = [];
                for (var _i = 1; _i < arguments.length; _i++) {
                    args[_i - 1] = arguments[_i];
                }
                this.runFlag = true;
                this.steps = 0;
                this.conses = 0;
                this.endTimeUtc = Date.now() + this.timeLimit;
                Funbase.Interp.get.initStack();
                var result = fun.apply(args, args.length, 0);
                this.checkpoint();
                return result;
            };
            Evaluator.reset = function () {
                this.quantum = this.QUANTUM;
                this.steps = this.conses = 0;
            };
            Evaluator.checkpoint = function () {
                this.steps += (this.QUANTUM - this.quantum); // quantum interats with interp.ts
                if (this.stepLimit > 0 && this.steps > this.stepLimit) {
                    this.error("#steps");
                }
                if (!this.runFlag) {
                    this.error("#time");
                }
                this.quantum = this.QUANTUM;
            };
            Evaluator.countCons = function () {
                this.conses += 1;
                if (this.consLimit > 0 && this.conses > this.consLimit) {
                    this.error("#memory");
                }
            };
            Evaluator.setLimits = function (timeLimit, stepLimit, consLimit) {
                Evaluator.timeLimit = timeLimit;
                Evaluator.stepLimit = stepLimit;
                Evaluator.consLimit = consLimit;
            };
            Evaluator.printStats = function () {
                console.log("(" + this.steps + " step(s)" + ", " + this.conses + "conse(s)" + ")");
            };
            Evaluator.error = function (errtag) {
                var args = [];
                for (var _i = 1; _i < arguments.length; _i++) {
                    args[_i - 1] = arguments[_i];
                }
                //var context: string[] = FunCode.getContext(null);
                console.log(errtag);
                console.log(args);
                throw new Evaluator.EvalError(errtag, args, "");
            };
            Evaluator.expect = function (name, expected) {
                //var context: string[] = FunCode.getContext(null);
                this.error("#expect", "", expected);
            };
            // Complain about calling a non-function
            Evaluator.errApply = function () {
                this.error("#apply");
            };
            // Complain about pattern-matching with a non-constructor
            Evaluator.errMatch = function () {
                this.error("#constr");
            };
            // Complain when the wrong number of arguments is provided
            Evaluator.errNargs = function (name, nargs, arity) {
                if (nargs === 1) {
                    this.error("#numargs1", name, arity);
                }
                else {
                    this.error("#numargs", name, nargs, arity);
                }
            };
            // Complain when no pattern matches in a function definition
            Evaluator.errNoMatch = function (args, base, arity) {
                var buf = "";
                if (arity > 0) {
                    buf += Funbase.Value.print(args[base + 0]);
                    for (var i = 1; i < arity; i++) {
                        buf += (", " + Funbase.Value.print(args[base + i]));
                    }
                }
                if (arity === 1) {
                    this.error("#match1", buf);
                }
                else {
                    this.error("#match", buf);
                }
            };
            // Complain about an undefined name
            Evaluator.errNotDef = function (x) {
                this.error("#undef", x);
            };
            // Complain about a non-boolean guard or 'if' condition
            Evaluator.errBoolCond = function () {
                this.error("#condbool");
            };
            /* Complain about matching against a constructor with the
             *  wrong number of argument patterns
             */
            Evaluator.errPatNargs = function (name) {
                this.error("#patnargs", name);
            };
            Evaluator.listFail = function (xs, msg) {
                this.error(msg, xs.type === 5 /* Nil */ ? "this empty list" : "a non-list");
            };
            Evaluator.debug = 0;
            /* Debug levels:
               1 -- see ASTs before code gen
               2 -- see funcode */
            Evaluator.QUANTUM = 10000;
            Evaluator.quantum = 10000;
            Evaluator.timeLimit = 30000;
            Evaluator.stepLimit = 500000000;
            Evaluator.consLimit = 10000000;
            return Evaluator;
        })();
        Funbase.Evaluator = Evaluator;
        Funbase.Primitive.store("_error", function (tag, args) {
            Evaluator.error(Funbase.Value.string(tag), Funbase.Value.array(args));
            return null;
        });
        Funbase.Primitive.store("_limit", function (time, steps, conses) {
            Evaluator.setLimits(Funbase.Value.asNumber(time), Funbase.Value.asNumber(steps), Funbase.Value.asNumber(conses));
            return Funbase.Value.nil;
        });
    })(Funbase = GeomJS.Funbase || (GeomJS.Funbase = {}));
})(GeomJS || (GeomJS = {}));
// The TypeScript way of doing nested classes
var GeomJS;
(function (GeomJS) {
    var Funbase;
    (function (Funbase) {
        var Evaluator;
        (function (Evaluator) {
            "use strict";
            // An exception raised because of a run-time error
            var EvalError = (function () {
                function EvalError(errtag, args, context) {
                    if (args === void 0) { args = null; }
                    if (context === void 0) { context = null; }
                    this.errtag = errtag;
                    this.args = args;
                    this.context = context;
                }
                return EvalError;
            })();
            Evaluator.EvalError = EvalError;
        })(Evaluator = Funbase.Evaluator || (Funbase.Evaluator = {}));
    })(Funbase = GeomJS.Funbase || (GeomJS.Funbase = {}));
})(GeomJS || (GeomJS = {}));
//# sourceMappingURL=Evaluator.js.map