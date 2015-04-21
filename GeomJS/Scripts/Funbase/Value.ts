///<reference path="../references.ts"/>
module GeomJS.Funbase {

  export interface Value {
    type: Type;
    subr?: Func;
  }
  export interface NumValue extends Value {
    value: number;
  }
  export interface BoolValue extends Value {
    value: boolean;
  }
  export interface ListValue extends Value {
    head: Value;
    tail: Value;
  }
  export interface StringValue extends Value {
    value: string;
  }
  export module BoolValue {
    export var True = {
      "type": Type.Bool,
      "value": true,
      "subr": Func.nullFunction(),
      "name": "true"
    };
    export var False = {
      "type": Type.Bool,
      "value": false,
      "subr": Func.nullFunction(),
      "name": "false"
    };
    export function create(b: boolean): BoolValue {
      return b ? True : False;
    }
  }
  export module StringValue {
    export function create(str: string): StringValue {
      return {
        "type": Type.String,
        "value": str,
        "subr": Func.nullFunction()
      }
    }
  }
  export module NumValue {
    export function create(num: number) : NumValue {
      return {
        "type": Type.Number,
        "value": num,
        "subr": Func.nullFunction()
      }
    }
  }
  export module Value {
    export var nil = {
      type: Type.Nil,
      subr: Func.nullFunction()
    };
    export function print(val: any): any {
      var ret = "";
      if (val.type === Type.List) {
        var arr = Value.array(val);
        ret += "[";
        var i = 0;
        for (; i < arr.length - 1; i++) {
          ret += print(arr[i]);
          ret += ", ";
        }
        ret += print(arr[i]);
        ret += "]";
      } else if (val.type === Type.String) {
        ret += val.value;
      }
      else if (val.type === Type.Hash) {
        ret += "<hash>";
      } else if (val.type === Type.Cell) {
        ret += "ref " + print(val.value);
      } else if (val.value !== undefined) {
        ret += JSON.stringify(val.value);
      } else if (val.type === Type.Funvalue) {
        ret += "<function(" + val.subr.arity + ")>";
      } else if (val.type === Type.Nil) {
        ret += "[]";
      } else {
        ret += JSON.stringify(val.name);
      }
      return ret;
    }
    export function apply(val: Value, args: Value[]): Value {
      return val.subr.apply(args, args.length, 0);
    }
    /** Make a list from a sequence of values */
    export function makeList(...elems: Value[]) : Value {
      var val : Value = nil;
      for (var i = elems.length - 1; i >= 0; i--) {
        val = cons(elems[i], val);
      }
      return val;
    }
    export function isCons(val: Value) : boolean {
      return val.type === Type.List;
    }
    export function tail(val: Value): Value {
      if (val.type !== Type.List) {
        throw new ClassCastException();
      }
      return (<ListValue>val).tail;
    }
    export function cons(head: Value, tail: Value) : Value {
      return {
        type: Type.List,
        head: head,
        tail: tail,
        subr: Func.nullFunction()
      }
    }
    export function array(val: Value): any[]{
      if (val.type !== Type.List && val.type !== Type.Nil) {
        throw new ClassCastException();
      }
      var elems = [];
      while (isCons(val)) {
        elems.push(Value.head(val));
        val = Value.tail(val);
      }

      return elems;
    }
    export function head(val: Value): Value {
      if (val.type !== Type.List) {
        throw new ClassCastException();
      }
      return (<ListValue>val).head;
    }

    export function string(val: Value) : string {
      if (val.type !== Type.String) {
        throw new ClassCastException();
      }
      return (<StringValue>val).value;
    }
    export function asNumber(val: Value): number {
      if (val.type !== Type.Number) {
        throw new WrongKindException();
      }
      return (<NumValue>val).value;
    }
    export function funcode(val: Value): FunCode {
      if (val.type !== Type.Funcode) {
        //throw new ClassCastException();
      }
      return <FunCode>val;
    }
    /*export function asBoolean(val: Value): boolean {
      if (val.type !== Type.Bool) {
        throw new WrongKindException();
      }
      return (<BoolValue>val).value;
    }*/
    export function name(val: Value): Name {
      if ((<Name>val).name === undefined) {
        throw new ClassCastException();
      }
      return (<Name>val);
    }
    export function matchPlus(val1 : Value, val2: Value): Value {
      if (val1.type !== Type.Number || val2.type !== Type.Number) {
        throw new ClassCastException();
      }
      var inc = (<NumValue>val2).value;
      var val = (<NumValue>val1).value;
	    var x = val - inc;
      if (inc > 0 && x >= 0 && x % 1 === 0) {
        return NumValue.create(x);
      }
      return null;
    }
  }
}
