///<reference path="../references.ts"/>
module GeomJS.JsRuntime {

  export function Name(name: string) {
    this.name = name;
    //this.level = 2;
    this.toString = function () {
      return "#" + this.name;
    }
  }

  export module Name {
    var base = "GeomJS.JsRuntime.Name."
    var stage: number = 0;
    export var nameTable: { [tag: string]: any } = {};

    function getGlodef(n: Value) {
      var prim = nameTable[n.name];
      if (prim !== undefined) {
        return prim;
      }

      return nameTable[n.name];
    }

    export function setGlodef(tag: Value, val: Value): void {
      //n.level = stage;
      if (stage == 2) {
        Interop.remove(tag.name);
      }
      nameTable[tag.name] = val;
    }

    export function _defined(x: Value): Value {
      return (getGlodef(x) !== undefined);
    }

    export function _glodef(x: Value): Value {
      var v = getGlodef(x);
      if (v === undefined) {
        Funbase.Evaluator.errNotDef(x);
      }
      return v;
    }

    export function _stage(x: Value): Value {
      stage = x;
      return [];
    }

    export function _redefine(x: Value): Value {
      /*if (x.level === 0 && stage > 0) {
        Funbase.Evaluator.error("#redef", x);
      } else if (x.level === 2) {
        Funbase.Evaluator.error("#multidef", x);
      }*/
      return [];
    }

    export function _spelling(x: Value): Value {
      return x.name;
    }

    export var _g = 0;
    export function _gensym(x: Value): Value {
      Name._g += 1;
      return new Name("$g" + Name._g);
    }

    // To prevent cyclic dependency between Interop & Name!
    export function install() {
      Interop.add("_gensym", base + "_gensym");
      Interop.add("_spelling", base + "_spelling");
      Interop.add("_redefine", base + "_redefine");
      Interop.add("_defined", base + "_defined");
      Interop.add("_glodef", base + "_glodef");
      Interop.add("_stage", base + "_stage");
    }
  }
}