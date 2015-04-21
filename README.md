Try GeomLab in your browser: https://jamesthomp.github.io/GeomJS/GeomJS/index.html

----------

Note: This repository contains all TypeScript and the compiled JavaScript. Installing TypeScript is not required unless you wish to modify the code.

This project requires iojs and Java.

https://iojs.org/en/index.html

http://www.oracle.com/technetwork/java/javase/downloads/index.html

----------

Directory structure:
>     geombench:
>       Java GeomLab modified to allow for benchmarking.
>     geomboot:
>       (old version of) Java GeomLab modified to allow for production of JSON bootfile.
>     GeomJS:
>       GeomLab implementation in JavaScript

----------

To run benchmarks:

1) Build geombench:
>     cd geombench/
>     javac -d out src\funbase\*.java src\funjit\*.java src\geomlab\*.java src\plugins\*.java

2) Run benchmarks:
>     cd GeomJS/
>     iojs benchmark.js

----------

To run web-based JavaScript GeomLab:

- Serve GeomJS/ using a HTTP server
- Open index.html in a web browser

----------

To run command line JavaScript GeomLab:
>     cd GeomJS/
>     iojs nodeexec.js -c compilerinline -t

----------

To compile & bundle all TypeScript into nodeexec.js
>     tsc GeomJS/Scripts/Funbase/tests.ts --out GeomJS/nodeexec.js