///<reference path="../../references.ts"/>

module GeomJS.JsRuntime {
  export function Hash(init = undefined) {
    this.toString = function () {
      return "<hash>";
    };
    this.mapping = new GeomJS.Common.Map(Value.areEqual, init)
  }

  export module Hash {
    var base = "GeomJS.JsRuntime.Hash.";

    export function _hash(): Value {
      return new Hash();
    }
    Interop.add("_hash", base + "_hash");

    export function _clone(h: Value): Value {
      if (h.constructor === Hash || h.type === Funbase.Type.Hash) {
        return new Hash(h.mapping.getIterator());
      } else {
        throw "_clone called with non-hash";
      }
    }
    Interop.add("_clone", base + "_clone");

    export function _lookup(h: Value, x: Value): Value {
      if (h.constructor === Hash || h.type === Funbase.Type.Hash) {
        var r = h.mapping.get(x);
        if (r === undefined)
          return [];
        return r;
      } else {
        throw "_lookup called with non-hash";
      }
    }
    Interop.add("_lookup", base + "_lookup");

    export function _update(h: Value, x: Value, y: Value): Value {
      if (h.constructor === Hash || h.type === Funbase.Type.Hash) {
        h.mapping.set(x, y);
        return y;
      } else {
        console.log(h);
        throw "_update called with non-hash"; 
      }
    }
    Interop.add("_update", base + "_update");
  }
}