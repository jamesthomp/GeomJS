///<reference path="../../references.ts"/>
var GeomJS;
(function (GeomJS) {
    var Funbase;
    (function (Funbase) {
        // Implements the Cell primitive with operations: _new, _get, _set
        // _new() creates a fresh cell, _get(c) gets the value stored in cell c,
        // and _set(c,v) sets the cell c to store value v.
        var Cell;
        (function (Cell) {
            // Creates a fresh cell
            function newInstance(val) {
                return {
                    type: 7 /* Cell */,
                    value: val,
                    subr: Funbase.Func.nullFunction()
                };
            }
            // Converts a Value to a cell, or throws WrongKindException
            function toCell(v) {
                if (v && v.type === 7 /* Cell */) {
                    return v;
                }
                else {
                    throw new Funbase.WrongKindException();
                }
            }
            // As this plugin is required by the compiler, this plugin is
            // installed by the runtime during the initial loading phase.
            function install() {
                Funbase.Primitive.store("_new", function (x) {
                    Funbase.Evaluator.countCons();
                    return newInstance(x);
                });
                Funbase.Primitive.store("_get", function (x) {
                    return toCell(x).value;
                });
                Funbase.Primitive.store("_set", function (v, y) {
                    var x = toCell(v);
                    return (x.value = y);
                });
            }
            Cell.install = install;
        })(Cell = Funbase.Cell || (Funbase.Cell = {}));
    })(Funbase = GeomJS.Funbase || (GeomJS.Funbase = {}));
})(GeomJS || (GeomJS = {}));
//# sourceMappingURL=Cell.js.map