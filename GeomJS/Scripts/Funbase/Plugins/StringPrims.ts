///<reference path="../../references.ts"/>
module GeomJS.Funbase {
  export module StringPrims {
    export function install() {
      Primitive.store("^", (x: Value, y: Value) => {
        return StringValue.create(Value.string(x) + Value.string(y));
      });
      Primitive.store("explode", (x: Value) => {
        var s = Value.string(x);
	      var result : Value = Value.nil;
	      for (var i = s.length - 1; i >= 0; i--)
	        result = Value.cons(StringValue.create(s.charAt(i)), result);
        return result;
      });
      Primitive.store("implode", (ys: Value) => {
        var result = "";
	      for (var xs = ys; !(Common.objectEquals(xs, Value.nil));
          xs = Value.tail(xs))
	      result += Value.string(Value.head(xs));
        return StringValue.create(result);
      });
      Primitive.store("chr", (x: Value) => {
        return StringValue.create(String.fromCharCode(Value.asNumber(x)));
      });
      Primitive.store("ord", (x: Value) => {
        var s = Value.string(x);
        return NumValue.create(s.length === 0 ? 0 : s.charCodeAt(0));
      });

      // seq and quote are used to represent an abstract data type for contructing large strings.
      // it is used inside the compiler for the javascript code generation.
      Primitive.store("_seq", (x: Value) => {
        var s = Value.array(x);
        var acc = "";
        for (var i = 0; i < s.length; i++) {
          acc += s[i].value;
        }
        return StringValue.create(acc);
      });

      Primitive.store("_str", (x: Value) => {
        if (x.type === Type.String) {
          return x;
        } else if (x.type === Type.Number) {
          return StringValue.create(Value.asNumber(x).toString());
        } else {
          return StringValue.create(Value.name(x).name);
        }
      });

        //NOTE(james): for testing/experimenting/debugging ONLY
        /*Primitive.store("_pair", (x: Value, y: Value) => {
        return {
          "type": "pairvalue",
          "one": x,
          "two": y,
          "subr": Func.nullFunction()
        };
      }, (obj: any, nargs: number): Value[]=> {
        if (nargs != 2) {
          Evaluator.errPatNargs(name);
        }
        var args: Value[] = [];
        try {
          args[0] = obj.one;
          args[1] = obj.two;
          return args;
        } catch (e) {
          if (e instanceof ClassCastException) {
            return null;
          }
          throw e;
        }
      });*/
    }
  }
}