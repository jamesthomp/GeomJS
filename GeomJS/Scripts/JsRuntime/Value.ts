///<reference path="../references.ts"/>
module GeomJS.JsRuntime {
  export type Value = any;

  export module Value {
    export function areNotEqual(x: Value, y: Value) {
      return !areEqual(x, y);
    }

    export function areEqual(x: Value, y: Value) {
      if (x === y) {
        return true; //number, boolean, string
      } else if (x.constructor === Number || x.constructor === Boolean || x.constructor === String || x.constructor !== y.constructor) {
        return false;
      } else if (x.constructor === Name) {
        return x.name === y.name;
      } else if (x.constructor === Array) {
        while (true) {
          if (x.length === 0) {
            return y.length === 0
          }
          if (y.length === 0) {
            return x.length === 0
          }
          if (!areEqual(x[0], y[0])) {
            return false;
          }

          x = x[1];
          y = y[1];
        }

      } else if (x.constructor === Function) {
        return x.name == y.name;
      } else if (x.equals && y.equals) {
        return x.equals(y);
      } else {
        console.log("Equals unsupported on " + x.constructor);
      }
      //TODO: cell, dict, etc
    }

    export function array(v: Value) {
      var acc = [];
      for (var xs = v; Value.isCons(xs); xs = xs[1]) {
        acc.push(xs[0]);
      }
      return acc;
    }

    export function isCons(v: Value) {
      return v && v.constructor === Array && v.length === 2
    }

    export function print(v: Value) {
      if (v.constructor === Array) {

        var str = "[";
        for (var xs = v; Value.isCons(xs); xs = xs[1]) {
          str += Value.print(xs[0]);
          if (Value.isCons(xs[1])) {
            str += ", ";
          }
        }
        str += "]"
        return str;

      } else if (v.constructor === Function) {
        return "<function(" + v.length + ")>"
      } else {
        return v.toString();
      }
    }
  }
}