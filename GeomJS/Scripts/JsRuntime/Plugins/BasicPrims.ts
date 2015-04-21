///<reference path="../../references.ts"/>
module GeomJS.JsRuntime {
  export module BasicPrims {
    var base = "GeomJS.JsRuntime.BasicPrims.";

    Interop.add("=", "GeomJS.JsRuntime.Value.areEqual");
    Interop.add("<>", "GeomJS.JsRuntime.Value.areNotEqual");

    export function add(x: Value, y: Value) {
      return x + y;
    }

    // Code for a match gets inlined as direct javascript during the compilation stage. 
    export function matchPlus(args: Value): Value {
      var val = args[0];
      var inc = args[1][0];
      if (inc.constructor !== Number || inc <= 0) {
        return "false";
      }
      var x = "(" + val + "-" + inc + ")";
      return "(!" + val + " || " + val + ".constructor !== Number || " + x + " < 0 || " + x + " % 1 !== 0) ? false : [" + x + "]"
    }

    Interop.add("+", base + "add", matchPlus);

    export function sub(x: Value, y: Value) {
      return x - y;
    }
    Interop.add("-", base + "sub");

    export function mul(x: Value, y: Value) {
      return x * y;
    }
    Interop.add("*", base + "mul");

    export function div(x: Value, y: Value) {
      if (y === 0) {
        Funbase.Evaluator.error("#divzero");
      }
      return x / y;
    }
    Interop.add("/", base + "div");

    export function neg(x: Value) {
      return -x;
    }
    Interop.add("~", base + "neg");

    export function lt(x: Value, y: Value) {
      return x < y;
    }
    Interop.add("<", base + "lt");

    export function lte(x: Value, y: Value) {
      return x <= y;
    }
    Interop.add("<=", base + "lte");

    export function  gt(x: Value, y: Value) {
      return x > y;
    }
    Interop.add(">", base + "gt");

    export function gte(x: Value, y: Value) {
      return x >= y;
    }
    Interop.add(">=", base + "gte");

    export function numeric(x: Value) {
      return typeof x === "number";
    }
    Interop.add("numeric", base + "numeric");

    export function int(x: Value) {
      return Math.floor(x);
    }
    Interop.add("int", base + "int");

    export function sqrt(x: Value) {
      if (x < 0) {
        Funbase.Evaluator.error("#sqrt");
      }
      return Math.sqrt(x);
    }
    Interop.add("sqrt", base + "sqrt");

    export function exp(x: Value) {
      return Math.exp(x);
    }
    Interop.add("exp", base + "exp");

    export function sin(x: Value) {
      return Math.sin(x * Math.PI / 180);
    }
    Interop.add("sin", base + "sin");

    export function cos(x: Value) {
      return Math.cos(x * Math.PI / 180);
    }
    Interop.add("cos", base + "cos");

    export function tan(x: Value) {
      return Math.tan(x * Math.PI / 180);
    }
    Interop.add("tan", base + "tan");

    export function atan2(x: Value, y: Value) {
      return Math.atan2(x, y) * Math.PI / 180;
    }
    Interop.add("atan2", base + "atan2");

    export function random() {
      return Math.random();
    }
    Interop.add("random", base + "random");

    export function name(x: Value) {
      return Interop.find(x, false);
    }
    Interop.add("name", base + "name");

    export function cons(hd: Value, tl: Value) {
      if (!tl || tl.constructor !== Array) {
        Funbase.Evaluator.expect(":", "a list");
      }
      return [hd, tl];
    }

    // Code for a match gets inlined as direct javascript during the compilation stage. 
    export function consMatch(obj: Value): Value {
      return "(!" + obj + " || " + obj + ".constructor !== Array || " + obj + ".length !== 2) ? false : " + obj + ""
    }
    Interop.add(":", base + "cons", consMatch);

    export function head(x: Value) {
      if (!x || x.constructor !== Array) {
        Funbase.Evaluator.listFail(x, "#head");
        return undefined;
      }
      return x[0];
    }
    Interop.add("head", base + "head");

    export function tail(x: Value) {
      if (!x || x.constructor !== Array) {
        Funbase.Evaluator.listFail(x, "#tail");
        return undefined;
      }
      return x[1];
    }
    Interop.add("tail", base + "tail");
  }
}