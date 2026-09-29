// Synthesizes every sound effect in src/audioCues.ts into public/audio/sfx/
// (48 kHz mono 16-bit WAV). Tonal sounds sit in D major to match the music bed.
// Any file can be swapped for a recorded or generated one with the same name.
//
//   node scripts/make-sfx.mjs              all sounds
//   node scripts/make-sfx.mjs tick ping    just these
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const outDir = resolve(here, "../public/audio/sfx");
const musicFile = resolve(here, "../public/audio/music.mp3");
const SR = 48000;
const TAU = Math.PI * 2;

const N = {
  D2: 73.42, D3: 146.83, Fs3: 185.0, A3: 220.0, D4: 293.66, Fs4: 369.99, A4: 440.0,
  D5: 587.33, Fs5: 739.99, A5: 880.0, B5: 987.77, D6: 1174.66, E6: 1318.51, Fs6: 1479.98,
  A6: 1760.0, B6: 1975.53, D7: 2349.32,
};

// [frequency ratio, amplitude, decay seconds]
const GLOCK = [[1, 1, 0.5], [2.76, 0.3, 0.12], [5.4, 0.12, 0.05], [8.93, 0.05, 0.025]];
const MARIMBA = [[1, 1, 0.3], [3.93, 0.25, 0.05], [9.2, 0.06, 0.015]];
const GLASS = [[1, 1, 1.4], [2.32, 0.45, 0.7], [4.25, 0.25, 0.35], [6.63, 0.12, 0.2], [9.38, 0.06, 0.1]];

// ---------- building blocks ----------

const buf = (sec) => new Float32Array(Math.ceil(sec * SR));

function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function noise(sec, seed) {
  const r = rng(seed);
  const b = buf(sec);
  for (let i = 0; i < b.length; i++) b[i] = r() * 2 - 1;
  return b;
}

function mix(dst, src, at = 0, gain = 1) {
  const o = Math.round(at * SR);
  for (let i = 0; i < src.length && o + i < dst.length; i++) if (o + i >= 0) dst[o + i] += src[i] * gain;
  return dst;
}

function shape(b, f) {
  for (let i = 0; i < b.length; i++) b[i] *= f(i / SR);
  return b;
}

const expDecay = (tau) => (t) => Math.exp(-t / tau);
const ad = (attack, tau) => (t) => (t < attack ? t / attack : Math.exp(-(t - attack) / tau));

function norm(b, peak = 1) {
  let m = 0;
  for (const v of b) m = Math.max(m, Math.abs(v));
  if (m > 0) for (let i = 0; i < b.length; i++) b[i] *= peak / m;
  return b;
}

function sat(b, drive) {
  norm(b);
  const k = Math.tanh(drive);
  for (let i = 0; i < b.length; i++) b[i] = Math.tanh(drive * b[i]) / k;
  return b;
}

// Sine with a fixed or time-varying frequency.
function osc(sec, freq, { amp = () => 1 } = {}) {
  const f = typeof freq === "function" ? freq : () => freq;
  const b = buf(sec);
  let ph = 0;
  for (let i = 0; i < b.length; i++) {
    const t = i / SR;
    b[i] = Math.sin(ph) * amp(t);
    ph += (TAU * f(t)) / SR;
  }
  return b;
}

// Struck-bar / bell tone from a partial table.
function partials(sec, f0, list, { attack = 0.002 } = {}) {
  const b = buf(sec);
  for (const [r, a, tau] of list) {
    if (f0 * r > SR * 0.45) continue;
    mix(b, osc(sec, f0 * r, { amp: (t) => a * Math.min(1, t / attack) * Math.exp(-t / tau) }));
  }
  return b;
}

// Felt-piano-ish: slightly stretched harmonics, upper ones darker and shorter.
function piano(sec, f, { tau = 1.6 } = {}) {
  const list = [];
  for (let n = 1; n <= 12; n++) {
    list.push([n * Math.sqrt(1 + 0.0004 * n * n), n ** -1.6 * Math.exp(-(n * f) / 2600), tau / (1 + 0.45 * (n - 1))]);
  }
  return partials(sec, f, list, { attack: 0.006 });
}

