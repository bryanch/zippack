"use strict";
const zippack = require("./main");
const fs = require("fs");
const path = require("path");

/**
 * cli tool
 * @param {Array = []} argv
 * @param {String = process.cwd()} cwd
 */
function zippackCLI(argv, cwd) {
  const confFile = path.resolve(cwd, "zippack.json");
  const conf = JSON.parse(fs.readFileSync(confFile));
  zippack(conf, console);
}

zippackCLI(process.argv, process.cwd());
