///<reference path="../references.ts"/>
module GeomJS.Funbase {
  "use strict";

  export enum Type {
    String,
    Bool,
    List,
    Number,
    Funcode,
    Nil,
    Funvalue,
    Cell,
    Hash,
    Name,
    Func
  }

  export interface Func {
    type: Type; /** The parent type */
    arity: number; /** Number of arguments */
    apply(args: Value[], nargs: number, base: number): Value;
    pattMatch(obj: Value, nargs: number): Value[];
  }

  export interface Closure extends Func {
    code: FunCode;
    fvars: Value[];
  }

  export module Func {
    "use strict";

    export function nullFunction(): Func {
      return {
        type: Type.Func,
        arity: -1,
        apply: (args, nargs, base) => {
          Evaluator.errApply();
          return null;
        },
        pattMatch: (obj, nargs) => {
          Evaluator.errMatch();
          return null;
        }
      };
    }

    Primitive.store("_apply", (x: Value, y: Value): Value => {
      var args: Value[] = Value.array(y);
      return Value.apply(x, args);
    });

    Primitive.store("_closure", (x: Value): Value => {
      var body = Value.funcode(x);
      return FunCode.makeClosure(body, [undefined]);
    });
  }
}