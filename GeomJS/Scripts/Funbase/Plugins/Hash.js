///<reference path="../../references.ts"/>
var GeomJS;
(function (GeomJS) {
    var Funbase;
    (function (Funbase) {
        var Hash;
        (function (Hash) {
            function newInstance(init) {
                if (init === void 0) { init = undefined; }
                Funbase.Evaluator.countCons();
                return {
                    type: 8 /* Hash */,
                    mapping: new GeomJS.Common.Map(GeomJS.Common.objectEquals, init),
                    subr: Funbase.Func.nullFunction()
                };
            }
            function toHash(v) {
                if (v && v.type === 8 /* Hash */) {
                    return v;
                }
                else {
                }
            }
            function install() {
                Funbase.Primitive.store("_hash", function () {
                    return newInstance();
                });
                Funbase.Primitive.store("_clone", function (m) {
                    var h = toHash(m);
                    return newInstance(h.mapping.getIterator());
                });
                Funbase.Primitive.store("_lookup", function (m, x) {
                    var r = toHash(m).mapping.get(x);
                    if (!r)
                        return Funbase.Value.nil;
                    return r;
                });
                Funbase.Primitive.store("_update", function (m, x, y) {
                    var h = toHash(m);
                    h.mapping.set(x, y);
                    return y;
                });
            }
            Hash.install = install;
        })(Hash = Funbase.Hash || (Funbase.Hash = {}));
    })(Funbase = GeomJS.Funbase || (GeomJS.Funbase = {}));
})(GeomJS || (GeomJS = {}));
//# sourceMappingURL=Hash.js.map