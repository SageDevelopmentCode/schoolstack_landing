// Temp audio for the Dream animatic, into public/audio/dream/:
//   click.wav  metronome at the edit's BPM (accent on each bar) so cut timing can
//              be judged before the licensed music.mp3 exists
//   buzz.wav   phone vibrating twice on a table (the hook)
// Swap either for a real recording with the same name.
import { execFileSync } from "node:child_process";
import { mkdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const outDir = resolve(here, "../public/audio/dream");
mkdirSync(outDir, { recursive: true });
const { BPM } = await import("../src/dream/edl.ts");

const beat = 60 / BPM;
const bar = beat * 4;
// Short sine blips: 1760 Hz on the bar, 880 Hz on other beats, 30 ms each.
const click = [
  `if(lt(mod(t,${bar}),0.03), 0.6*sin(2*PI*1760*t)*exp(-mod(t,${bar})*90),`,
  `if(lt(mod(t,${beat}),0.03), 0.45*sin(2*PI*880*t)*exp(-mod(t,${beat})*90), 0))`,
].join("");
execFileSync("ffmpeg", ["-v", "error", "-y", "-f", "lavfi", "-i", `aevalsrc='${click}':s=48000:d=45`, join(outDir, "click.wav")]);

// Two 0.45s bursts of a 165 Hz buzz with a 31 Hz wobble, 0.25s apart.
const buzzOn = (a, b) => `between(t,${a},${b})`;
const buzz = `(${buzzOn(0, 0.45)}+${buzzOn(0.7, 1.15)})*0.5*sin(2*PI*165*t)*(0.6+0.4*sin(2*PI*31*t))`;
execFileSync("ffmpeg", [
  "-v", "error", "-y", "-f", "lavfi", "-i", `aevalsrc='${buzz}':s=48000:d=1.3`,
  "-af", "lowpass=f=900,highpass=f=80,afade=t=out:st=1.15:d=0.1",
  join(outDir, "buzz.wav"),
]);

console.log(`[audio:dream] wrote click.wav (${BPM} BPM) and buzz.wav to public/audio/dream/`);
execFileSync("node", [join(here, "sync-assets.mjs")], { stdio: "inherit" });
