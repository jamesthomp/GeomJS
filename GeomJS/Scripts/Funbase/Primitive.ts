///<reference path="../references.ts"/>
module GeomJS.Funbase {
  export interface Primitive extends Func {
    name: string;
  }

  export module Primitive {
    var primitives: { [tag: string]: Name } = {};

    /** Stores a primitive function (used to replace reflection) */
    export function store(name: string, func: (...params: Value[]) => Value, pattMatch?: (obj: Value, nargs: number) => Value[]): void {
      var p = {
        type: Type.Funcode,
        name: name,
        subr: {
          type: Funbase.Type.Func,
          arity: func.length - 1,
          apply: (args: Value[], nargs: number, base: number): Value => {
            var theArgs = [];
            Common.arraycopy(args, base, theArgs, 0, func.length);
            return func.apply(null, theArgs);
          },
          pattMatch: (obj: Value, nargs: number): Value[] => null
          //code: funcode
        },
        level: 0
      };

      if (pattMatch) {
        p.subr.pattMatch = pattMatch;
      }

      primitives[name] = p;
    }

    export function find(name: string): Name {
      return primitives[name];
    }
  }
}