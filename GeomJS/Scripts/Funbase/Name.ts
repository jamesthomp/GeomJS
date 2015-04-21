///<reference path="../references.ts"/>
module GeomJS.Funbase {
  "use strict"
  export interface Name extends Value {
    name: string;
    /** Level at which the name is defined. Values 0 = fixed system, 
    1 = preloaded but redefinable, 2 = undefined or user-defined */
    level: number;
  }
  export module Name {
    var nameTable: { [tag: string]: Name } = {};

    export function bootstrap(boot: { [tag: string]: Name }) {
      for (var defn in boot) {
        if (!boot.hasOwnProperty(defn)) {
          continue;
        }
        var body = boot[defn];
        if (body && body.type === Type.Funcode) {
          bootDef(defn, FunCode.makeClosure(Value.funcode(boot[defn]), [undefined]));
        } else {
          bootDef(defn, boot[defn]);
        }
      }
    }

    export function create(value: string): Name {
      return {
        type: Type.Name,
        name: value,
        subr: Func.nullFunction(),
        level: 2
      };
    }

    /* Resets back to just level 0 definitions */
    export function reset(): void {
      for (var tag in nameTable) {
        if (nameTable.hasOwnProperty(tag) && nameTable[tag] && nameTable[tag].level != 0) {
          nameTable[tag] = undefined;
        }
      }
    }

    export function getGlodef(n: Name): Value {
      var prim = Primitive.find(n.name);
      if (prim) {
        return prim;
      }

      return nameTable[n.name];
    }

    /** Find or create the unique Name with a given spelling */
    export function find(tag: string): Name {
      var prim = Primitive.find(tag);
      if (prim) {
        return prim;
      }

      var name = nameTable[tag];
      if (!name) {
        name = create(tag);
        nameTable[tag] = name;
      }
      return name;
    }

    /** Initialization stage.  Global definitions made in stage 0 become
    frozen once stage is non-zero. */
    var stage = 0;

    export function setGlodef(tag: string, val: Value): void {
      var n = Value.name(val);
      n.level = stage;
      nameTable[tag] = n;
    }

    export function bootDef(tag: string, val: Value): void {
      var n = Value.name(val);
      n.level = 0;
      nameTable[tag] = n;
    }

    /** Whether functions created now should be ignored in tracebacks */
    export function getFreezer(): boolean {
       return stage === 0;
    }

    export function isFrozen(n: Name): boolean {
      return (n.level === 0 && stage > 0);
    }

    /** Get alphabetical list of globally defined names */
    export function getGlobalNames(): string[] {
      var names: string[] = [];

      for (var tag in nameTable) {
        if (!(tag[0] === "_")) {
          names.push(tag);
        }
      }

      return names.sort();
    }

    Primitive.store("_defined", (x: Value): Value => {
      var n = Value.name(x);
      var d = getGlodef(n);
      if (d)
        return BoolValue.True;
      else
        return BoolValue.False;
    });

    Primitive.store("_glodef", (x: Value): Value => {
      var n = Value.name(x);
      var v = getGlodef(n);
      if (!v || v.type === Type.Name) {
        Evaluator.errNotDef(n);
      }
      return v;
    });

    Primitive.store("_stage", (x : Value): Value => {
      stage = Value.asNumber(x);
      return Value.nil;
    });

    Primitive.store("_redefine", (x: Value): Value => {
      var n = Value.name(x);
      if (n.level === 0 && stage > 0) {
        Evaluator.error("#redef", x);
      } else if (n.level === 2 && getGlodef(n).type !== Type.Name) {
        Evaluator.error("#multidef", x);
      }
      return Value.nil;
    });

    Primitive.store("_spelling", (x: Value): Value => {
      var n = Value.name(x);
      return StringValue.create(n.name);
    });

    export var _g = 0;

    Primitive.store("_gensym", (x: Value): Value => {
      Name._g += 1;
      return Name.find("$g" + Name._g);
    });
  }
} 