///<reference path="../references.ts"/>
var GeomJS;
(function (GeomJS) {
    var JsRuntime;
    (function (JsRuntime) {
        function Name(name) {
            this.name = name;
            //this.level = 2;
            this.toString = function () {
                return "#" + this.name;
            };
        }
        JsRuntime.Name = Name;
        var Name;
        (function (Name) {
            var base = "GeomJS.JsRuntime.Name.";
            var stage = 0;
            Name.nameTable = {};
            function getGlodef(n) {
                var prim = Name.nameTable[n.name];
                if (prim !== undefined) {
                    return prim;
                }
                return Name.nameTable[n.name];
            }
            function setGlodef(tag, val) {
                //n.level = stage;
                Name.nameTable[tag.name] = val;
            }
            Name.setGlodef = setGlodef;
            function _defined(x) {
                return (getGlodef(x) !== undefined);
            }
            Name._defined = _defined;
            function _glodef(x) {
                var v = getGlodef(x);
                if (v === undefined) {
                    GeomJS.Funbase.Evaluator.errNotDef(x);
                }
                return v;
            }
            Name._glodef = _glodef;
            function _stage(x) {
                stage = x;
                return [];
            }
            Name._stage = _stage;
            function _redefine(x) {
                /*if (x.level === 0 && stage > 0) {
                  Funbase.Evaluator.error("#redef", x);
                } else if (x.level === 2) {
                  Funbase.Evaluator.error("#multidef", x);
                }*/
                return [];
            }
            Name._redefine = _redefine;
            function _spelling(x) {
                return x.name;
            }
            Name._spelling = _spelling;
            Name._g = 0;
            function _gensym(x) {
                Name._g += 1;
                return new Name("$g" + Name._g);
            }
            Name._gensym = _gensym;
            // To prevent cyclic dependency between Interop & Name!
            function install() {
                JsRuntime.Interop.add("_gensym", base + "_gensym");
                JsRuntime.Interop.add("_spelling", base + "_spelling");
                JsRuntime.Interop.add("_redefine", base + "_redefine");
                JsRuntime.Interop.add("_defined", base + "_defined");
                JsRuntime.Interop.add("_glodef", base + "_glodef");
                JsRuntime.Interop.add("_stage", base + "_stage");
            }
            Name.install = install;
        })(Name = JsRuntime.Name || (JsRuntime.Name = {}));
    })(JsRuntime = GeomJS.JsRuntime || (GeomJS.JsRuntime = {}));
})(GeomJS || (GeomJS = {}));
//# sourceMappingURL=Name.js.map