// Detuned additive saw pad with a moving brightness (spectral rolloff in Hz).
function pad(sec, freqs, { amp, bright, harmonics = 10, detune = 0.004 }) {
  const b = buf(sec);
  for (const f of freqs) {
    for (const d of [-detune, detune]) {
      const ff = f * (1 + d);
      const ph = new Float64Array(harmonics);
      for (let i = 0; i < b.length; i++) {
        const t = i / SR;
        const cut = bright(t);
        let s = 0;
        for (let n = 1; n <= harmonics; n++) {
          const fn = ff * n;
          if (fn > 16000) break;
          s += (Math.sin(ph[n - 1]) * Math.exp(-fn / cut)) / n;
          ph[n - 1] += (TAU * fn) / SR;
        }
        b[i] += s * amp(t);
      }
    }
  }
  return b;
}

// RBJ biquad; freq may be a function of time.
function biquad(b, type, freq, q = 0.707) {
  const fq = typeof freq === "function" ? freq : () => freq;
  const out = new Float32Array(b.length);
  let x1 = 0, x2 = 0, y1 = 0, y2 = 0;
  let b0 = 0, b1 = 0, b2 = 0, a1 = 0, a2 = 0;
  for (let i = 0; i < b.length; i++) {
    if (i % 32 === 0) {
      const f = Math.min(SR * 0.45, Math.max(20, fq(i / SR)));
      const w = (TAU * f) / SR;
      const c = Math.cos(w);
      const alpha = Math.sin(w) / (2 * q);
      const a0 = 1 + alpha;
      if (type === "lowpass") { b0 = (1 - c) / 2; b1 = 1 - c; b2 = (1 - c) / 2; }
      else if (type === "highpass") { b0 = (1 + c) / 2; b1 = -(1 + c); b2 = (1 + c) / 2; }
      else { b0 = alpha; b1 = 0; b2 = -alpha; }
      b0 /= a0; b1 /= a0; b2 /= a0;
      a1 = (-2 * c) / a0;
      a2 = (1 - alpha) / a0;
    }
    const x = b[i];
    const y = b0 * x + b1 * x1 + b2 * x2 - a1 * y1 - a2 * y2;
    x2 = x1; x1 = x; y2 = y1; y1 = y;
    out[i] = y;
  }
  return out;
}

// Freeverb-style room (8 damped combs + 4 allpasses); extends the buffer by `tail`.
function reverb(b, { room = 0.8, damp = 0.4, wet = 0.3, tail = 1 } = {}) {
  const len = b.length + Math.round(tail * SR);
  const scale = SR / 44100;
  const combs = [1116, 1188, 1277, 1356, 1422, 1491, 1557, 1617].map((d) => ({ line: new Float32Array(Math.round(d * scale)), i: 0, z: 0 }));
  const aps = [556, 441, 341, 225].map((d) => ({ line: new Float32Array(Math.round(d * scale)), i: 0 }));
  const fb = 0.7 + room * 0.28;
  const out = new Float32Array(len);
  for (let n = 0; n < len; n++) {
    const x = n < b.length ? b[n] : 0;
    const inp = x * 0.015;
    let y = 0;
    for (const c of combs) {
      const o = c.line[c.i];
      c.z = o * (1 - damp) + c.z * damp;
      c.line[c.i] = inp + c.z * fb;
      c.i = (c.i + 1) % c.line.length;
      y += o;
    }
    for (const a of aps) {
      const o = a.line[a.i];
      a.line[a.i] = y + o * 0.5;
      a.i = (a.i + 1) % a.line.length;
      y = o - y;
    }
    out[n] = x * (1 - wet) + y * wet * 3;
  }
  return out;
}

// Peak-normalize (dBFS) with a linear fade on the tail.
function finish(b, { peak = -1, fadeOut = 0.01 } = {}) {
  norm(b, 10 ** (peak / 20));
  const fo = Math.round(fadeOut * SR);
  for (let i = Math.max(0, b.length - fo); i < b.length; i++) b[i] *= (b.length - 1 - i) / fo;
  return b;
}

