///<reference path="../references.ts"/>
var GeomJS;
(function (GeomJS) {
    var Funbase;
    (function (Funbase) {
        var Primitive;
        (function (Primitive) {
            var primitives = {};
            /** Stores a primitive function (used to replace reflection) */
            function store(name, func, pattMatch) {
                var p = {
                    type: 4 /* Funcode */,
                    name: name,
                    subr: {
                        type: 10 /* Func */,
                        arity: func.length - 1,
                        apply: function (args, nargs, base) {
                            var theArgs = [];
                            GeomJS.Common.arraycopy(args, base, theArgs, 0, func.length);
                            return func.apply(null, theArgs);
                        },
                        pattMatch: function (obj, nargs) { return null; }
                    },
                    level: 0
                };
                if (pattMatch) {
                    p.subr.pattMatch = pattMatch;
                }
                primitives[name] = p;
            }
            Primitive.store = store;
            function find(name) {
                return primitives[name];
            }
            Primitive.find = find;
        })(Primitive = Funbase.Primitive || (Funbase.Primitive = {}));
    })(Funbase = GeomJS.Funbase || (GeomJS.Funbase = {}));
})(GeomJS || (GeomJS = {}));
///<reference path="../references.ts"/>
var GeomJS;
(function (GeomJS) {
    var Funbase;
    (function (Funbase) {
        "use strict";
        (function (Type) {
            Type[Type["String"] = 0] = "String";
            Type[Type["Bool"] = 1] = "Bool";
            Type[Type["List"] = 2] = "List";
            Type[Type["Number"] = 3] = "Number";
            Type[Type["Funcode"] = 4] = "Funcode";
            Type[Type["Nil"] = 5] = "Nil";
            Type[Type["Funvalue"] = 6] = "Funvalue";
            Type[Type["Cell"] = 7] = "Cell";
            Type[Type["Hash"] = 8] = "Hash";
            Type[Type["Name"] = 9] = "Name";
            Type[Type["Func"] = 10] = "Func";
        })(Funbase.Type || (Funbase.Type = {}));
        var Type = Funbase.Type;
        var Func;
        (function (Func) {
            "use strict";
            function nullFunction() {
                return {
                    type: 10 /* Func */,
                    arity: -1,
                    apply: function (args, nargs, base) {
                        Funbase.Evaluator.errApply();
                        return null;
                    },
                    pattMatch: function (obj, nargs) {
                        Funbase.Evaluator.errMatch();
                        return null;
                    }
                };
            }
            Func.nullFunction = nullFunction;
            Funbase.Primitive.store("_apply", function (x, y) {
                var args = Funbase.Value.array(y);
                return Funbase.Value.apply(x, args);
            });
            Funbase.Primitive.store("_closure", function (x) {
                var body = Funbase.Value.funcode(x);
                return Funbase.FunCode.makeClosure(body, [undefined]);
            });
        })(Func = Funbase.Func || (Funbase.Func = {}));
    })(Funbase = GeomJS.Funbase || (GeomJS.Funbase = {}));
})(GeomJS || (GeomJS = {}));
///<reference path="../references.ts"/>
var GeomJS;
(function (GeomJS) {
    var Funbase;
    (function (Funbase) {
        var BoolValue;
        (function (BoolValue) {
            BoolValue.True = {
                "type": 1 /* Bool */,
                "value": true,
                "subr": Funbase.Func.nullFunction(),
                "name": "true"
            };
            BoolValue.False = {
                "type": 1 /* Bool */,
                "value": false,
                "subr": Funbase.Func.nullFunction(),
                "name": "false"
            };
            function create(b) {
                return b ? BoolValue.True : BoolValue.False;
            }
            BoolValue.create = create;
        })(BoolValue = Funbase.BoolValue || (Funbase.BoolValue = {}));
        var StringValue;
        (function (StringValue) {
            function create(str) {
                return {
                    "type": 0 /* String */,
                    "value": str,
                    "subr": Funbase.Func.nullFunction()
                };
            }
            StringValue.create = create;
        })(StringValue = Funbase.StringValue || (Funbase.StringValue = {}));
        var NumValue;
        (function (NumValue) {
            function create(num) {
                return {
                    "type": 3 /* Number */,
                    "value": num,
                    "subr": Funbase.Func.nullFunction()
                };
            }
            NumValue.create = create;
        })(NumValue = Funbase.NumValue || (Funbase.NumValue = {}));
        var Value;
        (function (Value) {
            Value.nil = {
                type: 5 /* Nil */,
                subr: Funbase.Func.nullFunction()
            };
            function print(val) {
                var ret = "";
                if (val.type === 2 /* List */) {
                    var arr = Value.array(val);
                    ret += "[";
                    var i = 0;
                    for (; i < arr.length - 1; i++) {
                        ret += print(arr[i]);
                        ret += ", ";
                    }
                    ret += print(arr[i]);
                    ret += "]";
                }
                else if (val.type === 0 /* String */) {
                    ret += val.value;
                }
                else if (val.type === 8 /* Hash */) {
                    ret += "<hash>";
                }
                else if (val.type === 7 /* Cell */) {
                    ret += "ref " + print(val.value);
                }
                else if (val.value !== undefined) {
                    ret += JSON.stringify(val.value);
                }
                else if (val.type === 6 /* Funvalue */) {
                    ret += "<function(" + val.subr.arity + ")>";
                }
                else if (val.type === 5 /* Nil */) {
                    ret += "[]";
                }
                else {
                    ret += JSON.stringify(val.name);
                }
                return ret;
            }
            Value.print = print;
            function apply(val, args) {
                return val.subr.apply(args, args.length, 0);
            }
            Value.apply = apply;
            /** Make a list from a sequence of values */
            function makeList() {
                var elems = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    elems[_i - 0] = arguments[_i];
                }
                var val = Value.nil;
                for (var i = elems.length - 1; i >= 0; i--) {
                    val = cons(elems[i], val);
                }
                return val;
            }
            Value.makeList = makeList;
            function isCons(val) {
                return val.type === 2 /* List */;
            }
            Value.isCons = isCons;
            function tail(val) {
                if (val.type !== 2 /* List */) {
                    throw new Funbase.ClassCastException();
                }
                return val.tail;
            }
            Value.tail = tail;
            function cons(head, tail) {
                return {
                    type: 2 /* List */,
                    head: head,
                    tail: tail,
                    subr: Funbase.Func.nullFunction()
                };
            }
            Value.cons = cons;
            function array(val) {
                if (val.type !== 2 /* List */ && val.type !== 5 /* Nil */) {
                    throw new Funbase.ClassCastException();
                }
                var elems = [];
                while (isCons(val)) {
                    elems.push(Value.head(val));
                    val = Value.tail(val);
                }
                return elems;
            }
            Value.array = array;
            function head(val) {
                if (val.type !== 2 /* List */) {
                    throw new Funbase.ClassCastException();
                }
                return val.head;
            }
            Value.head = head;
            function string(val) {
                if (val.type !== 0 /* String */) {
                    throw new Funbase.ClassCastException();
                }
                return val.value;
            }
            Value.string = string;
            function asNumber(val) {
                if (val.type !== 3 /* Number */) {
                    throw new Funbase.WrongKindException();
                }
                return val.value;
            }
            Value.asNumber = asNumber;
            function funcode(val) {
                if (val.type !== 4 /* Funcode */) {
                }
                return val;
            }
            Value.funcode = funcode;
            /*export function asBoolean(val: Value): boolean {
              if (val.type !== Type.Bool) {
                throw new WrongKindException();
              }
              return (<BoolValue>val).value;
            }*/
            function name(val) {
                if (val.name === undefined) {
                    throw new Funbase.ClassCastException();
                }
                return val;
            }
            Value.name = name;
            function matchPlus(val1, val2) {
                if (val1.type !== 3 /* Number */ || val2.type !== 3 /* Number */) {
                    throw new Funbase.ClassCastException();
                }
                var inc = val2.value;
                var val = val1.value;
                var x = val - inc;
                if (inc > 0 && x >= 0 && x % 1 === 0) {
                    return NumValue.create(x);
                }
                return null;
            }
            Value.matchPlus = matchPlus;
        })(Value = Funbase.Value || (Funbase.Value = {}));
    })(Funbase = GeomJS.Funbase || (GeomJS.Funbase = {}));
})(GeomJS || (GeomJS = {}));
///<reference path="../references.ts"/>
var GeomJS;
(function (GeomJS) {
    var Funbase;
    (function (Funbase) {
        var Bootstrap;
        (function (Bootstrap) {
            var truth = Funbase.BoolValue.True;
            var falsity = Funbase.BoolValue.False;
            Bootstrap.nameTable = {
                "++": { "type": 4 /* Funcode */, "name": "++", "arity": 2, "ops": [2, 9, 16, 2, 13, 2, 9, 17, 4, 18, 4, 0, 20, 1, 22, 3, 20, 1, 22, 2, 22, 23, 22, 23, 13, 10], "rands": [0, 5, 134217728, 1, 134217728, 0, 25, 134217728, 0, 134217728, 1, 0, 2, 0, 0, 0, 2, 1, 0, 1, 1, 2, 1, 2, 134217728, 134217728], "consts": [{ "type": 9 /* Name */, "name": ":" }] },
                "__top": { "type": 4 /* Funcode */, "name": "__top", "arity": 0, "ops": [6, 21, 24, 4, 6, 21, 24, 4, 6, 21, 24, 4, 6, 21, 24, 4, 6, 21, 24, 4, 6, 21, 24, 4, 6, 21, 24, 4, 6, 21, 24, 4, 0, 20, 6, 22, 23, 11, 0, 12, 0, 20, 23, 4, 0, 20, 6, 22, 23, 4, 0, 20, 6, 22, 23, 4, 6, 21, 1, 22, 1, 22, 1, 22, 1, 22, 1, 22, 1, 22, 1, 22, 24, 4, 6, 21, 1, 22, 24, 4, 6, 21, 1, 22, 24, 4, 6, 21, 1, 22, 24, 4, 6, 21, 1, 22, 1, 22, 1, 22, 24, 4, 6, 21, 1, 22, 1, 22, 24, 4, 6, 21, 1, 22, 24, 4, 6, 21, 1, 22, 1, 22, 24, 4, 6, 21, 1, 22, 24, 4, 6, 21, 1, 22, 24, 4, 6, 21, 1, 22, 24, 4, 6, 21, 1, 22, 24, 4, 6, 21, 1, 22, 1, 22, 24, 4, 0, 20, 6, 22, 23, 4, 6, 21, 1, 22, 24, 4, 6, 21, 1, 22, 24, 4, 0, 20, 6, 22, 23, 4, 6, 21, 1, 22, 24, 4, 0, 20, 6, 22, 23, 4, 6, 21, 1, 22, 24, 4, 0, 20, 6, 22, 23, 4, 6, 21, 1, 22, 24, 4, 6, 21, 24, 4, 6, 21, 1, 22, 1, 22, 24, 4, 6, 21, 1, 22, 1, 22, 1, 22, 1, 22, 1, 22, 1, 22, 1, 22, 1, 22, 1, 22, 24, 4, 6, 21, 1, 22, 1, 22, 24, 4, 6, 21, 1, 22, 1, 22, 1, 22, 24, 4, 6, 21, 1, 22, 1, 22, 24, 4, 6, 21, 1, 22, 1, 22, 24, 4, 6, 21, 24, 4, 6, 21, 1, 22, 1, 22, 1, 22, 24, 4, 6, 21, 1, 22, 1, 22, 1, 22, 1, 22, 24, 4, 6, 21, 1, 22, 1, 22, 1, 22, 1, 22, 1, 22, 1, 22, 1, 22, 24, 4, 6, 21, 1, 22, 1, 22, 1, 22, 1, 22, 1, 22, 1, 22, 1, 22, 1, 22, 24, 4, 6, 21, 1, 22, 1, 22, 1, 22, 1, 22, 1, 22, 1, 22, 1, 22, 1, 22, 1, 22, 24, 4, 6, 21, 1, 22, 1, 22, 1, 22, 1, 22, 1, 22, 24, 4, 6, 21, 24, 4, 6, 21, 1, 22, 1, 22, 1, 22, 1, 22, 1, 22, 1, 22, 1, 22, 1, 22, 1, 22, 1, 22, 1, 22, 24, 4, 6, 21, 1, 22, 1, 22, 1, 22, 24, 4, 6, 21, 1, 22, 1, 22, 1, 22, 1, 22, 1, 22, 1, 22, 1, 22, 24, 4, 6, 21, 1, 22, 1, 22, 1, 22, 1, 22, 24, 4, 6, 21, 1, 22, 1, 22, 1, 22, 24, 4, 6, 21, 1, 22, 1, 22, 1, 22, 1, 22, 1, 22, 1, 22, 1, 22, 1, 22, 24, 4, 6, 21, 1, 22, 1, 22, 1, 22, 1, 22, 1, 22, 1, 22, 1, 22, 1, 22, 24, 4, 6, 21, 1, 22, 1, 22, 1, 22, 1, 22, 1, 22, 24, 4, 0, 20, 1, 22, 1, 22, 23, 5, 0, 20, 1, 22, 1, 22, 23, 5, 0, 20, 1, 22, 1, 22, 23, 5, 0, 20, 1, 22, 1, 22, 23, 5, 6, 21, 1, 22, 1, 22, 24, 4, 6, 21, 24, 4, 6, 21, 24, 4, 6, 21, 24, 4, 6, 21, 24, 4, 6, 21, 24, 4, 6, 21, 24, 4, 6, 21, 24, 4, 6, 21, 24, 4, 6, 21, 24, 4, 6, 21, 24, 4, 6, 21, 24, 4, 6, 21, 24, 4, 6, 21, 1, 22, 1, 22, 1, 22, 24, 4, 6, 21, 1, 22, 1, 22, 24, 4, 6, 21, 24, 4, 6, 21, 1, 22, 1, 22, 24, 4, 6, 21, 1, 22, 1, 22, 24, 4, 6, 21, 24, 4, 0, 20, 6, 22, 23, 4, 6, 21, 1, 22, 24, 4, 6, 21, 1, 22, 1, 22, 1, 22, 1, 22, 24, 4, 6, 21, 24, 4, 6, 21, 1, 22, 1, 22, 24, 4, 6, 21, 1, 22, 1, 22, 1, 22, 1, 22, 1, 22, 1, 22, 1, 22, 24, 4, 6, 21, 1, 22, 1, 22, 1, 22, 1, 22, 24, 4, 6, 21, 1, 22, 1, 22, 1, 22, 24, 4, 0, 20, 6, 22, 23, 4, 6, 21, 1, 22, 1, 22, 1, 22, 1, 22, 1, 22, 1, 22, 24, 4, 6, 21, 24, 4, 6, 21, 1, 22, 1, 22, 1, 22, 1, 22, 1, 22, 24, 4, 6, 21, 1, 22, 1, 22, 1, 22, 1, 22, 1, 22, 1, 22, 1, 22, 1, 22, 24, 4, 6, 21, 24, 4, 6, 21, 1, 22, 1, 22, 1, 22, 1, 22, 1, 22, 1, 22, 1, 22, 1, 22, 1, 22, 1, 22, 1, 22, 1, 22, 24, 4, 0, 20, 1, 22, 1, 22, 23, 5, 6, 21, 1, 22, 1, 22, 1, 22, 1, 22, 1, 22, 24, 4, 6, 21, 1, 22, 1, 22, 1, 22, 1, 22, 24, 4, 6, 21, 1, 22, 1, 22, 1, 22, 24, 4, 6, 21, 1, 22, 1, 22, 1, 22, 1, 22, 1, 22, 24, 13], "rands": [0, 1, 1, 0, 1, 1, 1, 1, 2, 1, 1, 2, 3, 1, 1, 3, 4, 1, 1, 4, 5, 1, 1, 5, 6, 1, 1, 6, 7, 1, 1, 7, 8, 1, 9, 0, 1, 40, 9, 43, 10, 0, 0, 8, 11, 1, 12, 0, 1, 9, 11, 1, 12, 0, 1, 10, 13, 8, 0, 1, 6, 2, 9, 3, 3, 4, 8, 5, 4, 6, 10, 7, 8, 11, 14, 2, 8, 1, 2, 12, 15, 2, 1, 1, 2, 13, 16, 2, 9, 1, 2, 14, 17, 4, 14, 1, 11, 2, 7, 3, 4, 15, 18, 3, 14, 1, 11, 2, 3, 16, 19, 2, 9, 1, 2, 17, 20, 3, 10, 1, 15, 2, 3, 18, 21, 2, 15, 1, 2, 19, 22, 2, 15, 1, 2, 20, 23, 2, 16, 1, 2, 21, 24, 2, 21, 1, 2, 22, 25, 3, 14, 1, 22, 2, 3, 23, 11, 1, 12, 0, 1, 24, 26, 2, 24, 1, 2, 25, 27, 2, 25, 1, 2, 26, 11, 1, 12, 0, 1, 27, 28, 2, 27, 1, 2, 28, 11, 1, 12, 0, 1, 29, 29, 2, 29, 1, 2, 30, 11, 1, 12, 0, 1, 31, 30, 2, 31, 1, 2, 32, 31, 1, 1, 33, 32, 3, 23, 1, 30, 2, 3, 34, 33, 10, 6, 1, 30, 2, 19, 3, 15, 4, 34, 5, 20, 6, 14, 7, 18, 8, 17, 9, 10, 35, 34, 3, 35, 1, 16, 2, 3, 36, 35, 4, 18, 1, 16, 2, 36, 3, 4, 37, 36, 3, 20, 1, 34, 2, 3, 38, 37, 3, 23, 1, 26, 2, 3, 39, 38, 1, 1, 40, 39, 4, 30, 1, 15, 2, 26, 3, 4, 41, 40, 5, 17, 1, 15, 2, 26, 3, 41, 4, 5, 42, 41, 8, 14, 1, 26, 2, 42, 3, 40, 4, 15, 5, 21, 6, 17, 7, 8, 43, 42, 9, 9, 1, 13, 2, 25, 3, 18, 4, 12, 5, 14, 6, 28, 7, 4, 8, 9, 44, 43, 10, 6, 1, 43, 2, 44, 3, 19, 4, 39, 5, 20, 6, 14, 7, 18, 8, 17, 9, 10, 45, 44, 6, 45, 1, 15, 2, 14, 3, 18, 4, 17, 5, 6, 46, 45, 1, 1, 47, 46, 12, 47, 1, 4, 2, 28, 3, 14, 4, 15, 5, 3, 6, 12, 7, 10, 8, 13, 9, 9, 10, 46, 11, 12, 48, 47, 4, 16, 1, 15, 2, 28, 3, 4, 49, 48, 8, 16, 1, 49, 2, 38, 3, 26, 4, 32, 5, 15, 6, 17, 7, 8, 50, 49, 5, 13, 1, 9, 2, 14, 3, 18, 4, 5, 51, 50, 4, 15, 1, 26, 2, 16, 3, 4, 52, 51, 9, 10, 1, 13, 2, 9, 3, 14, 4, 6, 5, 15, 6, 38, 7, 52, 8, 9, 53, 52, 9, 51, 1, 14, 2, 15, 3, 26, 4, 38, 5, 52, 6, 21, 7, 53, 8, 9, 54, 53, 6, 14, 1, 16, 2, 32, 3, 26, 4, 6, 5, 6, 55, 54, 2, 24, 0, 50, 1, 2, 134217728, 54, 2, 27, 0, 48, 1, 2, 134217728, 54, 2, 29, 0, 37, 1, 2, 134217728, 54, 2, 31, 0, 54, 1, 2, 134217728, 55, 3, 11, 1, 55, 2, 3, 56, 56, 1, 1, 57, 57, 1, 1, 58, 58, 1, 1, 59, 59, 1, 1, 60, 60, 1, 1, 61, 61, 1, 1, 62, 62, 1, 1, 63, 63, 1, 1, 64, 64, 1, 1, 65, 65, 1, 1, 66, 66, 1, 1, 67, 67, 1, 1, 68, 68, 4, 65, 1, 67, 2, 66, 3, 4, 69, 69, 3, 68, 1, 66, 2, 3, 70, 70, 1, 1, 71, 71, 3, 62, 1, 59, 2, 3, 72, 72, 3, 62, 1, 59, 2, 3, 73, 73, 1, 1, 74, 11, 1, 12, 0, 1, 75, 74, 2, 75, 1, 2, 76, 75, 5, 67, 1, 71, 2, 62, 3, 59, 4, 5, 77, 76, 1, 1, 78, 77, 3, 3, 1, 4, 2, 3, 79, 78, 8, 76, 1, 79, 2, 72, 3, 77, 4, 69, 5, 2, 6, 33, 7, 8, 80, 79, 5, 72, 1, 67, 2, 79, 3, 80, 4, 5, 81, 80, 4, 81, 1, 3, 2, 4, 3, 4, 82, 11, 1, 12, 0, 1, 83, 81, 7, 83, 1, 82, 2, 74, 3, 3, 4, 4, 5, 76, 6, 7, 84, 82, 1, 1, 85, 83, 6, 84, 1, 4, 2, 3, 3, 78, 4, 85, 5, 6, 86, 84, 9, 61, 1, 57, 2, 86, 3, 64, 4, 0, 5, 58, 6, 2, 7, 77, 8, 9, 87, 85, 1, 1, 88, 86, 13, 88, 1, 77, 2, 73, 3, 63, 4, 2, 5, 76, 6, 67, 7, 68, 8, 69, 9, 70, 10, 87, 11, 33, 12, 13, 89, 54, 2, 83, 0, 89, 1, 2, 134217728, 87, 6, 57, 1, 86, 2, 61, 3, 0, 4, 58, 5, 6, 90, 88, 5, 59, 1, 67, 2, 68, 3, 90, 4, 5, 91, 89, 4, 91, 1, 60, 2, 90, 3, 4, 92, 90, 6, 56, 1, 0, 2, 75, 3, 91, 4, 92, 5, 6, 134217728], "consts": [{
                    "type": 4 /* Funcode */,
                    "name": "debug",
                    "arity": 2,
                    "ops": [0, 20, 0, 20, 23, 22, 2, 22, 23, 11, 0, 20, 2, 22, 23, 13, 7, 13],
                    "rands": [0, 2, 1, 0, 0, 0, 0, 1, 2, 16, 2, 1, 1, 0, 1, 134217728, 134217728, 134217728],
                    "consts": [{ "type": 9 /* Name */, "name": ">" }, { "type": 9 /* Name */, "name": "_debug" }, { "type": 9 /* Name */, "name": "_print" }]
                }, {
                    "type": 4 /* Funcode */,
                    "name": "member",
                    "arity": 2,
                    "ops": [2, 9, 16, 0, 13, 2, 9, 17, 4, 18, 4, 0, 20, 2, 22, 1, 22, 23, 11, 6, 13, 2, 1, 19, 10],
                    "rands": [1, 5, 134217728, 0, 134217728, 1, 24, 134217728, 0, 134217728, 1, 1, 2, 0, 0, 0, 1, 2, 21, 2, 134217728, 0, 1, 2, 134217728],
                    "consts": [{ "type": 9 /* Name */, "name": "false" }, { "type": 9 /* Name */, "name": "=" }, truth]
                }, {
                    "type": 4 /* Funcode */,
                    "name": "number",
                    "arity": 2,
                    "ops": [2, 9, 16, 7, 13, 2, 9, 17, 4, 18, 4, 0, 20, 2, 1, 7, 8, 8, 22, 3, 20, 0, 20, 2, 22, 6, 22, 23, 22, 1, 22, 23, 22, 23, 13, 10],
                    "rands": [1, 5, 134217728, 134217728, 134217728, 1, 35, 134217728, 0, 134217728, 1, 0, 2, 0, 0, 134217728, 134217728, 134217728, 0, 0, 2, 1, 2, 0, 0, 2, 1, 2, 0, 1, 1, 2, 1, 2, 134217728, 134217728],
                    "consts": [{ "type": 9 /* Name */, "name": ":" }, { "type": 9 /* Name */, "name": "+" }, { "type": 3 /* Number */, "value": 1 }]
                }, { "type": 4 /* Funcode */, "name": "fst", "arity": 1, "ops": [2, 9, 17, 4, 5, 1, 13, 10], "rands": [0, 7, 134217728, 0, 134217728, 0, 134217728, 134217728] }, { "type": 4 /* Funcode */, "name": "snd", "arity": 1, "ops": [2, 9, 17, 5, 18, 9, 17, 4, 5, 1, 13, 10], "rands": [0, 11, 134217728, 134217728, 134217728, 11, 134217728, 0, 134217728, 0, 134217728, 134217728] }, { "type": 4 /* Funcode */, "name": "max", "arity": 2, "ops": [0, 20, 2, 22, 2, 22, 23, 11, 2, 13, 2, 13], "rands": [0, 2, 0, 0, 1, 1, 2, 10, 0, 134217728, 1, 134217728], "consts": [{ "type": 9 /* Name */, "name": ">" }] }, { "type": 4 /* Funcode */, "name": "synerror", "arity": 1, "ops": [0, 20, 2, 22, 7, 22, 23, 13], "rands": [0, 2, 0, 0, 134217728, 1, 2, 134217728], "consts": [{ "type": 9 /* Name */, "name": "_synerror" }] }, {
                    "type": 4 /* Funcode */,
                    "name": "describe",
                    "arity": 1,
                    "ops": [2, 9, 6, 15, 6, 13, 2, 9, 6, 15, 6, 13, 2, 9, 6, 15, 6, 13, 2, 9, 6, 15, 6, 13, 2, 9, 6, 15, 6, 13, 2, 9, 6, 15, 6, 13, 2, 9, 6, 15, 6, 13, 2, 9, 6, 15, 6, 13, 2, 9, 6, 15, 6, 13, 2, 9, 6, 15, 6, 13, 2, 9, 6, 15, 6, 13, 2, 9, 6, 15, 6, 13, 2, 9, 6, 15, 6, 13, 2, 9, 6, 15, 6, 13, 2, 9, 6, 15, 6, 13, 2, 9, 6, 15, 6, 13, 2, 9, 6, 15, 6, 13, 2, 9, 6, 15, 6, 13, 2, 9, 6, 15, 6, 13, 0, 20, 0, 20, 6, 22, 0, 20, 2, 22, 23, 22, 23, 22, 6, 22, 23, 13],
                    "rands": [0, 6, 0, 134217728, 1, 134217728, 0, 12, 2, 134217728, 3, 134217728, 0, 18, 4, 134217728, 5, 134217728, 0, 24, 6, 134217728, 7, 134217728, 0, 30, 8, 134217728, 9, 134217728, 0, 36, 10, 134217728, 11, 134217728, 0, 42, 12, 134217728, 13, 134217728, 0, 48, 14, 134217728, 15, 134217728, 0, 54, 16, 134217728, 17, 134217728, 0, 60, 18, 134217728, 19, 134217728, 0, 66, 20, 134217728, 21, 134217728, 0, 72, 22, 134217728, 23, 134217728, 0, 78, 24, 134217728, 25, 134217728, 0, 84, 26, 134217728, 27, 134217728, 0, 90, 28, 134217728, 29, 134217728, 0, 96, 30, 134217728, 31, 134217728, 0, 102, 32, 134217728, 33, 134217728, 0, 108, 34, 134217728, 35, 134217728, 0, 114, 36, 134217728, 37, 134217728, 38, 2, 38, 2, 39, 0, 40, 1, 0, 0, 1, 1, 2, 0, 39, 1, 2, 134217728],
                    "consts": [{ "type": 9 /* Name */, "name": "ident" }, { "type": 0 /* String */, "value": "an identifier" }, { "type": 9 /* Name */, "name": "number" }, { "type": 0 /* String */, "value": "a number" }, { "type": 9 /* Name */, "name": "atom" }, { "type": 0 /* String */, "value": "an atom" }, { "type": 9 /* Name */, "name": "lpar" }, { "type": 0 /* String */, "value": "'('" }, { "type": 9 /* Name */, "name": "rpar" }, { "type": 0 /* String */, "value": "')'" }, { "type": 9 /* Name */, "name": "comma" }, { "type": 0 /* String */, "value": "','" }, { "type": 9 /* Name */, "name": "semi" }, { "type": 0 /* String */, "value": "';'" }, { "type": 9 /* Name */, "name": "bra" }, { "type": 0 /* String */, "value": "'['" }, { "type": 9 /* Name */, "name": "ket" }, { "type": 0 /* String */, "value": "']'" }, { "type": 9 /* Name */, "name": "vbar" }, { "type": 0 /* String */, "value": "'|'" }, { "type": 9 /* Name */, "name": ">>" }, { "type": 0 /* String */, "value": "'>>'" }, { "type": 9 /* Name */, "name": ".." }, { "type": 0 /* String */, "value": "'..'" }, { "type": 9 /* Name */, "name": "string" }, { "type": 0 /* String */, "value": "a string constant" }, { "type": 9 /* Name */, "name": "binop" }, { "type": 0 /* String */, "value": "a binary operator" }, { "type": 9 /* Name */, "name": "monop" }, { "type": 0 /* String */, "value": "a unary operator" }, { "type": 9 /* Name */, "name": "lbrace" }, { "type": 0 /* String */, "value": "'{'" }, { "type": 9 /* Name */, "name": "rbrace" }, { "type": 0 /* String */, "value": "'}'" }, { "type": 9 /* Name */, "name": "eol" }, { "type": 0 /* String */, "value": "end of line" }, { "type": 9 /* Name */, "name": "eof" }, { "type": 0 /* String */, "value": "end of input" }, { "type": 9 /* Name */, "name": "^" }, { "type": 0 /* String */, "value": "'" }, { "type": 9 /* Name */, "name": "_spelling" }]
                }, { "type": 9 /* Name */, "name": "_defined" }, { "type": 9 /* Name */, "name": "_syntax" }, { "type": 9 /* Name */, "name": "_hash" }, { "type": 9 /* Name */, "name": "_new" }, { "type": 3 /* Number */, "value": 0 }, {
                    "type": 4 /* Funcode */,
                    "name": "scan",
                    "arity": 0,
                    "ops": [0, 20, 23, 4, 3, 20, 6, 22, 1, 22, 23, 5, 6, 21, 3, 22, 1, 22, 3, 22, 3, 22, 3, 22, 3, 22, 3, 22, 24, 4, 1, 20, 3, 20, 1, 22, 23, 22, 23, 5, 0, 20, 3, 22, 3, 20, 1, 22, 23, 22, 23, 13],
                    "rands": [0, 0, 0, 0, 1, 2, 1, 0, 0, 1, 2, 134217728, 2, 8, 6, 1, 0, 2, 5, 3, 4, 4, 3, 5, 1, 6, 2, 7, 8, 1, 1, 1, 4, 1, 0, 0, 1, 0, 1, 134217728, 3, 2, 7, 0, 6, 1, 0, 0, 1, 1, 2, 134217728],
                    "consts": [{ "type": 9 /* Name */, "name": "_scan" }, { "type": 3 /* Number */, "value": 2 }, {
                        "type": 4 /* Funcode */,
                        "name": "case",
                        "arity": 1,
                        "ops": [2, 9, 6, 15, 0, 20, 3, 22, 3, 20, 3, 22, 23, 22, 23, 4, 0, 20, 3, 22, 0, 20, 1, 22, 7, 22, 23, 11, 3, 20, 1, 22, 23, 12, 6, 22, 23, 5, 3, 20, 6, 22, 0, 20, 3, 22, 23, 22, 23, 13, 2, 9, 6, 15, 0, 20, 3, 22, 3, 20, 3, 22, 23, 22, 23, 4, 0, 20, 1, 22, 7, 22, 23, 11, 0, 20, 3, 22, 3, 20, 1, 22, 23, 22, 23, 13, 3, 20, 6, 22, 23, 13, 0, 20, 3, 22, 2, 22, 23, 13],
                        "rands": [0, 50, 0, 134217728, 1, 2, 3, 0, 1, 1, 2, 0, 1, 1, 2, 0, 2, 2, 5, 0, 3, 2, 0, 0, 134217728, 1, 2, 34, 4, 1, 0, 0, 1, 35, 0, 1, 2, 134217728, 6, 2, 4, 0, 5, 1, 5, 0, 1, 1, 2, 134217728, 0, 92, 6, 134217728, 1, 2, 3, 0, 1, 1, 2, 0, 1, 1, 2, 0, 3, 2, 0, 0, 134217728, 1, 2, 86, 2, 2, 5, 0, 4, 1, 0, 0, 1, 1, 2, 134217728, 7, 1, 7, 0, 1, 134217728, 2, 2, 5, 0, 0, 1, 2, 134217728],
                        "consts": [{ "type": 9 /* Name */, "name": "ident" }, { "type": 9 /* Name */, "name": "_lookup" }, { "type": 9 /* Name */, "name": "_set" }, { "type": 9 /* Name */, "name": "<>" }, { "type": 3 /* Number */, "value": 2 }, { "type": 9 /* Name */, "name": "_get" }, { "type": 9 /* Name */, "name": "op" }, { "type": 0 /* String */, "value": "#badtok" }]
                    }, { "type": 9 /* Name */, "name": "_set" }]
                }, {
                    "type": 4 /* Funcode */,
                    "name": "_priority",
                    "arity": 1,
                    "ops": [0, 20, 3, 22, 2, 22, 23, 4, 0, 20, 1, 22, 7, 22, 23, 11, 0, 20, 1, 22, 23, 13, 6, 6, 7, 8, 8, 13],
                    "rands": [0, 2, 1, 0, 0, 1, 2, 0, 1, 2, 0, 0, 134217728, 1, 2, 22, 2, 1, 0, 0, 1, 134217728, 3, 3, 134217728, 134217728, 134217728, 134217728],
                    "consts": [{ "type": 9 /* Name */, "name": "_lookup" }, { "type": 9 /* Name */, "name": "<>" }, { "type": 9 /* Name */, "name": "tail" }, { "type": 3 /* Number */, "value": 0 }]
                }, {
                    "type": 4 /* Funcode */,
                    "name": "isbinop",
                    "arity": 1,
                    "ops": [3, 20, 2, 22, 6, 6, 6, 6, 6, 7, 8, 8, 8, 8, 8, 22, 23, 13],
                    "rands": [1, 2, 0, 0, 0, 1, 2, 3, 4, 134217728, 134217728, 134217728, 134217728, 134217728, 134217728, 1, 2, 134217728],
                    "consts": [{ "type": 9 /* Name */, "name": "binop" }, { "type": 9 /* Name */, "name": "=" }, { "type": 9 /* Name */, "name": "-" }, { "type": 9 /* Name */, "name": "+" }, { "type": 9 /* Name */, "name": ":" }]
                }, {
                    "type": 4 /* Funcode */,
                    "name": "see",
                    "arity": 1,
                    "ops": [0, 20, 0, 20, 3, 22, 23, 22, 2, 22, 23, 13],
                    "rands": [0, 2, 1, 1, 1, 0, 1, 0, 0, 1, 2, 134217728],
                    "consts": [{ "type": 9 /* Name */, "name": "=" }, { "type": 9 /* Name */, "name": "_get" }]
                }, {
                    "type": 4 /* Funcode */,
                    "name": "eat",
                    "arity": 1,
                    "ops": [3, 20, 2, 22, 23, 11, 3, 20, 23, 13, 0, 20, 6, 22, 3, 20, 2, 22, 23, 7, 8, 22, 23, 13],
                    "rands": [1, 1, 0, 0, 1, 10, 2, 0, 0, 134217728, 0, 2, 1, 0, 3, 1, 0, 0, 1, 134217728, 134217728, 1, 2, 134217728],
                    "consts": [{ "type": 9 /* Name */, "name": "_synerror" }, { "type": 0 /* String */, "value": "#eat" }]
                }, {
                    "type": 4 /* Funcode */,
                    "name": "can_eat",
                    "arity": 1,
                    "ops": [3, 20, 2, 22, 23, 11, 3, 20, 23, 5, 0, 13, 0, 13],
                    "rands": [1, 1, 0, 0, 1, 12, 2, 0, 0, 134217728, 0, 134217728, 1, 134217728],
                    "consts": [{ "type": 9 /* Name */, "name": "true" }, { "type": 9 /* Name */, "name": "false" }]
                }, { "type": 4 /* Funcode */, "name": "whichever", "arity": 1, "ops": [2, 20, 0, 20, 3, 22, 23, 22, 23, 13], "rands": [0, 1, 0, 1, 1, 0, 1, 0, 1, 134217728], "consts": [{ "type": 9 /* Name */, "name": "_get" }] }, { "type": 4 /* Funcode */, "name": "p_sym", "arity": 1, "ops": [0, 20, 3, 22, 23, 4, 3, 20, 2, 22, 23, 5, 1, 13], "rands": [0, 1, 1, 0, 1, 0, 2, 1, 0, 0, 1, 134217728, 0, 134217728], "consts": [{ "type": 9 /* Name */, "name": "_get" }] }, { "type": 4 /* Funcode */, "name": "brack", "arity": 3, "ops": [3, 20, 2, 22, 23, 5, 2, 20, 23, 4, 3, 20, 2, 22, 23, 5, 1, 13], "rands": [1, 1, 0, 0, 1, 134217728, 1, 0, 0, 0, 1, 1, 2, 0, 1, 134217728, 0, 134217728] }, { "type": 4 /* Funcode */, "name": "brack1", "arity": 3, "ops": [3, 20, 2, 22, 23, 5, 2, 20, 2, 22, 23, 4, 3, 20, 2, 22, 23, 5, 1, 13], "rands": [1, 1, 0, 0, 1, 134217728, 1, 1, 2, 0, 1, 0, 1, 1, 2, 0, 1, 134217728, 0, 134217728] }, { "type": 4 /* Funcode */, "name": "p_tail", "arity": 2, "ops": [3, 20, 2, 22, 23, 11, 2, 20, 23, 4, 0, 20, 1, 22, 3, 20, 2, 22, 2, 22, 23, 22, 23, 13, 7, 13], "rands": [1, 1, 1, 0, 1, 24, 0, 0, 0, 0, 0, 2, 0, 0, 0, 2, 0, 0, 1, 1, 2, 1, 2, 134217728, 134217728, 134217728], "consts": [{ "type": 9 /* Name */, "name": ":" }] }, {
                    "type": 4 /* Funcode */,
                    "name": "p_list1",
                    "arity": 1,
                    "ops": [2, 20, 23, 4, 0, 20, 1, 22, 3, 20, 2, 22, 6, 22, 23, 22, 23, 13],
                    "rands": [0, 0, 0, 0, 0, 2, 0, 0, 1, 2, 0, 0, 1, 1, 2, 1, 2, 134217728],
                    "consts": [{ "type": 9 /* Name */, "name": ":" }, { "type": 9 /* Name */, "name": "comma" }]
                }, {
                    "type": 4 /* Funcode */,
                    "name": "p_list",
                    "arity": 2,
                    "ops": [3, 20, 2, 22, 23, 11, 6, 12, 3, 20, 6, 22, 23, 11, 7, 13, 3, 20, 2, 22, 23, 13],
                    "rands": [1, 1, 1, 0, 1, 8, 0, 13, 1, 1, 1, 0, 1, 16, 134217728, 134217728, 2, 1, 0, 0, 1, 134217728],
                    "consts": [truth, { "type": 9 /* Name */, "name": "eof" }]
                }, { "type": 4 /* Funcode */, "name": "p_expr0", "arity": 1, "ops": [0, 20, 3, 22, 23, 4, 1, 20, 2, 22, 23, 13], "rands": [0, 1, 1, 0, 1, 0, 0, 1, 0, 0, 1, 134217728], "consts": [{ "type": 9 /* Name */, "name": "_get" }] }, { "type": 4 /* Funcode */, "name": "p_expr", "arity": 0, "ops": [3, 20, 0, 22, 23, 13], "rands": [1, 1, 0, 0, 1, 134217728], "consts": [{ "type": 9 /* Name */, "name": "false" }] }, { "type": 4 /* Funcode */, "name": "p_term", "arity": 2, "ops": [0, 20, 3, 22, 23, 4, 1, 20, 2, 22, 2, 22, 23, 13], "rands": [0, 1, 1, 0, 1, 0, 0, 2, 0, 0, 1, 1, 2, 134217728], "consts": [{ "type": 9 /* Name */, "name": "_get" }] }, { "type": 4 /* Funcode */, "name": "p_pattern", "arity": 0, "ops": [0, 20, 3, 22, 23, 4, 1, 20, 23, 13], "rands": [0, 1, 1, 0, 1, 0, 0, 0, 0, 134217728], "consts": [{ "type": 9 /* Name */, "name": "_get" }] }, { "type": 4 /* Funcode */, "name": "p_defn", "arity": 0, "ops": [0, 20, 3, 22, 23, 4, 1, 20, 23, 13], "rands": [0, 1, 1, 0, 1, 0, 0, 0, 0, 134217728], "consts": [{ "type": 9 /* Name */, "name": "_get" }] }, {
                    "type": 4 /* Funcode */,
                    "name": "listify",
                    "arity": 1,
                    "ops": [0, 20, 6, 21, 24, 22, 6, 7, 8, 22, 2, 22, 23, 13],
                    "rands": [0, 3, 1, 1, 1, 0, 2, 134217728, 134217728, 1, 0, 2, 3, 134217728],
                    "consts": [{ "type": 9 /* Name */, "name": "foldr" }, { "type": 4 /* Funcode */, "name": "<function>", "arity": 2, "ops": [6, 2, 2, 7, 8, 8, 8, 13], "rands": [0, 0, 1, 134217728, 134217728, 134217728, 134217728, 134217728], "consts": [{ "type": 9 /* Name */, "name": "cons" }] }, { "type": 9 /* Name */, "name": "nil" }]
                }, { "type": 4 /* Funcode */, "name": "p_patterns", "arity": 1, "ops": [3, 20, 3, 22, 2, 22, 23, 13], "rands": [1, 2, 2, 0, 0, 1, 2, 134217728] }, {
                    "type": 4 /* Funcode */,
                    "name": "p_patprim",
                    "arity": 0,
                    "ops": [6, 21, 3, 22, 3, 22, 3, 22, 3, 22, 3, 22, 3, 22, 3, 22, 3, 22, 24, 4, 3, 20, 1, 22, 23, 13],
                    "rands": [0, 9, 8, 1, 7, 2, 6, 3, 5, 4, 4, 5, 3, 6, 2, 7, 1, 8, 9, 0, 9, 1, 0, 0, 1, 134217728],
                    "consts": [{
                        "type": 4 /* Funcode */,
                        "name": "case",
                        "arity": 1,
                        "ops": [2, 9, 6, 15, 3, 20, 6, 22, 23, 4, 0, 20, 3, 20, 6, 22, 23, 22, 23, 11, 6, 1, 7, 8, 8, 13, 0, 20, 6, 22, 0, 20, 1, 22, 3, 20, 6, 22, 3, 22, 6, 22, 23, 22, 23, 22, 23, 13, 2, 9, 6, 15, 6, 3, 20, 6, 22, 23, 7, 8, 8, 13, 2, 9, 6, 15, 3, 20, 6, 22, 23, 5, 6, 7, 8, 13, 2, 9, 6, 15, 6, 3, 20, 6, 22, 23, 7, 8, 8, 13, 2, 9, 6, 15, 3, 20, 6, 22, 23, 5, 6, 0, 20, 3, 20, 6, 22, 23, 22, 23, 7, 8, 8, 13, 2, 9, 6, 15, 6, 3, 20, 6, 22, 23, 7, 8, 8, 13, 2, 9, 6, 15, 3, 20, 6, 22, 3, 22, 6, 22, 23, 13, 2, 9, 6, 15, 0, 20, 6, 22, 3, 20, 6, 22, 3, 22, 6, 22, 23, 22, 23, 13, 3, 20, 6, 22, 23, 13],
                        "rands": [0, 48, 0, 134217728, 1, 1, 0, 0, 1, 0, 1, 1, 2, 1, 2, 0, 1, 0, 1, 26, 3, 0, 134217728, 134217728, 134217728, 134217728, 4, 2, 5, 0, 4, 2, 0, 0, 3, 3, 2, 0, 4, 1, 6, 2, 3, 1, 2, 1, 2, 134217728, 0, 62, 7, 134217728, 8, 1, 1, 7, 0, 1, 134217728, 134217728, 134217728, 134217728, 0, 76, 9, 134217728, 5, 1, 9, 0, 1, 134217728, 10, 134217728, 134217728, 134217728, 0, 90, 11, 134217728, 8, 1, 1, 11, 0, 1, 134217728, 134217728, 134217728, 134217728, 0, 114, 12, 134217728, 5, 1, 12, 0, 1, 134217728, 8, 13, 1, 1, 1, 11, 0, 1, 0, 1, 134217728, 134217728, 134217728, 134217728, 0, 128, 14, 134217728, 8, 1, 1, 14, 0, 1, 134217728, 134217728, 134217728, 134217728, 0, 142, 2, 134217728, 6, 3, 2, 0, 7, 1, 6, 2, 3, 134217728, 0, 162, 15, 134217728, 4, 2, 16, 0, 3, 3, 15, 0, 4, 1, 17, 2, 3, 1, 2, 134217728, 8, 1, 18, 0, 1, 134217728],
                        "consts": [{ "type": 9 /* Name */, "name": "ident" }, { "type": 9 /* Name */, "name": "not" }, { "type": 9 /* Name */, "name": "lpar" }, { "type": 9 /* Name */, "name": "var" }, { "type": 9 /* Name */, "name": ":" }, { "type": 9 /* Name */, "name": "prim" }, { "type": 9 /* Name */, "name": "rpar" }, { "type": 9 /* Name */, "name": "atom" }, { "type": 9 /* Name */, "name": "const" }, { "type": 9 /* Name */, "name": "_" }, { "type": 9 /* Name */, "name": "anon" }, { "type": 9 /* Name */, "name": "number" }, { "type": 9 /* Name */, "name": "-" }, { "type": 9 /* Name */, "name": "~" }, { "type": 9 /* Name */, "name": "string" }, { "type": 9 /* Name */, "name": "bra" }, { "type": 9 /* Name */, "name": "list" }, { "type": 9 /* Name */, "name": "ket" }, { "type": 0 /* String */, "value": "#pattern" }]
                    }]
                }, {
                    "type": 4 /* Funcode */,
                    "name": "p_patfactor",
                    "arity": 0,
                    "ops": [3, 20, 23, 4, 3, 20, 6, 22, 23, 11, 6, 1, 3, 20, 23, 7, 8, 8, 8, 13, 1, 13],
                    "rands": [1, 0, 0, 0, 2, 1, 0, 0, 1, 20, 1, 0, 0, 0, 0, 134217728, 134217728, 134217728, 134217728, 134217728, 0, 134217728],
                    "consts": [{ "type": 9 /* Name */, "name": ":" }, { "type": 9 /* Name */, "name": "cons" }]
                }, {
                    "type": 4 /* Funcode */,
                    "name": "p_pattern_body",
                    "arity": 0,
                    "ops": [6, 21, 3, 22, 3, 22, 24, 4, 1, 20, 3, 20, 23, 22, 23, 13],
                    "rands": [0, 3, 2, 1, 1, 2, 3, 0, 0, 1, 3, 0, 0, 0, 1, 134217728],
                    "consts": [{
                        "type": 4 /* Funcode */,
                        "name": "chain",
                        "arity": 1,
                        "ops": [3, 20, 6, 22, 23, 11, 6, 2, 3, 20, 6, 22, 23, 7, 8, 8, 8, 19, 2, 13],
                        "rands": [1, 1, 0, 0, 1, 18, 1, 0, 2, 1, 2, 0, 1, 134217728, 134217728, 134217728, 134217728, 1, 0, 134217728],
                        "consts": [{ "type": 9 /* Name */, "name": "+" }, { "type": 9 /* Name */, "name": "plus" }, { "type": 9 /* Name */, "name": "number" }]
                    }]
                }, {
                    "type": 4 /* Funcode */,
                    "name": "p_formals",
                    "arity": 0,
                    "ops": [3, 20, 6, 22, 3, 22, 6, 22, 23, 13],
                    "rands": [1, 3, 0, 0, 2, 1, 1, 2, 3, 134217728],
                    "consts": [{ "type": 9 /* Name */, "name": "lpar" }, { "type": 9 /* Name */, "name": "rpar" }]
                }, { "type": 4 /* Funcode */, "name": "p_exprs", "arity": 1, "ops": [3, 20, 3, 22, 2, 22, 23, 13], "rands": [1, 2, 2, 0, 0, 1, 2, 134217728] }, {
                    "type": 4 /* Funcode */,
                    "name": "expand",
                    "arity": 3,
                    "ops": [2, 9, 16, 6, 2, 2, 7, 8, 8, 8, 13, 2, 9, 17, 9, 17, 9, 6, 15, 18, 9, 17, 9, 17, 9, 6, 15, 18, 9, 17, 4, 18, 9, 16, 18, 9, 17, 4, 18, 9, 16, 18, 4, 6, 0, 20, 23, 7, 8, 8, 4, 6, 6, 6, 7, 8, 8, 6, 6, 6, 1, 7, 8, 8, 1, 7, 8, 8, 3, 20, 2, 22, 1, 22, 1, 22, 23, 7, 8, 8, 7, 8, 7, 8, 8, 8, 1, 2, 7, 8, 8, 8, 8, 8, 13, 5, 5, 5, 2, 9, 17, 9, 17, 9, 6, 15, 18, 9, 17, 4, 18, 9, 17, 4, 18, 9, 16, 18, 4, 6, 0, 20, 23, 7, 8, 8, 4, 6, 6, 6, 7, 8, 8, 6, 6, 1, 1, 7, 8, 8, 3, 20, 2, 22, 1, 22, 1, 22, 23, 7, 8, 8, 6, 7, 8, 1, 7, 8, 8, 1, 7, 8, 8, 7, 8, 8, 7, 8, 8, 8, 1, 2, 7, 8, 8, 8, 8, 8, 13, 5, 5, 2, 9, 17, 9, 17, 9, 6, 15, 18, 9, 17, 4, 18, 9, 16, 18, 4, 6, 1, 3, 20, 2, 22, 1, 22, 2, 22, 23, 2, 7, 8, 8, 8, 8, 13, 5, 5, 10],
                    "rands": [1, 11, 134217728, 0, 0, 2, 134217728, 134217728, 134217728, 134217728, 134217728, 1, 98, 134217728, 97, 134217728, 96, 1, 134217728, 134217728, 97, 134217728, 96, 134217728, 95, 2, 134217728, 134217728, 96, 134217728, 0, 134217728, 96, 134217728, 134217728, 97, 134217728, 1, 134217728, 97, 134217728, 134217728, 2, 2, 3, 0, 0, 134217728, 134217728, 134217728, 3, 4, 2, 5, 134217728, 134217728, 134217728, 6, 7, 2, 0, 134217728, 134217728, 134217728, 3, 134217728, 134217728, 134217728, 0, 3, 0, 0, 2, 1, 3, 2, 3, 134217728, 134217728, 134217728, 134217728, 134217728, 134217728, 134217728, 134217728, 134217728, 1, 2, 134217728, 134217728, 134217728, 134217728, 134217728, 134217728, 134217728, 134217728, 134217728, 134217728, 1, 181, 134217728, 180, 134217728, 179, 1, 134217728, 134217728, 180, 134217728, 0, 134217728, 180, 134217728, 1, 134217728, 180, 134217728, 134217728, 2, 2, 3, 0, 0, 134217728, 134217728, 134217728, 3, 4, 2, 5, 134217728, 134217728, 134217728, 6, 7, 0, 3, 134217728, 134217728, 134217728, 0, 3, 0, 0, 2, 1, 3, 2, 3, 134217728, 134217728, 134217728, 8, 134217728, 134217728, 3, 134217728, 134217728, 134217728, 3, 134217728, 134217728, 134217728, 134217728, 134217728, 134217728, 134217728, 134217728, 134217728, 134217728, 1, 2, 134217728, 134217728, 134217728, 134217728, 134217728, 134217728, 134217728, 134217728, 134217728, 1, 218, 134217728, 217, 134217728, 216, 9, 134217728, 134217728, 217, 134217728, 0, 134217728, 217, 134217728, 134217728, 1, 10, 0, 0, 3, 0, 0, 1, 1, 2, 2, 3, 2, 134217728, 134217728, 134217728, 134217728, 134217728, 134217728, 134217728, 134217728, 134217728],
                    "consts": [{ "type": 9 /* Name */, "name": "cons" }, { "type": 9 /* Name */, "name": "gen" }, { "type": 9 /* Name */, "name": "var" }, { "type": 9 /* Name */, "name": "_gensym" }, { "type": 9 /* Name */, "name": "apply" }, { "type": 9 /* Name */, "name": "_mapa" }, { "type": 9 /* Name */, "name": "function" }, { "type": 3 /* Number */, "value": 2 }, { "type": 9 /* Name */, "name": "anon" }, { "type": 9 /* Name */, "name": "when" }, { "type": 9 /* Name */, "name": "if" }]
                }, {
                    "type": 4 /* Funcode */,
                    "name": "p_gen",
                    "arity": 0,
                    "ops": [3, 20, 23, 4, 3, 20, 6, 22, 23, 5, 6, 1, 3, 20, 23, 7, 8, 8, 8, 13],
                    "rands": [1, 0, 0, 0, 2, 1, 0, 0, 1, 134217728, 1, 0, 3, 0, 0, 134217728, 134217728, 134217728, 134217728, 134217728],
                    "consts": [{ "type": 9 /* Name */, "name": "<-" }, { "type": 9 /* Name */, "name": "gen" }]
                }, {
                    "type": 4 /* Funcode */,
                    "name": "p_gens",
                    "arity": 0,
                    "ops": [6, 21, 3, 22, 3, 22, 3, 22, 3, 22, 24, 4, 3, 20, 23, 4, 0, 20, 1, 22, 1, 20, 23, 22, 23, 13],
                    "rands": [0, 5, 4, 1, 3, 2, 2, 3, 1, 4, 5, 0, 4, 0, 0, 1, 1, 2, 1, 0, 0, 0, 0, 1, 2, 134217728],
                    "consts": [{
                        "type": 4 /* Funcode */,
                        "name": "p_tail",
                        "arity": 0,
                        "ops": [6, 21, 3, 22, 3, 22, 3, 22, 3, 22, 24, 4, 3, 20, 1, 22, 23, 13],
                        "rands": [0, 5, 3, 1, 2, 2, 0, 3, 1, 4, 5, 0, 4, 1, 0, 0, 1, 134217728],
                        "consts": [{
                            "type": 4 /* Funcode */,
                            "name": "case",
                            "arity": 1,
                            "ops": [2, 9, 6, 15, 3, 20, 6, 22, 23, 5, 3, 20, 23, 4, 0, 20, 6, 1, 7, 8, 8, 22, 3, 20, 23, 22, 23, 13, 2, 9, 6, 15, 3, 20, 6, 22, 23, 5, 3, 20, 23, 4, 0, 20, 1, 22, 3, 20, 23, 22, 23, 13, 7, 13],
                            "rands": [0, 28, 0, 134217728, 1, 1, 0, 0, 1, 134217728, 2, 0, 0, 0, 1, 2, 0, 0, 134217728, 134217728, 134217728, 0, 3, 0, 0, 1, 2, 134217728, 0, 52, 2, 134217728, 1, 1, 2, 0, 1, 134217728, 4, 0, 0, 0, 1, 2, 0, 0, 3, 0, 0, 1, 2, 134217728, 134217728, 134217728],
                            "consts": [{ "type": 9 /* Name */, "name": "when" }, { "type": 9 /* Name */, "name": ":" }, { "type": 9 /* Name */, "name": "comma" }]
                        }]
                    }, { "type": 9 /* Name */, "name": ":" }]
                }, {
                    "type": 4 /* Funcode */,
                    "name": "p_listexp",
                    "arity": 0,
                    "ops": [3, 20, 6, 22, 23, 11, 6, 7, 8, 13, 3, 20, 23, 4, 6, 21, 3, 22, 3, 22, 1, 22, 3, 22, 3, 22, 3, 22, 24, 4, 3, 20, 1, 22, 23, 13],
                    "rands": [1, 1, 0, 0, 1, 10, 1, 134217728, 134217728, 134217728, 2, 0, 0, 0, 2, 7, 6, 1, 2, 2, 0, 3, 5, 4, 4, 5, 3, 6, 7, 1, 7, 1, 1, 0, 1, 134217728],
                    "consts": [{ "type": 9 /* Name */, "name": "ket" }, { "type": 9 /* Name */, "name": "nil" }, {
                        "type": 4 /* Funcode */,
                        "name": "case",
                        "arity": 1,
                        "ops": [2, 9, 6, 15, 0, 20, 6, 22, 0, 20, 3, 22, 3, 20, 3, 22, 6, 22, 23, 22, 23, 22, 23, 13, 2, 9, 6, 15, 3, 20, 6, 22, 23, 5, 6, 6, 6, 7, 8, 8, 3, 3, 20, 23, 7, 8, 8, 8, 8, 13, 2, 9, 6, 15, 3, 20, 6, 22, 23, 5, 3, 20, 3, 22, 3, 20, 23, 22, 6, 7, 8, 22, 23, 13, 6, 3, 7, 8, 8, 13],
                        "rands": [0, 24, 0, 134217728, 1, 2, 2, 0, 1, 2, 3, 0, 1, 2, 2, 0, 0, 1, 2, 1, 2, 1, 2, 134217728, 0, 50, 3, 134217728, 4, 1, 3, 0, 1, 134217728, 4, 5, 6, 134217728, 134217728, 134217728, 3, 2, 0, 0, 134217728, 134217728, 134217728, 134217728, 134217728, 134217728, 0, 74, 7, 134217728, 4, 1, 7, 0, 1, 134217728, 5, 3, 3, 0, 6, 0, 0, 1, 8, 134217728, 134217728, 2, 3, 134217728, 2, 3, 134217728, 134217728, 134217728, 134217728],
                        "consts": [{ "type": 9 /* Name */, "name": "comma" }, { "type": 9 /* Name */, "name": ":" }, { "type": 9 /* Name */, "name": "list" }, { "type": 9 /* Name */, "name": ".." }, { "type": 9 /* Name */, "name": "apply" }, { "type": 9 /* Name */, "name": "var" }, { "type": 9 /* Name */, "name": "_range" }, { "type": 9 /* Name */, "name": "vbar" }, { "type": 9 /* Name */, "name": "nil" }]
                    }]
                }, {
                    "type": 4 /* Funcode */,
                    "name": "p_parenexp",
                    "arity": 0,
                    "ops": [0, 20, 0, 20, 3, 22, 23, 22, 6, 22, 23, 11, 6, 12, 0, 20, 3, 20, 0, 20, 3, 22, 23, 22, 23, 22, 23, 11, 3, 20, 0, 22, 23, 13, 3, 20, 0, 20, 3, 22, 23, 22, 23, 4, 3, 20, 1, 22, 23, 4, 3, 20, 6, 22, 23, 11, 6, 1, 7, 8, 8, 13, 6, 6, 6, 7, 8, 8, 6, 1, 7, 8, 8, 3, 20, 3, 20, 1, 22, 23, 22, 0, 22, 23, 7, 8, 8, 8, 8, 13],
                    "rands": [0, 2, 1, 1, 1, 0, 1, 0, 2, 1, 2, 14, 3, 27, 4, 1, 2, 1, 1, 1, 1, 0, 1, 0, 1, 0, 1, 34, 3, 1, 5, 0, 1, 134217728, 4, 1, 1, 1, 1, 0, 1, 0, 1, 0, 5, 1, 0, 0, 1, 1, 6, 1, 6, 0, 1, 62, 7, 0, 134217728, 134217728, 134217728, 134217728, 8, 7, 9, 134217728, 134217728, 134217728, 7, 0, 134217728, 134217728, 134217728, 7, 2, 8, 1, 1, 0, 1, 0, 10, 1, 2, 134217728, 134217728, 134217728, 134217728, 134217728, 134217728],
                    "consts": [{ "type": 9 /* Name */, "name": "=" }, { "type": 9 /* Name */, "name": "_get" }, { "type": 9 /* Name */, "name": "-" }, truth, { "type": 9 /* Name */, "name": "not" }, { "type": 9 /* Name */, "name": "true" }, { "type": 9 /* Name */, "name": "rpar" }, { "type": 9 /* Name */, "name": "var" }, { "type": 9 /* Name */, "name": "apply" }, { "type": 9 /* Name */, "name": "_rsect" }, { "type": 9 /* Name */, "name": "false" }]
                }, {
                    "type": 4 /* Funcode */,
                    "name": "p_primary",
                    "arity": 0,
                    "ops": [6, 21, 3, 22, 3, 22, 3, 22, 3, 22, 3, 22, 3, 22, 3, 22, 3, 22, 24, 4, 3, 20, 1, 22, 23, 13],
                    "rands": [0, 9, 8, 1, 7, 2, 6, 3, 5, 4, 4, 5, 3, 6, 2, 7, 1, 8, 9, 0, 9, 1, 0, 0, 1, 134217728],
                    "consts": [{
                        "type": 4 /* Funcode */,
                        "name": "case",
                        "arity": 1,
                        "ops": [2, 9, 6, 15, 6, 3, 20, 6, 22, 23, 7, 8, 8, 13, 2, 9, 6, 15, 6, 3, 20, 6, 22, 23, 7, 8, 8, 13, 2, 9, 6, 15, 6, 3, 20, 6, 22, 23, 7, 8, 8, 13, 2, 9, 6, 15, 3, 20, 6, 22, 23, 4, 0, 20, 3, 20, 6, 22, 23, 22, 23, 11, 6, 1, 7, 8, 8, 13, 0, 20, 6, 22, 0, 20, 6, 1, 7, 8, 8, 22, 3, 20, 6, 22, 3, 22, 6, 22, 23, 22, 23, 22, 23, 13, 2, 9, 6, 15, 3, 20, 6, 22, 3, 22, 6, 22, 23, 13, 2, 9, 6, 15, 3, 20, 6, 22, 3, 22, 6, 22, 23, 13, 2, 9, 6, 15, 3, 20, 6, 22, 23, 13, 3, 20, 6, 22, 23, 13],
                        "rands": [0, 14, 0, 134217728, 1, 1, 1, 0, 0, 1, 134217728, 134217728, 134217728, 134217728, 0, 28, 2, 134217728, 1, 1, 1, 2, 0, 1, 134217728, 134217728, 134217728, 134217728, 0, 42, 3, 134217728, 1, 1, 1, 3, 0, 1, 134217728, 134217728, 134217728, 134217728, 0, 94, 4, 134217728, 1, 1, 4, 0, 1, 0, 5, 1, 2, 1, 6, 0, 1, 0, 1, 68, 7, 0, 134217728, 134217728, 134217728, 134217728, 8, 2, 9, 0, 8, 2, 7, 0, 134217728, 134217728, 134217728, 0, 3, 3, 6, 0, 4, 1, 10, 2, 3, 1, 2, 1, 2, 134217728, 0, 108, 6, 134217728, 5, 3, 6, 0, 6, 1, 10, 2, 3, 134217728, 0, 122, 11, 134217728, 5, 3, 11, 0, 7, 1, 12, 2, 3, 134217728, 0, 132, 13, 134217728, 8, 1, 14, 0, 1, 134217728, 8, 1, 15, 0, 1, 134217728],
                        "consts": [{ "type": 9 /* Name */, "name": "number" }, { "type": 9 /* Name */, "name": "const" }, { "type": 9 /* Name */, "name": "atom" }, { "type": 9 /* Name */, "name": "string" }, { "type": 9 /* Name */, "name": "ident" }, { "type": 9 /* Name */, "name": "not" }, { "type": 9 /* Name */, "name": "lpar" }, { "type": 9 /* Name */, "name": "var" }, { "type": 9 /* Name */, "name": ":" }, { "type": 9 /* Name */, "name": "apply" }, { "type": 9 /* Name */, "name": "rpar" }, { "type": 9 /* Name */, "name": "bra" }, { "type": 9 /* Name */, "name": "ket" }, { "type": 9 /* Name */, "name": "eof" }, { "type": 0 /* String */, "value": "#exp" }, { "type": 0 /* String */, "value": "#badexp" }]
                    }]
                }, {
                    "type": 4 /* Funcode */,
                    "name": "p_factor",
                    "arity": 1,
                    "ops": [6, 21, 3, 22, 2, 22, 3, 22, 3, 22, 3, 22, 3, 22, 24, 4, 3, 20, 1, 22, 23, 13],
                    "rands": [0, 7, 4, 1, 0, 2, 3, 3, 0, 4, 2, 5, 1, 6, 7, 0, 5, 1, 0, 0, 1, 134217728],
                    "consts": [{
                        "type": 4 /* Funcode */,
                        "name": "case",
                        "arity": 1,
                        "ops": [2, 9, 6, 15, 3, 20, 6, 22, 23, 4, 3, 11, 3, 20, 6, 22, 23, 12, 6, 11, 6, 1, 7, 8, 8, 13, 6, 6, 1, 7, 8, 8, 3, 20, 0, 22, 23, 7, 8, 8, 8, 13, 2, 9, 6, 15, 3, 20, 6, 22, 23, 5, 3, 20, 6, 22, 23, 11, 6, 0, 20, 3, 20, 6, 22, 23, 22, 23, 7, 8, 8, 13, 3, 11, 3, 20, 6, 22, 23, 12, 6, 11, 6, 6, 7, 8, 8, 13, 6, 6, 6, 7, 8, 8, 3, 20, 0, 22, 23, 7, 8, 8, 8, 13, 3, 20, 23, 13],
                        "rands": [0, 42, 0, 134217728, 1, 1, 0, 0, 1, 0, 2, 18, 3, 1, 1, 0, 1, 19, 2, 26, 3, 0, 134217728, 134217728, 134217728, 134217728, 4, 3, 0, 134217728, 134217728, 134217728, 4, 1, 5, 0, 1, 134217728, 134217728, 134217728, 134217728, 134217728, 0, 104, 6, 134217728, 5, 1, 6, 0, 1, 134217728, 3, 1, 7, 0, 1, 72, 8, 9, 1, 1, 1, 7, 0, 1, 0, 1, 134217728, 134217728, 134217728, 134217728, 2, 80, 3, 1, 1, 0, 1, 81, 2, 88, 3, 6, 134217728, 134217728, 134217728, 134217728, 4, 3, 9, 134217728, 134217728, 134217728, 4, 1, 5, 0, 1, 134217728, 134217728, 134217728, 134217728, 134217728, 6, 0, 0, 134217728],
                        "consts": [{ "type": 9 /* Name */, "name": "monop" }, { "type": 9 /* Name */, "name": "rpar" }, falsity, { "type": 9 /* Name */, "name": "var" }, { "type": 9 /* Name */, "name": "apply" }, { "type": 9 /* Name */, "name": "false" }, { "type": 9 /* Name */, "name": "-" }, { "type": 9 /* Name */, "name": "number" }, { "type": 9 /* Name */, "name": "const" }, { "type": 9 /* Name */, "name": "~" }]
                    }]
                }, {
                    "type": 4 /* Funcode */,
                    "name": "makebin",
                    "arity": 3,
                    "ops": [6, 21, 2, 22, 2, 22, 2, 22, 24, 4, 1, 20, 2, 22, 23, 13],
                    "rands": [0, 4, 1, 1, 2, 2, 0, 3, 4, 0, 0, 1, 0, 0, 1, 134217728],
                    "consts": [{
                        "type": 4 /* Funcode */,
                        "name": "case",
                        "arity": 1,
                        "ops": [2, 9, 6, 15, 6, 3, 3, 6, 0, 7, 8, 8, 7, 8, 8, 8, 8, 13, 2, 9, 6, 15, 6, 3, 6, 0, 7, 8, 8, 3, 7, 8, 8, 8, 8, 13, 6, 6, 3, 7, 8, 8, 3, 3, 7, 8, 8, 8, 8, 13],
                        "rands": [0, 18, 0, 134217728, 1, 1, 2, 2, 3, 134217728, 134217728, 134217728, 134217728, 134217728, 134217728, 134217728, 134217728, 134217728, 0, 36, 4, 134217728, 1, 1, 2, 5, 134217728, 134217728, 134217728, 2, 134217728, 134217728, 134217728, 134217728, 134217728, 134217728, 6, 7, 3, 134217728, 134217728, 134217728, 1, 2, 134217728, 134217728, 134217728, 134217728, 134217728, 134217728],
                        "consts": [{ "type": 9 /* Name */, "name": "and" }, { "type": 9 /* Name */, "name": "if" }, { "type": 9 /* Name */, "name": "const" }, { "type": 9 /* Name */, "name": "false" }, { "type": 9 /* Name */, "name": "or" }, { "type": 9 /* Name */, "name": "true" }, { "type": 9 /* Name */, "name": "apply" }, { "type": 9 /* Name */, "name": "var" }]
                    }]
                }, {
                    "type": 4 /* Funcode */,
                    "name": "p_term_body",
                    "arity": 2,
                    "ops": [6, 21, 3, 22, 3, 22, 3, 22, 3, 22, 3, 22, 3, 22, 2, 22, 3, 22, 3, 22, 3, 22, 3, 22, 24, 4, 1, 20, 3, 20, 2, 22, 23, 22, 2, 22, 23, 13],
                    "rands": [0, 12, 10, 1, 9, 2, 8, 3, 7, 4, 6, 5, 5, 6, 1, 7, 4, 8, 3, 9, 2, 10, 1, 11, 12, 0, 0, 2, 11, 1, 1, 0, 1, 0, 0, 1, 2, 134217728],
                    "consts": [{
                        "type": 4 /* Funcode */,
                        "name": "p_termcont",
                        "arity": 2,
                        "ops": [0, 20, 3, 22, 23, 4, 0, 20, 3, 20, 1, 22, 23, 22, 23, 11, 2, 13, 0, 20, 3, 22, 23, 4, 3, 20, 1, 22, 23, 4, 0, 20, 3, 20, 1, 22, 23, 22, 2, 22, 23, 11, 2, 13, 3, 20, 1, 22, 23, 5, 3, 11, 3, 20, 6, 22, 23, 12, 6, 11, 6, 6, 6, 7, 8, 8, 6, 1, 7, 8, 8, 2, 7, 8, 8, 8, 8, 13, 3, 20, 3, 20, 1, 22, 23, 22, 0, 22, 23, 4, 3, 20, 1, 22, 2, 22, 1, 22, 23, 2, 19],
                        "rands": [0, 1, 1, 0, 1, 0, 1, 1, 2, 1, 0, 0, 1, 0, 1, 18, 0, 134217728, 0, 1, 3, 0, 1, 1, 4, 1, 1, 0, 1, 2, 2, 2, 5, 1, 2, 0, 1, 0, 1, 1, 2, 44, 0, 134217728, 6, 1, 0, 0, 1, 134217728, 7, 58, 8, 1, 3, 0, 1, 59, 4, 78, 5, 6, 7, 134217728, 134217728, 134217728, 6, 1, 134217728, 134217728, 134217728, 0, 134217728, 134217728, 134217728, 134217728, 134217728, 134217728, 9, 2, 10, 1, 2, 0, 1, 0, 8, 1, 2, 3, 11, 3, 1, 0, 0, 1, 3, 2, 3, 1, 2],
                        "consts": [{ "type": 9 /* Name */, "name": "_get" }, { "type": 9 /* Name */, "name": "not" }, { "type": 9 /* Name */, "name": "<" }, { "type": 9 /* Name */, "name": "rpar" }, falsity, { "type": 9 /* Name */, "name": "apply" }, { "type": 9 /* Name */, "name": "var" }, { "type": 9 /* Name */, "name": "_lsect" }, { "type": 9 /* Name */, "name": "false" }]
                    }]
                }, {
                    "type": 4 /* Funcode */,
                    "name": "p_cond",
                    "arity": 1,
                    "ops": [3, 20, 6, 22, 23, 11, 3, 20, 0, 22, 23, 4, 3, 20, 6, 22, 23, 5, 3, 20, 0, 22, 23, 4, 3, 20, 6, 22, 23, 5, 3, 20, 0, 22, 23, 4, 6, 1, 1, 1, 7, 8, 8, 8, 8, 13, 3, 20, 6, 22, 2, 22, 23, 13],
                    "rands": [1, 1, 0, 0, 1, 46, 0, 1, 1, 0, 1, 0, 2, 1, 2, 0, 1, 134217728, 0, 1, 1, 0, 1, 1, 2, 1, 3, 0, 1, 134217728, 0, 1, 1, 0, 1, 2, 0, 0, 1, 2, 134217728, 134217728, 134217728, 134217728, 134217728, 134217728, 3, 2, 4, 0, 0, 1, 2, 134217728],
                    "consts": [{ "type": 9 /* Name */, "name": "if" }, { "type": 9 /* Name */, "name": "false" }, { "type": 9 /* Name */, "name": "then" }, { "type": 9 /* Name */, "name": "else" }, { "type": 3 /* Number */, "value": 1 }]
                }, {
                    "type": 4 /* Funcode */,
                    "name": "p_expr_body",
                    "arity": 1,
                    "ops": [6, 21, 3, 22, 3, 22, 3, 22, 3, 22, 3, 22, 2, 22, 3, 22, 24, 4, 3, 20, 1, 22, 23, 13],
                    "rands": [0, 8, 6, 1, 5, 2, 4, 3, 3, 4, 2, 5, 0, 6, 1, 7, 8, 0, 7, 1, 0, 0, 1, 134217728],
                    "consts": [{
                        "type": 4 /* Funcode */,
                        "name": "case",
                        "arity": 1,
                        "ops": [2, 9, 6, 15, 3, 20, 6, 22, 23, 5, 3, 20, 23, 4, 3, 20, 6, 22, 23, 5, 6, 1, 3, 20, 23, 7, 8, 8, 8, 13, 2, 9, 6, 15, 3, 20, 6, 22, 23, 5, 3, 20, 23, 4, 6, 0, 20, 1, 22, 23, 1, 3, 20, 23, 7, 8, 8, 7, 8, 7, 8, 8, 8, 13, 3, 20, 3, 22, 23, 4, 3, 20, 6, 22, 23, 11, 6, 1, 3, 20, 23, 7, 8, 8, 8, 13, 1, 13],
                        "rands": [0, 30, 0, 134217728, 1, 1, 0, 0, 1, 134217728, 2, 0, 0, 0, 1, 1, 1, 0, 1, 134217728, 0, 0, 3, 0, 0, 134217728, 134217728, 134217728, 134217728, 134217728, 0, 64, 2, 134217728, 1, 1, 2, 0, 1, 134217728, 4, 0, 0, 0, 2, 3, 1, 0, 0, 1, 0, 3, 0, 0, 134217728, 134217728, 134217728, 134217728, 134217728, 134217728, 134217728, 134217728, 134217728, 134217728, 5, 1, 6, 0, 1, 0, 7, 1, 4, 0, 1, 86, 5, 0, 3, 0, 0, 134217728, 134217728, 134217728, 134217728, 134217728, 0, 134217728],
                        "consts": [{ "type": 9 /* Name */, "name": "let" }, { "type": 9 /* Name */, "name": "in" }, { "type": 9 /* Name */, "name": "function" }, { "type": 9 /* Name */, "name": "length" }, { "type": 9 /* Name */, "name": ">>" }, { "type": 9 /* Name */, "name": "seq" }]
                    }]
                }, {
                    "type": 4 /* Funcode */,
                    "name": "p_name",
                    "arity": 0,
                    "ops": [3, 20, 0, 20, 3, 22, 23, 22, 23, 11, 6, 12, 3, 20, 6, 22, 23, 11, 3, 20, 0, 20, 3, 22, 23, 22, 23, 13, 3, 20, 6, 22, 23, 13],
                    "rands": [1, 1, 0, 1, 2, 0, 1, 0, 1, 12, 1, 17, 3, 1, 2, 0, 1, 28, 4, 1, 0, 1, 2, 0, 1, 0, 1, 134217728, 4, 1, 3, 0, 1, 134217728],
                    "consts": [{ "type": 9 /* Name */, "name": "_get" }, truth, { "type": 9 /* Name */, "name": "monop" }, { "type": 9 /* Name */, "name": "ident" }]
                }, {
                    "type": 4 /* Funcode */,
                    "name": "p_rhs",
                    "arity": 1,
                    "ops": [3, 20, 6, 22, 23, 5, 3, 20, 23, 4, 3, 20, 6, 22, 23, 11, 2, 3, 20, 23, 1, 7, 8, 8, 8, 13, 2, 1, 7, 8, 8, 13],
                    "rands": [1, 1, 0, 0, 1, 134217728, 2, 0, 0, 0, 3, 1, 1, 0, 1, 26, 0, 2, 0, 0, 0, 134217728, 134217728, 134217728, 134217728, 134217728, 0, 0, 134217728, 134217728, 134217728, 134217728],
                    "consts": [{ "type": 9 /* Name */, "name": "=" }, { "type": 9 /* Name */, "name": "when" }]
                }, {
                    "type": 4 /* Funcode */,
                    "name": "p_rule",
                    "arity": 2,
                    "ops": [0, 20, 3, 22, 23, 4, 3, 20, 0, 20, 3, 22, 23, 22, 23, 11, 6, 12, 3, 20, 6, 22, 23, 11, 0, 20, 3, 22, 23, 12, 6, 4, 3, 20, 1, 22, 23, 11, 0, 20, 2, 22, 1, 22, 23, 12, 6, 11, 3, 20, 6, 22, 23, 12, 7, 5, 3, 20, 1, 22, 23, 5, 3, 20, 23, 4, 0, 20, 0, 20, 1, 22, 23, 22, 2, 22, 23, 11, 7, 12, 3, 20, 6, 22, 23, 5, 3, 20, 1, 22, 23, 13],
                    "rands": [0, 1, 1, 0, 1, 0, 2, 1, 0, 1, 3, 0, 1, 0, 1, 18, 1, 23, 4, 1, 2, 0, 1, 30, 0, 1, 3, 0, 1, 31, 3, 1, 4, 1, 1, 0, 1, 46, 4, 2, 0, 0, 0, 1, 2, 47, 5, 54, 5, 1, 6, 0, 1, 55, 134217728, 134217728, 6, 1, 1, 0, 1, 134217728, 7, 0, 0, 2, 7, 2, 8, 1, 2, 0, 1, 0, 1, 1, 2, 80, 134217728, 85, 5, 1, 9, 0, 1, 134217728, 8, 1, 2, 0, 1, 134217728],
                    "consts": [{ "type": 9 /* Name */, "name": "_get" }, truth, { "type": 9 /* Name */, "name": "monop" }, { "type": 9 /* Name */, "name": "ident" }, { "type": 9 /* Name */, "name": "<>" }, falsity, { "type": 0 /* String */, "value": "#names" }, { "type": 9 /* Name */, "name": "=" }, { "type": 9 /* Name */, "name": "length" }, { "type": 0 /* String */, "value": "#arity" }]
                }, {
                    "type": 4 /* Funcode */,
                    "name": "p_defn_body",
                    "arity": 0,
                    "ops": [3, 20, 23, 4, 0, 20, 3, 20, 6, 22, 23, 22, 23, 11, 3, 20, 6, 22, 23, 5, 6, 1, 3, 20, 23, 7, 8, 8, 8, 13, 3, 20, 23, 4, 0, 20, 1, 22, 23, 4, 3, 20, 1, 22, 23, 4, 6, 1, 1, 0, 20, 1, 22, 3, 20, 6, 21, 3, 22, 1, 22, 1, 22, 24, 22, 6, 22, 23, 22, 23, 7, 8, 8, 8, 8, 13],
                    "rands": [1, 0, 0, 0, 0, 1, 2, 1, 1, 0, 1, 0, 1, 30, 3, 1, 2, 0, 1, 134217728, 3, 0, 4, 0, 0, 134217728, 134217728, 134217728, 134217728, 134217728, 5, 0, 0, 1, 4, 1, 1, 0, 1, 2, 6, 1, 1, 0, 1, 3, 5, 0, 2, 6, 2, 3, 0, 7, 2, 7, 4, 8, 1, 2, 2, 0, 3, 4, 0, 8, 1, 2, 1, 2, 134217728, 134217728, 134217728, 134217728, 134217728, 134217728],
                    "consts": [{ "type": 9 /* Name */, "name": "not" }, { "type": 9 /* Name */, "name": "lpar" }, { "type": 9 /* Name */, "name": "=" }, { "type": 9 /* Name */, "name": "val" }, { "type": 9 /* Name */, "name": "length" }, { "type": 9 /* Name */, "name": "fun" }, { "type": 9 /* Name */, "name": ":" }, { "type": 4 /* Funcode */, "name": "<function>", "arity": 0, "ops": [3, 20, 3, 22, 3, 22, 23, 13], "rands": [1, 2, 3, 0, 2, 1, 2, 134217728] }, { "type": 9 /* Name */, "name": "vbar" }]
                }, {
                    "type": 4 /* Funcode */,
                    "name": "p_para",
                    "arity": 0,
                    "ops": [3, 20, 6, 22, 23, 11, 6, 13, 3, 20, 6, 22, 23, 11, 3, 20, 23, 12, 3, 20, 23, 4, 3, 20, 6, 22, 23, 11, 3, 20, 6, 22, 23, 12, 3, 20, 6, 22, 23, 11, 3, 20, 6, 22, 23, 12, 0, 20, 3, 20, 6, 22, 23, 22, 23, 11, 0, 20, 3, 20, 6, 22, 23, 22, 23, 12, 6, 11, 3, 20, 6, 22, 23, 12, 7, 5, 1, 13],
                    "rands": [1, 1, 0, 0, 1, 8, 0, 134217728, 2, 1, 1, 0, 1, 18, 3, 0, 0, 21, 4, 0, 0, 0, 1, 1, 2, 0, 1, 34, 5, 1, 3, 0, 1, 75, 1, 1, 4, 0, 1, 46, 5, 1, 5, 0, 1, 75, 6, 1, 1, 1, 7, 0, 1, 0, 1, 66, 6, 1, 1, 1, 0, 0, 1, 0, 1, 67, 8, 74, 5, 1, 9, 0, 1, 75, 134217728, 134217728, 0, 134217728],
                    "consts": [{ "type": 9 /* Name */, "name": "eof" }, { "type": 9 /* Name */, "name": "define" }, { "type": 9 /* Name */, "name": "rpar" }, { "type": 0 /* String */, "value": "#parenmatch" }, { "type": 9 /* Name */, "name": "ket" }, { "type": 0 /* String */, "value": "#bramatch" }, { "type": 9 /* Name */, "name": "not" }, { "type": 9 /* Name */, "name": "semi" }, falsity, { "type": 0 /* String */, "value": "#junk" }]
                }, { "type": 9 /* Name */, "name": "_set" }, { "type": 4 /* Funcode */, "name": "parser", "arity": 0, "ops": [3, 20, 23, 5, 3, 20, 23, 13], "rands": [1, 0, 0, 134217728, 2, 0, 0, 134217728] }, {
                    "type": 4 /* Funcode */,
                    "name": "flatten",
                    "arity": 1,
                    "ops": [6, 21, 24, 4, 1, 20, 2, 22, 7, 22, 23, 13],
                    "rands": [0, 1, 1, 0, 0, 2, 0, 0, 134217728, 1, 2, 134217728],
                    "consts": [{
                        "type": 4 /* Funcode */,
                        "name": "flat",
                        "arity": 2,
                        "ops": [2, 9, 16, 2, 13, 2, 9, 17, 9, 6, 15, 18, 4, 0, 20, 3, 22, 2, 22, 1, 22, 23, 13, 5, 0, 20, 2, 22, 2, 22, 23, 13],
                        "rands": [0, 5, 134217728, 1, 134217728, 0, 24, 134217728, 23, 0, 134217728, 134217728, 0, 1, 3, 0, 0, 1, 1, 0, 2, 3, 134217728, 134217728, 2, 2, 0, 0, 1, 1, 2, 134217728],
                        "consts": [{ "type": 9 /* Name */, "name": "seq" }, { "type": 9 /* Name */, "name": "foldr" }, { "type": 9 /* Name */, "name": ":" }]
                    }]
                }, {
                    "type": 4 /* Funcode */,
                    "name": "assemble",
                    "arity": 3,
                    "ops": [0, 20, 23, 4, 6, 21, 1, 22, 24, 4, 6, 21, 1, 22, 24, 4, 6, 21, 1, 22, 24, 4, 6, 21, 1, 22, 24, 4, 0, 20, 2, 22, 2, 22, 1, 20, 1, 20, 6, 22, 2, 22, 7, 22, 23, 22, 23, 22, 23, 13],
                    "rands": [0, 0, 0, 0, 1, 2, 0, 1, 2, 1, 2, 2, 0, 1, 2, 2, 3, 2, 1, 1, 2, 3, 4, 2, 3, 1, 2, 4, 5, 3, 0, 0, 1, 1, 4, 1, 2, 3, 6, 0, 2, 1, 134217728, 2, 3, 0, 1, 2, 3, 134217728],
                    "consts": [{ "type": 9 /* Name */, "name": "_hash" }, { "type": 4 /* Funcode */, "name": "fixlab", "arity": 1, "ops": [0, 20, 3, 22, 2, 22, 23, 13], "rands": [0, 2, 1, 0, 0, 1, 2, 134217728], "consts": [{ "type": 9 /* Name */, "name": "_lookup" }] }, {
                        "type": 4 /* Funcode */,
                        "name": "pass1",
                        "arity": 3,
                        "ops": [2, 9, 16, 2, 13, 2, 9, 17, 4, 18, 4, 0, 20, 1, 22, 23, 11, 0, 20, 3, 22, 1, 22, 2, 22, 23, 5, 2, 1, 2, 19, 2, 9, 17, 4, 18, 4, 0, 20, 2, 22, 6, 22, 23, 1, 0, 20, 1, 22, 2, 22, 23, 19, 10],
                        "rands": [1, 5, 134217728, 2, 134217728, 1, 31, 134217728, 0, 134217728, 1, 0, 1, 0, 0, 1, 31, 1, 3, 1, 0, 0, 1, 0, 2, 3, 134217728, 0, 1, 2, 3, 1, 53, 134217728, 0, 134217728, 1, 2, 2, 0, 0, 3, 1, 2, 1, 4, 2, 0, 0, 2, 1, 2, 3, 134217728],
                        "consts": [{ "type": 9 /* Name */, "name": "numeric" }, { "type": 9 /* Name */, "name": "_update" }, { "type": 9 /* Name */, "name": "+" }, { "type": 3 /* Number */, "value": 1 }, { "type": 9 /* Name */, "name": ":" }]
                    }, {
                        "type": 4 /* Funcode */,
                        "name": "fixup",
                        "arity": 1,
                        "ops": [2, 9, 17, 9, 6, 15, 18, 9, 17, 4, 18, 9, 16, 6, 3, 20, 1, 22, 23, 7, 8, 8, 13, 5, 2, 9, 17, 9, 6, 15, 18, 9, 17, 4, 18, 9, 16, 6, 3, 20, 1, 22, 23, 7, 8, 8, 13, 5, 2, 9, 17, 9, 6, 15, 18, 9, 17, 4, 18, 9, 16, 6, 3, 20, 1, 22, 23, 7, 8, 8, 13, 5, 2, 13],
                        "rands": [0, 24, 134217728, 23, 0, 134217728, 134217728, 24, 134217728, 0, 134217728, 24, 134217728, 0, 1, 1, 0, 0, 1, 134217728, 134217728, 134217728, 134217728, 134217728, 0, 48, 134217728, 47, 1, 134217728, 134217728, 48, 134217728, 0, 134217728, 48, 134217728, 1, 1, 1, 0, 0, 1, 134217728, 134217728, 134217728, 134217728, 134217728, 0, 72, 134217728, 71, 2, 134217728, 134217728, 72, 134217728, 0, 134217728, 72, 134217728, 2, 1, 1, 0, 0, 1, 134217728, 134217728, 134217728, 134217728, 134217728, 0, 134217728],
                        "consts": [{ "type": 9 /* Name */, "name": "JUMP" }, { "type": 9 /* Name */, "name": "JFALSE" }, { "type": 9 /* Name */, "name": "TRAP" }]
                    }, {
                        "type": 4 /* Funcode */,
                        "name": "pass2",
                        "arity": 1,
                        "ops": [0, 20, 6, 21, 3, 22, 24, 22, 7, 22, 2, 22, 23, 13],
                        "rands": [0, 3, 1, 2, 1, 1, 2, 0, 134217728, 1, 0, 2, 3, 134217728],
                        "consts": [{ "type": 9 /* Name */, "name": "foldl" }, { "type": 4 /* Funcode */, "name": "<function>", "arity": 2, "ops": [0, 20, 3, 20, 2, 22, 23, 22, 2, 22, 23, 13], "rands": [0, 2, 1, 1, 1, 0, 1, 0, 0, 1, 2, 134217728], "consts": [{ "type": 9 /* Name */, "name": ":" }] }]
                    }, { "type": 9 /* Name */, "name": "_assemble" }, { "type": 3 /* Number */, "value": 0 }]
                }, {
                    "type": 4 /* Funcode */,
                    "name": "lookup",
                    "arity": 2,
                    "ops": [2, 9, 17, 5, 18, 9, 17, 5, 18, 9, 17, 4, 18, 9, 17, 5, 18, 9, 17, 5, 18, 9, 16, 0, 20, 2, 22, 0, 20, 1, 22, 23, 22, 23, 13, 10],
                    "rands": [1, 35, 134217728, 134217728, 134217728, 35, 134217728, 134217728, 134217728, 35, 134217728, 0, 134217728, 35, 134217728, 134217728, 134217728, 35, 134217728, 134217728, 134217728, 35, 134217728, 0, 2, 0, 0, 1, 1, 0, 0, 1, 1, 2, 134217728, 134217728],
                    "consts": [{ "type": 9 /* Name */, "name": "assoc" }, { "type": 9 /* Name */, "name": "_get" }]
                }, {
                    "type": 4 /* Funcode */,
                    "name": "empty",
                    "arity": 0,
                    "ops": [6, 6, 0, 20, 7, 22, 23, 0, 20, 7, 22, 23, 0, 20, 6, 22, 23, 7, 8, 8, 8, 8, 8, 13],
                    "rands": [0, 0, 1, 1, 134217728, 0, 1, 1, 1, 134217728, 0, 1, 1, 1, 0, 0, 1, 134217728, 134217728, 134217728, 134217728, 134217728, 134217728, 134217728],
                    "consts": [{ "type": 3 /* Number */, "value": 0 }, { "type": 9 /* Name */, "name": "_new" }]
                }, {
                    "type": 4 /* Funcode */,
                    "name": "newblock",
                    "arity": 3,
                    "ops": [2, 9, 17, 4, 18, 9, 17, 5, 18, 9, 17, 4, 18, 9, 17, 5, 18, 9, 17, 5, 18, 9, 16, 0, 20, 2, 22, 6, 22, 23, 11, 7, 12, 2, 0, 20, 1, 22, 6, 22, 23, 6, 6, 7, 8, 8, 8, 7, 8, 8, 7, 8, 4, 0, 20, 1, 22, 6, 22, 23, 2, 0, 20, 0, 20, 1, 22, 0, 20, 1, 22, 23, 22, 23, 22, 23, 0, 20, 7, 22, 23, 0, 20, 6, 22, 23, 7, 8, 8, 8, 8, 8, 13, 10],
                    "rands": [2, 93, 134217728, 0, 134217728, 93, 134217728, 134217728, 134217728, 93, 134217728, 1, 134217728, 93, 134217728, 134217728, 134217728, 93, 134217728, 134217728, 134217728, 93, 134217728, 0, 2, 0, 0, 1, 1, 2, 33, 134217728, 52, 0, 2, 2, 0, 0, 3, 1, 2, 4, 5, 134217728, 134217728, 134217728, 134217728, 134217728, 134217728, 134217728, 134217728, 134217728, 2, 2, 2, 0, 0, 3, 1, 2, 1, 6, 1, 7, 2, 2, 0, 8, 1, 1, 0, 1, 1, 2, 0, 1, 6, 1, 134217728, 0, 1, 6, 1, 5, 0, 1, 134217728, 134217728, 134217728, 134217728, 134217728, 134217728, 134217728, 134217728],
                    "consts": [{ "type": 9 /* Name */, "name": "=" }, { "type": 0 /* String */, "value": "<function>" }, { "type": 9 /* Name */, "name": "+" }, { "type": 3 /* Number */, "value": 1 }, { "type": 9 /* Name */, "name": "FVAR" }, { "type": 3 /* Number */, "value": 0 }, { "type": 9 /* Name */, "name": "_new" }, { "type": 9 /* Name */, "name": "++" }, { "type": 9 /* Name */, "name": "_get" }]
                }, { "type": 4 /* Funcode */, "name": "e_level", "arity": 1, "ops": [2, 9, 17, 4, 18, 9, 17, 5, 18, 9, 17, 5, 18, 9, 17, 5, 18, 9, 17, 5, 18, 9, 16, 1, 13, 10], "rands": [0, 25, 134217728, 0, 134217728, 25, 134217728, 134217728, 134217728, 25, 134217728, 134217728, 134217728, 25, 134217728, 134217728, 134217728, 25, 134217728, 134217728, 134217728, 25, 134217728, 0, 134217728, 134217728] }, { "type": 4 /* Funcode */, "name": "e_arity", "arity": 1, "ops": [2, 9, 17, 5, 18, 9, 17, 4, 18, 9, 17, 5, 18, 9, 17, 5, 18, 9, 17, 5, 18, 9, 16, 1, 13, 10], "rands": [0, 25, 134217728, 134217728, 134217728, 25, 134217728, 0, 134217728, 25, 134217728, 134217728, 134217728, 25, 134217728, 134217728, 134217728, 25, 134217728, 134217728, 134217728, 25, 134217728, 0, 134217728, 134217728] }, { "type": 4 /* Funcode */, "name": "e_fvars", "arity": 1, "ops": [2, 9, 17, 5, 18, 9, 17, 5, 18, 9, 17, 5, 18, 9, 17, 4, 18, 9, 17, 5, 18, 9, 16, 0, 20, 1, 22, 23, 13, 10], "rands": [0, 29, 134217728, 134217728, 134217728, 29, 134217728, 134217728, 134217728, 29, 134217728, 134217728, 134217728, 29, 134217728, 0, 134217728, 29, 134217728, 134217728, 134217728, 29, 134217728, 0, 1, 0, 0, 1, 134217728, 134217728], "consts": [{ "type": 9 /* Name */, "name": "_get" }] }, { "type": 4 /* Funcode */, "name": "e_size", "arity": 1, "ops": [2, 9, 17, 5, 18, 9, 17, 5, 18, 9, 17, 5, 18, 9, 17, 5, 18, 9, 17, 4, 18, 9, 16, 0, 20, 1, 22, 23, 13, 10], "rands": [0, 29, 134217728, 134217728, 134217728, 29, 134217728, 134217728, 134217728, 29, 134217728, 134217728, 134217728, 29, 134217728, 134217728, 134217728, 29, 134217728, 0, 134217728, 29, 134217728, 0, 1, 0, 0, 1, 134217728, 134217728], "consts": [{ "type": 9 /* Name */, "name": "_get" }] }, {
                    "type": 4 /* Funcode */,
                    "name": "inc_size",
                    "arity": 2,
                    "ops": [2, 9, 17, 5, 18, 9, 17, 5, 18, 9, 17, 5, 18, 9, 17, 5, 18, 9, 17, 4, 18, 9, 16, 0, 20, 1, 22, 0, 20, 0, 20, 1, 22, 23, 22, 2, 22, 23, 22, 23, 13, 10],
                    "rands": [0, 41, 134217728, 134217728, 134217728, 41, 134217728, 134217728, 134217728, 41, 134217728, 134217728, 134217728, 41, 134217728, 134217728, 134217728, 41, 134217728, 0, 134217728, 41, 134217728, 0, 2, 0, 0, 1, 2, 2, 1, 0, 0, 1, 0, 1, 1, 2, 1, 2, 134217728, 134217728],
                    "consts": [{ "type": 9 /* Name */, "name": "_set" }, { "type": 9 /* Name */, "name": "+" }, { "type": 9 /* Name */, "name": "_get" }]
                }, {
                    "type": 4 /* Funcode */,
                    "name": "bind",
                    "arity": 4,
                    "ops": [2, 9, 17, 4, 18, 9, 17, 5, 18, 9, 17, 4, 18, 9, 17, 5, 18, 9, 17, 5, 18, 9, 16, 0, 20, 1, 22, 0, 20, 2, 1, 2, 2, 7, 8, 8, 8, 7, 8, 8, 22, 0, 20, 1, 22, 23, 22, 23, 22, 23, 13, 10],
                    "rands": [3, 51, 134217728, 0, 134217728, 51, 134217728, 134217728, 134217728, 51, 134217728, 1, 134217728, 51, 134217728, 134217728, 134217728, 51, 134217728, 134217728, 134217728, 51, 134217728, 0, 2, 1, 0, 1, 2, 0, 0, 1, 2, 134217728, 134217728, 134217728, 134217728, 134217728, 134217728, 134217728, 0, 2, 1, 1, 0, 1, 1, 2, 1, 2, 134217728, 134217728],
                    "consts": [{ "type": 9 /* Name */, "name": "_set" }, { "type": 9 /* Name */, "name": ":" }, { "type": 9 /* Name */, "name": "_get" }]
                }, {
                    "type": 4 /* Funcode */,
                    "name": "unbind",
                    "arity": 2,
                    "ops": [2, 9, 17, 5, 18, 9, 17, 5, 18, 9, 17, 4, 18, 9, 17, 5, 18, 9, 17, 5, 18, 9, 16, 6, 21, 2, 22, 24, 4, 0, 20, 1, 22, 1, 20, 0, 20, 1, 22, 23, 22, 23, 22, 23, 13, 10],
                    "rands": [1, 45, 134217728, 134217728, 134217728, 45, 134217728, 134217728, 134217728, 45, 134217728, 0, 134217728, 45, 134217728, 134217728, 134217728, 45, 134217728, 134217728, 134217728, 45, 134217728, 0, 2, 0, 1, 2, 1, 1, 2, 0, 0, 1, 1, 2, 1, 0, 0, 1, 0, 1, 1, 2, 134217728, 134217728],
                    "consts": [{
                        "type": 4 /* Funcode */,
                        "name": "h",
                        "arity": 1,
                        "ops": [2, 9, 17, 9, 17, 4, 18, 9, 17, 5, 18, 9, 16, 18, 4, 0, 20, 3, 22, 1, 22, 23, 11, 1, 13, 5, 2, 9, 17, 4, 18, 4, 0, 20, 1, 22, 3, 20, 1, 22, 23, 22, 23, 13, 2, 9, 16, 7, 13, 10],
                        "rands": [0, 26, 134217728, 25, 134217728, 0, 134217728, 25, 134217728, 134217728, 134217728, 25, 134217728, 134217728, 1, 0, 2, 1, 0, 0, 1, 2, 26, 1, 134217728, 134217728, 0, 44, 134217728, 0, 134217728, 1, 1, 2, 0, 0, 0, 1, 1, 0, 1, 1, 2, 134217728, 0, 49, 134217728, 134217728, 134217728, 134217728],
                        "consts": [{ "type": 9 /* Name */, "name": "=" }, { "type": 9 /* Name */, "name": ":" }]
                    }, { "type": 9 /* Name */, "name": "_set" }, { "type": 9 /* Name */, "name": "_get" }]
                }, {
                    "type": 4 /* Funcode */,
                    "name": "alloc",
                    "arity": 2,
                    "ops": [3, 20, 2, 22, 23, 4, 3, 20, 2, 22, 6, 22, 1, 22, 2, 22, 23, 5, 3, 20, 2, 22, 6, 22, 23, 5, 1, 13],
                    "rands": [1, 1, 1, 0, 1, 0, 2, 4, 0, 0, 0, 1, 0, 2, 1, 3, 4, 134217728, 3, 2, 1, 0, 1, 1, 2, 134217728, 0, 134217728],
                    "consts": [{ "type": 9 /* Name */, "name": "LOCAL" }, { "type": 3 /* Number */, "value": 1 }]
                }, { "type": 4 /* Funcode */, "name": "dealloc", "arity": 2, "ops": [3, 20, 2, 22, 2, 22, 23, 5, 3, 20, 2, 22, 6, 22, 23, 13], "rands": [1, 2, 0, 0, 1, 1, 2, 134217728, 2, 2, 1, 0, 0, 1, 2, 134217728], "consts": [{ "type": 3 /* Number */, "value": -1 }] }, {
                    "type": 4 /* Funcode */,
                    "name": "alloc_fv",
                    "arity": 2,
                    "ops": [2, 9, 17, 5, 18, 9, 17, 5, 18, 9, 17, 5, 18, 9, 17, 4, 18, 9, 17, 5, 18, 9, 16, 0, 20, 0, 20, 0, 20, 1, 22, 23, 22, 23, 22, 6, 22, 23, 4, 0, 20, 1, 22, 0, 20, 0, 20, 1, 22, 23, 22, 2, 7, 8, 22, 23, 22, 23, 5, 1, 13, 10],
                    "rands": [1, 61, 134217728, 134217728, 134217728, 61, 134217728, 134217728, 134217728, 61, 134217728, 134217728, 134217728, 61, 134217728, 0, 134217728, 61, 134217728, 134217728, 134217728, 61, 134217728, 0, 2, 1, 1, 2, 1, 0, 0, 1, 0, 1, 0, 3, 1, 2, 1, 4, 2, 0, 0, 5, 2, 2, 1, 0, 0, 1, 0, 0, 134217728, 134217728, 1, 2, 1, 2, 134217728, 1, 134217728, 134217728],
                    "consts": [{ "type": 9 /* Name */, "name": "+" }, { "type": 9 /* Name */, "name": "length" }, { "type": 9 /* Name */, "name": "_get" }, { "type": 3 /* Number */, "value": 1 }, { "type": 9 /* Name */, "name": "_set" }, { "type": 9 /* Name */, "name": "++" }]
                }, {
                    "type": 4 /* Funcode */,
                    "name": "islocal",
                    "arity": 2,
                    "ops": [6, 21, 3, 22, 2, 22, 24, 4, 1, 20, 3, 20, 2, 22, 2, 22, 23, 22, 23, 13],
                    "rands": [0, 3, 1, 1, 1, 2, 3, 0, 0, 1, 2, 2, 0, 0, 1, 1, 2, 0, 1, 134217728],
                    "consts": [{
                        "type": 4 /* Funcode */,
                        "name": "case",
                        "arity": 1,
                        "ops": [2, 9, 17, 4, 18, 9, 17, 4, 18, 9, 17, 5, 18, 9, 16, 0, 20, 1, 22, 6, 22, 23, 11, 6, 12, 0, 20, 1, 22, 6, 22, 23, 11, 0, 20, 1, 22, 3, 20, 3, 22, 23, 22, 23, 13, 0, 13],
                        "rands": [0, 45, 134217728, 0, 134217728, 45, 134217728, 1, 134217728, 45, 134217728, 134217728, 134217728, 45, 134217728, 0, 2, 1, 0, 1, 1, 2, 25, 2, 32, 0, 2, 1, 0, 3, 1, 2, 45, 0, 2, 0, 0, 1, 1, 2, 0, 1, 1, 2, 134217728, 4, 134217728],
                        "consts": [{ "type": 9 /* Name */, "name": "=" }, { "type": 9 /* Name */, "name": "LOCAL" }, truth, { "type": 9 /* Name */, "name": "ARG" }, { "type": 9 /* Name */, "name": "false" }]
                    }]
                }, {
                    "type": 4 /* Funcode */,
                    "name": "selfrec",
                    "arity": 2,
                    "ops": [0, 20, 3, 20, 2, 22, 2, 22, 23, 22, 3, 20, 2, 22, 23, 6, 6, 7, 8, 8, 8, 22, 23, 13],
                    "rands": [0, 2, 2, 2, 0, 0, 1, 1, 2, 0, 1, 1, 1, 0, 1, 1, 2, 134217728, 134217728, 134217728, 134217728, 1, 2, 134217728],
                    "consts": [{ "type": 9 /* Name */, "name": "=" }, { "type": 9 /* Name */, "name": "FVAR" }, { "type": 3 /* Number */, "value": 0 }]
                }, {
                    "type": 4 /* Funcode */,
                    "name": "reset",
                    "arity": 1,
                    "ops": [2, 9, 17, 4, 18, 9, 17, 5, 18, 9, 17, 4, 18, 9, 17, 5, 18, 9, 17, 4, 18, 9, 16, 6, 21, 1, 22, 24, 4, 0, 20, 1, 22, 0, 20, 1, 22, 0, 20, 1, 22, 23, 22, 23, 22, 23, 5, 0, 20, 1, 22, 6, 22, 23, 13, 10],
                    "rands": [0, 55, 134217728, 0, 134217728, 55, 134217728, 134217728, 134217728, 55, 134217728, 1, 134217728, 55, 134217728, 134217728, 134217728, 55, 134217728, 2, 134217728, 55, 134217728, 0, 2, 0, 1, 2, 3, 1, 2, 1, 0, 2, 2, 3, 0, 3, 1, 1, 0, 1, 1, 2, 1, 2, 134217728, 1, 2, 2, 0, 4, 1, 2, 134217728, 134217728],
                    "consts": [{
                        "type": 4 /* Funcode */,
                        "name": "h",
                        "arity": 1,
                        "ops": [2, 9, 17, 5, 18, 9, 17, 9, 17, 4, 18, 9, 17, 4, 18, 9, 17, 5, 18, 9, 16, 18, 9, 16, 0, 20, 1, 22, 6, 22, 23, 11, 6, 12, 0, 20, 1, 22, 6, 22, 23, 11, 0, 20, 1, 22, 3, 22, 23, 13, 5, 0, 13],
                        "rands": [0, 51, 134217728, 134217728, 134217728, 51, 134217728, 50, 134217728, 0, 134217728, 50, 134217728, 1, 134217728, 50, 134217728, 134217728, 134217728, 50, 134217728, 134217728, 51, 134217728, 0, 2, 1, 0, 1, 1, 2, 34, 2, 41, 0, 2, 1, 0, 3, 1, 2, 51, 4, 2, 0, 0, 1, 1, 2, 134217728, 134217728, 5, 134217728],
                        "consts": [{ "type": 9 /* Name */, "name": "=" }, { "type": 9 /* Name */, "name": "LOCAL" }, truth, { "type": 9 /* Name */, "name": "ARG" }, { "type": 9 /* Name */, "name": "<" }, { "type": 9 /* Name */, "name": "true" }]
                    }, { "type": 9 /* Name */, "name": "_set" }, { "type": 9 /* Name */, "name": "filter" }, { "type": 9 /* Name */, "name": "_get" }, { "type": 3 /* Number */, "value": 0 }]
                }, {
                    "type": 4 /* Funcode */,
                    "name": "label",
                    "arity": 0,
                    "ops": [0, 20, 3, 22, 0, 20, 0, 20, 3, 22, 23, 22, 6, 22, 23, 22, 23, 13],
                    "rands": [0, 2, 1, 0, 1, 2, 2, 1, 1, 0, 1, 0, 3, 1, 2, 1, 2, 134217728],
                    "consts": [{ "type": 9 /* Name */, "name": "_set" }, { "type": 9 /* Name */, "name": "+" }, { "type": 9 /* Name */, "name": "_get" }, { "type": 3 /* Number */, "value": 1 }]
                }, {
                    "type": 4 /* Funcode */,
                    "name": "c_ref",
                    "arity": 2,
                    "ops": [6, 21, 3, 22, 2, 22, 3, 22, 2, 22, 3, 22, 24, 4, 1, 20, 3, 20, 2, 22, 2, 22, 23, 22, 23, 13],
                    "rands": [0, 6, 3, 1, 1, 2, 2, 3, 0, 4, 1, 5, 6, 0, 0, 1, 4, 2, 0, 0, 1, 1, 2, 0, 1, 134217728],
                    "consts": [{
                        "type": 4 /* Funcode */,
                        "name": "case",
                        "arity": 1,
                        "ops": [2, 9, 17, 4, 18, 9, 17, 4, 18, 9, 17, 4, 18, 9, 16, 0, 20, 1, 22, 3, 20, 3, 22, 23, 22, 23, 11, 6, 12, 0, 20, 1, 22, 6, 22, 23, 11, 1, 1, 7, 8, 8, 13, 2, 9, 17, 5, 18, 9, 17, 5, 18, 9, 17, 5, 18, 9, 16, 3, 20, 3, 22, 3, 22, 23, 4, 3, 20, 3, 22, 6, 22, 1, 22, 3, 22, 23, 5, 6, 1, 7, 8, 8, 13, 2, 9, 16, 6, 3, 7, 8, 8, 13, 10],
                        "rands": [0, 43, 134217728, 0, 134217728, 43, 134217728, 1, 134217728, 43, 134217728, 2, 134217728, 43, 134217728, 0, 2, 0, 0, 1, 1, 2, 0, 1, 1, 2, 29, 1, 36, 0, 2, 1, 0, 2, 1, 2, 43, 1, 2, 134217728, 134217728, 134217728, 134217728, 0, 84, 134217728, 134217728, 134217728, 84, 134217728, 134217728, 134217728, 84, 134217728, 134217728, 134217728, 84, 134217728, 3, 2, 4, 0, 2, 1, 2, 0, 5, 4, 4, 0, 3, 1, 0, 2, 2, 3, 4, 134217728, 3, 0, 134217728, 134217728, 134217728, 134217728, 0, 93, 134217728, 4, 4, 134217728, 134217728, 134217728, 134217728, 134217728],
                        "consts": [{ "type": 9 /* Name */, "name": "=" }, truth, { "type": 9 /* Name */, "name": "QUOTE" }, { "type": 9 /* Name */, "name": "FVAR" }, { "type": 9 /* Name */, "name": "GLOBAL" }]
                    }]
                }, {
                    "type": 4 /* Funcode */,
                    "name": "sortby",
                    "arity": 2,
                    "ops": [6, 21, 2, 22, 24, 4, 0, 20, 1, 22, 7, 22, 2, 22, 23, 13],
                    "rands": [0, 2, 0, 1, 2, 0, 1, 3, 0, 0, 134217728, 1, 1, 2, 3, 134217728],
                    "consts": [{
                        "type": 4 /* Funcode */,
                        "name": "insert",
                        "arity": 2,
                        "ops": [2, 9, 16, 2, 7, 8, 13, 2, 9, 17, 4, 18, 4, 0, 20, 3, 20, 2, 22, 23, 22, 3, 20, 1, 22, 23, 22, 23, 11, 0, 20, 2, 22, 0, 20, 1, 22, 1, 22, 23, 22, 23, 13, 0, 20, 1, 22, 3, 20, 2, 22, 1, 22, 23, 22, 23, 13, 10],
                        "rands": [1, 7, 134217728, 0, 134217728, 134217728, 134217728, 1, 57, 134217728, 0, 134217728, 1, 0, 2, 1, 1, 0, 0, 1, 0, 1, 1, 0, 0, 1, 1, 2, 43, 1, 2, 0, 0, 1, 2, 0, 0, 1, 1, 2, 1, 2, 134217728, 1, 2, 0, 0, 0, 2, 0, 0, 1, 1, 2, 1, 2, 134217728, 134217728],
                        "consts": [{ "type": 9 /* Name */, "name": "<=" }, { "type": 9 /* Name */, "name": ":" }]
                    }, { "type": 9 /* Name */, "name": "foldr" }]
                }, {
                    "type": 4 /* Funcode */,
                    "name": "pgen",
                    "arity": 3,
                    "ops": [6, 2, 0, 20, 6, 22, 0, 20, 3, 22, 2, 22, 23, 22, 23, 7, 8, 8, 8, 0, 20, 2, 22, 0, 20, 0, 20, 3, 22, 2, 22, 23, 22, 23, 22, 23, 7, 8, 8, 13],
                    "rands": [0, 0, 1, 2, 0, 0, 2, 2, 1, 0, 1, 1, 2, 1, 2, 134217728, 134217728, 134217728, 134217728, 3, 2, 2, 0, 4, 1, 2, 2, 2, 0, 1, 1, 2, 0, 1, 1, 2, 134217728, 134217728, 134217728, 134217728],
                    "consts": [{ "type": 9 /* Name */, "name": "seq" }, { "type": 9 /* Name */, "name": ":" }, { "type": 9 /* Name */, "name": "map" }, { "type": 9 /* Name */, "name": "++" }, { "type": 9 /* Name */, "name": "concat" }]
                }, {
                    "type": 4 /* Funcode */,
                    "name": "c_patt",
                    "arity": 3,
                    "ops": [2, 9, 17, 9, 6, 15, 18, 9, 17, 4, 18, 9, 16, 3, 20, 23, 4, 3, 20, 6, 6, 1, 7, 8, 8, 6, 1, 7, 8, 8, 6, 7, 8, 7, 8, 8, 8, 8, 22, 7, 22, 1, 2, 7, 8, 8, 7, 8, 22, 23, 13, 5, 2, 9, 17, 9, 6, 15, 18, 9, 17, 4, 18, 9, 16, 3, 20, 23, 4, 3, 20, 1, 22, 2, 22, 23, 11, 3, 20, 6, 6, 1, 7, 8, 8, 3, 20, 1, 22, 2, 22, 23, 6, 7, 8, 7, 8, 8, 8, 8, 22, 7, 22, 1, 2, 7, 8, 8, 7, 8, 22, 23, 13, 3, 20, 6, 6, 3, 20, 1, 22, 2, 22, 23, 7, 8, 8, 7, 8, 8, 22, 7, 22, 7, 22, 23, 13, 5, 2, 9, 17, 9, 6, 15, 18, 9, 16, 3, 20, 6, 7, 8, 22, 7, 22, 7, 22, 23, 13, 5, 2, 9, 17, 9, 6, 15, 18, 9, 17, 4, 18, 4, 3, 20, 23, 4, 0, 20, 1, 22, 23, 4, 3, 20, 6, 6, 1, 7, 8, 8, 3, 20, 1, 22, 2, 22, 23, 6, 1, 7, 8, 8, 7, 8, 8, 8, 8, 22, 0, 20, 0, 20, 6, 21, 3, 22, 2, 22, 24, 22, 3, 20, 2, 22, 1, 22, 23, 22, 7, 22, 23, 22, 23, 22, 1, 2, 7, 8, 8, 7, 8, 22, 23, 13, 5, 2, 9, 17, 9, 6, 15, 18, 9, 17, 4, 18, 9, 17, 9, 17, 9, 6, 15, 18, 9, 16, 18, 9, 16, 3, 20, 23, 4, 3, 20, 6, 6, 1, 7, 8, 8, 6, 7, 8, 7, 8, 8, 8, 22, 3, 20, 1, 22, 0, 20, 2, 22, 6, 22, 23, 22, 2, 22, 23, 6, 7, 8, 7, 7, 8, 8, 7, 8, 8, 22, 1, 2, 7, 8, 8, 7, 8, 22, 23, 13, 5, 5, 2, 9, 17, 9, 6, 15, 18, 9, 17, 4, 18, 9, 17, 4, 18, 9, 16, 3, 20, 23, 4, 3, 20, 6, 6, 1, 7, 8, 8, 6, 7, 8, 7, 8, 8, 8, 22, 3, 20, 1, 22, 0, 20, 2, 22, 6, 22, 23, 22, 2, 22, 23, 6, 7, 8, 7, 7, 8, 8, 3, 20, 1, 22, 2, 22, 2, 22, 23, 7, 8, 8, 8, 22, 1, 2, 7, 8, 8, 7, 8, 22, 23, 13, 5, 2, 9, 17, 9, 6, 15, 18, 9, 16, 3, 20, 23, 4, 3, 20, 6, 6, 1, 7, 8, 8, 6, 7, 8, 7, 8, 8, 8, 22, 7, 22, 1, 2, 7, 8, 8, 7, 8, 22, 23, 13, 5, 2, 9, 17, 9, 6, 15, 18, 4, 3, 20, 1, 22, 23, 2, 2, 19, 5, 2, 9, 17, 9, 6, 15, 18, 9, 17, 4, 18, 9, 17, 4, 18, 9, 16, 3, 20, 23, 4, 3, 20, 6, 6, 1, 7, 8, 8, 6, 1, 7, 8, 8, 7, 8, 8, 8, 22, 3, 20, 1, 22, 2, 22, 2, 22, 23, 7, 8, 22, 1, 2, 7, 8, 8, 7, 8, 22, 23, 13, 5, 10],
                    "rands": [0, 52, 134217728, 51, 0, 134217728, 134217728, 52, 134217728, 0, 134217728, 52, 134217728, 1, 0, 0, 1, 2, 3, 1, 2, 1, 134217728, 134217728, 134217728, 3, 0, 134217728, 134217728, 134217728, 4, 134217728, 134217728, 134217728, 134217728, 134217728, 134217728, 134217728, 0, 134217728, 1, 1, 1, 134217728, 134217728, 134217728, 134217728, 134217728, 2, 3, 134217728, 134217728, 0, 138, 134217728, 137, 5, 134217728, 134217728, 138, 134217728, 0, 134217728, 138, 134217728, 1, 0, 0, 1, 3, 2, 0, 0, 2, 1, 2, 113, 2, 3, 1, 2, 1, 134217728, 134217728, 134217728, 4, 2, 0, 0, 2, 1, 2, 4, 134217728, 134217728, 134217728, 134217728, 134217728, 134217728, 134217728, 0, 134217728, 1, 1, 1, 134217728, 134217728, 134217728, 134217728, 134217728, 2, 3, 134217728, 2, 3, 1, 6, 5, 2, 0, 0, 2, 1, 2, 134217728, 134217728, 134217728, 134217728, 134217728, 134217728, 0, 134217728, 1, 134217728, 2, 3, 134217728, 134217728, 0, 160, 134217728, 159, 7, 134217728, 134217728, 160, 134217728, 2, 3, 8, 134217728, 134217728, 0, 134217728, 1, 134217728, 2, 3, 134217728, 134217728, 0, 245, 134217728, 244, 9, 134217728, 134217728, 245, 134217728, 0, 134217728, 1, 1, 0, 0, 2, 10, 1, 1, 0, 1, 3, 2, 3, 1, 2, 2, 134217728, 134217728, 134217728, 4, 2, 0, 0, 2, 1, 2, 11, 3, 134217728, 134217728, 134217728, 134217728, 134217728, 134217728, 134217728, 134217728, 0, 12, 1, 13, 3, 14, 3, 0, 1, 2, 2, 3, 0, 6, 2, 1, 0, 1, 1, 2, 1, 134217728, 2, 3, 0, 1, 1, 2, 1, 134217728, 134217728, 134217728, 134217728, 134217728, 2, 3, 134217728, 134217728, 0, 327, 134217728, 326, 15, 134217728, 134217728, 327, 134217728, 0, 134217728, 327, 134217728, 326, 134217728, 325, 7, 134217728, 134217728, 326, 134217728, 134217728, 327, 134217728, 1, 0, 0, 1, 2, 3, 1, 2, 1, 134217728, 134217728, 134217728, 16, 134217728, 134217728, 134217728, 134217728, 134217728, 134217728, 0, 0, 3, 0, 0, 17, 2, 1, 0, 18, 1, 2, 1, 2, 2, 3, 8, 134217728, 134217728, 134217728, 134217728, 134217728, 134217728, 134217728, 134217728, 134217728, 1, 1, 1, 134217728, 134217728, 134217728, 134217728, 134217728, 2, 3, 134217728, 134217728, 134217728, 0, 411, 134217728, 410, 15, 134217728, 134217728, 411, 134217728, 0, 134217728, 411, 134217728, 1, 134217728, 411, 134217728, 1, 0, 0, 2, 2, 3, 1, 2, 2, 134217728, 134217728, 134217728, 16, 134217728, 134217728, 134217728, 134217728, 134217728, 134217728, 0, 0, 3, 0, 0, 17, 2, 1, 0, 18, 1, 2, 1, 2, 2, 3, 19, 134217728, 134217728, 134217728, 134217728, 134217728, 134217728, 0, 3, 1, 0, 1, 1, 2, 2, 3, 134217728, 134217728, 134217728, 134217728, 1, 2, 1, 134217728, 134217728, 134217728, 134217728, 134217728, 2, 3, 134217728, 134217728, 0, 453, 134217728, 452, 20, 134217728, 134217728, 453, 134217728, 1, 0, 0, 0, 2, 3, 1, 2, 0, 134217728, 134217728, 134217728, 21, 134217728, 134217728, 134217728, 134217728, 134217728, 134217728, 0, 134217728, 1, 0, 1, 134217728, 134217728, 134217728, 134217728, 134217728, 2, 3, 134217728, 134217728, 0, 470, 134217728, 469, 22, 134217728, 134217728, 0, 7, 1, 0, 0, 1, 1, 2, 3, 134217728, 0, 532, 134217728, 531, 23, 134217728, 134217728, 532, 134217728, 0, 134217728, 532, 134217728, 1, 134217728, 532, 134217728, 1, 0, 0, 2, 2, 3, 1, 2, 2, 134217728, 134217728, 134217728, 24, 1, 134217728, 134217728, 134217728, 134217728, 134217728, 134217728, 134217728, 0, 0, 3, 0, 0, 1, 1, 2, 2, 3, 134217728, 134217728, 1, 2, 1, 134217728, 134217728, 134217728, 134217728, 134217728, 2, 3, 134217728, 134217728, 134217728],
                    "consts": [{ "type": 9 /* Name */, "name": "const" }, { "type": 9 /* Name */, "name": "seq" }, { "type": 9 /* Name */, "name": "TRAP" }, { "type": 9 /* Name */, "name": "QUOTE" }, { "type": 9 /* Name */, "name": "MEQ" }, { "type": 9 /* Name */, "name": "var" }, { "type": 9 /* Name */, "name": "BIND" }, { "type": 9 /* Name */, "name": "anon" }, { "type": 9 /* Name */, "name": "POP" }, { "type": 9 /* Name */, "name": "prim" }, { "type": 9 /* Name */, "name": "length" }, { "type": 9 /* Name */, "name": "MPRIM" }, { "type": 9 /* Name */, "name": "reverse" }, { "type": 9 /* Name */, "name": "_mapa" }, { "type": 4 /* Funcode */, "name": "<function>", "arity": 2, "ops": [2, 9, 17, 4, 18, 9, 17, 4, 18, 9, 16, 3, 20, 1, 22, 1, 22, 3, 22, 23, 2, 8, 13, 2, 13], "rands": [0, 23, 134217728, 0, 134217728, 23, 134217728, 1, 134217728, 23, 134217728, 1, 3, 1, 0, 0, 1, 2, 2, 3, 1, 134217728, 134217728, 1, 134217728] }, { "type": 9 /* Name */, "name": "cons" }, { "type": 9 /* Name */, "name": "MCONS" }, { "type": 9 /* Name */, "name": "+" }, { "type": 3 /* Number */, "value": 1 }, { "type": 9 /* Name */, "name": "GETTAIL" }, { "type": 9 /* Name */, "name": "nil" }, { "type": 9 /* Name */, "name": "MNIL" }, { "type": 9 /* Name */, "name": "list" }, { "type": 9 /* Name */, "name": "plus" }, { "type": 9 /* Name */, "name": "MPLUS" }]
                }, {
                    "type": 4 /* Funcode */,
                    "name": "c_arg",
                    "arity": 3,
                    "ops": [2, 9, 17, 9, 6, 15, 18, 9, 17, 4, 18, 9, 16, 0, 20, 3, 20, 1, 22, 2, 22, 23, 22, 23, 11, 3, 20, 1, 22, 6, 22, 2, 22, 2, 22, 23, 5, 3, 20, 7, 22, 7, 22, 7, 22, 23, 13, 5, 2, 9, 17, 9, 6, 15, 18, 9, 16, 3, 20, 7, 22, 7, 22, 7, 22, 23, 13, 5, 3, 20, 6, 6, 2, 7, 8, 8, 7, 8, 8, 22, 3, 20, 2, 22, 6, 22, 2, 22, 23, 7, 8, 22, 7, 22, 23, 13],
                    "rands": [1, 48, 134217728, 47, 0, 134217728, 134217728, 48, 134217728, 0, 134217728, 48, 134217728, 1, 1, 1, 2, 0, 0, 2, 1, 2, 0, 1, 48, 2, 4, 0, 0, 2, 1, 0, 2, 2, 3, 4, 134217728, 3, 3, 134217728, 0, 134217728, 1, 134217728, 2, 3, 134217728, 134217728, 1, 68, 134217728, 67, 3, 134217728, 134217728, 68, 134217728, 3, 3, 134217728, 0, 134217728, 1, 134217728, 2, 3, 134217728, 134217728, 3, 3, 4, 2, 0, 134217728, 134217728, 134217728, 134217728, 134217728, 134217728, 0, 4, 3, 1, 0, 5, 1, 2, 2, 3, 134217728, 134217728, 1, 134217728, 2, 3, 134217728],
                    "consts": [{ "type": 9 /* Name */, "name": "var" }, { "type": 9 /* Name */, "name": "not" }, { "type": 9 /* Name */, "name": "ARG" }, { "type": 9 /* Name */, "name": "anon" }, { "type": 9 /* Name */, "name": "seq" }, { "type": 3 /* Number */, "value": 0 }]
                }, {
                    "type": 4 /* Funcode */,
                    "name": "c_match",
                    "arity": 2,
                    "ops": [6, 21, 3, 22, 2, 22, 24, 4, 1, 20, 6, 22, 2, 22, 23, 4, 0, 20, 6, 22, 0, 20, 3, 22, 1, 22, 23, 22, 23, 0, 20, 0, 20, 3, 22, 1, 22, 23, 22, 23, 7, 8, 8, 13],
                    "rands": [0, 3, 1, 1, 1, 2, 3, 0, 0, 2, 1, 0, 0, 1, 2, 1, 2, 2, 3, 0, 4, 2, 2, 0, 1, 1, 2, 1, 2, 5, 1, 4, 2, 3, 0, 1, 1, 2, 0, 1, 134217728, 134217728, 134217728, 134217728],
                    "consts": [{
                        "type": 4 /* Funcode */,
                        "name": "compile",
                        "arity": 2,
                        "ops": [2, 9, 16, 7, 13, 2, 9, 17, 4, 18, 4, 3, 20, 2, 22, 1, 22, 3, 22, 23, 4, 0, 20, 1, 22, 3, 20, 0, 20, 2, 22, 6, 22, 23, 22, 1, 22, 23, 22, 23, 13, 10],
                        "rands": [1, 5, 134217728, 134217728, 134217728, 1, 41, 134217728, 0, 134217728, 1, 1, 3, 0, 0, 0, 1, 2, 2, 3, 2, 0, 2, 2, 0, 0, 2, 1, 2, 0, 0, 2, 1, 2, 0, 1, 1, 2, 1, 2, 134217728, 134217728],
                        "consts": [{ "type": 9 /* Name */, "name": ":" }, { "type": 9 /* Name */, "name": "+" }, { "type": 3 /* Number */, "value": 1 }]
                    }, { "type": 3 /* Number */, "value": 0 }, { "type": 9 /* Name */, "name": ":" }, { "type": 9 /* Name */, "name": "seq" }, { "type": 9 /* Name */, "name": "map" }, { "type": 9 /* Name */, "name": "concat" }]
                }, {
                    "type": 4 /* Funcode */,
                    "name": "c_rule",
                    "arity": 2,
                    "ops": [2, 9, 17, 4, 18, 9, 17, 4, 18, 9, 16, 0, 20, 3, 22, 23, 4, 3, 20, 1, 22, 2, 22, 23, 4, 1, 20, 1, 22, 2, 22, 0, 22, 23, 4, 3, 20, 2, 22, 23, 5, 6, 3, 20, 1, 22, 23, 1, 7, 8, 8, 8, 3, 20, 1, 22, 23, 7, 8, 8, 13, 2, 9, 17, 4, 18, 9, 17, 4, 18, 9, 17, 4, 18, 9, 16, 3, 20, 23, 4, 0, 20, 3, 22, 23, 4, 3, 20, 1, 22, 2, 22, 23, 4, 1, 20, 1, 22, 2, 22, 0, 22, 23, 4, 1, 20, 1, 22, 2, 22, 0, 22, 23, 4, 3, 20, 2, 22, 23, 5, 6, 3, 20, 1, 22, 23, 1, 6, 1, 7, 8, 8, 1, 7, 8, 8, 8, 8, 8, 0, 20, 1, 6, 7, 8, 8, 22, 3, 20, 1, 22, 23, 22, 23, 7, 8, 8, 13, 10],
                    "rands": [0, 61, 134217728, 0, 134217728, 61, 134217728, 1, 134217728, 61, 134217728, 0, 1, 1, 0, 1, 2, 2, 2, 0, 0, 1, 1, 2, 3, 2, 3, 1, 0, 1, 1, 1, 2, 3, 4, 3, 1, 1, 0, 1, 134217728, 2, 4, 1, 3, 0, 1, 4, 134217728, 134217728, 134217728, 134217728, 5, 1, 3, 0, 1, 134217728, 134217728, 134217728, 134217728, 0, 158, 134217728, 0, 134217728, 158, 134217728, 1, 134217728, 158, 134217728, 2, 134217728, 158, 134217728, 6, 0, 0, 3, 0, 1, 1, 0, 1, 4, 2, 2, 0, 0, 1, 1, 2, 5, 4, 3, 1, 0, 1, 1, 3, 2, 3, 6, 4, 3, 2, 0, 1, 1, 1, 2, 3, 7, 3, 1, 1, 0, 1, 134217728, 2, 4, 1, 5, 0, 1, 6, 4, 3, 134217728, 134217728, 134217728, 7, 134217728, 134217728, 134217728, 134217728, 134217728, 134217728, 5, 2, 3, 6, 134217728, 134217728, 134217728, 0, 5, 1, 5, 0, 1, 1, 2, 134217728, 134217728, 134217728, 134217728, 134217728],
                    "consts": [{ "type": 9 /* Name */, "name": "_get" }, { "type": 9 /* Name */, "name": "true" }, { "type": 9 /* Name */, "name": "seq" }, { "type": 9 /* Name */, "name": "false" }, { "type": 9 /* Name */, "name": "JFALSE" }, { "type": 9 /* Name */, "name": ":" }, { "type": 3 /* Number */, "value": 0 }]
                }, {
                    "type": 4 /* Funcode */,
                    "name": "c_traps",
                    "arity": 1,
                    "ops": [6, 21, 24, 4, 0, 20, 6, 22, 1, 20, 6, 22, 2, 22, 7, 22, 23, 22, 23, 13],
                    "rands": [0, 1, 1, 0, 1, 2, 2, 0, 0, 3, 3, 0, 0, 1, 134217728, 2, 3, 1, 2, 134217728],
                    "consts": [{
                        "type": 4 /* Funcode */,
                        "name": "h",
                        "arity": 3,
                        "ops": [2, 9, 16, 2, 13, 2, 9, 17, 9, 17, 4, 18, 9, 17, 4, 18, 9, 16, 18, 4, 0, 20, 2, 22, 1, 22, 23, 11, 1, 1, 0, 20, 1, 22, 2, 22, 23, 19, 0, 20, 2, 22, 6, 22, 23, 0, 20, 1, 1, 7, 8, 8, 22, 1, 22, 23, 0, 20, 6, 7, 8, 22, 2, 22, 23, 19, 5, 10],
                        "rands": [1, 5, 134217728, 2, 134217728, 1, 67, 134217728, 66, 134217728, 0, 134217728, 66, 134217728, 1, 134217728, 66, 134217728, 134217728, 2, 0, 2, 0, 0, 1, 1, 2, 38, 1, 2, 1, 2, 0, 0, 2, 1, 2, 3, 2, 2, 0, 0, 3, 1, 2, 1, 2, 0, 1, 134217728, 134217728, 134217728, 0, 2, 1, 2, 1, 2, 4, 134217728, 134217728, 0, 2, 1, 2, 3, 134217728, 134217728],
                        "consts": [{ "type": 9 /* Name */, "name": "=" }, { "type": 9 /* Name */, "name": ":" }, { "type": 9 /* Name */, "name": "+" }, { "type": 3 /* Number */, "value": 1 }, { "type": 9 /* Name */, "name": "POP" }]
                    }, { "type": 9 /* Name */, "name": ":" }, { "type": 9 /* Name */, "name": "seq" }, { "type": 3 /* Number */, "value": 0 }]
                }, {
                    "type": 4 /* Funcode */,
                    "name": "c_body",
                    "arity": 2,
                    "ops": [2, 9, 16, 6, 7, 8, 13, 2, 9, 17, 4, 18, 4, 3, 20, 1, 22, 2, 22, 23, 4, 0, 20, 3, 22, 3, 20, 1, 22, 23, 22, 23, 4, 3, 20, 3, 22, 3, 20, 1, 22, 23, 22, 23, 4, 6, 3, 20, 1, 22, 23, 0, 20, 1, 22, 7, 22, 23, 11, 7, 12, 6, 3, 20, 1, 22, 23, 3, 20, 1, 22, 2, 22, 23, 7, 8, 8, 8, 7, 8, 8, 8, 13, 10],
                    "rands": [0, 7, 134217728, 0, 134217728, 134217728, 134217728, 0, 83, 134217728, 0, 134217728, 1, 1, 2, 0, 0, 1, 1, 2, 2, 1, 2, 3, 0, 2, 1, 2, 0, 1, 1, 2, 3, 4, 2, 2, 0, 2, 1, 2, 0, 1, 1, 2, 4, 2, 3, 1, 2, 0, 1, 3, 2, 4, 0, 134217728, 1, 2, 61, 134217728, 78, 2, 5, 1, 4, 0, 1, 0, 2, 1, 0, 1, 1, 2, 134217728, 134217728, 134217728, 134217728, 134217728, 134217728, 134217728, 134217728, 134217728, 134217728],
                    "consts": [{ "type": 9 /* Name */, "name": "FAIL" }, { "type": 9 /* Name */, "name": "map" }, { "type": 9 /* Name */, "name": "seq" }, { "type": 9 /* Name */, "name": "=" }]
                }, {
                    "type": 4 /* Funcode */,
                    "name": "c_closure",
                    "arity": 4,
                    "ops": [3, 20, 2, 22, 2, 22, 2, 22, 23, 4, 3, 20, 3, 20, 2, 22, 1, 22, 23, 22, 23, 4, 3, 20, 1, 22, 23, 4, 0, 20, 1, 22, 23, 4, 3, 20, 6, 22, 1, 22, 23, 5, 6, 6, 3, 20, 2, 22, 2, 22, 1, 22, 23, 7, 8, 8, 6, 0, 20, 1, 22, 6, 22, 23, 7, 8, 8, 0, 20, 6, 22, 0, 20, 6, 21, 3, 22, 2, 22, 24, 22, 3, 20, 6, 22, 1, 22, 23, 22, 7, 22, 23, 22, 23, 6, 0, 20, 1, 22, 6, 22, 23, 7, 8, 8, 7, 8, 8, 8, 8, 8, 13],
                    "rands": [1, 3, 0, 0, 1, 1, 3, 2, 3, 0, 2, 1, 3, 2, 2, 0, 0, 1, 2, 0, 1, 1, 4, 1, 0, 0, 1, 2, 0, 1, 2, 0, 1, 3, 5, 2, 1, 0, 1, 1, 2, 134217728, 2, 3, 6, 3, 0, 0, 1, 1, 1, 2, 3, 134217728, 134217728, 134217728, 4, 5, 2, 3, 0, 1, 1, 2, 134217728, 134217728, 134217728, 6, 2, 2, 0, 7, 3, 8, 3, 8, 1, 3, 2, 3, 0, 7, 2, 1, 0, 2, 1, 2, 1, 134217728, 2, 3, 1, 2, 9, 5, 2, 3, 0, 1, 1, 2, 134217728, 134217728, 134217728, 134217728, 134217728, 134217728, 134217728, 134217728, 134217728, 134217728],
                    "consts": [{ "type": 9 /* Name */, "name": "length" }, { "type": 3 /* Number */, "value": 1 }, { "type": 9 /* Name */, "name": "seq" }, { "type": 9 /* Name */, "name": "QUOTE" }, { "type": 9 /* Name */, "name": "FRAME" }, { "type": 9 /* Name */, "name": "+" }, { "type": 9 /* Name */, "name": ":" }, { "type": 9 /* Name */, "name": "_mapa" }, {
                        "type": 4 /* Funcode */,
                        "name": "<function>",
                        "arity": 2,
                        "ops": [2, 9, 17, 4, 18, 9, 17, 4, 18, 9, 16, 6, 3, 20, 1, 22, 3, 22, 23, 6, 1, 7, 8, 8, 7, 8, 8, 8, 2, 8, 13, 2, 13],
                        "rands": [0, 31, 134217728, 0, 134217728, 31, 134217728, 1, 134217728, 31, 134217728, 0, 1, 2, 1, 0, 2, 1, 2, 1, 0, 134217728, 134217728, 134217728, 134217728, 134217728, 134217728, 134217728, 1, 134217728, 134217728, 1, 134217728],
                        "consts": [{ "type": 9 /* Name */, "name": "seq" }, { "type": 9 /* Name */, "name": "PUTARG" }]
                    }, { "type": 9 /* Name */, "name": "CLOSURE" }]
                }, {
                    "type": 4 /* Funcode */,
                    "name": "yield",
                    "arity": 2,
                    "ops": [2, 11, 6, 2, 6, 7, 8, 7, 8, 8, 8, 13, 2, 13],
                    "rands": [1, 12, 0, 0, 1, 134217728, 134217728, 134217728, 134217728, 134217728, 134217728, 134217728, 0, 134217728],
                    "consts": [{ "type": 9 /* Name */, "name": "seq" }, { "type": 9 /* Name */, "name": "RETURN" }]
                }, {
                    "type": 4 /* Funcode */,
                    "name": "c_exp",
                    "arity": 3,
                    "ops": [2, 9, 17, 9, 6, 15, 18, 9, 17, 4, 18, 9, 16, 3, 20, 6, 1, 7, 8, 8, 22, 2, 22, 23, 13, 5, 2, 9, 17, 9, 6, 15, 18, 9, 17, 4, 18, 9, 16, 3, 20, 3, 20, 1, 22, 2, 22, 23, 22, 2, 22, 23, 13, 5, 2, 9, 17, 9, 6, 15, 18, 9, 17, 9, 17, 9, 6, 15, 18, 9, 17, 4, 18, 9, 16, 18, 4, 2, 11, 3, 20, 1, 22, 2, 22, 23, 12, 6, 11, 0, 20, 0, 20, 1, 22, 23, 22, 3, 20, 2, 22, 23, 22, 23, 12, 6, 11, 6, 0, 20, 6, 22, 0, 20, 6, 21, 3, 22, 2, 22, 24, 22, 1, 22, 7, 22, 23, 22, 23, 6, 0, 20, 1, 22, 23, 7, 8, 8, 7, 8, 8, 8, 13, 5, 5, 2, 9, 17, 9, 6, 15, 18, 9, 17, 4, 18, 4, 0, 20, 1, 22, 23, 4, 3, 20, 6, 3, 20, 1, 22, 2, 22, 0, 22, 23, 6, 1, 7, 8, 8, 0, 20, 6, 22, 0, 20, 6, 21, 3, 22, 2, 22, 24, 22, 3, 20, 6, 22, 1, 22, 23, 22, 7, 22, 23, 22, 23, 6, 1, 7, 8, 8, 7, 8, 8, 8, 8, 8, 22, 2, 22, 23, 13, 5, 2, 9, 17, 9, 6, 15, 18, 9, 17, 4, 18, 9, 17, 4, 18, 9, 17, 4, 18, 9, 16, 3, 20, 23, 4, 3, 20, 23, 4, 2, 11, 6, 3, 20, 1, 22, 2, 22, 0, 22, 23, 6, 1, 7, 8, 8, 3, 20, 1, 22, 2, 22, 0, 22, 23, 1, 3, 20, 1, 22, 2, 22, 0, 22, 23, 7, 8, 8, 8, 8, 8, 8, 13, 6, 3, 20, 1, 22, 2, 22, 0, 22, 23, 6, 1, 7, 8, 8, 3, 20, 1, 22, 2, 22, 0, 22, 23, 6, 1, 7, 8, 8, 1, 3, 20, 1, 22, 2, 22, 0, 22, 23, 1, 7, 8, 8, 8, 8, 8, 8, 8, 8, 13, 5, 2, 9, 17, 9, 6, 15, 18, 9, 17, 9, 17, 9, 6, 15, 18, 9, 17, 4, 18, 9, 17, 9, 17, 9, 6, 15, 18, 9, 17, 4, 18, 9, 16, 18, 9, 16, 18, 9, 17, 4, 18, 9, 16, 3, 20, 1, 22, 6, 22, 1, 22, 2, 22, 23, 5, 3, 20, 1, 22, 2, 22, 2, 22, 23, 4, 3, 20, 1, 22, 2, 22, 23, 5, 1, 13, 5, 5, 5, 2, 9, 17, 9, 6, 15, 18, 9, 17, 9, 17, 9, 6, 15, 18, 9, 17, 4, 18, 9, 17, 4, 18, 9, 16, 18, 9, 17, 4, 18, 9, 16, 3, 20, 1, 22, 2, 22, 0, 22, 23, 4, 3, 20, 1, 22, 2, 22, 23, 4, 3, 20, 1, 22, 2, 22, 2, 22, 23, 4, 3, 20, 1, 22, 2, 22, 23, 5, 6, 1, 6, 1, 7, 8, 8, 1, 7, 8, 8, 8, 8, 13, 5, 5, 2, 9, 17, 9, 6, 15, 18, 9, 17, 9, 17, 9, 6, 15, 18, 9, 17, 4, 18, 9, 17, 4, 18, 9, 17, 4, 18, 9, 16, 18, 9, 17, 4, 18, 9, 16, 3, 20, 1, 22, 1, 22, 1, 22, 2, 22, 23, 4, 3, 20, 1, 22, 2, 22, 23, 4, 3, 20, 1, 22, 2, 22, 2, 22, 23, 4, 3, 20, 1, 22, 2, 22, 23, 5, 6, 1, 6, 1, 7, 8, 8, 1, 7, 8, 8, 8, 8, 13, 5, 5, 2, 9, 17, 9, 6, 15, 18, 9, 17, 4, 18, 9, 17, 4, 18, 9, 16, 3, 20, 3, 20, 6, 22, 1, 22, 1, 22, 2, 22, 23, 22, 2, 22, 23, 13, 5, 2, 9, 17, 9, 6, 15, 18, 9, 17, 4, 18, 9, 17, 4, 18, 9, 16, 3, 20, 6, 3, 20, 1, 22, 2, 22, 0, 22, 23, 3, 20, 1, 22, 2, 22, 0, 22, 23, 6, 7, 8, 7, 8, 8, 8, 8, 22, 2, 22, 23, 13, 5, 2, 9, 17, 9, 6, 15, 18, 9, 16, 3, 20, 6, 7, 8, 22, 2, 22, 23, 13, 5, 2, 9, 17, 9, 6, 15, 18, 4, 3, 20, 1, 22, 23, 2, 2, 19, 5, 2, 9, 17, 9, 6, 15, 18, 9, 17, 4, 18, 9, 17, 4, 18, 9, 16, 6, 3, 20, 1, 22, 2, 22, 0, 22, 23, 6, 7, 8, 3, 20, 1, 22, 2, 22, 2, 22, 23, 7, 8, 8, 8, 8, 13, 5, 10],
                    "rands": [0, 26, 134217728, 25, 0, 134217728, 134217728, 26, 134217728, 0, 134217728, 26, 134217728, 1, 2, 1, 0, 134217728, 134217728, 134217728, 0, 2, 1, 2, 134217728, 134217728, 0, 54, 134217728, 53, 2, 134217728, 134217728, 54, 134217728, 0, 134217728, 54, 134217728, 1, 2, 2, 2, 0, 0, 1, 1, 2, 0, 2, 1, 2, 134217728, 134217728, 0, 145, 134217728, 144, 3, 134217728, 134217728, 145, 134217728, 144, 134217728, 143, 2, 134217728, 134217728, 144, 134217728, 0, 134217728, 144, 134217728, 134217728, 1, 2, 87, 3, 2, 0, 0, 1, 1, 2, 88, 4, 105, 5, 2, 6, 1, 1, 0, 1, 0, 4, 1, 1, 0, 1, 1, 2, 106, 4, 145, 7, 8, 2, 7, 0, 9, 3, 10, 3, 0, 1, 1, 2, 3, 0, 1, 1, 134217728, 2, 3, 1, 2, 11, 6, 1, 1, 0, 1, 134217728, 134217728, 134217728, 134217728, 134217728, 134217728, 134217728, 134217728, 134217728, 134217728, 0, 224, 134217728, 223, 3, 134217728, 134217728, 224, 134217728, 0, 134217728, 1, 6, 1, 1, 0, 1, 2, 1, 2, 7, 0, 3, 0, 0, 1, 1, 12, 2, 3, 13, 2, 134217728, 134217728, 134217728, 8, 2, 7, 0, 9, 3, 14, 3, 0, 1, 1, 2, 3, 0, 5, 2, 15, 0, 1, 1, 2, 1, 134217728, 2, 3, 1, 2, 16, 2, 134217728, 134217728, 134217728, 134217728, 134217728, 134217728, 134217728, 134217728, 134217728, 0, 2, 1, 2, 134217728, 134217728, 0, 348, 134217728, 347, 17, 134217728, 134217728, 348, 134217728, 0, 134217728, 348, 134217728, 1, 134217728, 348, 134217728, 2, 134217728, 348, 134217728, 6, 0, 0, 3, 6, 0, 0, 4, 2, 297, 7, 0, 3, 0, 0, 1, 1, 12, 2, 3, 18, 3, 134217728, 134217728, 134217728, 0, 3, 1, 0, 1, 1, 19, 2, 3, 3, 0, 3, 2, 0, 1, 1, 19, 2, 3, 134217728, 134217728, 134217728, 134217728, 134217728, 134217728, 134217728, 134217728, 7, 0, 3, 0, 0, 1, 1, 12, 2, 3, 18, 3, 134217728, 134217728, 134217728, 0, 3, 1, 0, 1, 1, 12, 2, 3, 20, 4, 134217728, 134217728, 134217728, 3, 0, 3, 2, 0, 1, 1, 12, 2, 3, 4, 134217728, 134217728, 134217728, 134217728, 134217728, 134217728, 134217728, 134217728, 134217728, 134217728, 134217728, 0, 426, 134217728, 425, 21, 134217728, 134217728, 426, 134217728, 425, 134217728, 424, 22, 134217728, 134217728, 425, 134217728, 0, 134217728, 425, 134217728, 424, 134217728, 423, 0, 134217728, 134217728, 424, 134217728, 1, 134217728, 424, 134217728, 134217728, 425, 134217728, 134217728, 426, 134217728, 2, 134217728, 426, 134217728, 7, 4, 0, 0, 1, 1, 1, 2, 1, 3, 4, 134217728, 0, 3, 2, 0, 1, 1, 2, 2, 3, 3, 8, 2, 0, 0, 1, 1, 2, 134217728, 3, 134217728, 134217728, 134217728, 134217728, 0, 510, 134217728, 509, 21, 134217728, 134217728, 510, 134217728, 509, 134217728, 508, 22, 134217728, 134217728, 509, 134217728, 0, 134217728, 509, 134217728, 1, 134217728, 509, 134217728, 134217728, 510, 134217728, 2, 134217728, 510, 134217728, 0, 3, 1, 0, 1, 1, 12, 2, 3, 3, 9, 2, 0, 0, 1, 1, 2, 4, 0, 3, 2, 0, 1, 1, 2, 2, 3, 5, 10, 2, 0, 0, 1, 1, 2, 134217728, 7, 3, 23, 4, 134217728, 134217728, 134217728, 5, 134217728, 134217728, 134217728, 134217728, 134217728, 134217728, 134217728, 134217728, 0, 600, 134217728, 599, 21, 134217728, 134217728, 600, 134217728, 599, 134217728, 598, 24, 134217728, 134217728, 599, 134217728, 0, 134217728, 599, 134217728, 1, 134217728, 599, 134217728, 2, 134217728, 599, 134217728, 134217728, 600, 134217728, 3, 134217728, 600, 134217728, 11, 4, 0, 0, 1, 1, 2, 2, 1, 3, 4, 4, 9, 2, 0, 0, 1, 1, 2, 5, 0, 3, 3, 0, 1, 1, 2, 2, 3, 6, 10, 2, 0, 0, 1, 1, 2, 134217728, 7, 4, 23, 5, 134217728, 134217728, 134217728, 6, 134217728, 134217728, 134217728, 134217728, 134217728, 134217728, 134217728, 134217728, 0, 636, 134217728, 635, 25, 134217728, 134217728, 636, 134217728, 0, 134217728, 636, 134217728, 1, 134217728, 636, 134217728, 1, 2, 11, 4, 26, 0, 0, 1, 1, 2, 1, 3, 4, 0, 2, 1, 2, 134217728, 134217728, 0, 688, 134217728, 687, 27, 134217728, 134217728, 688, 134217728, 0, 134217728, 688, 134217728, 1, 134217728, 688, 134217728, 1, 2, 7, 0, 3, 0, 0, 1, 1, 12, 2, 3, 0, 3, 1, 0, 1, 1, 12, 2, 3, 28, 134217728, 134217728, 134217728, 134217728, 134217728, 134217728, 134217728, 0, 2, 1, 2, 134217728, 134217728, 0, 708, 134217728, 707, 29, 134217728, 134217728, 708, 134217728, 1, 2, 30, 134217728, 134217728, 0, 2, 1, 2, 134217728, 134217728, 0, 725, 134217728, 724, 31, 134217728, 134217728, 0, 12, 1, 0, 0, 1, 1, 2, 3, 134217728, 0, 771, 134217728, 770, 7, 134217728, 134217728, 771, 134217728, 0, 134217728, 771, 134217728, 1, 134217728, 771, 134217728, 7, 0, 3, 0, 0, 1, 1, 12, 2, 3, 32, 134217728, 134217728, 0, 3, 1, 0, 1, 1, 2, 2, 3, 134217728, 134217728, 134217728, 134217728, 134217728, 134217728, 134217728, 134217728],
                    "consts": [{ "type": 9 /* Name */, "name": "const" }, { "type": 9 /* Name */, "name": "QUOTE" }, { "type": 9 /* Name */, "name": "var" }, { "type": 9 /* Name */, "name": "apply" }, falsity, { "type": 9 /* Name */, "name": "=" }, { "type": 9 /* Name */, "name": "length" }, { "type": 9 /* Name */, "name": "seq" }, { "type": 9 /* Name */, "name": ":" }, { "type": 9 /* Name */, "name": "_mapa" }, { "type": 4 /* Funcode */, "name": "<function>", "arity": 2, "ops": [3, 20, 2, 22, 3, 22, 0, 22, 23, 2, 8, 13], "rands": [1, 3, 0, 0, 2, 1, 0, 2, 3, 1, 134217728, 134217728], "consts": [{ "type": 9 /* Name */, "name": "false" }] }, { "type": 9 /* Name */, "name": "TCALL" }, { "type": 9 /* Name */, "name": "false" }, { "type": 9 /* Name */, "name": "PREP" }, {
                        "type": 4 /* Funcode */,
                        "name": "<function>",
                        "arity": 2,
                        "ops": [2, 9, 17, 4, 18, 9, 17, 4, 18, 9, 16, 6, 3, 20, 1, 22, 3, 22, 0, 22, 23, 6, 1, 7, 8, 8, 7, 8, 8, 8, 2, 8, 13, 2, 13],
                        "rands": [0, 33, 134217728, 0, 134217728, 33, 134217728, 1, 134217728, 33, 134217728, 0, 1, 3, 1, 0, 2, 1, 1, 2, 3, 2, 0, 134217728, 134217728, 134217728, 134217728, 134217728, 134217728, 134217728, 1, 134217728, 134217728, 1, 134217728],
                        "consts": [{ "type": 9 /* Name */, "name": "seq" }, { "type": 9 /* Name */, "name": "false" }, { "type": 9 /* Name */, "name": "PUTARG" }]
                    }, { "type": 3 /* Number */, "value": 0 }, { "type": 9 /* Name */, "name": "CALL" }, { "type": 9 /* Name */, "name": "if" }, { "type": 9 /* Name */, "name": "JFALSE" }, { "type": 9 /* Name */, "name": "true" }, { "type": 9 /* Name */, "name": "JUMP" }, { "type": 9 /* Name */, "name": "let" }, { "type": 9 /* Name */, "name": "val" }, { "type": 9 /* Name */, "name": "BIND" }, { "type": 9 /* Name */, "name": "fun" }, { "type": 9 /* Name */, "name": "function" }, { "type": 0 /* String */, "value": "<function>" }, { "type": 9 /* Name */, "name": "cons" }, { "type": 9 /* Name */, "name": "CONS" }, { "type": 9 /* Name */, "name": "nil" }, { "type": 9 /* Name */, "name": "NIL" }, { "type": 9 /* Name */, "name": "list" }, { "type": 9 /* Name */, "name": "POP" }]
                }, {
                    "type": 4 /* Funcode */,
                    "name": "i_func",
                    "arity": 4,
                    "ops": [3, 20, 3, 20, 2, 22, 3, 20, 2, 22, 2, 22, 2, 22, 23, 22, 23, 22, 23, 4, 3, 20, 6, 22, 1, 22, 23, 5, 0, 20, 3, 20, 2, 22, 2, 22, 1, 22, 23, 22, 23, 13],
                    "rands": [1, 1, 2, 2, 2, 0, 3, 3, 0, 0, 1, 1, 3, 2, 3, 1, 2, 0, 1, 0, 4, 2, 0, 0, 0, 1, 2, 134217728, 1, 1, 5, 3, 0, 0, 1, 1, 0, 2, 3, 0, 1, 134217728],
                    "consts": [{ "type": 3 /* Number */, "value": 1 }, { "type": 9 /* Name */, "name": "_closure" }]
                }, {
                    "type": 4 /* Funcode */,
                    "name": "interp",
                    "arity": 2,
                    "ops": [2, 9, 17, 9, 6, 15, 18, 9, 17, 4, 18, 9, 16, 1, 13, 5, 2, 9, 17, 9, 6, 15, 18, 9, 17, 4, 18, 9, 16, 6, 21, 1, 22, 24, 4, 1, 20, 3, 20, 1, 22, 2, 22, 23, 22, 23, 13, 5, 2, 9, 17, 9, 6, 15, 18, 9, 17, 4, 18, 4, 0, 20, 3, 20, 1, 22, 2, 22, 23, 22, 0, 20, 6, 21, 3, 22, 2, 22, 24, 22, 1, 22, 7, 22, 23, 22, 23, 13, 5, 2, 9, 17, 9, 6, 15, 18, 9, 17, 4, 18, 9, 17, 4, 18, 9, 17, 4, 18, 9, 16, 3, 20, 1, 22, 2, 22, 23, 11, 1, 2, 19, 1, 2, 19, 5, 2, 9, 17, 9, 6, 15, 18, 9, 17, 9, 17, 9, 6, 15, 18, 9, 17, 4, 18, 9, 17, 4, 18, 9, 16, 18, 9, 17, 4, 18, 9, 16, 3, 20, 1, 22, 6, 22, 3, 20, 1, 22, 2, 22, 23, 22, 2, 22, 23, 5, 3, 20, 1, 22, 2, 22, 23, 4, 3, 20, 1, 22, 2, 22, 23, 5, 1, 13, 5, 5, 2, 9, 17, 9, 6, 15, 18, 9, 17, 9, 17, 9, 6, 15, 18, 9, 17, 4, 18, 9, 17, 4, 18, 9, 17, 4, 18, 9, 16, 18, 9, 17, 4, 18, 9, 16, 3, 20, 1, 22, 6, 22, 3, 20, 1, 22, 1, 22, 1, 22, 2, 22, 23, 22, 2, 22, 23, 5, 3, 20, 1, 22, 2, 22, 23, 4, 3, 20, 1, 22, 2, 22, 23, 5, 1, 13, 5, 5, 2, 9, 17, 9, 6, 15, 18, 9, 17, 4, 18, 9, 17, 4, 18, 9, 16, 3, 20, 6, 22, 1, 22, 1, 22, 2, 22, 23, 13, 5, 2, 9, 17, 9, 6, 15, 18, 9, 17, 4, 18, 9, 17, 4, 18, 9, 16, 0, 20, 3, 20, 1, 22, 2, 22, 23, 22, 3, 20, 1, 22, 2, 22, 23, 22, 23, 13, 5, 2, 9, 17, 9, 6, 15, 18, 9, 16, 7, 13, 5, 2, 9, 17, 9, 6, 15, 18, 4, 0, 20, 6, 21, 3, 22, 2, 22, 24, 22, 1, 22, 7, 22, 23, 13, 5, 2, 9, 17, 9, 6, 15, 18, 9, 17, 4, 18, 9, 17, 4, 18, 9, 16, 3, 20, 1, 22, 2, 22, 23, 5, 1, 2, 19, 5, 10],
                    "rands": [0, 16, 134217728, 15, 0, 134217728, 134217728, 16, 134217728, 0, 134217728, 16, 134217728, 0, 134217728, 134217728, 0, 48, 134217728, 47, 1, 134217728, 134217728, 48, 134217728, 0, 134217728, 48, 134217728, 2, 2, 0, 1, 2, 1, 1, 1, 1, 2, 0, 0, 1, 1, 2, 0, 1, 134217728, 134217728, 0, 89, 134217728, 88, 3, 134217728, 134217728, 89, 134217728, 0, 134217728, 1, 4, 2, 0, 2, 0, 0, 1, 1, 2, 0, 5, 3, 6, 3, 0, 1, 1, 2, 3, 0, 1, 1, 134217728, 2, 3, 1, 2, 134217728, 134217728, 0, 125, 134217728, 124, 7, 134217728, 134217728, 125, 134217728, 0, 134217728, 125, 134217728, 1, 134217728, 125, 134217728, 2, 134217728, 125, 134217728, 0, 2, 0, 0, 1, 1, 2, 121, 1, 1, 2, 2, 1, 2, 134217728, 0, 195, 134217728, 194, 8, 134217728, 134217728, 195, 134217728, 194, 134217728, 193, 9, 134217728, 134217728, 194, 134217728, 0, 134217728, 194, 134217728, 1, 134217728, 194, 134217728, 134217728, 195, 134217728, 2, 134217728, 195, 134217728, 2, 4, 0, 0, 10, 1, 0, 2, 1, 0, 1, 1, 2, 2, 1, 3, 4, 134217728, 0, 2, 2, 0, 1, 1, 2, 3, 3, 2, 0, 0, 1, 1, 2, 134217728, 3, 134217728, 134217728, 134217728, 0, 273, 134217728, 272, 8, 134217728, 134217728, 273, 134217728, 272, 134217728, 271, 11, 134217728, 134217728, 272, 134217728, 0, 134217728, 272, 134217728, 1, 134217728, 272, 134217728, 2, 134217728, 272, 134217728, 134217728, 273, 134217728, 3, 134217728, 273, 134217728, 2, 4, 0, 0, 10, 1, 4, 4, 0, 0, 1, 1, 2, 2, 1, 3, 4, 2, 1, 3, 4, 134217728, 0, 2, 3, 0, 1, 1, 2, 4, 3, 2, 0, 0, 1, 1, 2, 134217728, 4, 134217728, 134217728, 134217728, 0, 303, 134217728, 302, 12, 134217728, 134217728, 303, 134217728, 0, 134217728, 303, 134217728, 1, 134217728, 303, 134217728, 4, 4, 13, 0, 0, 1, 1, 2, 1, 3, 4, 134217728, 134217728, 0, 341, 134217728, 340, 14, 134217728, 134217728, 341, 134217728, 0, 134217728, 341, 134217728, 1, 134217728, 341, 134217728, 15, 2, 0, 2, 0, 0, 1, 1, 2, 0, 0, 2, 1, 0, 1, 1, 2, 1, 2, 134217728, 134217728, 0, 353, 134217728, 352, 16, 134217728, 134217728, 353, 134217728, 134217728, 134217728, 134217728, 0, 378, 134217728, 377, 17, 134217728, 134217728, 0, 5, 3, 18, 3, 0, 1, 1, 2, 3, 0, 0, 1, 134217728, 2, 3, 134217728, 134217728, 0, 407, 134217728, 406, 19, 134217728, 134217728, 407, 134217728, 0, 134217728, 407, 134217728, 1, 134217728, 407, 134217728, 0, 2, 0, 0, 1, 1, 2, 134217728, 1, 1, 2, 134217728, 134217728],
                    "consts": [{ "type": 9 /* Name */, "name": "const" }, { "type": 9 /* Name */, "name": "var" }, {
                        "type": 4 /* Funcode */,
                        "name": "case",
                        "arity": 1,
                        "ops": [2, 9, 17, 5, 18, 9, 17, 9, 6, 15, 18, 9, 17, 4, 18, 9, 16, 1, 13, 5, 2, 9, 16, 0, 20, 3, 22, 23, 13, 10],
                        "rands": [0, 20, 134217728, 134217728, 134217728, 20, 134217728, 19, 0, 134217728, 134217728, 20, 134217728, 0, 134217728, 20, 134217728, 0, 134217728, 134217728, 0, 29, 134217728, 1, 1, 1, 0, 1, 134217728, 134217728],
                        "consts": [{ "type": 9 /* Name */, "name": "QUOTE" }, { "type": 9 /* Name */, "name": "_glodef" }]
                    }, { "type": 9 /* Name */, "name": "apply" }, { "type": 9 /* Name */, "name": "_apply" }, { "type": 9 /* Name */, "name": "_mapa" }, { "type": 4 /* Funcode */, "name": "<function>", "arity": 2, "ops": [3, 20, 2, 22, 3, 22, 23, 2, 8, 13], "rands": [1, 2, 0, 0, 2, 1, 2, 1, 134217728, 134217728] }, { "type": 9 /* Name */, "name": "if" }, { "type": 9 /* Name */, "name": "let" }, { "type": 9 /* Name */, "name": "val" }, { "type": 9 /* Name */, "name": "QUOTE" }, { "type": 9 /* Name */, "name": "fun" }, { "type": 9 /* Name */, "name": "function" }, { "type": 0 /* String */, "value": "<function>" }, { "type": 9 /* Name */, "name": "cons" }, { "type": 9 /* Name */, "name": ":" }, { "type": 9 /* Name */, "name": "nil" }, { "type": 9 /* Name */, "name": "list" }, { "type": 4 /* Funcode */, "name": "<function>", "arity": 2, "ops": [3, 20, 2, 22, 3, 22, 23, 2, 8, 13], "rands": [1, 2, 0, 0, 2, 1, 2, 1, 134217728, 134217728] }, { "type": 9 /* Name */, "name": "seq" }]
                }, {
                    "type": 4 /* Funcode */,
                    "name": "exec",
                    "arity": 1,
                    "ops": [2, 9, 17, 9, 6, 15, 18, 9, 17, 4, 18, 9, 17, 4, 18, 9, 16, 0, 20, 1, 22, 23, 5, 0, 20, 1, 22, 3, 20, 1, 22, 3, 20, 23, 22, 23, 22, 23, 13, 5, 2, 9, 17, 9, 6, 15, 18, 9, 17, 4, 18, 9, 17, 4, 18, 9, 17, 4, 18, 9, 16, 0, 20, 1, 22, 23, 5, 0, 20, 1, 22, 3, 20, 1, 22, 1, 22, 1, 22, 3, 20, 23, 22, 23, 22, 23, 13, 5, 0, 20, 3, 20, 2, 22, 3, 20, 23, 22, 23, 22, 23, 13],
                    "rands": [0, 40, 134217728, 39, 0, 134217728, 134217728, 40, 134217728, 0, 134217728, 40, 134217728, 1, 134217728, 40, 134217728, 1, 1, 0, 0, 1, 134217728, 2, 2, 0, 0, 1, 2, 1, 0, 2, 0, 0, 1, 2, 1, 2, 134217728, 134217728, 0, 88, 134217728, 87, 3, 134217728, 134217728, 88, 134217728, 0, 134217728, 88, 134217728, 1, 134217728, 88, 134217728, 2, 134217728, 88, 134217728, 1, 1, 0, 0, 1, 134217728, 2, 2, 0, 0, 3, 4, 0, 0, 1, 1, 2, 2, 2, 0, 0, 3, 4, 1, 2, 134217728, 134217728, 4, 1, 1, 2, 0, 0, 2, 0, 0, 1, 2, 0, 1, 134217728],
                    "consts": [{ "type": 9 /* Name */, "name": "val" }, { "type": 9 /* Name */, "name": "_redefine" }, { "type": 9 /* Name */, "name": "_topdef" }, { "type": 9 /* Name */, "name": "fun" }, { "type": 9 /* Name */, "name": "_topval" }]
                }, {
                    "type": 4 /* Funcode */,
                    "name": "<function>",
                    "arity": 0,
                    "ops": [3, 20, 23, 4, 0, 20, 1, 22, 6, 22, 23, 11, 0, 13, 0, 20, 23, 5, 3, 20, 6, 22, 1, 22, 23, 5, 0, 20, 3, 22, 6, 22, 23, 5, 0, 20, 3, 22, 23, 5, 3, 20, 1, 22, 23, 5, 0, 13],
                    "rands": [1, 0, 0, 0, 0, 2, 0, 0, 1, 1, 2, 14, 2, 134217728, 3, 0, 0, 134217728, 2, 2, 4, 0, 0, 1, 2, 134217728, 5, 2, 3, 0, 4, 1, 2, 134217728, 6, 1, 4, 0, 1, 134217728, 5, 1, 0, 0, 1, 134217728, 7, 134217728],
                    "consts": [{ "type": 9 /* Name */, "name": "=" }, { "type": 9 /* Name */, "name": "eof" }, { "type": 9 /* Name */, "name": "false" }, { "type": 9 /* Name */, "name": "_toptext" }, { "type": 3 /* Number */, "value": 0 }, { "type": 9 /* Name */, "name": "_set" }, { "type": 9 /* Name */, "name": "_setroot" }, { "type": 9 /* Name */, "name": "true" }]
                }] },
                "_infixl": { "type": 4 /* Funcode */, "name": "_infixl", "arity": 2, "ops": [0, 20, 0, 22, 2, 22, 6, 2, 0, 20, 2, 22, 6, 22, 23, 7, 8, 8, 8, 22, 23, 13], "rands": [0, 3, 1, 0, 0, 1, 2, 1, 3, 2, 1, 0, 4, 1, 2, 134217728, 134217728, 134217728, 134217728, 2, 3, 134217728], "consts": [{ "type": 9 /* Name */, "name": "_update" }, { "type": 9 /* Name */, "name": "_syntax" }, { "type": 9 /* Name */, "name": "binop" }, { "type": 9 /* Name */, "name": "+" }, { "type": 3 /* Number */, "value": 1 }] },
                "_infixr": { "type": 4 /* Funcode */, "name": "_infixr", "arity": 2, "ops": [0, 20, 0, 22, 2, 22, 6, 2, 2, 7, 8, 8, 8, 22, 23, 13], "rands": [0, 3, 1, 0, 0, 1, 2, 1, 1, 134217728, 134217728, 134217728, 134217728, 2, 3, 134217728], "consts": [{ "type": 9 /* Name */, "name": "_update" }, { "type": 9 /* Name */, "name": "_syntax" }, { "type": 9 /* Name */, "name": "binop" }] },
                "_lsect": { "type": 4 /* Funcode */, "name": "_lsect", "arity": 2, "ops": [6, 21, 2, 22, 2, 22, 24, 13], "rands": [0, 3, 0, 1, 1, 2, 3, 134217728], "consts": [{ "type": 4 /* Funcode */, "name": "<function>", "arity": 1, "ops": [3, 20, 3, 22, 2, 22, 23, 13], "rands": [1, 2, 2, 0, 0, 1, 2, 134217728] }] },
                "_mapa": { "type": 4 /* Funcode */, "name": "_mapa", "arity": 3, "ops": [2, 9, 16, 2, 13, 2, 9, 17, 4, 18, 4, 2, 20, 1, 22, 3, 20, 2, 22, 1, 22, 2, 22, 23, 22, 23, 13, 10], "rands": [1, 5, 134217728, 2, 134217728, 1, 27, 134217728, 0, 134217728, 1, 0, 2, 0, 0, 0, 3, 0, 0, 1, 1, 2, 2, 3, 1, 2, 134217728, 134217728] },
                "_range": { "type": 4 /* Funcode */, "name": "_range", "arity": 2, "ops": [0, 20, 2, 22, 2, 22, 23, 11, 7, 13, 0, 20, 2, 22, 3, 20, 0, 20, 2, 22, 6, 22, 23, 22, 2, 22, 23, 22, 23, 13], "rands": [0, 2, 0, 0, 1, 1, 2, 10, 134217728, 134217728, 1, 2, 0, 0, 0, 2, 2, 2, 0, 0, 3, 1, 2, 0, 1, 1, 2, 1, 2, 134217728], "consts": [{ "type": 9 /* Name */, "name": ">" }, { "type": 9 /* Name */, "name": ":" }, { "type": 9 /* Name */, "name": "+" }, { "type": 3 /* Number */, "value": 1 }] },
                "_rsect": { "type": 4 /* Funcode */, "name": "_rsect", "arity": 2, "ops": [6, 21, 2, 22, 2, 22, 24, 13], "rands": [0, 3, 0, 1, 1, 2, 3, 134217728], "consts": [{ "type": 4 /* Funcode */, "name": "<function>", "arity": 1, "ops": [3, 20, 2, 22, 3, 22, 23, 13], "rands": [1, 2, 0, 0, 2, 1, 2, 134217728] }] },
                "_top": { "type": 4 /* Funcode */, "name": "_top", "arity": 0, "ops": [0, 20, 23, 4, 1, 20, 23, 13], "rands": [0, 0, 0, 0, 0, 0, 0, 134217728], "consts": [{ "type": 9 /* Name */, "name": "__top" }] },
                "assoc": { "type": 4 /* Funcode */, "name": "assoc", "arity": 2, "ops": [2, 9, 16, 7, 13, 2, 9, 17, 9, 17, 4, 18, 9, 17, 4, 18, 9, 16, 18, 4, 0, 20, 2, 22, 1, 22, 23, 11, 1, 13, 2, 1, 19, 5, 10], "rands": [1, 5, 134217728, 134217728, 134217728, 1, 34, 134217728, 33, 134217728, 0, 134217728, 33, 134217728, 1, 134217728, 33, 134217728, 134217728, 2, 0, 2, 0, 0, 0, 1, 2, 30, 1, 134217728, 0, 2, 2, 134217728, 134217728], "consts": [{ "type": 9 /* Name */, "name": "=" }] },
                "concat": { "type": 4 /* Funcode */, "name": "concat", "arity": 1, "ops": [2, 9, 16, 7, 13, 2, 9, 17, 4, 18, 4, 0, 20, 1, 22, 3, 20, 1, 22, 23, 22, 23, 13, 10], "rands": [0, 5, 134217728, 134217728, 134217728, 0, 23, 134217728, 0, 134217728, 1, 0, 2, 0, 0, 0, 1, 1, 0, 1, 1, 2, 134217728, 134217728], "consts": [{ "type": 9 /* Name */, "name": "++" }] },
                "false": falsity,
                "filter": { "type": 4 /* Funcode */, "name": "filter", "arity": 2, "ops": [2, 9, 16, 7, 13, 2, 9, 17, 4, 18, 4, 2, 20, 1, 22, 23, 11, 0, 20, 1, 22, 3, 20, 2, 22, 1, 22, 23, 22, 23, 13, 2, 1, 19, 10], "rands": [1, 5, 134217728, 134217728, 134217728, 1, 34, 134217728, 0, 134217728, 1, 0, 1, 0, 0, 1, 31, 0, 2, 0, 0, 0, 2, 0, 0, 1, 1, 2, 1, 2, 134217728, 0, 1, 2, 134217728], "consts": [{ "type": 9 /* Name */, "name": ":" }] },
                "foldl": { "type": 4 /* Funcode */, "name": "foldl", "arity": 3, "ops": [2, 9, 16, 2, 13, 2, 9, 17, 4, 18, 4, 2, 2, 20, 2, 22, 1, 22, 23, 1, 19, 10], "rands": [2, 5, 134217728, 1, 134217728, 2, 21, 134217728, 0, 134217728, 1, 0, 0, 2, 1, 0, 0, 1, 2, 1, 3, 134217728] },
                "foldr": { "type": 4 /* Funcode */, "name": "foldr", "arity": 3, "ops": [2, 9, 16, 2, 13, 2, 9, 17, 4, 18, 4, 2, 20, 1, 22, 3, 20, 2, 22, 2, 22, 1, 22, 23, 22, 23, 13, 10], "rands": [2, 5, 134217728, 1, 134217728, 2, 27, 134217728, 0, 134217728, 1, 0, 2, 0, 0, 0, 3, 0, 0, 1, 1, 1, 2, 3, 1, 2, 134217728, 134217728] },
                "length": { "type": 4 /* Funcode */, "name": "length", "arity": 1, "ops": [2, 9, 16, 6, 13, 2, 9, 17, 4, 18, 4, 0, 20, 3, 20, 1, 22, 23, 22, 6, 22, 23, 13, 10], "rands": [0, 5, 134217728, 0, 134217728, 0, 23, 134217728, 0, 134217728, 1, 1, 2, 0, 1, 1, 0, 1, 0, 2, 1, 2, 134217728, 134217728], "consts": [{ "type": 3 /* Number */, "value": 0 }, { "type": 9 /* Name */, "name": "+" }, { "type": 3 /* Number */, "value": 1 }] },
                "map": { "type": 4 /* Funcode */, "name": "map", "arity": 2, "ops": [2, 9, 16, 7, 13, 2, 9, 17, 4, 18, 4, 0, 20, 2, 20, 1, 22, 23, 22, 3, 20, 2, 22, 1, 22, 23, 22, 23, 13, 10], "rands": [1, 5, 134217728, 134217728, 134217728, 1, 29, 134217728, 0, 134217728, 1, 0, 2, 0, 1, 0, 0, 1, 0, 0, 2, 0, 0, 1, 1, 2, 1, 2, 134217728, 134217728], "consts": [{ "type": 9 /* Name */, "name": ":" }] },
                "not": { "type": 4 /* Funcode */, "name": "not", "arity": 1, "ops": [2, 11, 0, 13, 0, 13], "rands": [0, 4, 0, 134217728, 1, 134217728], "consts": [{ "type": 9 /* Name */, "name": "false" }, { "type": 9 /* Name */, "name": "true" }] },
                "reverse": { "type": 4 /* Funcode */, "name": "reverse", "arity": 1, "ops": [6, 21, 24, 4, 1, 20, 2, 22, 7, 22, 23, 13], "rands": [0, 1, 1, 0, 0, 2, 0, 0, 134217728, 1, 2, 134217728], "consts": [{ "type": 4 /* Funcode */, "name": "reva", "arity": 2, "ops": [2, 9, 16, 2, 13, 2, 9, 17, 4, 18, 4, 1, 0, 20, 1, 22, 2, 22, 23, 19, 10], "rands": [0, 5, 134217728, 1, 134217728, 0, 20, 134217728, 0, 134217728, 1, 1, 0, 2, 0, 0, 1, 1, 2, 2, 134217728], "consts": [{ "type": 9 /* Name */, "name": ":" }] }] },
                "true": truth
            };
        })(Bootstrap = Funbase.Bootstrap || (Funbase.Bootstrap = {}));
    })(Funbase = GeomJS.Funbase || (GeomJS.Funbase = {}));
})(GeomJS || (GeomJS = {}));
///<reference path="../references.ts"/>
var GeomJS;
(function (GeomJS) {
    var Common;
    (function (Common) {
        function arraycopy(src, srcStart, dest, destStart, length) {
            for (var i = 0; i < length; i++) {
                dest[destStart + i] = src[srcStart + i];
            }
        }
        Common.arraycopy = arraycopy;
        function objectEquals(x, y) {
            if (x === y) {
                return true;
            }
            if (x && x.type !== undefined && y && y.type !== undefined) {
                if (x.type !== y.type && (x.type !== 9 /* Name */ && y.type !== 9 /* Name */)) {
                    return false;
                }
                else {
                    switch (x.type) {
                        case 1 /* Bool */:
                        case 0 /* String */:
                        case 3 /* Number */:
                            return x.value === y.value;
                        case 5 /* Nil */:
                            return y.type === 5 /* Nil */;
                        case 2 /* List */:
                            if (y.type !== 2 /* List */)
                                return false;
                            var xlist = GeomJS.Funbase.Value.array(x);
                            var ylist = GeomJS.Funbase.Value.array(y);
                            if (xlist.length !== ylist.length)
                                return false;
                            for (var i = 0; i < xlist.length; i++) {
                                if (!objectEquals(xlist[i], ylist[i]))
                                    return false;
                            }
                            return true;
                        case 8 /* Hash */:
                            if (y.type !== 8 /* Hash */)
                                return false;
                            return x.mapping.getIterator() === y.mapping.getIterator();
                        case 7 /* Cell */:
                            if (y.cell !== 7 /* Cell */)
                                return false;
                            return objectEquals(x.value, y.value);
                        case 6 /* Funvalue */:
                        case 4 /* Funcode */:
                        case 9 /* Name */:
                            return x.name === y.name;
                        default:
                            return false;
                    }
                }
            }
            else {
                return false;
            }
        }
        Common.objectEquals = objectEquals;
        function indexOfArr(arr, fnd, eqComp) {
            for (var i = 0; i < arr.length; i++) {
                if (!(i in arr)) {
                    continue;
                }
                if (eqComp(arr[i], fnd)) {
                    return i;
                }
            }
            return -1;
        }
        var Map = (function () {
            function Map(eqComp, init) {
                this.keys = [];
                this.values = [];
                this.index = -1;
                this.eqComp = undefined;
                this.keys = [];
                this.values = [];
                this.eqComp = eqComp;
                if (init) {
                    init.forEach(function (i) {
                        this.set(i[0], i[1]);
                    }, this);
                }
            }
            Map.prototype.get = function (key) {
                return this.has(key) ? this.values[this.index] : undefined;
            };
            Map.prototype.has = function (key) {
                this.index = indexOfArr(this.keys, key, this.eqComp);
                return -1 < this.index;
            };
            Map.prototype.set = function (key, value) {
                this.has(key) ? this.values[this.index] = value : this.values[this.keys.push(key) - 1] = value;
            };
            Map.prototype.getIterator = function () {
                var copykeys = this.keys.slice(0);
                var copyvalues = this.values.slice(0);
                var res = [];
                for (var i = 0; i < copykeys.length; i++) {
                    res.push([copykeys[i], copyvalues[i]]);
                }
                return res;
            };
            return Map;
        })();
        Common.Map = Map;
    })(Common = GeomJS.Common || (GeomJS.Common = {}));
})(GeomJS || (GeomJS = {}));
var GeomJS;
(function (GeomJS) {
    var Funbase;
    (function (Funbase) {
        var WrongKindException = (function () {
            function WrongKindException() {
            }
            return WrongKindException;
        })();
        Funbase.WrongKindException = WrongKindException;
        var ClassCastException = (function () {
            function ClassCastException() {
            }
            return ClassCastException;
        })();
        Funbase.ClassCastException = ClassCastException;
        var Throwable = (function () {
            function Throwable() {
            }
            return Throwable;
        })();
        Funbase.Throwable = Throwable;
    })(Funbase = GeomJS.Funbase || (GeomJS.Funbase = {}));
})(GeomJS || (GeomJS = {}));
///<reference path="../references.ts"/>
var GeomJS;
(function (GeomJS) {
    var Funbase;
    (function (Funbase) {
        "use strict";
        /** This class provides the context for evaluating paragraphs: it imposes
          *  resource limits, and deals with errors that occur during evaluation.
          */
        var Evaluator = (function () {
            function Evaluator() {
            }
            Evaluator.execute = function (fun) {
                var args = [];
                for (var _i = 1; _i < arguments.length; _i++) {
                    args[_i - 1] = arguments[_i];
                }
                this.runFlag = true;
                this.steps = 0;
                this.conses = 0;
                this.endTimeUtc = Date.now() + this.timeLimit;
                Funbase.Interp.get.initStack();
                var result = fun.apply(args, args.length, 0);
                this.checkpoint();
                return result;
            };
            Evaluator.reset = function () {
                this.quantum = this.QUANTUM;
                this.steps = this.conses = 0;
            };
            Evaluator.checkpoint = function () {
                this.steps += (this.QUANTUM - this.quantum); // quantum interats with interp.ts
                if (this.stepLimit > 0 && this.steps > this.stepLimit) {
                    this.error("#steps");
                }
                if (!this.runFlag) {
                    this.error("#time");
                }
                this.quantum = this.QUANTUM;
            };
            Evaluator.countCons = function () {
                this.conses += 1;
                if (this.consLimit > 0 && this.conses > this.consLimit) {
                    this.error("#memory");
                }
            };
            Evaluator.setLimits = function (timeLimit, stepLimit, consLimit) {
                Evaluator.timeLimit = timeLimit;
                Evaluator.stepLimit = stepLimit;
                Evaluator.consLimit = consLimit;
            };
            Evaluator.printStats = function () {
                console.log("(" + this.steps + " step(s)" + ", " + this.conses + "conse(s)" + ")");
            };
            Evaluator.error = function (errtag) {
                var args = [];
                for (var _i = 1; _i < arguments.length; _i++) {
                    args[_i - 1] = arguments[_i];
                }
                //var context: string[] = FunCode.getContext(null);
                console.log(errtag);
                console.log(args);
                throw new Evaluator.EvalError(errtag, args, "");
            };
            Evaluator.expect = function (name, expected) {
                //var context: string[] = FunCode.getContext(null);
                this.error("#expect", "", expected);
            };
            // Complain about calling a non-function
            Evaluator.errApply = function () {
                this.error("#apply");
            };
            // Complain about pattern-matching with a non-constructor
            Evaluator.errMatch = function () {
                this.error("#constr");
            };
            // Complain when the wrong number of arguments is provided
            Evaluator.errNargs = function (name, nargs, arity) {
                if (nargs === 1) {
                    this.error("#numargs1", name, arity);
                }
                else {
                    this.error("#numargs", name, nargs, arity);
                }
            };
            // Complain when no pattern matches in a function definition
            Evaluator.errNoMatch = function (args, base, arity) {
                var buf = "";
                if (arity > 0) {
                    buf += Funbase.Value.print(args[base + 0]);
                    for (var i = 1; i < arity; i++) {
                        buf += (", " + Funbase.Value.print(args[base + i]));
                    }
                }
                if (arity === 1) {
                    this.error("#match1", buf);
                }
                else {
                    this.error("#match", buf);
                }
            };
            // Complain about an undefined name
            Evaluator.errNotDef = function (x) {
                this.error("#undef", x);
            };
            // Complain about a non-boolean guard or 'if' condition
            Evaluator.errBoolCond = function () {
                this.error("#condbool");
            };
            /* Complain about matching against a constructor with the
             *  wrong number of argument patterns
             */
            Evaluator.errPatNargs = function (name) {
                this.error("#patnargs", name);
            };
            Evaluator.listFail = function (xs, msg) {
                this.error(msg, xs.type === 5 /* Nil */ ? "this empty list" : "a non-list");
            };
            Evaluator.debug = 0;
            /* Debug levels:
               1 -- see ASTs before code gen
               2 -- see funcode */
            Evaluator.QUANTUM = 10000;
            Evaluator.quantum = 10000;
            Evaluator.timeLimit = 30000;
            Evaluator.stepLimit = 500000000;
            Evaluator.consLimit = 10000000;
            return Evaluator;
        })();
        Funbase.Evaluator = Evaluator;
        Funbase.Primitive.store("_error", function (tag, args) {
            Evaluator.error(Funbase.Value.string(tag), Funbase.Value.array(args));
            return null;
        });
        Funbase.Primitive.store("_limit", function (time, steps, conses) {
            Evaluator.setLimits(Funbase.Value.asNumber(time), Funbase.Value.asNumber(steps), Funbase.Value.asNumber(conses));
            return Funbase.Value.nil;
        });
    })(Funbase = GeomJS.Funbase || (GeomJS.Funbase = {}));
})(GeomJS || (GeomJS = {}));
// The TypeScript way of doing nested classes
var GeomJS;
(function (GeomJS) {
    var Funbase;
    (function (Funbase) {
        var Evaluator;
        (function (Evaluator) {
            "use strict";
            // An exception raised because of a run-time error
            var EvalError = (function () {
                function EvalError(errtag, args, context) {
                    if (args === void 0) { args = null; }
                    if (context === void 0) { context = null; }
                    this.errtag = errtag;
                    this.args = args;
                    this.context = context;
                }
                return EvalError;
            })();
            Evaluator.EvalError = EvalError;
        })(Evaluator = Funbase.Evaluator || (Funbase.Evaluator = {}));
    })(Funbase = GeomJS.Funbase || (GeomJS.Funbase = {}));
})(GeomJS || (GeomJS = {}));
///<reference path="../references.ts"/>
var GeomJS;
(function (GeomJS) {
    var Funbase;
    (function (Funbase) {
        "use strict";
        /** Assemble a list of instructions into a function body */
        Funbase.Primitive.store("_assemble", function (name, arity, code) {
            var instrs = [];
            var rands = [];
            var ip = 0;
            var consts = [];
            for (var xs = code; Funbase.Value.isCons(xs); xs = Funbase.Value.tail(xs)) {
                var inst = Funbase.Value.head(xs);
                var x = Funbase.Value.name(Funbase.Value.head(inst)).name;
                var op = FunCode.Opcode[x];
                var args = Funbase.Value.tail(inst);
                var rand;
                if (!Funbase.Value.isCons(args)) {
                    /* No argument */
                    rand = FunCode.NO_RAND;
                }
                else {
                    var v = Funbase.Value.head(args);
                    switch (op) {
                        case 0 /* GLOBAL */:
                        case 6 /* QUOTE */:
                        case 14 /* MPLUS */:
                            /* An argument that goes in the constant pool */
                            rand = consts.indexOf(v);
                            if (rand < 0) {
                                rand = consts.length;
                                consts.push(v);
                            }
                            break;
                        default:
                            /* An integer argument */
                            rand = Funbase.Value.asNumber(v);
                            break;
                    }
                }
                instrs[ip] = op;
                rands[ip] = rand;
                ip++;
            }
            var thisName = name.type === 0 /* String */ ? Funbase.Value.string(name) : Funbase.Value.name(name).name; //Its fine, I checked.
            return FunCode.create(thisName, Funbase.Value.asNumber(arity), instrs, rands, consts);
        });
        var FunCode;
        (function (FunCode) {
            "use strict";
            FunCode.NO_RAND = 0x8000000;
            function create(name, arity, ops, rands, consts) {
                if (consts === void 0) { consts = null; }
                var ret = {
                    "type": 4 /* Funcode */,
                    "arity": arity,
                    "name": name,
                    "ops": ops,
                    "rands": rands,
                    "subr": Funbase.Func.nullFunction(),
                    "frozen": Funbase.Name.getFreezer()
                };
                if (consts) {
                    ret["consts"] = consts;
                }
                return ret;
            }
            FunCode.create = create;
            /** Construct a wrapped closure and tie the knot for local recursion */
            function makeClosure(code, fvars) {
                var result = {
                    type: 6 /* Funvalue */,
                    name: code.name,
                    subr: Funbase.Interp.get.translate(code, fvars)
                };
                fvars[0] = result;
                return result;
            }
            FunCode.makeClosure = makeClosure;
            /** Enumerated type of opcodes for the Fun machine */
            (function (Opcode) {
                Opcode[Opcode["GLOBAL"] = 0] = "GLOBAL";
                Opcode[Opcode["LOCAL"] = 1] = "LOCAL";
                Opcode[Opcode["ARG"] = 2] = "ARG";
                Opcode[Opcode["FVAR"] = 3] = "FVAR";
                Opcode[Opcode["BIND"] = 4] = "BIND";
                Opcode[Opcode["POP"] = 5] = "POP";
                Opcode[Opcode["QUOTE"] = 6] = "QUOTE";
                Opcode[Opcode["NIL"] = 7] = "NIL";
                Opcode[Opcode["CONS"] = 8] = "CONS";
                Opcode[Opcode["TRAP"] = 9] = "TRAP";
                Opcode[Opcode["FAIL"] = 10] = "FAIL";
                Opcode[Opcode["JFALSE"] = 11] = "JFALSE";
                Opcode[Opcode["JUMP"] = 12] = "JUMP";
                Opcode[Opcode["RETURN"] = 13] = "RETURN";
                Opcode[Opcode["MPLUS"] = 14] = "MPLUS";
                Opcode[Opcode["MEQ"] = 15] = "MEQ";
                Opcode[Opcode["MNIL"] = 16] = "MNIL";
                Opcode[Opcode["MCONS"] = 17] = "MCONS";
                Opcode[Opcode["GETTAIL"] = 18] = "GETTAIL";
                Opcode[Opcode["TCALL"] = 19] = "TCALL";
                Opcode[Opcode["PREP"] = 20] = "PREP";
                Opcode[Opcode["FRAME"] = 21] = "FRAME";
                Opcode[Opcode["PUTARG"] = 22] = "PUTARG";
                Opcode[Opcode["CALL"] = 23] = "CALL";
                Opcode[Opcode["CLOSURE"] = 24] = "CLOSURE";
                Opcode[Opcode["MPRIM"] = 25] = "MPRIM"; /* [#mprim, n]: pattern match a constructor with n args */
            })(FunCode.Opcode || (FunCode.Opcode = {}));
            var Opcode = FunCode.Opcode;
        })(FunCode = Funbase.FunCode || (Funbase.FunCode = {}));
    })(Funbase = GeomJS.Funbase || (GeomJS.Funbase = {}));
})(GeomJS || (GeomJS = {}));
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
///<reference path="../references.ts"/>
var GeomJS;
(function (GeomJS) {
    var Funbase;
    (function (Funbase) {
        "use strict";
        /** A simple runtime translator that interprets the funcode */
        var Interp = (function () {
            function Interp() {
                this.root = null;
            }
            // turns funcode into a func that can be applied
            Interp.prototype.translate = function (funcode, fvars) {
                var _this = this;
                return {
                    type: 10 /* Func */,
                    arity: funcode.arity,
                    apply: function (args, nargs, base) { return _this.apply(funcode.arity, funcode, fvars, args, base, nargs); },
                    pattMatch: function (obj, nargs) { return null; },
                    code: funcode
                };
            };
            Interp.prototype.initStack = function () {
                Interp.backtrace = [];
                this.root = null;
            };
            Interp.prototype.setRoot = function (root) {
                this.root = Funbase.Value.funcode(root);
            };
            // interprets FunCode instructions
            Interp.prototype.apply = function (arity, code, fvars, args, base, nargs) {
                Interp.backtrace.push(code);
                if (nargs !== arity)
                    Funbase.Evaluator.errNargs(code.name, nargs, arity);
                if (--Funbase.Evaluator.quantum <= 0)
                    Funbase.Evaluator.checkpoint();
                var instrs = code.ops;
                var rands = code.rands;
                var frame = new Array(256);
                var pc = 0;
                var trap = -1;
                var sp = 0;
                for (;;) {
                    var op = instrs[pc];
                    var rand = rands[pc];
                    pc++;
                    switch (op) {
                        case 0 /* GLOBAL */: {
                            var x = Funbase.Value.name(code.consts[rand]);
                            var v = Funbase.Name.getGlodef(x);
                            if (!v || v.type === 9 /* Name */) {
                                Funbase.Evaluator.errNotDef(x);
                            }
                            frame[sp++] = v;
                            break;
                        }
                        case 1 /* LOCAL */:
                            frame[sp++] = frame[frame.length - rand - 1];
                            break;
                        case 2 /* ARG */:
                            frame[sp++] = args[base + rand];
                            break;
                        case 3 /* FVAR */:
                            frame[sp++] = fvars[rand];
                            break;
                        case 4 /* BIND */:
                            frame[frame.length - rand - 1] = frame[--sp];
                            break;
                        case 5 /* POP */:
                            sp--;
                            break;
                        case 6 /* QUOTE */:
                            frame[sp++] = code.consts[rand];
                            break;
                        case 7 /* NIL */:
                            frame[sp++] = Funbase.Value.nil;
                            break;
                        case 8 /* CONS */:
                            sp--;
                            frame[sp - 1] = Funbase.Value.cons(frame[sp - 1], frame[sp]);
                            break;
                        case 23 /* CALL */:
                            sp -= rand;
                            var fun = frame[sp - 1];
                            frame[sp - 1] = fun.subr.apply(frame, rand, sp);
                            break;
                        case 19 /* TCALL */:
                            if (rand !== nargs)
                                Funbase.Evaluator.errNargs(code.name, rand, nargs);
                            sp -= rand;
                            GeomJS.Common.arraycopy(frame, sp, args, base, nargs);
                            pc = 0;
                            trap = -1;
                            sp = 0;
                            if (--Funbase.Evaluator.quantum <= 0)
                                Funbase.Evaluator.checkpoint();
                            break;
                        case 24 /* CLOSURE */: {
                            sp -= rand - 1;
                            var body = Funbase.Value.funcode(frame[sp - 1]);
                            var fvars2 = new Array(rand);
                            GeomJS.Common.arraycopy(frame, sp, fvars2, 1, rand - 1);
                            frame[sp - 1] = Funbase.FunCode.makeClosure(body, fvars2);
                            break;
                        }
                        case 9 /* TRAP */:
                            trap = rand;
                            break;
                        case 10 /* FAIL */:
                            Funbase.Evaluator.errNoMatch(args, base, code.arity);
                            break;
                        case 11 /* JFALSE */:
                            var b = frame[--sp];
                            if (b === Funbase.BoolValue.False) {
                                pc = rand;
                            }
                            else if (b.type !== 1 /* Bool */) {
                                Funbase.Evaluator.errBoolCond();
                            }
                            break;
                        case 12 /* JUMP */:
                            pc = rand;
                            break;
                        case 13 /* RETURN */:
                            Interp.backtrace.splice(Interp.backtrace.length - 1, 1);
                            return frame[--sp];
                        case 14 /* MPLUS */:
                            sp -= 1;
                            var a = frame[sp];
                            if (a.type !== 3 /* Number */ || code.consts[rand].type !== 3 /* Number */) {
                                pc = trap;
                            }
                            else {
                                var v2 = Funbase.Value.matchPlus(a, code.consts[rand]);
                                if (v2)
                                    frame[sp++] = v2;
                                else
                                    pc = trap;
                            }
                            break;
                        case 15 /* MEQ */:
                            sp -= 2;
                            if (!GeomJS.Common.objectEquals(frame[sp], (frame[sp + 1])))
                                pc = trap;
                            break;
                        case 16 /* MNIL */:
                            if (frame[--sp].type !== 5 /* Nil */)
                                pc = trap;
                            break;
                        case 17 /* MCONS */: {
                            if (frame[sp - 1].type !== 2 /* List */) {
                                sp--;
                                pc = trap;
                            }
                            else {
                                var cell = frame[sp - 1];
                                frame[sp] = Funbase.Value.head(cell);
                                sp += 1;
                            }
                            break;
                        }
                        case 18 /* GETTAIL */:
                            frame[sp - 1] = Funbase.Value.tail(frame[sp - 1]);
                            break;
                        case 25 /* MPRIM */: {
                            var cons = frame[--sp];
                            var obj = frame[--sp];
                            var vs = cons.subr.pattMatch(obj, rand);
                            if (!vs)
                                pc = trap;
                            else {
                                GeomJS.Common.arraycopy(vs, 0, frame, sp, rand);
                                sp += rand;
                            }
                            break;
                        }
                        case 20 /* PREP */:
                        case 22 /* PUTARG */:
                        case 21 /* FRAME */:
                            break;
                        default:
                            throw new Error("bad opcode " + op);
                    }
                }
            };
            Interp.get = new Interp();
            return Interp;
        })();
        Funbase.Interp = Interp;
    })(Funbase = GeomJS.Funbase || (GeomJS.Funbase = {}));
})(GeomJS || (GeomJS = {}));
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
///<reference path="../references.ts"/>
var GeomJS;
(function (GeomJS) {
    var Funbase;
    (function (Funbase) {
        "use strict";
        var Scanner = (function () {
            function Scanner(reader) {
                this.push_back = "";
                this.line_num = 1;
                this.char_num = 0;
                this.start_char = 0;
                this.root_char = 0;
                this.last_char = 0;
                /* The scanner keeps track of the text that has been scanned, so that
                 * the defining text can be saved with each name in the global env.
                 * The variable 'virgin' indicates whether we are skipping characters that
                 * come before the first token of the text. */
                this.text = "";
                this.virgin = true;
                this.ATOM = Funbase.Name.find("atom");
                this.BRA = Funbase.Name.find("bra");
                this.COMMA = Funbase.Name.find("comma");
                this.EOF = Funbase.Name.find("eof");
                this.EOL = Funbase.Name.find("eol");
                this.KET = Funbase.Name.find("ket");
                this.LPAR = Funbase.Name.find("lpar");
                this.NUMBER = Funbase.Name.find("number");
                this.RPAR = Funbase.Name.find("rpar");
                this.SEMI = Funbase.Name.find("semi");
                this.STRING = Funbase.Name.find("string");
                this.VBAR = Funbase.Name.find("vbar");
                this.OP = Funbase.Name.find("op");
                this.IDENT = Funbase.Name.find("ident");
                this.reader = reader;
            }
            Scanner.prototype.readChar = function () {
                var ich = this.reader.read();
                if (ich < 0) {
                    return 0;
                }
                return ich;
            };
            Scanner.prototype.getChar = function () {
                var ch = "";
                var ci = 0;
                if (this.push_back.length === 0) {
                    ci = this.readChar();
                    ch = String.fromCharCode(ci);
                }
                else {
                    var i = this.push_back.length - 1;
                    ch = this.push_back[i];
                    ci = ch.charCodeAt(0);
                    this.push_back = this.push_back.substring(0, i);
                }
                if (ci !== 0) {
                    this.char_num += 1;
                    this.text += ch;
                }
                return ch;
            };
            /** Push back one character onto the input */
            Scanner.prototype.pushBack = function (ch) {
                if (ch !== String.fromCharCode(0)) {
                    this.char_num -= 1;
                    this.push_back += ch;
                    this.text = this.text.slice(0, -1);
                }
            };
            Scanner.prototype.getText = function () {
                var desiredLength = this.last_char - this.root_char;
                this.text = this.text.slice(0, desiredLength);
                return this.text;
            };
            Scanner.prototype.resetText = function () {
                this.text = "";
                this.virgin = true;
            };
            Scanner.prototype.isOpChar = function (ch) {
                return Scanner.opchars.indexOf(ch) !== -1;
            };
            Scanner.prototype.isLetter = function (ch) {
                return Scanner.letters.indexOf(ch) !== -1;
            };
            Scanner.prototype.isDigit = function (ch) {
                return Scanner.digits.indexOf(ch) !== -1;
            };
            Scanner.prototype.scan = function () {
                this.start_char = this.char_num;
                var ch = this.getChar();
                this.tok = null;
                this.sym = Funbase.Value.nil;
                while (this.tok == null) {
                    switch (ch) {
                        case "\0":
                            this.tok = this.EOF;
                            break;
                        case " ":
                        case "\t":
                        case "\r":
                            this.start_char = this.char_num;
                            if (this.virgin) {
                                this.resetText();
                            }
                            ch = this.getChar();
                            break;
                        case "\n":
                            this.line_num++;
                            this.start_char = this.char_num;
                            if (this.virgin) {
                                this.resetText();
                            }
                            ch = this.getChar();
                            break;
                        case "{":
                            var depth = 0;
                            do {
                                if (ch === "{") {
                                    depth++;
                                }
                                else if (ch === "}") {
                                    depth--;
                                }
                                else if (ch === "\n") {
                                    this.line_num++;
                                }
                                else if (ch === "\0") {
                                    this.start_char = this.char_num;
                                    this.tok = this.EOF;
                                    this.syntax_error("#comment");
                                }
                                ch = this.getChar();
                            } while (depth > 0);
                            break;
                        case "}":
                            this.syntax_error("#bracematch");
                            break;
                        case "(":
                            this.tok = this.LPAR;
                            break;
                        case ")":
                            this.tok = this.RPAR;
                            break;
                        case "[":
                            this.tok = this.BRA;
                            break;
                        case "]":
                            this.tok = this.KET;
                            break;
                        case ",":
                            this.tok = this.COMMA;
                            break;
                        case ";":
                            this.tok = this.SEMI;
                            break;
                        case "|":
                            this.tok = this.VBAR;
                            break;
                        case '"':
                            var str = "";
                            ch = this.getChar();
                            while (ch !== '"' && ch !== "\n" && ch !== "\0") {
                                str += ch;
                                ch = this.getChar();
                            }
                            if (ch === '"') {
                                this.tok = this.STRING;
                                this.sym = Funbase.StringValue.create(str);
                            }
                            else {
                                this.pushBack(ch);
                                this.start_char = this.char_num;
                                this.tok = (ch === "\n" ? this.EOL : this.EOF);
                                this.syntax_error("#string");
                            }
                            break;
                        case "#":
                            var buf = "";
                            ch = this.getChar();
                            if (this.isLetter(ch) || ch === "_") {
                                while (this.isLetter(ch) || this.isDigit(ch) || ch === "_") {
                                    buf += ch;
                                    ch = this.getChar();
                                }
                            }
                            else if (this.isOpChar(ch)) {
                                while (this.isOpChar(ch)) {
                                    buf += ch;
                                    ch = this.getChar();
                                }
                            }
                            else {
                                this.syntax_error("#idop");
                            }
                            this.pushBack(ch);
                            this.tok = this.ATOM;
                            this.sym = Funbase.Name.find(buf.toString());
                            break;
                        default:
                            if (this.isLetter(ch) || ch === "_") {
                                // An identifier
                                var buf = "";
                                while (this.isLetter(ch) || this.isDigit(ch) || ch === "_") {
                                    buf += ch;
                                    ch = this.getChar();
                                }
                                this.pushBack(ch);
                                var x = Funbase.Name.find(buf.toString());
                                this.tok = this.IDENT;
                                this.sym = x;
                            }
                            else if (this.isDigit(ch)) {
                                // A numeric constant
                                var buf = "";
                                while (this.isDigit(ch)) {
                                    buf += ch;
                                    ch = this.getChar();
                                }
                                if (ch === ".") {
                                    buf += ch;
                                    ch = this.getChar();
                                    if (!this.isDigit(ch)) {
                                        this.pushBack(ch);
                                        ch = ".";
                                    }
                                    else {
                                        while (this.isDigit(ch)) {
                                            buf += ch;
                                            ch = this.getChar();
                                        }
                                    }
                                }
                                if (ch === "E") {
                                    buf += (ch);
                                    ch = this.getChar();
                                    if (ch === "+" || ch === "-") {
                                        buf += ch;
                                        ch = this.getChar();
                                    }
                                    if (!this.isDigit(ch)) {
                                        this.badToken();
                                    }
                                    do {
                                        buf += ch;
                                        ch = this.getChar();
                                    } while (this.isDigit(ch));
                                }
                                this.pushBack(ch);
                                this.tok = this.NUMBER;
                                var val = Number(buf);
                                this.sym = Funbase.NumValue.create(val);
                            }
                            else if (this.isOpChar(ch)) {
                                // A symbolic operator
                                var buf = "";
                                while (this.isOpChar(ch)) {
                                    buf += ch;
                                    ch = this.getChar();
                                }
                                this.pushBack(ch);
                                var x = Funbase.Name.find(buf);
                                this.tok = this.OP;
                                this.sym = x;
                            }
                            else {
                                this.badToken();
                            }
                    }
                }
                if (this.virgin) {
                    this.root_char = this.last_char = this.start_char;
                    this.virgin = false;
                }
                if (this.tok !== this.EOF) {
                    this.last_char = this.char_num;
                }
            };
            Scanner.prototype.nextToken = function () {
                this.scan();
                return Funbase.Value.makeList(this.tok, this.sym);
            };
            Scanner.prototype.nextTokenJs = function () {
                this.scan();
                var tokJs = new GeomJS.JsRuntime.Name(Funbase.Value.name(this.tok).name);
                var symJs;
                if (this.sym.type === 3 /* Number */) {
                    symJs = Funbase.Value.asNumber(this.sym);
                }
                else if (this.sym.type === 0 /* String */) {
                    symJs = Funbase.Value.string(this.sym);
                }
                else if (this.sym.type === 5 /* Nil */) {
                    symJs = [];
                }
                else {
                    symJs = new GeomJS.JsRuntime.Name(Funbase.Value.name(this.sym).name);
                }
                return [tokJs, [symJs, []]];
            };
            Scanner.prototype.badToken = function () {
                this.syntax_error("#badtok");
            };
            Scanner.prototype.error_chars = function () {
                if (this.tok === this.EOF) {
                    return "end of input";
                }
                else if (this.tok === this.EOL) {
                    return "end of line";
                }
                else {
                    return "'" + this.text.substring(this.start_char - this.root_char, this.start_char - this.root_char + 10) + "'";
                }
            };
            /** Report a syntax error at the current token */
            Scanner.prototype.syntax_error = function (errtag, args) {
                if (args === void 0) { args = null; }
                console.log(errtag);
                console.log(args);
                console.log(this.error_chars());
                console.log(this.line_num);
                throw new Scanner.SyntaxError(errtag, args, this.line_num, this.start_char, this.char_num, this.error_chars());
            };
            Scanner.opchars = ".!#$%&*+-/:<=>?@^~";
            Scanner.letters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
            Scanner.digits = "0123456789";
            return Scanner;
        })();
        Funbase.Scanner = Scanner;
    })(Funbase = GeomJS.Funbase || (GeomJS.Funbase = {}));
})(GeomJS || (GeomJS = {}));
var GeomJS;
(function (GeomJS) {
    var Funbase;
    (function (Funbase) {
        var Scanner;
        (function (Scanner) {
            "use strict";
            var Reader;
            (function (Reader) {
                function fromString(str) {
                    var index = 0;
                    return {
                        read: function () {
                            var c = str.charCodeAt(index++);
                            if (!c) {
                                return -1;
                            }
                            return c;
                        }
                    };
                }
                Reader.fromString = fromString;
            })(Reader = Scanner.Reader || (Scanner.Reader = {}));
            var SyntaxError = (function () {
                function SyntaxError(errtag, args, line, start, end, errtok) {
                    this.errtag = errtag;
                    this.args = args;
                    this.line = line;
                    this.start = start;
                    this.end = end;
                    this.errtok = errtok;
                }
                return SyntaxError;
            })();
            Scanner.SyntaxError = SyntaxError;
        })(Scanner = Funbase.Scanner || (Funbase.Scanner = {}));
    })(Funbase = GeomJS.Funbase || (GeomJS.Funbase = {}));
})(GeomJS || (GeomJS = {}));
///<reference path="../../references.ts"/>
var GeomJS;
(function (GeomJS) {
    var Funbase;
    (function (Funbase) {
        // Implements the Cell primitive with operations: _new, _get, _set
        // _new() creates a fresh cell, _get(c) gets the value stored in cell c,
        // and _set(c,v) sets the cell c to store value v.
        var Cell;
        (function (Cell) {
            // Creates a fresh cell
            function newInstance(val) {
                return {
                    type: 7 /* Cell */,
                    value: val,
                    subr: Funbase.Func.nullFunction()
                };
            }
            // Converts a Value to a cell, or throws WrongKindException
            function toCell(v) {
                if (v && v.type === 7 /* Cell */) {
                    return v;
                }
                else {
                    throw new Funbase.WrongKindException();
                }
            }
            // As this plugin is required by the compiler, this plugin is
            // installed by the runtime during the initial loading phase.
            function install() {
                Funbase.Primitive.store("_new", function (x) {
                    Funbase.Evaluator.countCons();
                    return newInstance(x);
                });
                Funbase.Primitive.store("_get", function (x) {
                    return toCell(x).value;
                });
                Funbase.Primitive.store("_set", function (v, y) {
                    var x = toCell(v);
                    return (x.value = y);
                });
            }
            Cell.install = install;
        })(Cell = Funbase.Cell || (Funbase.Cell = {}));
    })(Funbase = GeomJS.Funbase || (GeomJS.Funbase = {}));
})(GeomJS || (GeomJS = {}));
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
///<reference path="../../references.ts"/>
var GeomJS;
(function (GeomJS) {
    var Funbase;
    (function (Funbase) {
        // A type that maps keys to values.
        var Hash;
        (function (Hash) {
            // Create a fresh hash.
            function newInstance(init) {
                if (init === void 0) { init = undefined; }
                Funbase.Evaluator.countCons();
                return {
                    type: 8 /* Hash */,
                    mapping: new GeomJS.Common.Map(GeomJS.Common.objectEquals, init),
                    subr: Funbase.Func.nullFunction()
                };
            }
            // Convert Value to hash, or throw.
            function toHash(v) {
                if (v && v.type === 8 /* Hash */) {
                    return v;
                }
                else {
                    throw new Funbase.WrongKindException();
                }
            }
            function install() {
                // Primitive for creating a hash
                Funbase.Primitive.store("_hash", function () {
                    return newInstance();
                });
                // Primitive for copying a hash
                Funbase.Primitive.store("_clone", function (m) {
                    var h = toHash(m);
                    return newInstance(h.mapping.getIterator());
                });
                // Primitive for getting the value associated with a key
                Funbase.Primitive.store("_lookup", function (m, x) {
                    var r = toHash(m).mapping.get(x);
                    if (!r)
                        return Funbase.Value.nil;
                    return r;
                });
                // Primitive for associating a value with a key
                Funbase.Primitive.store("_update", function (m, x, y) {
                    var h = toHash(m);
                    h.mapping.set(x, y);
                    return y;
                });
            }
            Hash.install = install;
        })(Hash = Funbase.Hash || (Funbase.Hash = {}));
    })(Funbase = GeomJS.Funbase || (GeomJS.Funbase = {}));
})(GeomJS || (GeomJS = {}));
///<reference path="../../references.ts"/>
var GeomJS;
(function (GeomJS) {
    var Funbase;
    (function (Funbase) {
        var BasicPrims;
        (function (BasicPrims) {
            BasicPrims.variableCount = 0;
            function install() {
                Funbase.Primitive.store("_newvar", function () {
                    return Funbase.StringValue.create("_v" + BasicPrims.variableCount++);
                });
                Funbase.Primitive.store("=", function (x, y) {
                    return Funbase.BoolValue.create(GeomJS.Common.objectEquals(x, y));
                });
                Funbase.Primitive.store("<>", function (x, y) {
                    return Funbase.BoolValue.create(!GeomJS.Common.objectEquals(x, y));
                });
                Funbase.Primitive.store("+", function (x, y) {
                    return Funbase.NumValue.create(Funbase.Value.asNumber(x) + Funbase.Value.asNumber(y));
                });
                Funbase.Primitive.store("-", function (x, y) {
                    return Funbase.NumValue.create(Funbase.Value.asNumber(x) - Funbase.Value.asNumber(y));
                });
                Funbase.Primitive.store("*", function (x, y) {
                    return Funbase.NumValue.create(Funbase.Value.asNumber(x) * Funbase.Value.asNumber(y));
                });
                Funbase.Primitive.store("/", function (x, y) {
                    var yy = Funbase.Value.asNumber(y);
                    if (yy === 0) {
                        Funbase.Evaluator.error("#divzero");
                    }
                    return Funbase.NumValue.create(Funbase.Value.asNumber(x) / yy);
                });
                Funbase.Primitive.store("~", function (x) {
                    return Funbase.NumValue.create(-Funbase.Value.asNumber(x));
                });
                Funbase.Primitive.store("<", function (x, y) {
                    return Funbase.BoolValue.create(Funbase.Value.asNumber(x) < Funbase.Value.asNumber(y));
                });
                Funbase.Primitive.store("<=", function (x, y) {
                    return Funbase.BoolValue.create(Funbase.Value.asNumber(x) <= Funbase.Value.asNumber(y));
                });
                Funbase.Primitive.store(">", function (x, y) {
                    return Funbase.BoolValue.create(Funbase.Value.asNumber(x) > Funbase.Value.asNumber(y));
                });
                Funbase.Primitive.store(">=", function (x, y) {
                    return Funbase.BoolValue.create(Funbase.Value.asNumber(x) >= Funbase.Value.asNumber(y));
                });
                Funbase.Primitive.store("numeric", function (x) {
                    return Funbase.BoolValue.create(x.type === 3 /* Number */);
                });
                Funbase.Primitive.store("int", function (x) {
                    return Funbase.NumValue.create(Math.floor(Funbase.Value.asNumber(x)));
                });
                Funbase.Primitive.store("sqrt", function (x) {
                    var arg = Funbase.Value.asNumber(x);
                    if (arg < 0) {
                        Funbase.Evaluator.error("#sqrt");
                    }
                    return Funbase.NumValue.create(Math.sqrt(arg));
                });
                Funbase.Primitive.store("exp", function (x) {
                    return Funbase.NumValue.create(Math.exp(Funbase.Value.asNumber(x)));
                });
                Funbase.Primitive.store("sin", function (x) {
                    return Funbase.NumValue.create(Math.sin(Funbase.Value.asNumber(x) * Math.PI / 180));
                });
                Funbase.Primitive.store("cos", function (x) {
                    return Funbase.NumValue.create(Math.cos(Funbase.Value.asNumber(x) * Math.PI / 180));
                });
                Funbase.Primitive.store("tan", function (x) {
                    return Funbase.NumValue.create(Math.tan(Funbase.Value.asNumber(x) * Math.PI / 180));
                });
                Funbase.Primitive.store("atan2", function (x, y) {
                    return Funbase.NumValue.create(Math.atan2(Funbase.Value.asNumber(x), Funbase.Value.asNumber(y)) * Math.PI / 180);
                });
                Funbase.Primitive.store("random", function () {
                    return Funbase.NumValue.create(Math.random());
                });
                Funbase.Primitive.store("name", function (x) {
                    return Funbase.Name.find(Funbase.Value.string(x));
                });
                Funbase.Primitive.store(":", function (hd, tl) {
                    if (!Funbase.Value.isCons(tl) && !GeomJS.Common.objectEquals(tl, Funbase.Value.nil)) {
                        Funbase.Evaluator.expect(":", "a list");
                    }
                    return Funbase.Value.cons(hd, tl);
                }, function (obj, nargs) {
                    if (nargs !== 2) {
                        Funbase.Evaluator.errPatNargs(":");
                    }
                    var args = [];
                    try {
                        args[0] = Funbase.Value.tail(obj);
                        args[1] = Funbase.Value.head(obj);
                        return args;
                    }
                    catch (e) {
                        if (e instanceof Funbase.ClassCastException) {
                            return null;
                        }
                        throw e;
                    }
                });
                Funbase.Primitive.store("head", function (x) {
                    try {
                        return Funbase.Value.head(x);
                    }
                    catch (e) {
                        if (e instanceof Funbase.ClassCastException) {
                            Funbase.Evaluator.listFail(x, "#head");
                            return null;
                        }
                    }
                });
                Funbase.Primitive.store("tail", function (x) {
                    try {
                        return Funbase.Value.tail(x);
                    }
                    catch (e) {
                        if (e instanceof Funbase.ClassCastException) {
                            Funbase.Evaluator.listFail(x, "#tail");
                            return null;
                        }
                    }
                });
            }
            BasicPrims.install = install;
        })(BasicPrims = Funbase.BasicPrims || (Funbase.BasicPrims = {}));
    })(Funbase = GeomJS.Funbase || (GeomJS.Funbase = {}));
})(GeomJS || (GeomJS = {}));
///<reference path="../references.ts"/>
var GeomJS;
(function (GeomJS) {
    var JsRuntime;
    (function (JsRuntime) {
        var Value;
        (function (Value) {
            function areNotEqual(x, y) {
                return !areEqual(x, y);
            }
            Value.areNotEqual = areNotEqual;
            function areEqual(x, y) {
                if (x === y) {
                    return true; //number, boolean, string
                }
                else if (x.constructor === Number || x.constructor === Boolean || x.constructor === String || x.constructor !== y.constructor) {
                    return false;
                }
                else if (x.constructor === JsRuntime.Name) {
                    return x.name === y.name;
                }
                else if (x.constructor === Array) {
                    while (true) {
                        if (x.length === 0) {
                            return y.length === 0;
                        }
                        if (y.length === 0) {
                            return x.length === 0;
                        }
                        if (!areEqual(x[0], y[0])) {
                            return false;
                        }
                        x = x[1];
                        y = y[1];
                    }
                }
                else if (x.constructor === Function) {
                    return x.name == y.name;
                }
                else if (x.equals && y.equals) {
                    return x.equals(y);
                }
                else {
                    console.log("Equals unsupported on " + x.constructor);
                }
                //TODO: cell, dict, etc
            }
            Value.areEqual = areEqual;
            function array(v) {
                var acc = [];
                for (var xs = v; Value.isCons(xs); xs = xs[1]) {
                    acc.push(xs[0]);
                }
                return acc;
            }
            Value.array = array;
            function isCons(v) {
                return v && v.constructor === Array && v.length === 2;
            }
            Value.isCons = isCons;
            function print(v) {
                if (v.constructor === Array) {
                    var str = "[";
                    for (var xs = v; Value.isCons(xs); xs = xs[1]) {
                        str += Value.print(xs[0]);
                        if (Value.isCons(xs[1])) {
                            str += ", ";
                        }
                    }
                    str += "]";
                    return str;
                }
                else if (v.constructor === Function) {
                    return "<function(" + v.length + ")>";
                }
                else {
                    return v.toString();
                }
            }
            Value.print = print;
        })(Value = JsRuntime.Value || (JsRuntime.Value = {}));
    })(JsRuntime = GeomJS.JsRuntime || (GeomJS.JsRuntime = {}));
})(GeomJS || (GeomJS = {}));
///<reference path="../../references.ts"/>
var GeomJS;
(function (GeomJS) {
    var JsRuntime;
    (function (JsRuntime) {
        function InstallInlines() {
            JsRuntime.Interop.addInline("=", function (x) {
                var args = JsRuntime.Value.array(x);
                var x = args[0];
                var y = args[1];
                // We have to be careful of variables which begin '_v'. Fortunately
                // nothing we want to inline begins with '_v'
                if (y.constructor === String && y.indexOf('_v') === -1) {
                    var runtimeVal = eval(y);
                    if (runtimeVal.constructor === String || runtimeVal.constructor === Number || runtimeVal.constructor === Boolean) {
                        return x + " === " + y;
                    }
                    if (runtimeVal.constructor === JsRuntime.Name || runtimeVal.constructor === Function) {
                        return x + ".name === " + y + ".name";
                    }
                }
                if (x.constructor === String && x.indexOf('_v') === -1) {
                    var runtimeVal = eval(x);
                    if (runtimeVal.constructor === String || runtimeVal.constructor === Number || runtimeVal.constructor === Boolean) {
                        return x + " === " + y;
                    }
                    if (runtimeVal.constructor === JsRuntime.Name || runtimeVal.constructor === Function) {
                        return x + ".name === " + y + ".name";
                    }
                }
                return "GeomJS.JsRuntime.Value.areEqual(" + x + "," + y + ")";
            });
            JsRuntime.Interop.addInline("<>", function (x) {
                var args = JsRuntime.Value.array(x);
                var x = args[0];
                var y = args[1];
                // We have to be careful of variables which begin '_v'. Fortunately
                // nothing we want to inline begins with '_v'
                if (y.constructor === String && y.indexOf('_v') === -1) {
                    var runtimeVal = eval(y);
                    if (runtimeVal.constructor === String || runtimeVal.constructor === Number || runtimeVal.constructor === Boolean) {
                        return x + " !== " + y;
                    }
                    if (runtimeVal.constructor === JsRuntime.Name || runtimeVal.constructor === Function) {
                        return x + ".name !== " + y + ".name";
                    }
                }
                if (x.constructor === String && x.indexOf('_v') === -1) {
                    var runtimeVal = eval(x);
                    if (runtimeVal.constructor === String || runtimeVal.constructor === Number || runtimeVal.constructor === Boolean) {
                        return x + " !== " + y;
                    }
                    if (runtimeVal.constructor === JsRuntime.Name || runtimeVal.constructor === Function) {
                        return x + ".name !== " + y + ".name";
                    }
                }
                return "GeomJS.JsRuntime.Value.areNotEqual(" + x + "," + y + ")";
            });
            JsRuntime.Interop.addInline("+", function (x) {
                var args = JsRuntime.Value.array(x);
                return "(" + args[0] + "+" + args[1] + ")";
            });
            JsRuntime.Interop.addInline("-", function (x) {
                var args = JsRuntime.Value.array(x);
                return "(" + args[0] + "-" + args[1] + ")";
            });
            JsRuntime.Interop.addInline("*", function (x) {
                var args = JsRuntime.Value.array(x);
                return "(" + args[0] + "*" + args[1] + ")";
            });
            JsRuntime.Interop.addInline("/", function (x) {
                var args = JsRuntime.Value.array(x);
                return "(" + args[1] + " === 0) ? GeomJS.Funbase.Evaluator.error('#divzero') : (" + args[0] + "/" + args[1] + ")";
            });
            JsRuntime.Interop.addInline("/", function (x) {
                var t = JsRuntime.Value.array(x);
                var l = t[0];
                var r = t[1];
                return "(" + r + " === 0) ? GeomJS.Funbase.Evaluator.error('#divzero') : (" + l + "/" + r + ")";
            });
            JsRuntime.Interop.addInline("~", function (x) {
                var args = JsRuntime.Value.array(x);
                return "(" + "-" + args[0] + ")";
            });
            JsRuntime.Interop.addInline("<", function (x) {
                var args = JsRuntime.Value.array(x);
                return "(" + args[0] + "<" + args[1] + ")";
            });
            JsRuntime.Interop.addInline("<=", function (x) {
                var args = JsRuntime.Value.array(x);
                return "(" + args[0] + "<=" + args[1] + ")";
            });
            JsRuntime.Interop.addInline(">", function (x) {
                var args = JsRuntime.Value.array(x);
                return "(" + args[0] + ">" + args[1] + ")";
            });
            JsRuntime.Interop.addInline(">=", function (x) {
                var args = JsRuntime.Value.array(x);
                return "(" + args[0] + ">=" + args[1] + ")";
            });
            JsRuntime.Interop.addInline("numeric", function (x) {
                var args = JsRuntime.Value.array(x);
                return "typeof " + args[0] + " === 'number'";
            });
            JsRuntime.Interop.addInline("int", function (x) {
                var args = JsRuntime.Value.array(x);
                return "Math.floor(" + args[0] + ")";
            });
            JsRuntime.Interop.addInline("head", function (x) {
                var args = JsRuntime.Value.array(x);
                return args[0] + "[0]";
            });
            JsRuntime.Interop.addInline("tail;", function (x) {
                var args = JsRuntime.Value.array(x);
                return args[0] + "[1]";
            });
            JsRuntime.Interop.addInline("^", function (x) {
                var args = JsRuntime.Value.array(x);
                return "(" + args[0] + "+" + args[1] + ")";
            });
        }
        JsRuntime.InstallInlines = InstallInlines;
    })(JsRuntime = GeomJS.JsRuntime || (GeomJS.JsRuntime = {}));
})(GeomJS || (GeomJS = {}));
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
///<reference path="../references.ts"/>
var GeomJS;
(function (GeomJS) {
    var JsRuntime;
    (function (JsRuntime) {
        var Interop;
        (function (Interop) {
            var dict = {};
            var inlineDict = {};
            var matchDict = {};
            var base = "GeomJS.JsRuntime.Interop.";
            function addInline(geomName, inlineFunc) {
                inlineDict[geomName] = inlineFunc;
            }
            Interop.addInline = addInline;
            function add(geomName, func, optionalMatch) {
                if (optionalMatch === void 0) { optionalMatch = undefined; }
                dict[geomName] = func;
                if (optionalMatch) {
                    matchDict[geomName] = optionalMatch;
                }
                // This is a little bit of a hack!
                JsRuntime.Name.nameTable[geomName] = eval(func);
            }
            Interop.add = add;
            // Find (optimisation used in compiler for linking functions without going through the name table)
            function find(name, inline) {
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
            Interop.find = find;
            function match(name, matchArg) {
                return matchDict[name](matchArg);
            }
            Interop.match = match;
            Interop.add("true", "true");
            Interop.add("false", "false");
            Interop.add("_newvar", function () {
                return "_v" + GeomJS.Funbase.BasicPrims.variableCount++;
            });
            GeomJS.Funbase.Primitive.store("_find", function (name, inline) {
                var prim = dict[name.value];
                if (prim !== undefined) {
                    return GeomJS.Funbase.StringValue.create(prim);
                }
                // No special compile time instructions so we look up at runtime.
                return GeomJS.Funbase.StringValue.create("GeomJS.JsRuntime.Name.nameTable['" + name.value + "']");
            });
            Interop.add("_find", base + "find");
            GeomJS.Funbase.Primitive.store("_match", function (matchType, matchArg) {
                var ret = GeomJS.Funbase.Value.string(matchType);
                return GeomJS.Funbase.StringValue.create(matchDict[ret](GeomJS.Funbase.Value.string(matchArg)));
            });
            Interop.add("_match", base + "match");
            function fail() {
                throw new Error("no pattern match");
            }
            Interop.fail = fail;
            function _error(tag, args) {
                GeomJS.Funbase.Evaluator.error(tag, JsRuntime.Value.array(args));
                return null;
            }
            Interop._error = _error;
            Interop.add("_error", base + "_error");
            function _apply(x, y) {
                var args = JsRuntime.Value.array(y);
                if (x.length != args.length) {
                    throw new Error("Function arity mismatch");
                }
                return x.apply(null, args);
            }
            Interop._apply = _apply;
            Interop.add("_apply", base + "_apply");
            function _jclosure(body) {
                var f = (new Function(body));
                return f();
            }
            Interop._jclosure = _jclosure;
            Interop.add("_jclosure", base + "_jclosure");
            GeomJS.Funbase.Primitive.store("_jclosure", function (body) {
                var func = new Function(GeomJS.Funbase.Value.string(body));
                var realfunc = func.apply(null);
                return {
                    "type": 6 /* Funvalue */,
                    "subr": {
                        type: 10 /* Func */,
                        arity: realfunc.length,
                        apply: function (args2, nargs2, base2) {
                            if (nargs2 !== realfunc.length) {
                                GeomJS.Funbase.Evaluator.errApply();
                            }
                            var res = realfunc.apply(null, args2);
                            return res;
                        },
                        applyjs: realfunc,
                        pattMatch: function (obj, nargs) {
                            GeomJS.Funbase.Evaluator.errMatch();
                            return null;
                        }
                    }
                };
            });
            function _scan() {
                return GeomJS.Funbase.GeomBase.theApp.scanJs();
            }
            Interop._scan = _scan;
            Interop.add("_scan", base + "_scan");
            function _synerror(tag, args) {
                GeomJS.Funbase.GeomBase.theApp.scanner.syntax_error(tag, JsRuntime.Value.array(args));
                return [];
            }
            Interop._synerror = _synerror;
            Interop.add("_synerror", base + "_synerror");
            function _topval(v) {
                GeomJS.Funbase.GeomBase.theApp.display("--> " + JsRuntime.Value.print(v));
                return [];
            }
            Interop._topval = _topval;
            Interop.add("_topval", base + "_topval");
            function _topdef(x, v) {
                JsRuntime.Name.setGlodef(x, v);
                GeomJS.Funbase.GeomBase.theApp.display("--- " + x.name + " = " + JsRuntime.Value.print(v));
                return [];
            }
            Interop._topdef = _topdef;
            Interop.add("_jtopdef", base + "_topdef");
            GeomJS.Funbase.Primitive.store("_jtopdef", function (x, v) {
                var n = GeomJS.Funbase.Value.name(x);
                if (v.type == 6 /* Funvalue */) {
                    JsRuntime.Name.setGlodef(n, v.subr.applyjs);
                }
                else {
                    JsRuntime.Name.setGlodef(n, v);
                }
                GeomJS.Funbase.GeomBase.theApp.display("--- " + n.name + " = " + GeomJS.Funbase.Value.print(v));
                return GeomJS.Funbase.Value.nil;
            });
            function _toptext() {
                GeomJS.Funbase.GeomBase.theApp.showPhrase();
                return [];
            }
            Interop._toptext = _toptext;
            Interop.add("_toptext", base + "_toptext");
            function _print(v) {
                console.log(JsRuntime.Value.print(v));
                return [];
            }
            Interop._print = _print;
            Interop.add("_print", base + "_print");
            function _debug() {
                return GeomJS.Funbase.Evaluator.debug;
            }
            Interop._debug = _debug;
            Interop.add("_debug", base + "_debug");
            function _install(name) {
                return [];
            }
            Interop._install = _install;
            Interop.add("_install", base + "_install");
            JsRuntime.Name.install();
            JsRuntime.InstallInlines();
        })(Interop = JsRuntime.Interop || (JsRuntime.Interop = {}));
    })(JsRuntime = GeomJS.JsRuntime || (GeomJS.JsRuntime = {}));
})(GeomJS || (GeomJS = {}));
///<reference path="../../references.ts"/>
var GeomJS;
(function (GeomJS) {
    var JsRuntime;
    (function (JsRuntime) {
        var BasicPrims;
        (function (BasicPrims) {
            var base = "GeomJS.JsRuntime.BasicPrims.";
            JsRuntime.Interop.add("=", "GeomJS.JsRuntime.Value.areEqual");
            JsRuntime.Interop.add("<>", "GeomJS.JsRuntime.Value.areNotEqual");
            function add(x, y) {
                return x + y;
            }
            BasicPrims.add = add;
            // Code for a match gets inlined as direct javascript during the compilation stage. 
            function matchPlus(args) {
                var val = args[0];
                var inc = args[1][0];
                if (inc.constructor !== Number || inc <= 0) {
                    return "false";
                }
                var x = "(" + val + "-" + inc + ")";
                return "(!" + val + " || " + val + ".constructor !== Number || " + x + " < 0 || " + x + " % 1 !== 0) ? false : [" + x + "]";
            }
            BasicPrims.matchPlus = matchPlus;
            JsRuntime.Interop.add("+", base + "add", matchPlus);
            function sub(x, y) {
                return x - y;
            }
            BasicPrims.sub = sub;
            JsRuntime.Interop.add("-", base + "sub");
            function mul(x, y) {
                return x * y;
            }
            BasicPrims.mul = mul;
            JsRuntime.Interop.add("*", base + "mul");
            function div(x, y) {
                if (y === 0) {
                    GeomJS.Funbase.Evaluator.error("#divzero");
                }
                return x / y;
            }
            BasicPrims.div = div;
            JsRuntime.Interop.add("/", base + "div");
            function neg(x) {
                return -x;
            }
            BasicPrims.neg = neg;
            JsRuntime.Interop.add("~", base + "neg");
            function lt(x, y) {
                return x < y;
            }
            BasicPrims.lt = lt;
            JsRuntime.Interop.add("<", base + "lt");
            function lte(x, y) {
                return x <= y;
            }
            BasicPrims.lte = lte;
            JsRuntime.Interop.add("<=", base + "lte");
            function gt(x, y) {
                return x > y;
            }
            BasicPrims.gt = gt;
            JsRuntime.Interop.add(">", base + "gt");
            function gte(x, y) {
                return x >= y;
            }
            BasicPrims.gte = gte;
            JsRuntime.Interop.add(">=", base + "gte");
            function numeric(x) {
                return typeof x === "number";
            }
            BasicPrims.numeric = numeric;
            JsRuntime.Interop.add("numeric", base + "numeric");
            function int(x) {
                return Math.floor(x);
            }
            BasicPrims.int = int;
            JsRuntime.Interop.add("int", base + "int");
            function sqrt(x) {
                if (x < 0) {
                    GeomJS.Funbase.Evaluator.error("#sqrt");
                }
                return Math.sqrt(x);
            }
            BasicPrims.sqrt = sqrt;
            JsRuntime.Interop.add("sqrt", base + "sqrt");
            function exp(x) {
                return Math.exp(x);
            }
            BasicPrims.exp = exp;
            JsRuntime.Interop.add("exp", base + "exp");
            function sin(x) {
                return Math.sin(x * Math.PI / 180);
            }
            BasicPrims.sin = sin;
            JsRuntime.Interop.add("sin", base + "sin");
            function cos(x) {
                return Math.cos(x * Math.PI / 180);
            }
            BasicPrims.cos = cos;
            JsRuntime.Interop.add("cos", base + "cos");
            function tan(x) {
                return Math.tan(x * Math.PI / 180);
            }
            BasicPrims.tan = tan;
            JsRuntime.Interop.add("tan", base + "tan");
            function atan2(x, y) {
                return Math.atan2(x, y) * Math.PI / 180;
            }
            BasicPrims.atan2 = atan2;
            JsRuntime.Interop.add("atan2", base + "atan2");
            function random() {
                return Math.random();
            }
            BasicPrims.random = random;
            JsRuntime.Interop.add("random", base + "random");
            function name(x) {
                return JsRuntime.Interop.find(x, false);
            }
            BasicPrims.name = name;
            JsRuntime.Interop.add("name", base + "name");
            function cons(hd, tl) {
                if (!tl || tl.constructor !== Array) {
                    GeomJS.Funbase.Evaluator.expect(":", "a list");
                }
                return [hd, tl];
            }
            BasicPrims.cons = cons;
            // Code for a match gets inlined as direct javascript during the compilation stage. 
            function consMatch(obj) {
                return "(!" + obj + " || " + obj + ".constructor !== Array || " + obj + ".length !== 2) ? false : " + obj + "";
            }
            BasicPrims.consMatch = consMatch;
            JsRuntime.Interop.add(":", base + "cons", consMatch);
            function head(x) {
                if (!x || x.constructor !== Array) {
                    GeomJS.Funbase.Evaluator.listFail(x, "#head");
                    return undefined;
                }
                return x[0];
            }
            BasicPrims.head = head;
            JsRuntime.Interop.add("head", base + "head");
            function tail(x) {
                if (!x || x.constructor !== Array) {
                    GeomJS.Funbase.Evaluator.listFail(x, "#tail");
                    return undefined;
                }
                return x[1];
            }
            BasicPrims.tail = tail;
            JsRuntime.Interop.add("tail", base + "tail");
        })(BasicPrims = JsRuntime.BasicPrims || (JsRuntime.BasicPrims = {}));
    })(JsRuntime = GeomJS.JsRuntime || (GeomJS.JsRuntime = {}));
})(GeomJS || (GeomJS = {}));
///<reference path="../../references.ts"/>
var GeomJS;
(function (GeomJS) {
    var JsRuntime;
    (function (JsRuntime) {
        // Implements the Cell primitive with operations: _new, _get, _set
        // _new() creates a fresh cell, _get(c) gets the value stored in cell c,
        // and _set(c,v) sets the cell c to store value v.
        function Cell(val) {
            this.val = val;
            this.toString = function () {
                return "ref " + this.val.toString();
            };
            this.equals = function (y) {
                return y.constructor === Cell && JsRuntime.Value.areEqual(this.val, y.val);
            };
        }
        JsRuntime.Cell = Cell;
        var Cell;
        (function (Cell) {
            var base = "GeomJS.JsRuntime.Cell.";
            // Create a fresh cell
            function _new(x) {
                GeomJS.Funbase.Evaluator.countCons();
                return new Cell(x);
            }
            Cell._new = _new;
            JsRuntime.Interop.add("_new", base + "_new");
            // Get the contents of a cell
            function _get(x) {
                if (x.constructor === Cell) {
                    return x.val;
                }
                else {
                    throw "_get called with non-cell";
                }
            }
            Cell._get = _get;
            JsRuntime.Interop.add("_get", base + "_get");
            // Set the contents of a cell
            function _set(v, y) {
                if (v.constructor === Cell) {
                    return (v.val = y);
                }
                else {
                    throw "_set called with non-cell";
                }
            }
            Cell._set = _set;
            JsRuntime.Interop.add("_set", base + "_set");
        })(Cell = JsRuntime.Cell || (JsRuntime.Cell = {}));
    })(JsRuntime = GeomJS.JsRuntime || (GeomJS.JsRuntime = {}));
})(GeomJS || (GeomJS = {}));
///<reference path="../../references.ts"/>
var GeomJS;
(function (GeomJS) {
    var JsRuntime;
    (function (JsRuntime) {
        function Hash(init) {
            if (init === void 0) { init = undefined; }
            this.toString = function () {
                return "<hash>";
            };
            this.mapping = new GeomJS.Common.Map(JsRuntime.Value.areEqual, init);
        }
        JsRuntime.Hash = Hash;
        var Hash;
        (function (Hash) {
            var base = "GeomJS.JsRuntime.Hash.";
            function _hash() {
                return new Hash();
            }
            Hash._hash = _hash;
            JsRuntime.Interop.add("_hash", base + "_hash");
            function _clone(h) {
                if (h.constructor === Hash || h.type === 8 /* Hash */) {
                    return new Hash(h.mapping.getIterator());
                }
                else {
                    throw "_clone called with non-hash";
                }
            }
            Hash._clone = _clone;
            JsRuntime.Interop.add("_clone", base + "_clone");
            function _lookup(h, x) {
                if (h.constructor === Hash || h.type === 8 /* Hash */) {
                    var r = h.mapping.get(x);
                    if (r === undefined)
                        return [];
                    return r;
                }
                else {
                    throw "_lookup called with non-hash";
                }
            }
            Hash._lookup = _lookup;
            JsRuntime.Interop.add("_lookup", base + "_lookup");
            function _update(h, x, y) {
                if (h.constructor === Hash || h.type === 8 /* Hash */) {
                    h.mapping.set(x, y);
                    return y;
                }
                else {
                    console.log(h);
                    throw "_update called with non-hash";
                }
            }
            Hash._update = _update;
            JsRuntime.Interop.add("_update", base + "_update");
        })(Hash = JsRuntime.Hash || (JsRuntime.Hash = {}));
    })(JsRuntime = GeomJS.JsRuntime || (GeomJS.JsRuntime = {}));
})(GeomJS || (GeomJS = {}));
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
///<reference path="Funbase/Primitive.ts"/>
///<reference path="Funbase/Func.ts"/>
///<reference path="Funbase/Value.ts"/>
///<reference path="Funbase/Bootstrap.ts"/>
///<reference path="Funbase/Common.ts"/>
///<reference path="Funbase/Evaluator.ts"/>
///<reference path="Funbase/FunCode.ts"/>
///<reference path="Funbase/GeomBase.ts"/>
///<reference path="Funbase/Interp.ts"/>
///<reference path="Funbase/Name.ts"/>
///<reference path="Funbase/Scanner.ts"/>
///<reference path="Funbase/Plugins/Cell.ts"/>
///<reference path="Funbase/Plugins/StringPrims.ts"/>
///<reference path="Funbase/Plugins/Hash.ts"/>
///<reference path="Funbase/Plugins/BasicPrims.ts"/>
///<reference path="JsRuntime/Value.ts"/>
///<reference path="JsRuntime/Plugins/Inline.ts"/>
///<reference path="JsRuntime/Name.ts"/>
///<reference path="JsRuntime/Interop.ts"/>
///<reference path="JsRuntime/Plugins/BasicPrims.ts"/>
///<reference path="JsRuntime/Plugins/Cell.ts"/>
///<reference path="JsRuntime/Plugins/Hash.ts"/>
///<reference path="JsRuntime/Plugins/StringPrims.ts"/> 
///<reference path="../references.ts"/>
var fs = require('fs');
var spawn = require('child_process').spawn;
var rewriteChar = process.platform === 'win32' ? '\033[0G' : '\r';
global.GeomJS = GeomJS;
var app = GeomJS.Funbase.GeomBase.theApp;
GeomJS.Funbase.Name.bootstrap(GeomJS.Funbase.Bootstrap.nameTable);
GeomJS.Funbase.Hash.install();
GeomJS.Funbase.Cell.install();
GeomJS.Funbase.BasicPrims.install();
GeomJS.Funbase.StringPrims.install();
var execJS = function () {
    var execFunc = GeomJS.JsRuntime.Name.nameTable['_js'];
    while (execFunc()) {
        GeomJS.Funbase.GeomBase.theApp.scanner.resetText();
    }
};
var getExecInterp = function (top) {
    return function () {
        var topFunc = GeomJS.Funbase.Name.find(top);
        while (GeomJS.Funbase.Evaluator.execute(topFunc.subr) === GeomJS.Funbase.BoolValue.True) {
            GeomJS.Funbase.GeomBase.theApp.scanner.resetText();
        }
    };
};
function terminal(evalFunc) {
    process.stdout.write('Welcome to GeomLab\n');
    process.stdin.resume();
    process.stdin.setEncoding('utf8');
    app.eval_loop(GeomJS.Funbase.Scanner.Reader.fromString(''), function (m) {
    }, function (m) {
        process.stdout.write(m + '\n');
    }, function (m) {
    }, function (m) {
        process.stdout.write(m + '\n');
    }, '_js');
    app.eval_loop(GeomJS.Funbase.Scanner.Reader.fromString(''), function (m) {
    }, function (m) {
        process.stdout.write(m + '\n');
    }, function (m) {
    }, function (m) {
        process.stdout.write(m + '\n');
    }, '_top');
    process.stdin.on('data', function (text) {
        GeomJS.Funbase.GeomBase.theApp.scanner = new GeomJS.Funbase.Scanner(GeomJS.Funbase.Scanner.Reader.fromString(text));
        evalFunc();
    });
}
var powTwo = function powtwo(n) {
    if (n.constructor !== Number) {
        return "powtwo expects a number";
    }
    else if (n < 0) {
        return "powtwo expects number >= 0";
    }
    else if (n === 0) {
        return 1;
    }
    else {
        return powtwo(n - 1) + powtwo(n - 1);
    }
};
// Loads compiler, returns _top.
function loadCompilerForBenchmark(compilerName) {
    if (compilerName === 'interp') {
        return getExecInterp("_top");
    }
    execfile(compilerName + ".txt", execJS);
    if (GeomJS.JsRuntime.Name.nameTable['_compiler']() !== compilerName) {
        console.log("Error with compiler: " + compilerName);
        throw new Error();
    }
    return execJS;
}
function benchmark(text, execFunc) {
    GeomJS.Funbase.GeomBase.theApp.scanner = new GeomJS.Funbase.Scanner(GeomJS.Funbase.Scanner.Reader.fromString(text));
    global.gc();
    var start = process.hrtime();
    //powTwo(21);
    execFunc();
    var diff = process.hrtime(start);
    var timeTaken = diff[0] * 1e9 + diff[1];
    console.log(timeTaken);
}
function execfile(filename, execFunc) {
    var text = fs.readFileSync(filename, 'utf8');
    GeomJS.Funbase.Name.reset();
    GeomJS.Funbase.GeomBase.theApp.scanner = new GeomJS.Funbase.Scanner(GeomJS.Funbase.Scanner.Reader.fromString(text));
    execFunc();
}
function round(x) {
    return Math.round(x * 100) / 100;
}
function main() {
    app.eval_loop(GeomJS.Funbase.Scanner.Reader.fromString(""), function (m) {
    }, function (m) {
    }, function (m) {
    }, function (m) {
    }, "_top");
    execfile("compiler.txt", getExecInterp("_top"));
    execfile("compilerjs.txt", getExecInterp("_top"));
    execfile("compilerjs.txt", getExecInterp("_js"));
    execfile("compilerjs.txt", execJS);
    var args = process.argv;
    var compiler = '';
    var evalFunc = execJS;
    for (var i = 2; i < args.length; i++) {
        if (args[i] === '-c') {
            compiler = args[++i];
            evalFunc = loadCompilerForBenchmark(compiler);
        }
        else if (args[i] === '-f') {
            var file = args[++i];
            var str = fs.readFileSync(file, 'utf8');
            benchmark(str, evalFunc);
        }
        else if (args[i] === '-s') {
            var str = args[++i];
            benchmark(str, evalFunc);
        }
        else if (args[i] === '-t') {
            terminal(evalFunc);
        }
    }
    /*execfilejs("compilerjsinline.txt");
    execfilejs("compilerjsinline.txt");
    execfilejs("benchmarks/mandle.geom");*/
}
/* PICTURE SUPPORT */
var GeomJS;
(function (GeomJS) {
    var JsRuntime;
    (function (JsRuntime) {
        function HSVtoRGB(a) {
            var r, g, b, i, f, p, q, t, h, s, v;
            h = a[0];
            s = a[1];
            v = a[2];
            i = Math.floor(h * 6);
            f = h * 6 - i;
            p = v * (1 - s);
            q = v * (1 - f * s);
            t = v * (1 - (1 - f) * s);
            switch (i % 6) {
                case 0:
                    r = v, g = t, b = p;
                    break;
                case 1:
                    r = q, g = v, b = p;
                    break;
                case 2:
                    r = p, g = v, b = t;
                    break;
                case 3:
                    r = p, g = q, b = v;
                    break;
                case 4:
                    r = t, g = p, b = v;
                    break;
                case 5:
                    r = v, g = p, b = q;
                    break;
            }
            //return [round(r), round(g), round(b)];
            return [Math.floor(r * 255), Math.floor(g * 255), Math.floor(b * 255)];
        }
        function fromCharCode(x) {
            return String.fromCharCode(x);
        }
        // This plugin adds the image primitive.
        function imageReal(width, height, pixelFunc, outName) {
            var file = fs.createWriteStream('temp.pam', { flags: 'w', encoding: 'ascii' });
            // Pam file header
            file.write("P7\n");
            file.write("WIDTH " + width + "\n");
            file.write("HEIGHT " + height + "\n");
            file.write("DEPTH 3\n");
            file.write("MAXVAL 255\n");
            file.write("TUPLTYPE RGB\n");
            file.write("ENDHDR\n");
            for (var y = height - 1; y >= 0; y--) {
                for (var x = 0; x < width; x++) {
                    var hsv = JsRuntime.Value.array(pixelFunc(x, y));
                    var rgb = HSVtoRGB(hsv).map(fromCharCode);
                    file.write(rgb[0] + rgb[1] + rgb[2], 'ascii');
                }
            }
            file.end();
            // Use ffmpeg to convert into a png from the pam format.
            spawn('ffmpeg', ['-y', '-i', 'temp.pam', outName + '.png']);
            return [];
        }
        JsRuntime.imageReal = imageReal;
        //Don't actually do convert HSV to RGB or do file IO for benchmarking purposes
        function imageBench(w, h, f, outName) {
            for (var y = Math.round(h - 1); y >= 0; y--) {
                for (var x = 0; x < w; x++) {
                    f(x, y);
                }
            }
            return [];
        }
        JsRuntime.imageBench = imageBench;
        //Interop.add("image", "GeomJS.JsRuntime.imageReal");
        JsRuntime.Interop.add("image", "GeomJS.JsRuntime.imageBench");
    })(JsRuntime = GeomJS.JsRuntime || (GeomJS.JsRuntime = {}));
})(GeomJS || (GeomJS = {}));
main();
