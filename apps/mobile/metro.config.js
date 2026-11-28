const { getSentryExpoConfig } = require("@sentry/react-native/metro");
const path = require("path");

const projectRoot = __dirname;
const monorepoRoot = path.resolve(projectRoot, "../..");

const config = getSentryExpoConfig(projectRoot);

// Only pdfjs `*.min.mjs` builds are assets; a bare "mjs" would turn every package's
// `.mjs` entry (e.g. abort-controller, which backs global AbortSignal) into an asset.
// `wasm` ships pdf.js's JPEG 2000 decoder (`pdfjs-dist/wasm/openjpeg.wasm`); nothing in the native
// bundle imports `.wasm` as code, so it is safe as a plain asset ext.
// Must run after getSentryExpoConfig — passing a pre-mutated config into Sentry rebuilds defaults and drops this.
config.resolver.assetExts = [
  ...config.resolver.assetExts.filter((ext) => ext !== "wasm"),
  "min.mjs",
  "wasm",
];

config.watchFolders = [monorepoRoot];
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, "node_modules"),
  path.resolve(monorepoRoot, "node_modules"),
];

module.exports = config;
