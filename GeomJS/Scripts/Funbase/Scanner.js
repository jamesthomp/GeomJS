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
//# sourceMappingURL=Scanner.js.map