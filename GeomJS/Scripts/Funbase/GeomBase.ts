///<reference path="../references.ts"/>
module GeomJS.Funbase {
  export class GeomBase {
    public scanner: Scanner;
    public display: (log: string) => void;
    public last_val: Value;
    public echo: (log: string) => void;
    public error: (log: string) => void;
    public static theApp: GeomBase = new GeomBase();

    public scan(): Value {
      return this.scanner.nextToken();
    }

    public scanJs(): Funbase.Value {
      return this.scanner.nextTokenJs();
    }

    /** Called when evaluation of a top-level expression is complete */
    public exprValue(v: Value): void {
      this.last_val = v;
      this.display("--> " + Value.print(v));
    }

    /** Called when elaboration of a top-level definition is complete */
    public defnValue(n: Name, v: Value): void {
      this.last_val = v;
      Name.setGlodef(n.name, v);
      this.display("--- " + n.name + " = " + Value.print(v));
    }

    /** Called when a phrase has been parsed */
    public showPhrase(): void {
      this.echo(this.scanner.getText());
    }

    public eval_loop(reader: Scanner.Reader, echo: (log: string) => void, display: (log: string) => void, statsOut: (log: string) => void, error: (log: string) => void, evalfunc : string): boolean {
      this.scanner = new Scanner(reader);
      this.echo = echo;
      this.display = display;
      this.error = error;

      var errtag = "";
      var last_val = null;

      while (true) {
        //try {

          var top: Value = Name.find(evalfunc);

          this.scanner.resetText();
          if (Evaluator.execute(top.subr) === BoolValue.False) {
            return true;
          }
        /*}
        catch (e) {
          if (e instanceof Scanner.SyntaxError) {
            error("#syntax - " + JSON.stringify(e));
            //syntaxError(e);
            return false;
          }
          else if (e instanceof Evaluator.EvalError) {
            error("#runtime - " + JSON.stringify(e));
            //runtimeError(e);
            return false;
          }
          else if (e instanceof Throwable) {
            error("#failure - " + JSON.stringify(e));
            //failure(e);
            return false;
          } else {
            error("#uncaught  - " + JSON.stringify(e));
          }
        }*/
      }
    }
  }

  Primitive.store("_scan", (): Value => GeomBase.theApp.scan());

  Primitive.store("_synerror", (tag: Value, args: Value): Value => {
    GeomBase.theApp.scanner.syntax_error(Value.string(tag), Value.array(args));
    return Value.nil;
  });

  Primitive.store("_setroot", (v: Value): Value => {
    Interp.get.setRoot(v);
    Evaluator.reset();
    return Value.nil;
  });

  Primitive.store("_topval", (v: Value): Value => {
    GeomBase.theApp.exprValue(v);
    return Value.nil;
  });

  Primitive.store("_topdef", (x: Value, v: Value): Value => {
    var n = Value.name(x);
    v['name'] = n.name;
    GeomBase.theApp.defnValue(n, v);
    return Value.nil;
  });

  Primitive.store("_toptext", (): Value => {
    GeomBase.theApp.showPhrase();
    return Value.nil;
  });

  Primitive.store("_print", (v: Value): Value => {
    console.log(Value.print(v));
    return Value.nil;
  });

  Primitive.store("_debug", (): Value => NumValue.create(Evaluator.debug));

  Primitive.store("_install", (name: Value): Value => {
    var packageName = Value.string(name);
    if (packageName === "") {
      //toInstall = thatPackage.primitives;
    } else if (packageName === "BasicPrims") {
      BasicPrims.install();
    } else if (packageName === "Cell") {
      Cell.install();
    } else if (packageName === "Hash") {
      Hash.install();
    } else if (packageName === "StringPrims") {
      StringPrims.install();
    }
    else {
      Evaluator.error("#install");
    }

    return Value.nil;
  });

  // Add image primitive for benchmarking purposes
  //Don't actually do convert HSV to RGB or do file IO for benchmarking purposes
  Primitive.store("image", (w: Value, h: Value, f: Value, outName: Value) : Value => {
    var h2 = Value.asNumber(h);
    var w2 = Value.asNumber(w);
    for (var y = Math.round(h2 - 1); y >= 0; y--) {
      for (var x = 0; x < w2; x++) {
        Value.apply(f, [NumValue.create(x), NumValue.create(y)]);
      }
    }
    return Value.nil;
  });
}