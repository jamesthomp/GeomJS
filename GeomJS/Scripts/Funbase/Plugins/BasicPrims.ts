///<reference path="../../references.ts"/>
module GeomJS.Funbase {
  export module BasicPrims {
    export var variableCount = 0;
    export function install() {
      Primitive.store("_newvar",() => {
        return StringValue.create("_v" + variableCount++);
      });
      Primitive.store("=", (x: Value, y: Value) => {
        return BoolValue.create(Common.objectEquals(x, y));
      });
      Primitive.store("<>", (x: Value, y: Value) => {
        return BoolValue.create(!Common.objectEquals(x, y));
      });
      Primitive.store("+", (x: Value, y: Value) => {
        return NumValue.create(Value.asNumber(x) + Value.asNumber(y));
      });
      Primitive.store("-", (x: Value, y: Value) => {
        return NumValue.create(Value.asNumber(x) - Value.asNumber(y));
      });
      Primitive.store("*", (x: Value, y: Value) => {
        return NumValue.create(Value.asNumber(x) * Value.asNumber(y));
      });
      Primitive.store("/", (x: Value, y: Value) => {
        var yy = Value.asNumber(y);
        if (yy === 0) {
          Evaluator.error("#divzero");
        }
        return NumValue.create(Value.asNumber(x) / yy);
      });
      Primitive.store("~", (x: Value) => {
        return NumValue.create(-Value.asNumber(x));
      });
      Primitive.store("<", (x: Value, y: Value) => {
        return BoolValue.create(Value.asNumber(x) < Value.asNumber(y));
      });
      Primitive.store("<=", (x: Value, y: Value) => {
        return BoolValue.create(Value.asNumber(x) <= Value.asNumber(y));
      });
      Primitive.store(">", (x: Value, y: Value) => {
        return BoolValue.create(Value.asNumber(x) > Value.asNumber(y));
      });
      Primitive.store(">=", (x: Value, y: Value) => {
        return BoolValue.create(Value.asNumber(x) >= Value.asNumber(y));
      });
      Primitive.store("numeric", (x: Value) => {
        return BoolValue.create(x.type === Type.Number);
      });
      Primitive.store("int", (x: Value) => {
        return NumValue.create(Math.floor(Value.asNumber(x)));
      });
      Primitive.store("sqrt", (x: Value) => {
        var arg = Value.asNumber(x);
        if (arg < 0) {
          Evaluator.error("#sqrt");
        }
        return NumValue.create(Math.sqrt(arg));
      });
      Primitive.store("exp", (x: Value) => {
        return NumValue.create(Math.exp(Value.asNumber(x)));
      });
      Primitive.store("sin", (x: Value) => {
        return NumValue.create(Math.sin(Value.asNumber(x) * Math.PI / 180));
      });
      Primitive.store("cos", (x: Value) => {
        return NumValue.create(Math.cos(Value.asNumber(x) * Math.PI / 180));
      });
      Primitive.store("tan", (x: Value) => {
        return NumValue.create(Math.tan(Value.asNumber(x) * Math.PI / 180));
      });
      Primitive.store("atan2", (x: Value, y: Value) => {
        return NumValue.create(Math.atan2(Value.asNumber(x), Value.asNumber(y)) * Math.PI / 180);
      });
      Primitive.store("random", () => {
        return NumValue.create(Math.random());
      });
      Primitive.store("name", (x: Value) => {
        return Name.find(Value.string(x));
      });
      Primitive.store(":", (hd: Value, tl: Value) => {
        if (!Value.isCons(tl) && !Common.objectEquals(tl, Value.nil)) {
          Evaluator.expect(":", "a list");
        }
        return Value.cons(hd, tl);
      }, (obj: Value, nargs: number): Value[] => {
        if (nargs !== 2) {
          Evaluator.errPatNargs(":");
        }
        var args: Value[] = [];
        try {
          args[0] = Value.tail(obj);
          args[1] = Value.head(obj);
          return args;
        } catch (e) {
          if (e instanceof ClassCastException) {
            return null;
          }
          throw e;
        }
      });
      Primitive.store("head", (x: Value) => {
        try {
          return Value.head(x);
        } catch (e) {
          if (e instanceof ClassCastException) {
            Evaluator.listFail(x, "#head");
            return null;
          }
        }
      });
      Primitive.store("tail", (x: Value) => {
        try {
          return Value.tail(x);
        } catch (e) {
          if (e instanceof ClassCastException) {
            Evaluator.listFail(x, "#tail");
            return null;
          }
        }
      });
    }
  }
}