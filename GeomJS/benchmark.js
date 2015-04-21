var spawn = require('child_process').spawn
var fs = require('fs');

var NUM_RUNS_PER_BENCHMARK = 3;
var MAX_OFF_PERCENT = 0.075; // 7.5%
var taskIndex = 0;
var tasks = [];
var reruns = [];

var JAVA_EXEC = 'java';
var IOJS_EXEC = 'iojs';
var JAVA_ARGS = ['-classpath', '..\\geombench\\out\\', 'geomlab.RunScript', '-b', '../geombench/src/boot.txt', '../geombench/src/compiler.txt'];
var IOJS_ARGS = ['--expose-gc', 'nodeexec.js'];

function processTask() {
  if (taskIndex == tasks.length)
  {
    console.log("Reruns: " + reruns.length);
    console.log("Benchmarks: " + tasks.length);
    return;
  }
  var task = tasks[taskIndex++];
  benchmark(task, NUM_RUNS_PER_BENCHMARK, []);
}

function round(x) {
    return Math.round(x * 100) / 100;
}

function benchResult(runs) {
    var minRun = runs[0];
    var maxRun = runs[0];
    var sum = 0;
    runs.forEach(function (run) {
        sum += run;
        minRun = Math.min(minRun, run);
        maxRun = Math.max(maxRun, run);
    });
    var average = sum / runs.length;
    var results = [round(minRun * 1e-6), round(maxRun * 1e-6), round(average * 1e-6)];
    return results;
}

function benchmark(task, times, runs) {
  var proc = spawn(task[0], task[1]);
  // console.log(task[0] + " " + task[1].join(' '));
  proc.stdout.on('data', function (data) {
    var timeTaken = ('' + data).split('\n')[0];
    runs.push(parseInt(timeTaken));
  });
  proc.stderr.on('data', function (data) {
    process.stdout.write(task[2] + " " + data);
  });
  proc.on('close', function(code) {
    if (code !== 0) {
      console.log('WARNING: process exited with code ' + code);
    }
    if (times > 1) {
      benchmark(task, times - 1, runs);
    } else {
      var results = benchResult(runs);
      var error = results[2] * MAX_OFF_PERCENT;
      if (results[0] < results[2] - error || results[1] > results[2] + error) {
        reruns.push(task[2]);
        benchmark(task, NUM_RUNS_PER_BENCHMARK, []);
      } else {
        process.stdout.write(task[2] + " " + benchResult(runs) + "\n");
        processTask();
      }
    }
  });
  proc.on('error', function(error) {
    console.log(error);
  })
}

function populateTasksFromDirectory(compilers, benchmarkDirectory) {
  var files = fs.readdirSync(benchmarkDirectory);
  compilers.forEach(function (compiler) {
    files.forEach(function (file) {
      if (compiler === 'java') {
        tasks.push([JAVA_EXEC, JAVA_ARGS.concat(['-benchf', '../GeomJS/benchmarks/' + file]), compiler + " " + file]);
      } else {
        tasks.push([IOJS_EXEC, IOJS_ARGS.concat(['-c', compiler, '-f', 'benchmarks/' + file]), compiler + " " + file]);
      }
    });
  });
}

function populateTasksFromPowTwo(compilers) {
  var makePowTwo = function (x) {
    return 'define powtwo(x) = 1 when x = 0 | powtwo(x) = powtwo(x - 1) + powtwo(x - 1); powtwo(' + x + ')';
  }

  compilers.forEach(function (compiler) {
    for (var i = 8; i < 27; i++) {
      if (compiler === 'java') {
        tasks.push([JAVA_EXEC, JAVA_ARGS.concat(['-benchs', makePowTwo(i)]), compiler + " " + i]);
      } else {
        tasks.push([IOJS_EXEC, IOJS_ARGS.concat(['-c', compiler, '-s', makePowTwo(i)]), compiler + " " + i]);
      }
    }
  });
}

var COMPILERS = ['java', 'compilerjs', 'compilerjsinline', 'interp'];
populateTasksFromDirectory(COMPILERS, 'benchmarks/');
populateTasksFromPowTwo(COMPILERS);
processTask();