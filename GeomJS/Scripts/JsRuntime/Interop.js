///<reference path="../references.ts"/>
var GeomJS;
(function (GeomJS) {
    var JsRuntime;
    (function (JsRuntime) {
        var Interop;
        (function (Interop) {
            var dict = {};
            var inlineDict = {};
            var matchDict = {};
            var base = "GeomJS.JsRuntime.Interop.";
            function addInline(geomName, inlineFunc) {
                inlineDict[geomName] = inlineFunc;
            }
            Interop.addInline = addInline;
            function add(geomName, func, optionalMatch) {
                if (optionalMatch === void 0) { optionalMatch = undefined; }
                dict[geomName] = func;
                if (optionalMatch) {
                    matchDict[geomName] = optionalMatch;
                }
                // This is a little bit of a hack!
                JsRuntime.Name.nameTable[geomName] = eval(func);
            }
            Interop.add = add;
            // Find (optimisation used in compiler for linking functions without going through the name table)
            function find(name, inline) {
                if (inline) {
                    var t = inlineDict[name];
                    if (t !== undefined) {
                        return [t, []];
                    }
                }
                var prim = dict[name];
                if (prim !== undefined) {
                    return prim;
                }
                // No special compile time instructions so we look up at runtime.
                return "GeomJS.JsRuntime.Name.nameTable['" + name + "']";
            }
            Interop.find = find;
            function match(name, matchArg) {
                return matchDict[name](matchArg);
            }
            Interop.match = match;
            Interop.add("true", "true");
            Interop.add("false", "false");
            Interop.add("_newvar", function () {
                return "_v" + GeomJS.Funbase.BasicPrims.variableCount++;
            });
            GeomJS.Funbase.Primitive.store("_find", function (name, inline) {
                var prim = dict[name.value];
                if (prim !== undefined) {
                    return GeomJS.Funbase.StringValue.create(prim);
                }
                // No special compile time instructions so we look up at runtime.
                return GeomJS.Funbase.StringValue.create("GeomJS.JsRuntime.Name.nameTable['" + name.value + "']");
            });
            Interop.add("_find", base + "find");
            GeomJS.Funbase.Primitive.store("_match", function (matchType, matchArg) {
                var ret = GeomJS.Funbase.Value.string(matchType);
                return GeomJS.Funbase.StringValue.create(matchDict[ret](GeomJS.Funbase.Value.string(matchArg)));
            });
            Interop.add("_match", base + "match");
            function fail() {
                throw new Error("no pattern match");
            }
            Interop.fail = fail;
            function _error(tag, args) {
                GeomJS.Funbase.Evaluator.error(tag, JsRuntime.Value.array(args));
                return null;
            }
            Interop._error = _error;
            Interop.add("_error", base + "_error");
            function _apply(x, y) {
                var args = JsRuntime.Value.array(y);
                if (x.length != args.length) {
                    throw new Error("Function arity mismatch");
                }
                return x.apply(null, args);
            }
            Interop._apply = _apply;
            Interop.add("_apply", base + "_apply");
            function _jclosure(body) {
                var f = (new Function(body));
                return f();
            }
            Interop._jclosure = _jclosure;
            Interop.add("_jclosure", base + "_jclosure");
            GeomJS.Funbase.Primitive.store("_jclosure", function (body) {
                var func = new Function(GeomJS.Funbase.Value.string(body));
                var realfunc = func.apply(null);
                return {
                    "type": 6 /* Funvalue */,
                    "subr": {
                        type: 10 /* Func */,
                        arity: realfunc.length,
                        apply: function (args2, nargs2, base2) {
                            if (nargs2 !== realfunc.length) {
                                GeomJS.Funbase.Evaluator.errApply();
                            }
                            var res = realfunc.apply(null, args2);
                            return res;
                        },
                        applyjs: realfunc,
                        pattMatch: function (obj, nargs) {
                            GeomJS.Funbase.Evaluator.errMatch();
                            return null;
                        }
                    }
                };
            });
            function _scan() {
                return GeomJS.Funbase.GeomBase.theApp.scanJs();
            }
            Interop._scan = _scan;
            Interop.add("_scan", base + "_scan");
            function _synerror(tag, args) {
                GeomJS.Funbase.GeomBase.theApp.scanner.syntax_error(tag, JsRuntime.Value.array(args));
                return [];
            }
            Interop._synerror = _synerror;
            Interop.add("_synerror", base + "_synerror");
            function _topval(v) {
                GeomJS.Funbase.GeomBase.theApp.display("--> " + JsRuntime.Value.print(v));
                return [];
            }
            Interop._topval = _topval;
            Interop.add("_topval", base + "_topval");
            function _topdef(x, v) {
                JsRuntime.Name.setGlodef(x, v);
                GeomJS.Funbase.GeomBase.theApp.display("--- " + x.name + " = " + JsRuntime.Value.print(v));
                return [];
            }
            Interop._topdef = _topdef;
            Interop.add("_jtopdef", base + "_topdef");
            GeomJS.Funbase.Primitive.store("_jtopdef", function (x, v) {
                var n = GeomJS.Funbase.Value.name(x);
                if (v.type == 6 /* Funvalue */) {
                    JsRuntime.Name.setGlodef(n, v.subr.applyjs);
                }
                else {
                    JsRuntime.Name.setGlodef(n, v);
                }
                GeomJS.Funbase.GeomBase.theApp.display("--- " + n.name + " = " + GeomJS.Funbase.Value.print(v));
                return GeomJS.Funbase.Value.nil;
            });
            function _toptext() {
                GeomJS.Funbase.GeomBase.theApp.showPhrase();
                return [];
            }
            Interop._toptext = _toptext;
            Interop.add("_toptext", base + "_toptext");
            function _print(v) {
                console.log(JsRuntime.Value.print(v));
                return [];
            }
            Interop._print = _print;
            Interop.add("_print", base + "_print");
            function _debug() {
                return GeomJS.Funbase.Evaluator.debug;
            }
            Interop._debug = _debug;
            Interop.add("_debug", base + "_debug");
            function _install(name) {
                return [];
            }
            Interop._install = _install;
            Interop.add("_install", base + "_install");
            JsRuntime.Name.install();
            JsRuntime.InstallInlines();
        })(Interop = JsRuntime.Interop || (JsRuntime.Interop = {}));
    })(JsRuntime = GeomJS.JsRuntime || (GeomJS.JsRuntime = {}));
})(GeomJS || (GeomJS = {}));
//# sourceMappingURL=Interop.js.map