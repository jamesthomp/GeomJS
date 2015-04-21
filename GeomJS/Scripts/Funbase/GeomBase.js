///<reference path="../references.ts"/>
var GeomJS;
(function (GeomJS) {
    var Funbase;
    (function (Funbase) {
        var GeomBase = (function () {
            function GeomBase() {
            }
            GeomBase.prototype.scan = function () {
                return this.scanner.nextToken();
            };
            GeomBase.prototype.scanJs = function () {
                return this.scanner.nextTokenJs();
            };
            /** Called when evaluation of a top-level expression is complete */
            GeomBase.prototype.exprValue = function (v) {
                this.last_val = v;
                this.display("--> " + Funbase.Value.print(v));
            };
            /** Called when elaboration of a top-level definition is complete */
            GeomBase.prototype.defnValue = function (n, v) {
                this.last_val = v;
                Funbase.Name.setGlodef(n.name, v);
                this.display("--- " + n.name + " = " + Funbase.Value.print(v));
            };
            /** Called when a phrase has been parsed */
            GeomBase.prototype.showPhrase = function () {
                this.echo(this.scanner.getText());
            };
            GeomBase.prototype.eval_loop = function (reader, echo, display, statsOut, error, evalfunc) {
                this.scanner = new Funbase.Scanner(reader);
                this.echo = echo;
                this.display = display;
                this.error = error;
                var errtag = "";
                var last_val = null;
                while (true) {
                    //try {
                    var top = Funbase.Name.find(evalfunc);
                    this.scanner.resetText();
                    if (Funbase.Evaluator.execute(top.subr) === Funbase.BoolValue.False) {
                        return true;
                    }
                }
            };
            GeomBase.theApp = new GeomBase();
            return GeomBase;
        })();
        Funbase.GeomBase = GeomBase;
        Funbase.Primitive.store("_scan", function () { return GeomBase.theApp.scan(); });
        Funbase.Primitive.store("_synerror", function (tag, args) {
            GeomBase.theApp.scanner.syntax_error(Funbase.Value.string(tag), Funbase.Value.array(args));
            return Funbase.Value.nil;
        });
        Funbase.Primitive.store("_setroot", function (v) {
            Funbase.Interp.get.setRoot(v);
            Funbase.Evaluator.reset();
            return Funbase.Value.nil;
        });
        Funbase.Primitive.store("_topval", function (v) {
            GeomBase.theApp.exprValue(v);
            return Funbase.Value.nil;
        });
        Funbase.Primitive.store("_topdef", function (x, v) {
            var n = Funbase.Value.name(x);
            v['name'] = n.name;
            GeomBase.theApp.defnValue(n, v);
            return Funbase.Value.nil;
        });
        Funbase.Primitive.store("_toptext", function () {
            GeomBase.theApp.showPhrase();
            return Funbase.Value.nil;
        });
        Funbase.Primitive.store("_print", function (v) {
            console.log(Funbase.Value.print(v));
            return Funbase.Value.nil;
        });
        Funbase.Primitive.store("_debug", function () { return Funbase.NumValue.create(Funbase.Evaluator.debug); });
        Funbase.Primitive.store("_install", function (name) {
            var packageName = Funbase.Value.string(name);
            if (packageName === "") {
            }
            else if (packageName === "BasicPrims") {
                Funbase.BasicPrims.install();
            }
            else if (packageName === "Cell") {
                Funbase.Cell.install();
            }
            else if (packageName === "Hash") {
                Funbase.Hash.install();
            }
            else if (packageName === "StringPrims") {
                Funbase.StringPrims.install();
            }
            else {
                Funbase.Evaluator.error("#install");
            }
            return Funbase.Value.nil;
        });
        // Add image primitive for benchmarking purposes
        //Don't actually do convert HSV to RGB or do file IO for benchmarking purposes
        Funbase.Primitive.store("image", function (w, h, f, outName) {
            var h2 = Funbase.Value.asNumber(h);
            var w2 = Funbase.Value.asNumber(w);
            for (var y = Math.round(h2 - 1); y >= 0; y--) {
                for (var x = 0; x < w2; x++) {
                    Funbase.Value.apply(f, [Funbase.NumValue.create(x), Funbase.NumValue.create(y)]);
                }
            }
            return Funbase.Value.nil;
        });
    })(Funbase = GeomJS.Funbase || (GeomJS.Funbase = {}));
})(GeomJS || (GeomJS = {}));
//# sourceMappingURL=GeomBase.js.map