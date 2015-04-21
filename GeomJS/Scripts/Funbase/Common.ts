///<reference path="../references.ts"/>
module GeomJS.Common {
  
  export function arraycopy(src, srcStart, dest, destStart, length) {
    for (var i = 0; i < length; i++) {
      dest[destStart + i] = src[srcStart + i];
    }
  }

  export function objectEquals(x, y) {
    if (x === y) {
      return true;
    }

    if (x && x.type !== undefined && y && y.type !== undefined) {
      if (x.type !== y.type && (x.type !== Funbase.Type.Name && y.type !== Funbase.Type.Name)) {
        return false;
      } else {
        switch (x.type) {
        case Funbase.Type.Bool:
        case Funbase.Type.String:
        case Funbase.Type.Number:
          return x.value === y.value;
        case Funbase.Type.Nil:
          return y.type === Funbase.Type.Nil;
        case Funbase.Type.List:
            if (y.type !== Funbase.Type.List)
              return false;
          var xlist = Funbase.Value.array(x);
          var ylist = Funbase.Value.array(y);
          if (xlist.length !== ylist.length)
            return false;
          for (var i = 0; i < xlist.length; i++) {
            if (!objectEquals(xlist[i], ylist[i]))
              return false;
          }
          return true;
        case Funbase.Type.Hash:
            if (y.type !== Funbase.Type.Hash)
              return false;
          return x.mapping.getIterator() === y.mapping.getIterator();
        case Funbase.Type.Cell:
            if (y.cell !== Funbase.Type.Cell)
              return false;
          return objectEquals(x.value, y.value);
        case Funbase.Type.Funvalue:
        case Funbase.Type.Funcode:
        case Funbase.Type.Name:
          return x.name === y.name;
        default:
          return false;
        }
      }
    } else {
      return false;
    }
  }

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

  export class Map {
    private keys = [];
    private values = [];
    private index = -1;
    private eqComp = undefined;
    constructor(eqComp, init?: any[]) {
      this.keys = [];
      this.values = [];
      this.eqComp = eqComp;
      if (init) {
        init.forEach(function (i) { this.set(i[0], i[1]); }, this);
      }
    }
    public get(key) {
      return this.has(key) ? this.values[this.index] : undefined;
    }
    public has(key) {
      this.index = indexOfArr(this.keys, key, this.eqComp);
      return -1 < this.index;
    }
    public set(key, value) {
      this.has(key) ?
        this.values[this.index] = value :
        this.values[this.keys.push(key) - 1] = value;
    }
    public getIterator() {
      var copykeys = this.keys.slice(0);
      var copyvalues = this.values.slice(0);
      var res = [];
      for (var i = 0; i < copykeys.length; i++) {
        res.push([copykeys[i], copyvalues[i]]);
      }
      return res;
    }
  }
}

module GeomJS.Funbase {
  export class WrongKindException { }
  export class ClassCastException { }
  export class Throwable { }
}