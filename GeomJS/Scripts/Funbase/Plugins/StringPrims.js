///<reference path="../../references.ts"/>
var GeomJS;
(function (GeomJS) {
    var Funbase;
    (function (Funbase) {
        var StringPrims;
        (function (StringPrims) {
            function install() {
                Funbase.Primitive.store("^", function (x, y) {
                    return Funbase.StringValue.create(Funbase.Value.string(x) + Funbase.Value.string(y));
                });
                Funbase.Primitive.store("explode", function (x) {
                    var s = Funbase.Value.string(x);
                    var result = Funbase.Value.nil;
                    for (var i = s.length - 1; i >= 0; i--)
                        result = Funbase.Value.cons(Funbase.StringValue.create(s.charAt(i)), result);
                    return result;
                });
                Funbase.Primitive.store("implode", function (ys) {
                    var result = "";
                    for (var xs = ys; !(GeomJS.Common.objectEquals(xs, Funbase.Value.nil)); xs = Funbase.Value.tail(xs))
                        result += Funbase.Value.string(Funbase.Value.head(xs));
                    return Funbase.StringValue.create(result);
                });
                Funbase.Primitive.store("chr", function (x) {
                    return Funbase.StringValue.create(String.fromCharCode(Funbase.Value.asNumber(x)));
                });
                Funbase.Primitive.store("ord", function (x) {
                    var s = Funbase.Value.string(x);
                    return Funbase.NumValue.create(s.length === 0 ? 0 : s.charCodeAt(0));
                });
                // seq and quote are used to represent an abstract data type for contructing large strings.
                // it is used inside the compiler for the javascript code generation.
                Funbase.Primitive.store("_seq", function (x) {
                    var s = Funbase.Value.array(x);
                    var acc = "";
                    for (var i = 0; i < s.length; i++) {
                        acc += s[i].value;
                    }
                    return Funbase.StringValue.create(acc);
                });
                Funbase.Primitive.store("_str", function (x) {
                    if (x.type === 0 /* String */) {
                        return x;
                    }
                    else if (x.type === 3 /* Number */) {
                        return Funbase.StringValue.create(Funbase.Value.asNumber(x).toString());
                    }
                    else {
                        return Funbase.StringValue.create(Funbase.Value.name(x).name);
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
            StringPrims.install = install;
        })(StringPrims = Funbase.StringPrims || (Funbase.StringPrims = {}));
    })(Funbase = GeomJS.Funbase || (GeomJS.Funbase = {}));
})(GeomJS || (GeomJS = {}));
//# sourceMappingURL=StringPrims.js.map