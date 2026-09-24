"use strict";

const createClientCalls = [];

function createClient(url, key, options) {
  createClientCalls.push([url, key, options]);
  return { auth: {} };
}

module.exports = {
  createClient,
  __createClientCalls: createClientCalls,
};
