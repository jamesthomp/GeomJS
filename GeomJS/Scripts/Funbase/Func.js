///<reference path="../references.ts"/>
var GeomJS;
(function (GeomJS) {
    var Funbase;
    (function (Funbase) {
        "use strict";
        (function (Type) {
            Type[Type["String"] = 0] = "String";
            Type[Type["Bool"] = 1] = "Bool";
            Type[Type["List"] = 2] = "List";
            Type[Type["Number"] = 3] = "Number";
            Type[Type["Funcode"] = 4] = "Funcode";
            Type[Type["Nil"] = 5] = "Nil";
            Type[Type["Funvalue"] = 6] = "Funvalue";
            Type[Type["Cell"] = 7] = "Cell";
            Type[Type["Hash"] = 8] = "Hash";
            Type[Type["Name"] = 9] = "Name";
            Type[Type["Func"] = 10] = "Func";
        })(Funbase.Type || (Funbase.Type = {}));
        var Type = Funbase.Type;
        var Func;
        (function (Func) {
            "use strict";
            function nullFunction() {
                return {
                    type: 10 /* Func */,
                    arity: -1,
                    apply: function (args, nargs, base) {
                        Funbase.Evaluator.errApply();
                        return null;
                    },
                    pattMatch: function (obj, nargs) {
                        Funbase.Evaluator.errMatch();
                        return null;
                    }
                };
            }
            Func.nullFunction = nullFunction;
            Funbase.Primitive.store("_apply", function (x, y) {
                var args = Funbase.Value.array(y);
                return Funbase.Value.apply(x, args);
            });
            Funbase.Primitive.store("_closure", function (x) {
                var body = Funbase.Value.funcode(x);
                return Funbase.FunCode.makeClosure(body, [undefined]);
            });
        })(Func = Funbase.Func || (Funbase.Func = {}));
    })(Funbase = GeomJS.Funbase || (GeomJS.Funbase = {}));
})(GeomJS || (GeomJS = {}));
//# sourceMappingURL=Func.js.map