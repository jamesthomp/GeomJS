///<reference path="../../references.ts"/>
var GeomJS;
(function (GeomJS) {
    var JsRuntime;
    (function (JsRuntime) {
        function InstallInlines() {
            JsRuntime.Interop.addInline("=", function (x) {
                var args = JsRuntime.Value.array(x);
                var x = args[0];
                var y = args[1];
                // We have to be careful of variables which begin '_v'. Fortunately
                // nothing we want to inline begins with '_v'
                if (y.constructor === String && y.indexOf('_v') === -1) {
                    var runtimeVal = eval(y);
                    if (runtimeVal.constructor === String || runtimeVal.constructor === Number || runtimeVal.constructor === Boolean) {
                        return x + " === " + y;
                    }
                    if (runtimeVal.constructor === JsRuntime.Name || runtimeVal.constructor === Function) {
                        return x + ".name === " + y + ".name";
                    }
                }
                if (x.constructor === String && x.indexOf('_v') === -1) {
                    var runtimeVal = eval(x);
                    if (runtimeVal.constructor === String || runtimeVal.constructor === Number || runtimeVal.constructor === Boolean) {
                        return x + " === " + y;
                    }
                    if (runtimeVal.constructor === JsRuntime.Name || runtimeVal.constructor === Function) {
                        return x + ".name === " + y + ".name";
                    }
                }
                return "GeomJS.JsRuntime.Value.areEqual(" + x + "," + y + ")";
            });
            JsRuntime.Interop.addInline("<>", function (x) {
                var args = JsRuntime.Value.array(x);
                var x = args[0];
                var y = args[1];
                // We have to be careful of variables which begin '_v'. Fortunately
                // nothing we want to inline begins with '_v'
                if (y.constructor === String && y.indexOf('_v') === -1) {
                    var runtimeVal = eval(y);
                    if (runtimeVal.constructor === String || runtimeVal.constructor === Number || runtimeVal.constructor === Boolean) {
                        return x + " !== " + y;
                    }
                    if (runtimeVal.constructor === JsRuntime.Name || runtimeVal.constructor === Function) {
                        return x + ".name !== " + y + ".name";
                    }
                }
                if (x.constructor === String && x.indexOf('_v') === -1) {
                    var runtimeVal = eval(x);
                    if (runtimeVal.constructor === String || runtimeVal.constructor === Number || runtimeVal.constructor === Boolean) {
                        return x + " !== " + y;
                    }
                    if (runtimeVal.constructor === JsRuntime.Name || runtimeVal.constructor === Function) {
                        return x + ".name !== " + y + ".name";
                    }
                }
                return "GeomJS.JsRuntime.Value.areNotEqual(" + x + "," + y + ")";
            });
            JsRuntime.Interop.addInline("+", function (x) {
                var args = JsRuntime.Value.array(x);
                return "(" + args[0] + "+" + args[1] + ")";
            });
            JsRuntime.Interop.addInline("-", function (x) {
                var args = JsRuntime.Value.array(x);
                return "(" + args[0] + "-" + args[1] + ")";
            });
            JsRuntime.Interop.addInline("*", function (x) {
                var args = JsRuntime.Value.array(x);
                return "(" + args[0] + "*" + args[1] + ")";
            });
            JsRuntime.Interop.addInline("/", function (x) {
                var args = JsRuntime.Value.array(x);
                return "(" + args[1] + " === 0) ? GeomJS.Funbase.Evaluator.error('#divzero') : (" + args[0] + "/" + args[1] + ")";
            });
            JsRuntime.Interop.addInline("/", function (x) {
                var t = JsRuntime.Value.array(x);
                var l = t[0];
                var r = t[1];
                return "(" + r + " === 0) ? GeomJS.Funbase.Evaluator.error('#divzero') : (" + l + "/" + r + ")";
            });
            JsRuntime.Interop.addInline("~", function (x) {
                var args = JsRuntime.Value.array(x);
                return "(" + "-" + args[0] + ")";
            });
            JsRuntime.Interop.addInline("<", function (x) {
                var args = JsRuntime.Value.array(x);
                return "(" + args[0] + "<" + args[1] + ")";
            });
            JsRuntime.Interop.addInline("<=", function (x) {
                var args = JsRuntime.Value.array(x);
                return "(" + args[0] + "<=" + args[1] + ")";
            });
            JsRuntime.Interop.addInline(">", function (x) {
                var args = JsRuntime.Value.array(x);
                return "(" + args[0] + ">" + args[1] + ")";
            });
            JsRuntime.Interop.addInline(">=", function (x) {
                var args = JsRuntime.Value.array(x);
                return "(" + args[0] + ">=" + args[1] + ")";
            });
            JsRuntime.Interop.addInline("numeric", function (x) {
                var args = JsRuntime.Value.array(x);
                return "typeof " + args[0] + " === 'number'";
            });
            JsRuntime.Interop.addInline("int", function (x) {
                var args = JsRuntime.Value.array(x);
                return "Math.floor(" + args[0] + ")";
            });
            JsRuntime.Interop.addInline("head", function (x) {
                var args = JsRuntime.Value.array(x);
                return args[0] + "[0]";
            });
            JsRuntime.Interop.addInline("tail;", function (x) {
                var args = JsRuntime.Value.array(x);
                return args[0] + "[1]";
            });
            JsRuntime.Interop.addInline("^", function (x) {
                var args = JsRuntime.Value.array(x);
                return "(" + args[0] + "+" + args[1] + ")";
            });
        }
        JsRuntime.InstallInlines = InstallInlines;
    })(JsRuntime = GeomJS.JsRuntime || (GeomJS.JsRuntime = {}));
})(GeomJS || (GeomJS = {}));
//# sourceMappingURL=Inline.js.map