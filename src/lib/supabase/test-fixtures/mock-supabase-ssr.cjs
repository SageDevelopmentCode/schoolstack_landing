"use strict";

module.exports = {
  createServerClient: () => {
    throw new Error("createServerClient should not be used for bearer auth");
  },
};
