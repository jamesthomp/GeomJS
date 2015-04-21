///<reference path="../../references.ts"/>

module GeomJS.Funbase {

  // A type that maps keys to values.
  export module Hash {
    interface Hash extends Value {
      mapping: GeomJS.Common.Map
    }

    // Create a fresh hash.
    function newInstance(init = undefined): Hash {
      Evaluator.countCons();
      return {
        type: Type.Hash,
        mapping: new GeomJS.Common.Map(Common.objectEquals, init),
        subr:  Func.nullFunction()
      }
    }

    // Convert Value to hash, or throw.
    function toHash(v : Value): Hash {
      if (v && v.type === Type.Hash) {
        return <Hash>v;
      } else {
        throw new WrongKindException();
      }
    }

    export function install() {
      
      // Primitive for creating a hash
      Primitive.store("_hash", (): Value => {
        return newInstance();
      });

      // Primitive for copying a hash
      Primitive.store("_clone", (m: Value): Value => {
        var h = toHash(m);
        return newInstance(h.mapping.getIterator());
      });

      // Primitive for getting the value associated with a key
      Primitive.store("_lookup", (m: Value, x: Value): Value => {
        var r = toHash(m).mapping.get(x);
        if (!r)
          return Value.nil;
        return r;
      });

      // Primitive for associating a value with a key
      Primitive.store("_update", (m: Value, x: Value, y: Value): Value => {
        var h = toHash(m);
        h.mapping.set(x, y);
        return y;
      });
    }
  }
}