///<reference path="../../references.ts"/>
module GeomJS.JsRuntime {

// Implements the Cell primitive with operations: _new, _get, _set
// _new() creates a fresh cell, _get(c) gets the value stored in cell c,
// and _set(c,v) sets the cell c to store value v.
  export function Cell(val: Value) {
    this.val = val;
    this.toString = function () {
      return "ref " + this.val.toString();
    }
    this.equals = function (y) {
      return y.constructor === Cell && Value.areEqual(this.val, y.val);
    }
  }

  export module Cell {
    var base = "GeomJS.JsRuntime.Cell.";

    // Create a fresh cell
    export function _new(x: Value): Value {
      Funbase.Evaluator.countCons();
      return new Cell(x);
    }
    Interop.add("_new", base + "_new");

    // Get the contents of a cell
    export function _get(x: Value): Value {
      if (x.constructor === Cell) {
        return x.val;
      } else {
        throw "_get called with non-cell";
      }
    }
    Interop.add("_get", base + "_get");

    // Set the contents of a cell
    export function _set(v: Value, y: Value): Value {
      if (v.constructor === Cell) {
        return (v.val = y);
      } else {
        throw "_set called with non-cell";
      }
    }
    Interop.add("_set", base + "_set");
  }
}