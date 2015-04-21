///<reference path="../references.ts"/>
module GeomJS.Funbase {
  "use strict";
  export class Scanner {
    public tok: Name;
    public sym: Value;

    private reader: Scanner.Reader;
    private push_back: string = "";
    private line_num = 1;
    private char_num = 0;
    private start_char = 0;
    private root_char = 0;
    private last_char = 0;

    /* The scanner keeps track of the text that has been scanned, so that
     * the defining text can be saved with each name in the global env.
     * The variable 'virgin' indicates whether we are skipping characters that
     * come before the first token of the text. */
    private text = "";
    private virgin = true;

    constructor(reader: Scanner.Reader) {
      this.reader = reader;
    }

    private readChar(): number {
      var ich = this.reader.read();
      if (ich < 0) {
        return 0;
      }
      return ich;
    }

    private getChar(): string {
      var ch = "";
      var ci = 0;
      if (this.push_back.length === 0) {
        ci = this.readChar();
        ch = String.fromCharCode(ci);
      } else {
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
    }

    /** Push back one character onto the input */
    private pushBack(ch: string): void {
      if (ch !== String.fromCharCode(0)) {
        this.char_num -= 1;
        this.push_back += ch;
        this.text = this.text.slice(0, -1);
      }
    }

    public getText(): string {
      var desiredLength = this.last_char - this.root_char;
      this.text = this.text.slice(0, desiredLength);
      return this.text;
    }

    public resetText(): void {
      this.text = "";
      this.virgin = true;
    }

    private ATOM = Name.find("atom");
    private BRA = Name.find("bra");
    private COMMA = Name.find("comma");
    private EOF = Name.find("eof");
    private EOL = Name.find("eol");
    private KET = Name.find("ket");
    private LPAR = Name.find("lpar");
    private NUMBER = Name.find("number");
    private RPAR = Name.find("rpar");
    private SEMI = Name.find("semi");
    private STRING = Name.find("string");
    private VBAR = Name.find("vbar");
    private OP = Name.find("op");
    private IDENT = Name.find("ident");

    private static opchars = ".!#$%&*+-/:<=>?@^~";
    private static letters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
    private static digits = "0123456789";

    private isOpChar(ch: string): boolean {
      return Scanner.opchars.indexOf(ch) !== -1;
    }

    private isLetter(ch: string): boolean {
      return Scanner.letters.indexOf(ch) !== -1;
    }

    private isDigit(ch: string): boolean {
      return Scanner.digits.indexOf(ch) !== -1;
    }

    public scan(): void {
      this.start_char = this.char_num;
      var ch = this.getChar();
      this.tok = null;
      this.sym = Value.nil;
      while (this.tok == null) {
        switch (ch) {
          case "\0": // EOF
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
            this.line_num++; this.start_char = this.char_num;
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
              } else if (ch === "}") {
                depth--;
              } else if (ch === "\n") {
                this.line_num++;
              } else if (ch === "\0") {
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
            this.tok = this.LPAR; break;
          case ")":
            this.tok = this.RPAR; break;
          case "[":
            this.tok = this.BRA; break;
          case "]":
            this.tok = this.KET; break;
          case ",":
            this.tok = this.COMMA; break;
          case ";":
            this.tok = this.SEMI; break;
          case "|":
            this.tok = this.VBAR; break;
          case '"':
            var str = "";
            ch = this.getChar();
            while (ch !== '"' && ch !== "\n" && ch !== "\0") {
              str += ch;
              ch = this.getChar();
            }
            if (ch === '"') {
              this.tok = this.STRING;
              this.sym = StringValue.create(str);
            } else {
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
            } else if (this.isOpChar(ch)) {
              while (this.isOpChar(ch)) {
                buf += ch;
                ch = this.getChar();
              }
            } else {
              this.syntax_error("#idop");
            }
            this.pushBack(ch);
            this.tok = this.ATOM;
            this.sym = Name.find(buf.toString());
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
              var x: Name = Name.find(buf.toString());
              this.tok = this.IDENT;
              this.sym = x;
            } else if (this.isDigit(ch)) {
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
                } else {
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
              this.sym = NumValue.create(val);
            } else if (this.isOpChar(ch)) {
              // A symbolic operator
              var buf = "";
              while (this.isOpChar(ch)) {
                buf += ch;
                ch = this.getChar();
              }
              this.pushBack(ch);
              var x = Name.find(buf);
              this.tok = this.OP;
              this.sym = x;
            } else {
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
    }


    public nextToken(): Value {
      this.scan();
      return Value.makeList(this.tok, this.sym);
    }

    public nextTokenJs(): JsRuntime.Value {
      this.scan();
      var tokJs = new JsRuntime.Name(Value.name(this.tok).name);
      var symJs;
      if (this.sym.type === Type.Number) {
        symJs = Value.asNumber(this.sym);
      } else if (this.sym.type === Type.String) {
        symJs = Value.string(this.sym);
      } else if (this.sym.type === Type.Nil) {
        symJs = [];
      } else {
        symJs = new JsRuntime.Name(Value.name(this.sym).name);
      }
      return [tokJs, [symJs, []]];
    }

    private badToken(): void {
      this.syntax_error("#badtok");
    }

    private error_chars(): string {
      if (this.tok === this.EOF) {
        return "end of input";
      } else if (this.tok === this.EOL) {
        return "end of line";
      } else {
        return "'" + this.text.substring(this.start_char - this.root_char, this.start_char - this.root_char + 10) + "'";
      }
    }

    /** Report a syntax error at the current token */
    public syntax_error(errtag: string, args: any[] = null): void {
      console.log(errtag);
      console.log(args);
      console.log(this.error_chars());
      console.log(this.line_num);
      throw new Scanner.SyntaxError(errtag, args, this.line_num, this.start_char, this.char_num, this.error_chars());
    }
  }
}

module GeomJS.Funbase.Scanner {
  "use strict";
  export interface Reader {
    read(): number; // next character (-1 on EOF)
  }

  export module Reader {
    export function fromString(str: string): Reader {
      var index = 0;
      return {
        read: () => {
          var c = str.charCodeAt(index++);
          if (!c) {
            return -1;
          }
          return c;
        }
      };
    }
  }

  export class SyntaxError {
    public line: number;
    public start: number;
    public end: number;
    public errtag: string;
    public errtok: string;
    public args: any[];

    constructor(errtag: string, args: any[], line: number, start: number, end: number, errtok: string) {
      this.errtag = errtag;
      this.args = args;
      this.line = line;
      this.start = start;
      this.end = end;
      this.errtok = errtok;
    }
  }
}
