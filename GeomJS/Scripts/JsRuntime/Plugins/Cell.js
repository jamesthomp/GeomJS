///<reference path="../../references.ts"/>
var GeomJS;
(function (GeomJS) {
    var JsRuntime;
    (function (JsRuntime) {
        // Implements the Cell primitive with operations: _new, _get, _set
        // _new() creates a fresh cell, _get(c) gets the value stored in cell c,
        // and _set(c,v) sets the cell c to store value v.
        function Cell(val) {
            this.val = val;
            this.toString = function () {
                return "ref " + this.val.toString();
            };
            this.equals = function (y) {
                return y.constructor === Cell && JsRuntime.Value.areEqual(this.val, y.val);
            };
        }
        JsRuntime.Cell = Cell;
        var Cell;
        (function (Cell) {
            var base = "GeomJS.JsRuntime.Cell.";
            // Create a fresh cell
            function _new(x) {
                GeomJS.Funbase.Evaluator.countCons();
                return new Cell(x);
            }
            Cell._new = _new;
            JsRuntime.Interop.add("_new", base + "_new");
            // Get the contents of a cell
            function _get(x) {
                if (x.constructor === Cell) {
                    return x.val;
                }
                else {
                    throw "_get called with non-cell";
                }
            }
            Cell._get = _get;
            JsRuntime.Interop.add("_get", base + "_get");
            // Set the contents of a cell
            function _set(v, y) {
                if (v.constructor === Cell) {
                    return (v.val = y);
                }
                else {
                    throw "_set called with non-cell";
                }
            }
            Cell._set = _set;
            JsRuntime.Interop.add("_set", base + "_set");
        })(Cell = JsRuntime.Cell || (JsRuntime.Cell = {}));
    })(JsRuntime = GeomJS.JsRuntime || (GeomJS.JsRuntime = {}));
})(GeomJS || (GeomJS = {}));
//# sourceMappingURL=Cell.js.map