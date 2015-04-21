///<reference path="../../references.ts"/>
module GeomJS.Funbase {

  // Implements the Cell primitive with operations: _new, _get, _set
  // _new() creates a fresh cell, _get(c) gets the value stored in cell c,
  // and _set(c,v) sets the cell c to store value v.
  export module Cell {

    // Cells are a subclass of Value
    interface Cell extends Value {
      value: Value;
    }

    // Creates a fresh cell
    function newInstance(val: Value): Cell {
      return {
        type: Type.Cell,
        value: val,
        subr: Func.nullFunction()
      }
    }

    // Converts a Value to a cell, or throws WrongKindException
    function toCell(v: Value): Cell {
      if (v && v.type === Type.Cell) {
        return <Cell>v;
      } else {
        throw new WrongKindException();
      }
    }

    // As this plugin is required by the compiler, this plugin is
    // installed by the runtime during the initial loading phase.
    export function install() {
      Primitive.store("_new",(x: Value): Value => {
        Evaluator.countCons();
        return newInstance(x);
      });
      Primitive.store("_get",(x: Value): Value => {
        return toCell(x).value;
      });
      Primitive.store("_set",(v: Value, y: Value): Value => {
        var x = toCell(v);
        return (x.value = y);
      });
    }
  }
}