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
//# sourceMappingURL=Value.js.map