///<reference path="../../references.ts"/>
var GeomJS;
(function (GeomJS) {
    var JsRuntime;
    (function (JsRuntime) {
        var StringPrims;
        (function (StringPrims) {
            var base = "GeomJS.JsRuntime.StringPrims.";
            function concat(x, y) {
                return x + y;
            }
            StringPrims.concat = concat;
            JsRuntime.Interop.add("^", base + "concat");
            function explode(x) {
                var result = [];
                for (var i = x.length - 1; i >= 0; i--) {
                    result = [x.charAt(i), result];
                }
                return result;
            }
            StringPrims.explode = explode;
            JsRuntime.Interop.add("explode", base + "explode");
            function implode(ys) {
                var result = "";
                for (var xs = ys; JsRuntime.Value.isCons(xs); xs = xs[1]) {
                    result += xs[0];
                }
                return result;
            }
            StringPrims.implode = implode;
            JsRuntime.Interop.add("implode", base + "implode");
            function chr(x) {
                return String.fromCharCode(x);
            }
            StringPrims.chr = chr;
            JsRuntime.Interop.add("chr", base + "chr");
            function ord(x) {
                return x.length === 0 ? 0 : x.charCodeAt(0);
            }
            StringPrims.ord = ord;
            JsRuntime.Interop.add("ord", base + "ord");
            // seq is used to represent an abstract data type for contructing large strings.
            // it is used inside the compiler for the javascript code generation.
            function _seq(x) {
                var acc = "";
                for (var xs = x; JsRuntime.Value.isCons(xs); xs = xs[1]) {
                    acc += xs[0];
                }
                return acc;
            }
            StringPrims._seq = _seq;
            JsRuntime.Interop.add("_seq", base + "_seq");
            function _str(x) {
                if (x.constructor === JsRuntime.Name) {
                    return x.name;
                }
                return x.toString();
            }
            StringPrims._str = _str;
            JsRuntime.Interop.add("_str", base + "_str");
            GeomJS.Funbase.Primitive.store("_const", function (x) {
                var ret;
                if (x.type === 0 /* String */) {
                    ret = '"' + GeomJS.Funbase.Value.string(x) + '"';
                }
                else if (x.type === 3 /* Number */) {
                    ret = GeomJS.Funbase.Value.asNumber(x);
                }
                else if (x.type === 1 /* Bool */) {
                    ret = x.value.toString();
                }
                else {
                    ret = 'new GeomJS.JsRuntime.Name("' + GeomJS.Funbase.Value.name(x).name + '")';
                }
                return GeomJS.Funbase.StringValue.create(ret);
            });
            function _const(x) {
                if (x.constructor === JsRuntime.Name) {
                    return 'new GeomJS.JsRuntime.Name("' + x.name + '")';
                }
                else if (x.constructor === Number) {
                    return x.toString();
                }
                else if (x.constructor === String) {
                    return '"' + x.toString() + '"';
                }
                else if (x.constructor === Boolean) {
                    return x;
                }
            }
            StringPrims._const = _const;
            JsRuntime.Interop.add("_const", base + "_const");
        })(StringPrims = JsRuntime.StringPrims || (JsRuntime.StringPrims = {}));
    })(JsRuntime = GeomJS.JsRuntime || (GeomJS.JsRuntime = {}));
})(GeomJS || (GeomJS = {}));
//# sourceMappingURL=StringPrims.js.map