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
//# sourceMappingURL=Hash.js.map