function writeWav(path, b) {
  const data = Buffer.alloc(44 + b.length * 2);
  data.write("RIFF", 0);
  data.writeUInt32LE(36 + b.length * 2, 4);
  data.write("WAVE", 8);
  data.write("fmt ", 12);
  data.writeUInt32LE(16, 16);
  data.writeUInt16LE(1, 20);
  data.writeUInt16LE(1, 22);
  data.writeUInt32LE(SR, 24);
  data.writeUInt32LE(SR * 2, 28);
  data.writeUInt16LE(2, 32);
  data.writeUInt16LE(16, 34);
  data.write("data", 36);
  data.writeUInt32LE(b.length * 2, 40);
  for (let i = 0; i < b.length; i++) data.writeInt16LE(Math.round(Math.max(-1, Math.min(1, b[i])) * 32767), 44 + i * 2);
  writeFileSync(path, data);
}

// ---------- the sounds ----------

const SOUNDS = {
  hum: () => {
    const T = 12;
    const b = buf(T);
    mix(b, osc(T, N.D2, { amp: () => 0.5 }));
    mix(b, osc(T, N.D3, { amp: (t) => 0.22 * (1 + 0.15 * Math.sin(TAU * 0.23 * t)) }));
    mix(b, osc(T, N.A3, { amp: () => 0.05 }));
    mix(b, biquad(biquad(noise(T, 11), "lowpass", 380), "highpass", 60), 0, 1.2);
    shape(b, (t) => Math.min(1, t / 0.6) * (t > T - 4 ? Math.max(0, (T - t) / 4) : 1));
    return finish(b, { peak: -9 });
  },

  crackle: () => {
    const T = 0.5;
    const b = buf(T);
    const r = rng(7);
    const pops = [[0, 1], [0.035, 0.45], [0.09, 0.3], [0.16, 0.55], [0.24, 0.2], [0.33, 0.25]];
    pops.forEach(([at, a], k) => {
      const len = 0.0015 + r() * 0.003;
      mix(b, biquad(shape(noise(len + 0.004, 100 + k), ad(0.0002, len / 3)), "highpass", 1500), at, a);
    });
    mix(b, shape(biquad(noise(T, 3), "bandpass", 5000, 0.5), (t) => 0.05 * Math.exp(-t / 0.25)));
    return finish(biquad(b, "lowpass", 9000), { peak: -3 });
  },

  tick: () => {
    const T = 0.2;
    const b = buf(T);
    mix(b, shape(biquad(noise(0.02, 5), "bandpass", 3200, 1.2), expDecay(0.0025)), 0, 3);
    mix(b, osc(T, 1850, { amp: ad(0.0005, 0.012) }), 0, 0.5);
    mix(b, osc(T, 620, { amp: ad(0.0008, 0.02) }), 0, 0.35);
    return finish(b, { peak: -2 });
  },

  "whoosh-in": () => {
    const T = 0.6;
    const rise = (t) => Math.min(1, t / 0.48) ** 2.2;
    const b = buf(T);
    mix(b, biquad(noise(T, 21), "bandpass", (t) => 350 + 3200 * rise(t), 0.9));
    mix(b, biquad(noise(T, 22), "lowpass", (t) => 500 + 5000 * rise(t)), 0, 0.35);
    shape(b, (t) => rise(t) * (t > 0.48 ? Math.max(0, 1 - (t - 0.48) / 0.12) : 1));
    return finish(b, { peak: -1 });
  },

  kick: () => {
    const T = 0.8;
    const b = buf(T);
    mix(b, osc(T, (t) => 48 + 110 * Math.exp(-t / 0.035), { amp: (t) => Math.min(1, t / 0.001) * Math.exp(-t / 0.28) }));
    mix(b, shape(biquad(noise(0.01, 31), "lowpass", 2500), expDecay(0.002)), 0, 0.5);
    return finish(reverb(sat(b, 1.6), { room: 0.5, damp: 0.6, wet: 0.12, tail: 0.3 }), { peak: -1, fadeOut: 0.1 });
  },

  shimmer: () => {
    const T = 1.5;
    const b = buf(T);
    const notes = [N.A5, N.B5, N.D6, N.E6, N.Fs6, N.A6, N.B6, N.D7];
    notes.forEach((f, i) => {
      mix(b, partials(0.9, f, GLOCK, { attack: 0.004 }), i * 0.085, 0.35 + 0.65 * Math.sin((Math.PI * (i + 1)) / (notes.length + 1)));
    });
    mix(b, shape(biquad(noise(T, 41), "highpass", 6500), (t) => 0.25 * Math.sin(Math.PI * Math.min(1, t / 1.2))));
    return finish(reverb(b, { room: 0.85, damp: 0.3, wet: 0.45, tail: 1 }), { peak: -1, fadeOut: 0.3 });
  },

  bloom: () => {
    const T = 2;
    const b = pad(T, [N.D3, N.A3, N.D4, N.Fs4], {
      amp: (t) => (t < 0.9 ? (t / 0.9) ** 1.5 : Math.max(0, 1 - (t - 0.9) / 1.1) ** 1.3),
      bright: (t) => 250 + 2300 * Math.sin((Math.PI / 2) * Math.min(1, t / 0.9)),
    });
    return finish(reverb(b, { room: 0.7, damp: 0.5, wet: 0.2, tail: 0.5 }), { peak: -2, fadeOut: 0.2 });
  },

  "whoosh-layered": () => {
    const T = 1.5;
    const end = 1.38;
    const build = (t) => Math.min(1, t / end) ** 1.8;
    const b = buf(T);
    [[51, 0.9, 1], [52, 1.3, 0.7], [53, 2.1, 0.5]].forEach(([seed, rate, g], k) => {
      const n = biquad(noise(T, seed), "bandpass", (t) => 300 + 2600 * build(t) * (0.8 + 0.4 * Math.sin(TAU * rate * t * (1 + 2 * t) + k)), 1.1);
      // Amplitude swirl speeds up (2 Hz to ~12 Hz) as the layers converge.
      mix(b, shape(n, (t) => 0.6 + 0.4 * Math.sin(TAU * (2 * t + 3.5 * t * t) + k * 2.1)), 0, g);
    });
    mix(b, osc(T, (t) => 55 + 70 * build(t), { amp: (t) => 0.25 * build(t) }));
    shape(b, (t) => build(t) * (t > end ? Math.max(0, 1 - (t - end) / 0.06) : 1));
    return finish(b, { peak: -1 });
  },

  "magnet-snap": () => {
    const T = 0.3;
    const b = buf(T);
    const click = (at, g, seed) => mix(b, shape(biquad(noise(0.01, seed), "highpass", 2500), expDecay(0.0012)), at, g);
    click(0, 0.5, 61);
    click(0.012, 1, 62);
    mix(b, partials(T, 2150, [[1, 1, 0.03], [1.58, 0.6, 0.02], [2.41, 0.3, 0.012]], { attack: 0.0003 }), 0.012, 0.25);
    mix(b, osc(T, (t) => 70 + 60 * Math.exp(-t / 0.01), { amp: ad(0.0005, 0.05) }), 0.012, 0.8);
    return finish(sat(b, 1.3), { peak: -1 });
  },

  "glass-chime": () => {
    const T = 2.5;
    const b = buf(T);
    mix(b, partials(T, N.D6, GLASS, { attack: 0.001 }));
    mix(b, partials(T, N.D6 * 1.0025, GLASS, { attack: 0.001 }), 0, 0.5);
    mix(b, partials(T, N.A5, [[1, 1, 1.0], [2, 0.2, 0.4]], { attack: 0.002 }), 0, 0.25);
    mix(b, shape(biquad(noise(0.02, 71), "highpass", 5000), expDecay(0.002)), 0, 0.3);
    return finish(reverb(b, { room: 0.8, damp: 0.35, wet: 0.35, tail: 0.8 }), { peak: -1, fadeOut: 0.4 });
  },

  ping: () => {
    const T = 0.6;
    const b = buf(T);
    mix(b, partials(T, N.A5, [[1, 1, 0.22], [3.93, 0.2, 0.04], [9.2, 0.05, 0.012]], { attack: 0.0015 }));
    mix(b, shape(biquad(noise(0.01, 81), "lowpass", 3000), expDecay(0.0015)), 0, 0.2);
    return finish(reverb(b, { room: 0.5, damp: 0.5, wet: 0.15, tail: 0.3 }), { peak: -1, fadeOut: 0.1 });
  },

  // Varispeeds the music bed itself at the finance flash, so the stop sounds like the track.
  "tape-stop": () => {
    const T = 0.5;
    let src;
    if (existsSync(musicFile)) {
      const raw = execFileSync(
        "ffmpeg",
        ["-v", "error", "-ss", "31.6", "-t", "0.8", "-i", musicFile, "-ac", "1", "-ar", String(SR), "-f", "f32le", "-"],
        { maxBuffer: 1 << 26 },
      );
      src = new Float32Array(raw.buffer.slice(raw.byteOffset, raw.byteOffset + raw.length));
    }
    if (!src || src.length < SR * 0.6) src = pad(0.8, [N.D3, N.A3, N.D4], { amp: () => 1, bright: () => 3000 });
    const b = buf(T);
    let pos = 0;
    for (let i = 0; i < b.length; i++) {
      const k = Math.floor(pos);
      const fr = pos - k;
      b[i] = (src[k] ?? 0) * (1 - fr) + (src[k + 1] ?? 0) * fr;
      pos += (1 - i / b.length) ** 1.6;
    }
    return finish(biquad(b, "lowpass", (t) => 200 + 9000 * (1 - t / T) ** 1.2), { peak: -1, fadeOut: 0.03 });
  },

  "sent-pop": () => {
    const T = 0.3;
    const b = buf(T);
    mix(b, shape(biquad(noise(0.14, 91), "bandpass", (t) => 900 + 3500 * (t / 0.14), 1.5), (t) => (t / 0.14) ** 2), 0, 2);
    mix(b, osc(0.15, (t) => 520 + 700 * (1 - Math.exp(-t / 0.012)), { amp: ad(0.001, 0.035) }), 0.13, 1);
    return finish(b, { peak: -1 });
  },

  pen: () => {
    const T = 0.85;
    const b = buf(T);
    const r = rng(101);
    const grit = noise(T, 102);
    const grain = norm(biquad(noise(T, 103), "lowpass", 90));
    const strokes = [[0, 0.12], [0.13, 0.09], [0.23, 0.14], [0.39, 0.07], [0.47, 0.12], [0.6, 0.2]];
    for (const [at, len] of strokes) {
      const f0 = 2500 + r() * 2000;
      const wobble = 5 + r() * 6;
      const seg = new Float32Array(Math.ceil((len + 0.02) * SR));
      const o = Math.round(at * SR);
      for (let i = 0; i < seg.length; i++) seg[i] = (grit[o + i] ?? 0) * (0.3 + Math.abs(grain[o + i] ?? 0));
      const s = biquad(seg, "bandpass", (t) => f0 * (1 + 0.3 * Math.sin(TAU * wobble * t)), 1.4);
      shape(s, (t) => (t < len ? Math.sin(Math.PI * (t / len)) ** 1.5 : 0));
      mix(b, s, at, 0.7 + r() * 0.3);
    }
    return finish(biquad(biquad(b, "highpass", 1200), "lowpass", 9000), { peak: -3 });
  },

  thock: () => {
    const T = 0.2;
    const b = buf(T);
    mix(b, osc(T, (t) => 300 + 120 * Math.exp(-t / 0.006), { amp: ad(0.0005, 0.022) }));
    mix(b, shape(biquad(noise(0.02, 111), "lowpass", 2200), expDecay(0.003)), 0, 0.9);
    mix(b, osc(T, 1250, { amp: ad(0.0003, 0.008) }), 0, 0.15);
    return finish(sat(b, 1.5), { peak: -1 });
  },

  success: () => {
    const T = 0.9;
    const b = buf(T);
    const tone = [[1, 1, 0.45], [2, 0.25, 0.2], [3, 0.08, 0.1], [4.2, 0.04, 0.05]];
    mix(b, partials(T, N.D5, tone, { attack: 0.003 }), 0, 0.8);
    mix(b, partials(T - 0.12, N.A5, tone, { attack: 0.003 }), 0.12, 1);
    return finish(reverb(b, { room: 0.7, damp: 0.4, wet: 0.25, tail: 0.5 }), { peak: -1, fadeOut: 0.2 });
  },

  boop: () => {
    const T = 0.25;
    const b = buf(T);
    const f = (t) => 330 + 240 * (1 - Math.exp(-t / 0.05));
    mix(b, osc(T, f, { amp: (t) => Math.min(1, t / 0.008) * Math.exp(-Math.max(0, t - 0.06) / 0.05) }));
    mix(b, osc(T, (t) => 2 * f(t), { amp: (t) => 0.15 * Math.min(1, t / 0.008) * Math.exp(-t / 0.05) }));
    return finish(b, { peak: -1, fadeOut: 0.02 });
  },

  thud: () => {
    const T = 0.45;
    const b = buf(T);
    mix(b, osc(T, (t) => 55 + 35 * Math.exp(-t / 0.02), { amp: ad(0.002, 0.11) }));
    mix(b, shape(biquad(noise(T, 121), "lowpass", 380), ad(0.001, 0.05)), 0, 1.5);
    mix(b, osc(T, 175, { amp: ad(0.001, 0.03) }), 0, 0.3);
    return finish(reverb(sat(b, 1.4), { room: 0.4, damp: 0.7, wet: 0.1, tail: 0.2 }), { peak: -1, fadeOut: 0.05 });
  },

  plinks: () => {
    const T = 1.1;
    const b = buf(T);
    const r = rng(131);
    const notes = [N.A6, N.Fs6, N.E6, N.D6, N.B5, N.A5, N.Fs5, N.D5];
    notes.forEach((f, i) => mix(b, partials(0.7, f, GLOCK, { attack: 0.002 }), i * 0.11 + r() * 0.012, 0.75 + r() * 0.25));
    return finish(reverb(b, { room: 0.75, damp: 0.35, wet: 0.3, tail: 0.6 }), { peak: -1, fadeOut: 0.25 });
  },

  downbeat: () => {
    const T = 1.6;
    const b = buf(T);
    mix(b, osc(T, (t) => 42 + 30 * Math.exp(-t / 0.04), { amp: ad(0.002, 0.45) }), 0, 0.9);
    mix(b, shape(biquad(noise(0.3, 141), "lowpass", 160), ad(0.002, 0.06)), 0, 1.2);
    for (const f of [N.D3, N.Fs3, N.A3, N.D4]) mix(b, piano(T, f), 0.005, 0.35);
    return finish(reverb(sat(b, 1.2), { room: 0.8, damp: 0.45, wet: 0.25, tail: 0.8 }), { peak: -1, fadeOut: 0.4 });
  },

  // The film ends 3.9s after the sting, so the whole tail fits.
  sting: () => {
    const T = 3;
    const b = buf(T);
    mix(b, partials(1, N.D5, MARIMBA, { attack: 0.0015 }), 0, 0.6);
    mix(b, osc(1, (t) => 50 + 40 * Math.exp(-t / 0.03), { amp: ad(0.002, 0.3) }), 0, 0.6);
    for (const f of [N.D3, N.A3, N.D4, N.Fs4, N.A4]) mix(b, piano(T, f, { tau: 2.4 }), 0.01, 0.3);
    [N.D6, N.Fs6, N.A6, N.D7, N.A6, N.D7].forEach((f, i) => mix(b, partials(1.4, f, GLOCK, { attack: 0.004 }), 0.25 + i * 0.14, 0.12));
    mix(b, shape(biquad(noise(T, 151), "highpass", 7000), (t) => 0.06 * Math.sin(Math.PI * Math.min(1, t / 2.4))));
    return finish(reverb(b, { room: 0.85, damp: 0.35, wet: 0.35, tail: 0.8 }), { peak: -1, fadeOut: 0.8 });
  },
};

const only = new Set(process.argv.slice(2));
const unknown = [...only].filter((n) => !(n in SOUNDS));
if (unknown.length > 0) {
  console.error(`[sfx] unknown sound(s): ${unknown.join(", ")}. Known: ${Object.keys(SOUNDS).join(", ")}`);
  process.exit(1);
}

mkdirSync(outDir, { recursive: true });
for (const [name, make] of Object.entries(SOUNDS)) {
  if (only.size > 0 && !only.has(name)) continue;
  const b = make();
  writeWav(join(outDir, `${name}.wav`), b);
  console.log(`[sfx] ${name}.wav ${(b.length / SR).toFixed(2)}s`);
}
