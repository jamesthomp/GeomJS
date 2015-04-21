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
//# sourceMappingURL=FunCode.js.map