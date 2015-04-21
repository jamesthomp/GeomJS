///<reference path="../references.ts"/>
module GeomJS.JsRuntime {


  export module Interop {
    var dict = {};
    var inlineDict = {};
    var matchDict = {};
    var base = "GeomJS.JsRuntime.Interop.";

    export function addInline(geomName, inlineFunc) {
      inlineDict[geomName] = inlineFunc;
    }

    export function add(geomName, func, optionalMatch = undefined) {
      dict[geomName] = func;
      if (optionalMatch) {
        matchDict[geomName] = optionalMatch
      }

      // This is a little bit of a hack!
      Name.nameTable[geomName] = eval(func);
    }

    // Find (optimisation used in compiler for linking functions without going through the name table)
    export function find(name, inline) {
      if (inline) {
        var t = inlineDict[name];
        if (t !== undefined) {
          return [t, []];
        }
      }

      var prim = dict[name];
      if (prim !== undefined) {
        return prim;
      }

      // No special compile time instructions so we look up at runtime.
      return "GeomJS.JsRuntime.Name.nameTable['" + name + "']";
    }

    export function match(name, matchArg) {
      return matchDict[name](matchArg);
    }

    Interop.add("true", "true");
    Interop.add("false", "false");

    Interop.add("_newvar", () => {
      return "_v" + Funbase.BasicPrims.variableCount++;
    });

    Funbase.Primitive.store("_find",(name: Funbase.Value, inline: Funbase.Value): Funbase.Value => {
      var prim = dict[(<any>name).value];
      if (prim !== undefined) {
        return Funbase.StringValue.create(prim);
      }

      // No special compile time instructions so we look up at runtime.
      return Funbase.StringValue.create("GeomJS.JsRuntime.Name.nameTable['" + (<any>name).value + "']");
    });
    Interop.add("_find", base + "find");

    Funbase.Primitive.store("_match",(matchType: Funbase.Value, matchArg : Funbase.Value): Funbase.Value => {
      var ret = Funbase.Value.string(matchType);
      return Funbase.StringValue.create(matchDict[ret](Funbase.Value.string(matchArg)));
    });
    Interop.add("_match", base + "match");

    export function fail() {
      //Evaluator.errNoMatch(args, base, code.arity);
      throw new Error("no pattern match");
    }

    export function _error(tag: Value, args: Value): Value {
      Funbase.Evaluator.error(tag, Value.array(args));
      return null;
    }
    Interop.add("_error", base + "_error");

    export function _apply(x: Value, y: Value): Value {
      var args: Value[] = Value.array(y);
      if (x.length != args.length) {
        throw new Error("Function arity mismatch");
      }
      return x.apply(null, args);
    }
    Interop.add("_apply", base + "_apply");

    export function _jclosure(body: Value): Value {
      var f = (new Function(body));
      return (<any>f)();
    }
    Interop.add("_jclosure", base + "_jclosure");

    Funbase.Primitive.store("_jclosure",(body: Funbase.Value): Funbase.Value => {
      var func = new Function(Funbase.Value.string(body));
      var realfunc = (<any>func).apply(null);

      return {
        "type": Funbase.Type.Funvalue,
        "subr": {
          type: Funbase.Type.Func,
          arity: realfunc.length,
          apply: (args2, nargs2, base2) => {
            if (nargs2 !== realfunc.length) {
              Funbase.Evaluator.errApply();
            }

            var res = (<any>realfunc).apply(null, args2);
            return res;
          },
          applyjs: realfunc,
          pattMatch: (obj, nargs) => {
            Funbase.Evaluator.errMatch();
            return null;
          }
        }
      };
    });

    export function _scan(): Value {
      return Funbase.GeomBase.theApp.scanJs();
    }
    Interop.add("_scan", base + "_scan");

    export function _synerror(tag: Value, args: Value): Value {
      Funbase.GeomBase.theApp.scanner.syntax_error(tag, Value.array(args));
      return [];
    }
    Interop.add("_synerror", base + "_synerror");

    export function _topval(v: Value): Value {
      Funbase.GeomBase.theApp.display("--> " + Value.print(v));
      return [];
    }
    Interop.add("_topval", base + "_topval");

    export function _topdef(x: Value, v: Value): Value {
      Name.setGlodef(x, v);
      Funbase.GeomBase.theApp.display("--- " + x.name + " = " + Value.print(v));
      return [];
    }
    Interop.add("_jtopdef", base + "_topdef");

    Funbase.Primitive.store("_jtopdef",(x: Value, v: Value): Value => {
      var n = Funbase.Value.name(x);
      if (v.type == Funbase.Type.Funvalue) {
        JsRuntime.Name.setGlodef(n,(<any>v.subr).applyjs);
      } else {
        JsRuntime.Name.setGlodef(n, v);
      }
      Funbase.GeomBase.theApp.display("--- " + n.name + " = " + Funbase.Value.print(v));
      return Funbase.Value.nil;
    });

    export function _toptext(): Value {
      Funbase.GeomBase.theApp.showPhrase();
      return [];
    }
    Interop.add("_toptext", base + "_toptext");

    export function _print(v: Value): Value {
      console.log(Value.print(v));
      return [];
    }
    Interop.add("_print", base + "_print");

    export function _debug(): Value {
      return Funbase.Evaluator.debug;
    }
    Interop.add("_debug", base + "_debug");

    export function _install(name: Value): Value {
      return [];
    }
    Interop.add("_install", base + "_install");

    Name.install();
    InstallInlines();
  }

  declare class Function {
    constructor(body: string);
  }
}