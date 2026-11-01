const { getSentryExpoConfig } = require("@sentry/react-native/metro");
const path = require("path");

const projectRoot = __dirname;
const monorepoRoot = path.resolve(projectRoot, "../..");

const config = getSentryExpoConfig(projectRoot);

// Only pdfjs `*.min.mjs` builds are assets; a bare "mjs" would turn every package's
// `.mjs` entry (e.g. abort-controller, which backs global AbortSignal) into an asset.
// Must run after getSentryExpoConfig — passing a pre-mutated config into Sentry rebuilds defaults and drops this.
config.resolver.assetExts = [...config.resolver.assetExts, "min.mjs"];

config.watchFolders = [monorepoRoot];
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, "node_modules"),
  path.resolve(monorepoRoot, "node_modules"),
];

module.exports = config;
