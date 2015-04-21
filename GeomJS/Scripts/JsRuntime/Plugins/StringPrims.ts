///<reference path="../../references.ts"/>
module GeomJS.JsRuntime {
  export module StringPrims {
    var base = "GeomJS.JsRuntime.StringPrims.";

    export function concat(x: Value, y: Value) {
      return x + y;
    }
    Interop.add("^", base + "concat");

    export function explode(x: Value) {
      var result: Value = [];
      for (var i = x.length - 1; i >= 0; i--) {
        result = [x.charAt(i), result];
      }
      return result;
    }
    Interop.add("explode", base + "explode");

    export function implode(ys: Value) {
      var result = "";
      for (var xs = ys; Value.isCons(xs); xs = xs[1]) {
        result += xs[0];
      }
      return result;
    }
    Interop.add("implode", base + "implode");

    export function chr(x: Value) {
      return String.fromCharCode(x);
    }
    Interop.add("chr", base + "chr");

    export function ord(x: Value) {
      return x.length === 0 ? 0 : x.charCodeAt(0);
    }
    Interop.add("ord", base + "ord");

    // seq is used to represent an abstract data type for contructing large strings.
    // it is used inside the compiler for the javascript code generation.
    export function _seq(x: Value) {
      var acc = "";
      for (var xs = x; Value.isCons(xs); xs = xs[1]) {
        acc += xs[0];
      }
      return acc;
    }
    Interop.add("_seq", base + "_seq");

    export function _str(x: Value) {
      if (x.constructor === Name) {
        return x.name;
      }
      return x.toString();
    }
    Interop.add("_str", base + "_str");

    Funbase.Primitive.store("_const",(x: Value): Value => {
      var ret;
      if (x.type === Funbase.Type.String) {
        ret = '"' + Funbase.Value.string(x) + '"';
      } else if (x.type === Funbase.Type.Number) {
        ret = Funbase.Value.asNumber(x);
      } else if (x.type === Funbase.Type.Bool) {
        ret = x.value.toString();
      } else {
        ret = 'new GeomJS.JsRuntime.Name("' + Funbase.Value.name(x).name + '")';
      }
      return Funbase.StringValue.create(ret);
    });

    export function _const(x: Value) {
      if (x.constructor === Name) {
        return 'new GeomJS.JsRuntime.Name("' + x.name + '")';
      } else if (x.constructor === Number) {
        return x.toString();
      } else if (x.constructor === String) {
        return '"' + x.toString() + '"';
      } else if (x.constructor === Boolean) {
        return x;
      }
    }
    Interop.add("_const", base + "_const");
  }
}