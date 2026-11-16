// Builds storybook.html and (optionally) exports every view as a standalone SVG.
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const D = __dirname;
const OUT = process.argv[2];

const bundle = ['sb-kit.js', 'sb-pip.js', 'sb-chars.js'].map((f) => fs.readFileSync(path.join(D, f), 'utf8')).join('\n');
const pageJs = fs.readFileSync(path.join(D, 'sb-page.js'), 'utf8');
const ctx = {};
vm.createContext(ctx);
vm.runInContext(bundle + '\n' + pageJs + '\n;this.SB=SB;this.SBPAGE=SBPAGE;', ctx);
const { SB, SBPAGE } = ctx;

if (OUT) {
  let n = 0;
  SBPAGE.ORDER.forEach((k) => {
    const C = SB.C[k], d = path.join(OUT, k);
    fs.mkdirSync(d, { recursive: true });
    SB.VIEWS.forEach((v, i) => { fs.writeFileSync(path.join(d, `${String(i + 1).padStart(2, '0')}-${v.key}.svg`), SB.svg(C, v, { standalone: true })); n++; });
    C.icon.bgs.forEach((_, b) => { fs.writeFileSync(path.join(d, `27-app-icon-${b ? 'b' : 'a'}.svg`), SB.icon(C, b, { standalone: true })); n++; });
  });
  console.log('exported', n, 'svgs');
}

const css = ['page.css', 'crew.css', 'sb.css'].map((f) => fs.readFileSync(path.join(D, f), 'utf8')).join('\n');
const defs = `<svg width="0" height="0" style="position:absolute" aria-hidden="true" focusable="false"><defs>${SB.baseDefs()}${SBPAGE.ORDER.map((k) => SB.C[k].defs()).join('')}</defs></svg>`;
const html = `<title>MudKitchen Storybook Crew</title>
<meta name="claude:viewport-fit-sides" content="cover">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,500;12..96,700;12..96,800&family=Gochi+Hand&family=Nunito:wght@400;600;700;800&display=swap">
<style>${css}</style>
${defs}
<header class="top">
  <div class="wrap">
    <p class="eyebrow">Brand exploration · Mascot round 3</p>
    <h1>The crew, <em>storybook style</em></h1>
    <p class="intro">Twelve characters with the round-one faces back, drawn like a picture book: warm outlines, painted shading, paper grain and little details. Each one has 17 faces and 9 poses, ready for feature posts, empty states and celebrations.</p>
    <p class="note" aria-hidden="true">tap a character ↓</p>
  </div>
</header>
<main class="wrap">
  ${SBPAGE.cast('pip')}
  <section class="sheet" id="sheet" data-k="pip" aria-labelledby="sheet-h" aria-live="polite">${SBPAGE.sheet('pip')}</section>
  <section class="take next" aria-labelledby="next-h">
    <h3 id="next-h">Next steps</h3>
    <p>Pick the characters you want to keep. From here we can make social post templates in your brand layout, a front, side and back turnaround, and layered files ready for animation. These sheets also work as a detailed brief if you want an illustrator to paint final versions.</p>
  </section>
</main>
<footer class="wrap foot"><p>Vector drafts, drawn in code. Every view shares one body, so each character stays on-model.</p></footer>
<script>${bundle}
${pageJs}</script>`;
fs.writeFileSync(path.join(D, 'storybook.html'), html);
fs.writeFileSync(path.join(D, 'storybook-preview.html'), `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"></head><body style="margin:0">${html}</body></html>`);
console.log('storybook.html', (html.length / 1024).toFixed(0) + 'KB');
