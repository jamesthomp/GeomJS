///<reference path="../../references.ts"/>
var GeomJS;
(function (GeomJS) {
    var JsRuntime;
    (function (JsRuntime) {
        var BasicPrims;
        (function (BasicPrims) {
            var base = "GeomJS.JsRuntime.BasicPrims.";
            JsRuntime.Interop.add("=", "GeomJS.JsRuntime.Value.areEqual");
            JsRuntime.Interop.add("<>", "GeomJS.JsRuntime.Value.areNotEqual");
            function add(x, y) {
                return x + y;
            }
            BasicPrims.add = add;
            // Code for a match gets inlined as direct javascript during the compilation stage. 
            function matchPlus(args) {
                var val = args[0];
                var inc = args[1][0];
                if (inc.constructor !== Number || inc <= 0) {
                    return "false";
                }
                var x = "(" + val + "-" + inc + ")";
                return "(!" + val + " || " + val + ".constructor !== Number || " + x + " < 0 || " + x + " % 1 !== 0) ? false : [" + x + "]";
            }
            BasicPrims.matchPlus = matchPlus;
            JsRuntime.Interop.add("+", base + "add", matchPlus);
            function sub(x, y) {
                return x - y;
            }
            BasicPrims.sub = sub;
            JsRuntime.Interop.add("-", base + "sub");
            function mul(x, y) {
                return x * y;
            }
            BasicPrims.mul = mul;
            JsRuntime.Interop.add("*", base + "mul");
            function div(x, y) {
                if (y === 0) {
                    GeomJS.Funbase.Evaluator.error("#divzero");
                }
                return x / y;
            }
            BasicPrims.div = div;
            JsRuntime.Interop.add("/", base + "div");
            function neg(x) {
                return -x;
            }
            BasicPrims.neg = neg;
            JsRuntime.Interop.add("~", base + "neg");
            function lt(x, y) {
                return x < y;
            }
            BasicPrims.lt = lt;
            JsRuntime.Interop.add("<", base + "lt");
            function lte(x, y) {
                return x <= y;
            }
            BasicPrims.lte = lte;
            JsRuntime.Interop.add("<=", base + "lte");
            function gt(x, y) {
                return x > y;
            }
            BasicPrims.gt = gt;
            JsRuntime.Interop.add(">", base + "gt");
            function gte(x, y) {
                return x >= y;
            }
            BasicPrims.gte = gte;
            JsRuntime.Interop.add(">=", base + "gte");
            function numeric(x) {
                return typeof x === "number";
            }
            BasicPrims.numeric = numeric;
            JsRuntime.Interop.add("numeric", base + "numeric");
            function int(x) {
                return Math.floor(x);
            }
            BasicPrims.int = int;
            JsRuntime.Interop.add("int", base + "int");
            function sqrt(x) {
                if (x < 0) {
                    GeomJS.Funbase.Evaluator.error("#sqrt");
                }
                return Math.sqrt(x);
            }
            BasicPrims.sqrt = sqrt;
            JsRuntime.Interop.add("sqrt", base + "sqrt");
            function exp(x) {
                return Math.exp(x);
            }
            BasicPrims.exp = exp;
            JsRuntime.Interop.add("exp", base + "exp");
            function sin(x) {
                return Math.sin(x * Math.PI / 180);
            }
            BasicPrims.sin = sin;
            JsRuntime.Interop.add("sin", base + "sin");
            function cos(x) {
                return Math.cos(x * Math.PI / 180);
            }
            BasicPrims.cos = cos;
            JsRuntime.Interop.add("cos", base + "cos");
            function tan(x) {
                return Math.tan(x * Math.PI / 180);
            }
            BasicPrims.tan = tan;
            JsRuntime.Interop.add("tan", base + "tan");
            function atan2(x, y) {
                return Math.atan2(x, y) * Math.PI / 180;
            }
            BasicPrims.atan2 = atan2;
            JsRuntime.Interop.add("atan2", base + "atan2");
            function random() {
                return Math.random();
            }
            BasicPrims.random = random;
            JsRuntime.Interop.add("random", base + "random");
            function name(x) {
                return JsRuntime.Interop.find(x, false);
            }
            BasicPrims.name = name;
            JsRuntime.Interop.add("name", base + "name");
            function cons(hd, tl) {
                if (!tl || tl.constructor !== Array) {
                    GeomJS.Funbase.Evaluator.expect(":", "a list");
                }
                return [hd, tl];
            }
            BasicPrims.cons = cons;
            // Code for a match gets inlined as direct javascript during the compilation stage. 
            function consMatch(obj) {
                return "(!" + obj + " || " + obj + ".constructor !== Array || " + obj + ".length !== 2) ? false : " + obj + "";
            }
            BasicPrims.consMatch = consMatch;
            JsRuntime.Interop.add(":", base + "cons", consMatch);
            function head(x) {
                if (!x || x.constructor !== Array) {
                    GeomJS.Funbase.Evaluator.listFail(x, "#head");
                    return undefined;
                }
                return x[0];
            }
            BasicPrims.head = head;
            JsRuntime.Interop.add("head", base + "head");
            function tail(x) {
                if (!x || x.constructor !== Array) {
                    GeomJS.Funbase.Evaluator.listFail(x, "#tail");
                    return undefined;
                }
                return x[1];
            }
            BasicPrims.tail = tail;
            JsRuntime.Interop.add("tail", base + "tail");
        })(BasicPrims = JsRuntime.BasicPrims || (JsRuntime.BasicPrims = {}));
    })(JsRuntime = GeomJS.JsRuntime || (GeomJS.JsRuntime = {}));
})(GeomJS || (GeomJS = {}));
//# sourceMappingURL=BasicPrims.js.map