///<reference path="../../references.ts"/>

module GeomJS.JsRuntime {
  export function InstallInlines() {
    Interop.addInline("=", function (x) {
      var args = Value.array(x);
      var x = args[0];
      var y = args[1];
      // We have to be careful of variables which begin '_v'. Fortunately
      // nothing we want to inline begins with '_v'

      if (y.constructor === String && y.indexOf('_v') === -1) {
        var runtimeVal = eval(y);

        if (runtimeVal.constructor === String || runtimeVal.constructor === Number || runtimeVal.constructor === Boolean) {
          return x + " === " + y;
        }
        if (runtimeVal.constructor === Name || runtimeVal.constructor === Function) {
          return x + ".name === " + y + ".name";
        }

      }

      if (x.constructor === String && x.indexOf('_v') === -1) {
        var runtimeVal = eval(x);

        if (runtimeVal.constructor === String || runtimeVal.constructor === Number || runtimeVal.constructor === Boolean) {
          return x + " === " + y;
        }
        if (runtimeVal.constructor === Name || runtimeVal.constructor === Function) {
          return x + ".name === " + y + ".name";
        }

      }

      return "GeomJS.JsRuntime.Value.areEqual(" + x + "," + y + ")";
    });


    Interop.addInline("<>", function (x) {
      var args = Value.array(x);
      var x = args[0];
      var y = args[1];
      // We have to be careful of variables which begin '_v'. Fortunately
      // nothing we want to inline begins with '_v'

      if (y.constructor === String && y.indexOf('_v') === -1) {
        var runtimeVal = eval(y);

        if (runtimeVal.constructor === String || runtimeVal.constructor === Number || runtimeVal.constructor === Boolean) {
          return x + " !== " + y;
        }
        if (runtimeVal.constructor === Name || runtimeVal.constructor === Function) {
          return x + ".name !== " + y + ".name";
        }

      }

      if (x.constructor === String && x.indexOf('_v') === -1) {
        var runtimeVal = eval(x);

        if (runtimeVal.constructor === String || runtimeVal.constructor === Number || runtimeVal.constructor === Boolean) {
          return x + " !== " + y;
        }
        if (runtimeVal.constructor === Name || runtimeVal.constructor === Function) {
          return x + ".name !== " + y + ".name";
        }

      }

      return "GeomJS.JsRuntime.Value.areNotEqual(" + x + "," + y + ")";
    });

    Interop.addInline("+", function (x) {
      var args = Value.array(x);
      return "(" + args[0] + "+" + args[1] + ")";
    });

    Interop.addInline("-", function (x) {
      var args = Value.array(x);
      return "(" + args[0] + "-" + args[1] + ")";
    });

    Interop.addInline("*", function (x) {
      var args = Value.array(x);
      return "(" + args[0] + "*" + args[1] + ")";
    });

    Interop.addInline("/", function (x) {
      var args = Value.array(x);
      return "(" + args[1] + " === 0) ? GeomJS.Funbase.Evaluator.error('#divzero') : (" + args[0] + "/" + args[1] + ")";
    });

    Interop.addInline("/", function (x) {
      var t = Value.array(x);
      var l = t[0];
      var r = t[1];
      return "(" + r + " === 0) ? GeomJS.Funbase.Evaluator.error('#divzero') : (" + l + "/" + r + ")";
    });

    Interop.addInline("~", function (x) {
      var args = Value.array(x);
      return "(" + "-" + args[0] + ")";
    });

    Interop.addInline("<", function (x) {
      var args = Value.array(x);
      return "(" + args[0] + "<" + args[1] + ")";
    });

    Interop.addInline("<=", function (x) {
      var args = Value.array(x);
      return "(" + args[0] + "<=" + args[1] + ")";
    });

    Interop.addInline(">", function (x) {
      var args = Value.array(x);
      return "(" + args[0] + ">" + args[1] + ")";
    });

    Interop.addInline(">=", function (x) {
      var args = Value.array(x);
      return "(" + args[0] + ">=" + args[1] + ")";
    });

    Interop.addInline("numeric", function (x) {
      var args = Value.array(x);
      return "typeof " + args[0] + " === 'number'";
    });

    Interop.addInline("int", function (x) {
      var args = Value.array(x);
      return "Math.floor(" + args[0] + ")";
    });

    Interop.addInline("head", function (x) {
      var args = Value.array(x);
      return args[0] + "[0]";
    });

    Interop.addInline("tail;", function (x) {
      var args = Value.array(x);
      return args[0] + "[1]";
    });

    Interop.addInline("^", function (x) {
      var args = Value.array(x);
      return "(" + args[0] + "+" + args[1] + ")";
    });
  }
}