"use strict";

const Module = require("node:module");
const path = require("node:path");

const stubPath = path.join(__dirname, "server-only-stub.cjs");
const originalResolveFilename = Module._resolveFilename;

Module._resolveFilename = function (request, parent, isMain, options) {
  if (request === "server-only") {
    return stubPath;
  }

  return originalResolveFilename.call(this, request, parent, isMain, options);
};
