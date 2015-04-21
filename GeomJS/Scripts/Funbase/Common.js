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
//# sourceMappingURL=Common.js.map