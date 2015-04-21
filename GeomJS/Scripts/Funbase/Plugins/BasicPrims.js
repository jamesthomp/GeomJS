///<reference path="../../references.ts"/>
var GeomJS;
(function (GeomJS) {
    var Funbase;
    (function (Funbase) {
        var BasicPrims;
        (function (BasicPrims) {
            BasicPrims.variableCount = 0;
            function install() {
                Funbase.Primitive.store("_newvar", function () {
                    return Funbase.StringValue.create("_v" + BasicPrims.variableCount++);
                });
                Funbase.Primitive.store("=", function (x, y) {
                    return Funbase.BoolValue.create(GeomJS.Common.objectEquals(x, y));
                });
                Funbase.Primitive.store("<>", function (x, y) {
                    return Funbase.BoolValue.create(!GeomJS.Common.objectEquals(x, y));
                });
                Funbase.Primitive.store("+", function (x, y) {
                    return Funbase.NumValue.create(Funbase.Value.asNumber(x) + Funbase.Value.asNumber(y));
                });
                Funbase.Primitive.store("-", function (x, y) {
                    return Funbase.NumValue.create(Funbase.Value.asNumber(x) - Funbase.Value.asNumber(y));
                });
                Funbase.Primitive.store("*", function (x, y) {
                    return Funbase.NumValue.create(Funbase.Value.asNumber(x) * Funbase.Value.asNumber(y));
                });
                Funbase.Primitive.store("/", function (x, y) {
                    var yy = Funbase.Value.asNumber(y);
                    if (yy === 0) {
                        Funbase.Evaluator.error("#divzero");
                    }
                    return Funbase.NumValue.create(Funbase.Value.asNumber(x) / yy);
                });
                Funbase.Primitive.store("~", function (x) {
                    return Funbase.NumValue.create(-Funbase.Value.asNumber(x));
                });
                Funbase.Primitive.store("<", function (x, y) {
                    return Funbase.BoolValue.create(Funbase.Value.asNumber(x) < Funbase.Value.asNumber(y));
                });
                Funbase.Primitive.store("<=", function (x, y) {
                    return Funbase.BoolValue.create(Funbase.Value.asNumber(x) <= Funbase.Value.asNumber(y));
                });
                Funbase.Primitive.store(">", function (x, y) {
                    return Funbase.BoolValue.create(Funbase.Value.asNumber(x) > Funbase.Value.asNumber(y));
                });
                Funbase.Primitive.store(">=", function (x, y) {
                    return Funbase.BoolValue.create(Funbase.Value.asNumber(x) >= Funbase.Value.asNumber(y));
                });
                Funbase.Primitive.store("numeric", function (x) {
                    return Funbase.BoolValue.create(x.type === 3 /* Number */);
                });
                Funbase.Primitive.store("int", function (x) {
                    return Funbase.NumValue.create(Math.floor(Funbase.Value.asNumber(x)));
                });
                Funbase.Primitive.store("sqrt", function (x) {
                    var arg = Funbase.Value.asNumber(x);
                    if (arg < 0) {
                        Funbase.Evaluator.error("#sqrt");
                    }
                    return Funbase.NumValue.create(Math.sqrt(arg));
                });
                Funbase.Primitive.store("exp", function (x) {
                    return Funbase.NumValue.create(Math.exp(Funbase.Value.asNumber(x)));
                });
                Funbase.Primitive.store("sin", function (x) {
                    return Funbase.NumValue.create(Math.sin(Funbase.Value.asNumber(x) * Math.PI / 180));
                });
                Funbase.Primitive.store("cos", function (x) {
                    return Funbase.NumValue.create(Math.cos(Funbase.Value.asNumber(x) * Math.PI / 180));
                });
                Funbase.Primitive.store("tan", function (x) {
                    return Funbase.NumValue.create(Math.tan(Funbase.Value.asNumber(x) * Math.PI / 180));
                });
                Funbase.Primitive.store("atan2", function (x, y) {
                    return Funbase.NumValue.create(Math.atan2(Funbase.Value.asNumber(x), Funbase.Value.asNumber(y)) * Math.PI / 180);
                });
                Funbase.Primitive.store("random", function () {
                    return Funbase.NumValue.create(Math.random());
                });
                Funbase.Primitive.store("name", function (x) {
                    return Funbase.Name.find(Funbase.Value.string(x));
                });
                Funbase.Primitive.store(":", function (hd, tl) {
                    if (!Funbase.Value.isCons(tl) && !GeomJS.Common.objectEquals(tl, Funbase.Value.nil)) {
                        Funbase.Evaluator.expect(":", "a list");
                    }
                    return Funbase.Value.cons(hd, tl);
                }, function (obj, nargs) {
                    if (nargs !== 2) {
                        Funbase.Evaluator.errPatNargs(":");
                    }
                    var args = [];
                    try {
                        args[0] = Funbase.Value.tail(obj);
                        args[1] = Funbase.Value.head(obj);
                        return args;
                    }
                    catch (e) {
                        if (e instanceof Funbase.ClassCastException) {
                            return null;
                        }
                        throw e;
                    }
                });
                Funbase.Primitive.store("head", function (x) {
                    try {
                        return Funbase.Value.head(x);
                    }
                    catch (e) {
                        if (e instanceof Funbase.ClassCastException) {
                            Funbase.Evaluator.listFail(x, "#head");
                            return null;
                        }
                    }
                });
                Funbase.Primitive.store("tail", function (x) {
                    try {
                        return Funbase.Value.tail(x);
                    }
                    catch (e) {
                        if (e instanceof Funbase.ClassCastException) {
                            Funbase.Evaluator.listFail(x, "#tail");
                            return null;
                        }
                    }
                });
            }
            BasicPrims.install = install;
        })(BasicPrims = Funbase.BasicPrims || (Funbase.BasicPrims = {}));
    })(Funbase = GeomJS.Funbase || (GeomJS.Funbase = {}));
})(GeomJS || (GeomJS = {}));
//# sourceMappingURL=BasicPrims.js.map