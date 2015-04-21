///<reference path="../references.ts"/>

declare var require; 
declare var global;
declare var process;
var fs = require('fs');
var spawn = require('child_process').spawn;

var rewriteChar = process.platform === 'win32' ? '\033[0G' : '\r'

global.GeomJS = GeomJS;

var app = GeomJS.Funbase.GeomBase.theApp;
GeomJS.Funbase.Name.bootstrap(GeomJS.Funbase.Bootstrap.nameTable);
GeomJS.Funbase.Hash.install();
GeomJS.Funbase.Cell.install();
GeomJS.Funbase.BasicPrims.install();
GeomJS.Funbase.StringPrims.install();

var execJS = function() {
  var execFunc = GeomJS.JsRuntime.Name.nameTable['_js'];
  while (execFunc()) {
    GeomJS.Funbase.GeomBase.theApp.scanner.resetText();
  }
}

var getExecInterp = function(top) {
  return function () {
    var topFunc = GeomJS.Funbase.Name.find(top);
    while (GeomJS.Funbase.Evaluator.execute(topFunc.subr) === GeomJS.Funbase.BoolValue.True) {
      GeomJS.Funbase.GeomBase.theApp.scanner.resetText();
    }
  }
}

function terminal(evalFunc) {
  process.stdout.write('Welcome to GeomLab\n');
  process.stdin.resume();
  process.stdin.setEncoding('utf8');
  app.eval_loop(GeomJS.Funbase.Scanner.Reader.fromString(''),(m) => { },(m) => { process.stdout.write(m + '\n'); },(m) => { },(m) => { process.stdout.write(m + '\n'); }, '_js');
  app.eval_loop(GeomJS.Funbase.Scanner.Reader.fromString(''),(m) => { },(m) => { process.stdout.write(m + '\n'); },(m) => { },(m) => { process.stdout.write(m + '\n'); }, '_top');
  process.stdin.on('data', function (text) {
    GeomJS.Funbase.GeomBase.theApp.scanner = new GeomJS.Funbase.Scanner(GeomJS.Funbase.Scanner.Reader.fromString(text));
    evalFunc();
  });
}

var powTwo = function powtwo(n) {
  if (n.constructor !== Number) {
    return "powtwo expects a number";
  } else if (n < 0) {
    return "powtwo expects number >= 0";
  } else if (n === 0) {
    return 1;
  } else {
    return powtwo(n - 1) + powtwo(n - 1);
  }
} 

// Loads compiler, returns _top.
function loadCompilerForBenchmark(compilerName: string) {
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

function benchmark(text: string, execFunc) {
  GeomJS.Funbase.GeomBase.theApp.scanner = new GeomJS.Funbase.Scanner(GeomJS.Funbase.Scanner.Reader.fromString(text));
  global.gc();
  var start = process.hrtime();
  //powTwo(21);
  execFunc()
  var diff = process.hrtime(start);
  var timeTaken = diff[0] * 1e9 + diff[1];
  console.log(timeTaken);
}

function execfile(filename: string, execFunc) {
    var text = fs.readFileSync(filename, 'utf8');
    GeomJS.Funbase.Name.reset();
    GeomJS.Funbase.GeomBase.theApp.scanner = new GeomJS.Funbase.Scanner(GeomJS.Funbase.Scanner.Reader.fromString(text));
    execFunc();
}

function round(x) {
  return Math.round(x * 100) / 100;
}

function main() {
  app.eval_loop(GeomJS.Funbase.Scanner.Reader.fromString(""),(m) => { },(m) => { /*console.log(m);*/ },(m) => { },(m) => { }, "_top");
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
    } else if (args[i] === '-f') {
      var file = args[++i];
      var str = fs.readFileSync(file, 'utf8');
      benchmark(str, evalFunc);
    } else if (args[i] === '-s') {
      var str = args[++i];
      benchmark(str, evalFunc);
    } else if (args[i] === '-t') {
      terminal(evalFunc);
    }
  }
  
  /*execfilejs("compilerjsinline.txt");
  execfilejs("compilerjsinline.txt");
  execfilejs("benchmarks/mandle.geom");*/
}


/* PICTURE SUPPORT */
module GeomJS.JsRuntime {
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
      case 0: r = v, g = t, b = p; break;
      case 1: r = q, g = v, b = p; break;
      case 2: r = p, g = v, b = t; break;
      case 3: r = p, g = q, b = v; break;
      case 4: r = t, g = p, b = v; break;
      case 5: r = v, g = p, b = q; break;
    }
    //return [round(r), round(g), round(b)];
    return [Math.floor(r * 255), Math.floor(g * 255), Math.floor(b * 255)];
  }

  function fromCharCode(x) {
    return String.fromCharCode(x);
  }

  // This plugin adds the image primitive.
  export function imageReal(width, height, pixelFunc, outName) {
    var file = fs.createWriteStream('temp.pam', { flags: 'w', encoding: 'ascii' });

    // Pam file header
    file.write("P7\n");
    file.write("WIDTH " + width + "\n");
    file.write("HEIGHT " + height + "\n");
    file.write("DEPTH 3\n");
    file.write("MAXVAL 255\n");
    file.write("TUPLTYPE RGB\n");
    file.write("ENDHDR\n");

    // Write out pixels in RGB from top to bottom, left to right.
    for (var y = height - 1; y >= 0; y--) {
      for (var x = 0; x < width; x++) {
        var hsv = Value.array(pixelFunc(x, y));
        var rgb = HSVtoRGB(hsv).map(fromCharCode);
        file.write(rgb[0] + rgb[1] + rgb[2], 'ascii');
      }
    }

    file.end();
    
    // Use ffmpeg to convert into a png from the pam format.
    spawn('ffmpeg', ['-y', '-i', 'temp.pam', outName + '.png']);

    return [];
  }

  //Don't actually do convert HSV to RGB or do file IO for benchmarking purposes
  export function imageBench(w, h, f, outName) {
    for (var y = Math.round(h - 1); y >= 0; y--) {
      for (var x = 0; x < w; x++) {
        f(x, y);
      }
    }
    return [];
  }
  
  //Interop.add("image", "GeomJS.JsRuntime.imageReal");
  Interop.add("image", "GeomJS.JsRuntime.imageBench");
}


main();