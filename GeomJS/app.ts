///<reference path="Scripts/references.ts"/>

declare var ace: any;

var app = GeomJS.Funbase.GeomBase.theApp;
GeomJS.Funbase.Name.bootstrap(GeomJS.Funbase.Bootstrap.nameTable);
GeomJS.Funbase.Hash.install();
GeomJS.Funbase.Cell.install();
GeomJS.Funbase.BasicPrims.install();
GeomJS.Funbase.StringPrims.install();

function loadFromScript() {
  //GeomJS.bootscript.load();
}

// dumps all the javascript from the compiler as a string that can be included as a script file,
// so that the whole bootstraping process can be avoided!
function dumpJsAsScript() {
  var nt = GeomJS.JsRuntime.Name.nameTable;
  var output = "function load() { ";

  Object.keys(nt).forEach(function (name) {
    // TODO cleanup (this relys on the implementation detail that the compiler outputs
    // functions of the form "_v". Change this to not use that internal detail.
    var src = nt[name].toString();
    if (src[9] === '_' && src[10] === 'v') {
      output += "GeomJS.JsRuntime.Name.nameTable['" + name + "'] = " + src
    }
  });

  output += "}";
}

function begin() {
  loadCompiler('', '_top'); // load original compiler using bootstrap.
  loadCompiler('js', '_top'); //load js compiler using original compiler
  loadCompiler('js', '_js') //compile js compiler using js compiler
  // at this point we switch to now running code using the compiled (javascript) version of the javascript compiler.
  // it is currently in the bootstraped stage so we load in the js compiler to get us finally ready.
  loadFileIntoJs('compilerjs.txt');
  loadFileIntoJs('prelude.txt');
  // phew!
}

function exec(compiler : string): boolean {
  return geomEval(ace.edit("editor").getSession().getValue(), compiler);
}

function execjs(): any {
  var text = ace.edit("editor").getSession().getValue();
  geomEvalJs(text);
}

function clearOutput() {
  var div = document.getElementById("output");
  while (div.hasChildNodes()) {
    div.removeChild(div.lastChild);
  }
}

function geomEvalJs(text: string) {
  clearOutput();
  //GeomJS.Funbase.Name.reset();
  GeomJS.Funbase.GeomBase.theApp.scanner = new GeomJS.Funbase.Scanner(GeomJS.Funbase.Scanner.Reader.fromString(text));
  while (GeomJS.JsRuntime.Name.nameTable['_js']()) {
    GeomJS.Funbase.GeomBase.theApp.scanner.resetText();
  }
  return true;
}

function geomEval(text: string, compiler : string) {
  clearOutput();
  GeomJS.Funbase.Name.reset();
    return app.eval_loop(GeomJS.Funbase.Scanner.Reader.fromString(text), insertStr("echo"), insertStr("result"), (m) => console.log(m), insertStr("error"), compiler);
}

function insertStr(cl: string) {
  return (str: string) => {
    var div = document.getElementById("output");
    var elem = document.createTextNode(str);
    var wrap = document.createElement("div");
    wrap.className = cl;
    wrap.insertBefore(elem, null);
    div.insertBefore(wrap, null);
    div.scrollTop = div.scrollHeight;
  }
}

function loadCompiler(compiler : string, toplevel : string) {
  var req = new XMLHttpRequest();
  req.open('GET', 'compiler' + compiler + '.txt', false);
  req.send(null);
  if (req.status == 200)
    geomEval(req.responseText, toplevel);
}

function loadPrelude() {
  var req = new XMLHttpRequest();
  req.open('GET', 'prelude.txt', false);
  req.send(null);
  if (req.status == 200)
    geomEval(req.responseText, '_top');
}

function loadFileIntoJs(file: string) {
  var req = new XMLHttpRequest();
  req.open('GET', file, false);
  req.send(null);
  if (req.status == 200)
    geomEvalJs(req.responseText);
}