///<reference path="../references.ts"/>
var GeomJS;
(function (GeomJS) {
    var JsRuntime;
    (function (JsRuntime) {
        var Value;
        (function (Value) {
            function areNotEqual(x, y) {
                return !areEqual(x, y);
            }
            Value.areNotEqual = areNotEqual;
            function areEqual(x, y) {
                if (x === y) {
                    return true; //number, boolean, string
                }
                else if (x.constructor === Number || x.constructor === Boolean || x.constructor === String || x.constructor !== y.constructor) {
                    return false;
                }
                else if (x.constructor === JsRuntime.Name) {
                    return x.name === y.name;
                }
                else if (x.constructor === Array) {
                    while (true) {
                        if (x.length === 0) {
                            return y.length === 0;
                        }
                        if (y.length === 0) {
                            return x.length === 0;
                        }
                        if (!areEqual(x[0], y[0])) {
                            return false;
                        }
                        x = x[1];
                        y = y[1];
                    }
                }
                else if (x.constructor === Function) {
                    return x.name == y.name;
                }
                else if (x.equals && y.equals) {
                    return x.equals(y);
                }
                else {
                    console.log("Equals unsupported on " + x.constructor);
                }
                //TODO: cell, dict, etc
            }
            Value.areEqual = areEqual;
            function array(v) {
                var acc = [];
                for (var xs = v; Value.isCons(xs); xs = xs[1]) {
                    acc.push(xs[0]);
                }
                return acc;
            }
            Value.array = array;
            function isCons(v) {
                return v && v.constructor === Array && v.length === 2;
            }
            Value.isCons = isCons;
            function print(v) {
                if (v.constructor === Array) {
                    var str = "[";
                    for (var xs = v; Value.isCons(xs); xs = xs[1]) {
                        str += Value.print(xs[0]);
                        if (Value.isCons(xs[1])) {
                            str += ", ";
                        }
                    }
                    str += "]";
                    return str;
                }
                else if (v.constructor === Function) {
                    return "<function(" + v.length + ")>";
                }
                else {
                    return v.toString();
                }
            }
            Value.print = print;
        })(Value = JsRuntime.Value || (JsRuntime.Value = {}));
    })(JsRuntime = GeomJS.JsRuntime || (GeomJS.JsRuntime = {}));
})(GeomJS || (GeomJS = {}));
//# sourceMappingURL=Value.js.map