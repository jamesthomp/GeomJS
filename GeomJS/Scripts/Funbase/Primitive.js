///<reference path="../references.ts"/>
var GeomJS;
(function (GeomJS) {
    var Funbase;
    (function (Funbase) {
        var Primitive;
        (function (Primitive) {
            var primitives = {};
            /** Stores a primitive function (used to replace reflection) */
            function store(name, func, pattMatch) {
                var p = {
                    type: 4 /* Funcode */,
                    name: name,
                    subr: {
                        type: 10 /* Func */,
                        arity: func.length - 1,
                        apply: function (args, nargs, base) {
                            var theArgs = [];
                            GeomJS.Common.arraycopy(args, base, theArgs, 0, func.length);
                            return func.apply(null, theArgs);
                        },
                        pattMatch: function (obj, nargs) { return null; }
                    },
                    level: 0
                };
                if (pattMatch) {
                    p.subr.pattMatch = pattMatch;
                }
                primitives[name] = p;
            }
            Primitive.store = store;
            function find(name) {
                return primitives[name];
            }
            Primitive.find = find;
        })(Primitive = Funbase.Primitive || (Funbase.Primitive = {}));
    })(Funbase = GeomJS.Funbase || (GeomJS.Funbase = {}));
})(GeomJS || (GeomJS = {}));
//# sourceMappingURL=Primitive.js.map