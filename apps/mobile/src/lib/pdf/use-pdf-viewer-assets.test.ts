import { readFileSync } from 'node:fs';
import path from 'node:path';

import {
  assertLooksLikePdfJsModule,
  assertLooksLikeWasmBase64,
} from '@/lib/pdf/use-pdf-viewer-assets';

jest.mock('expo-asset', () => ({ Asset: { fromModule: jest.fn() } }));
jest.mock('expo-file-system', () => ({ File: jest.fn() }));

describe('assertLooksLikePdfJsModule', () => {
  it('rejects an HTTP error body saved as the asset', () => {
    expect(() => assertLooksLikePdfJsModule('Asset not found')).toThrow(
      'Bundled pdf.js asset is not a pdf.js build (15 bytes: "Asset not found").',
    );
  });

  it('rejects an empty asset', () => {
    expect(() => assertLooksLikePdfJsModule('')).toThrow('Bundled pdf.js asset is empty.');
  });

  it('accepts a full-size build', () => {
    expect(() => assertLooksLikePdfJsModule('x'.repeat(400_000))).not.toThrow();
  });
});

describe('assertLooksLikeWasmBase64', () => {
  it('accepts a full-size wasm module', () => {
    expect(() => assertLooksLikeWasmBase64(`AGFzbQ${'A'.repeat(200_000)}`)).not.toThrow();
  });

  it('rejects an HTTP error body or an empty read', () => {
    // "Asset not found" in base64.
    expect(() => assertLooksLikeWasmBase64('QXNzZXQgbm90IGZvdW5k', 'openjpeg.wasm')).toThrow(
      'Bundled openjpeg.wasm is not a WebAssembly module (20 base64 chars).',
    );
    expect(() => assertLooksLikeWasmBase64('', 'jbig2.wasm')).toThrow('Bundled jbig2.wasm is empty.');
  });
});

describe('vendored pdf.js decoder fallbacks', () => {
  // Copies of pdfjs-dist/wasm/*_nowasm_fallback.js renamed to .min.mjs so Metro bundles them as
  // assets. They must match the installed pdf.js exactly (the worker's decoder glue changes with it).
  it.each(['openjpeg', 'jbig2'])('%s matches the installed pdfjs-dist', (name) => {
    const vendored = readFileSync(path.join(__dirname, 'vendor', `${name}_nowasm_fallback.min.mjs`), 'utf8');
    const installed = readFileSync(
      require.resolve(`pdfjs-dist/wasm/${name}_nowasm_fallback.js`),
      'utf8',
    );
    // Recopy after a pdfjs-dist upgrade:
    // { printf '/* eslint-disable */\n'; cat node_modules/pdfjs-dist/wasm/NAME_nowasm_fallback.js; } > src/lib/pdf/vendor/NAME_nowasm_fallback.min.mjs
    expect(vendored === `/* eslint-disable */\n${installed}`).toBe(true);
  });
});
