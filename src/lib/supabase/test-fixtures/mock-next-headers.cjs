"use strict";

const ACCESS_TOKEN = "headers-fallback-token";

module.exports = {
  headers: async () => ({
    get(name) {
      if (name === "authorization") {
        return `Bearer ${ACCESS_TOKEN}`;
      }
      return null;
    },
  }),
  cookies: async () => ({
    getAll: () => [],
    set: () => {},
  }),
  __ACCESS_TOKEN: ACCESS_TOKEN,
};
