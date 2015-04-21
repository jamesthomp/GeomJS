///<reference path="../references.ts"/>
var GeomJS;
(function (GeomJS) {
    var Funbase;
    (function (Funbase) {
        "use strict";
        var Name;
        (function (Name) {
            var nameTable = {};
            function bootstrap(boot) {
                for (var defn in boot) {
                    if (!boot.hasOwnProperty(defn)) {
                        continue;
                    }
                    var body = boot[defn];
                    if (body && body.type === 4 /* Funcode */) {
                        bootDef(defn, Funbase.FunCode.makeClosure(Funbase.Value.funcode(boot[defn]), [undefined]));
                    }
                    else {
                        bootDef(defn, boot[defn]);
                    }
                }
            }
            Name.bootstrap = bootstrap;
            function create(value) {
                return {
                    type: 9 /* Name */,
                    name: value,
                    subr: Funbase.Func.nullFunction(),
                    level: 2
                };
            }
            Name.create = create;
            /* Resets back to just level 0 definitions */
            function reset() {
                for (var tag in nameTable) {
                    if (nameTable.hasOwnProperty(tag) && nameTable[tag] && nameTable[tag].level != 0) {
                        nameTable[tag] = undefined;
                    }
                }
            }
            Name.reset = reset;
            function getGlodef(n) {
                var prim = Funbase.Primitive.find(n.name);
                if (prim) {
                    return prim;
                }
                return nameTable[n.name];
            }
            Name.getGlodef = getGlodef;
            /** Find or create the unique Name with a given spelling */
            function find(tag) {
                var prim = Funbase.Primitive.find(tag);
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
            Name.find = find;
            /** Initialization stage.  Global definitions made in stage 0 become
            frozen once stage is non-zero. */
            var stage = 0;
            function setGlodef(tag, val) {
                var n = Funbase.Value.name(val);
                n.level = stage;
                nameTable[tag] = n;
            }
            Name.setGlodef = setGlodef;
            function bootDef(tag, val) {
                var n = Funbase.Value.name(val);
                n.level = 0;
                nameTable[tag] = n;
            }
            Name.bootDef = bootDef;
            /** Whether functions created now should be ignored in tracebacks */
            function getFreezer() {
                return stage === 0;
            }
            Name.getFreezer = getFreezer;
            function isFrozen(n) {
                return (n.level === 0 && stage > 0);
            }
            Name.isFrozen = isFrozen;
            /** Get alphabetical list of globally defined names */
            function getGlobalNames() {
                var names = [];
                for (var tag in nameTable) {
                    if (!(tag[0] === "_")) {
                        names.push(tag);
                    }
                }
                return names.sort();
            }
            Name.getGlobalNames = getGlobalNames;
            Funbase.Primitive.store("_defined", function (x) {
                var n = Funbase.Value.name(x);
                var d = getGlodef(n);
                if (d)
                    return Funbase.BoolValue.True;
                else
                    return Funbase.BoolValue.False;
            });
            Funbase.Primitive.store("_glodef", function (x) {
                var n = Funbase.Value.name(x);
                var v = getGlodef(n);
                if (!v || v.type === 9 /* Name */) {
                    Funbase.Evaluator.errNotDef(n);
                }
                return v;
            });
            Funbase.Primitive.store("_stage", function (x) {
                stage = Funbase.Value.asNumber(x);
                return Funbase.Value.nil;
            });
            Funbase.Primitive.store("_redefine", function (x) {
                var n = Funbase.Value.name(x);
                if (n.level === 0 && stage > 0) {
                    Funbase.Evaluator.error("#redef", x);
                }
                else if (n.level === 2 && getGlodef(n).type !== 9 /* Name */) {
                    Funbase.Evaluator.error("#multidef", x);
                }
                return Funbase.Value.nil;
            });
            Funbase.Primitive.store("_spelling", function (x) {
                var n = Funbase.Value.name(x);
                return Funbase.StringValue.create(n.name);
            });
            Name._g = 0;
            Funbase.Primitive.store("_gensym", function (x) {
                Name._g += 1;
                return Name.find("$g" + Name._g);
            });
        })(Name = Funbase.Name || (Funbase.Name = {}));
    })(Funbase = GeomJS.Funbase || (GeomJS.Funbase = {}));
})(GeomJS || (GeomJS = {}));
//# sourceMappingURL=Name.js.map