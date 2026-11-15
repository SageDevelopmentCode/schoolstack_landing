// Builds social.html: the review page for all post templates, grouped by character.
const fs = require('fs');
const path = require('path');
const D = __dirname;
const { POSTS, SB } = require('./posts-build.js');

const FEATURE = { terra: 'School Website', pip: 'Enrollment', nutmeg: 'Tuition & Billing', fennel: 'Attendance', clover: 'Timeclock', marigold: 'Marketing', dig: 'Admin Portal',
  loam: 'Messages', dot: 'Calendar & Events', flicker: 'Photos', bramble: 'Forms', tansy: 'Committees' };
const ORDER = ['terra', 'pip', 'nutmeg', 'fennel', 'clover', 'marigold', 'dig', 'loam', 'dot', 'flicker', 'bramble', 'tansy'];
const LAYOUTS = [
  ['Spotlight', '1080 × 1080', 'Feature name, the character and an illustrated screen of the feature.'],
  ['Question', '1080 × 1350', 'A real question from the get-started page, the answer, and two sample notifications.'],
  ['App moment', '1080 × 1920', 'A story-sized post with the character pointing at the app on a phone.'],
  ['Before and after', '1080 × 1080', 'Scattered sticky notes on one side, one tidy system on the other.'],
  ['Customer proof', '1080 × 1350', 'Sage Field stats on the forest panel with a polaroid.'],
  ['Customer quote', '1080 × 1920', 'Sabrina Obnamia’s quote as a story.'],
];
const jpg = (f) => 'data:image/jpeg;base64,' + fs.readFileSync(path.join(D, 'posts', 'preview', `${f}.jpg`)).toString('base64');

const css = fs.readFileSync(path.join(D, 'page.css'), 'utf8') + `
.layouts { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px; margin-top: 4px; }
.layouts div { background: var(--paper); border: 1.5px solid var(--line); border-radius: 18px; padding: 14px 16px; }
.layouts h3 { font-size: 17px; font-weight: 700; display: flex; justify-content: space-between; gap: 8px; }
.layouts h3 span { font-family: var(--f-body); font-size: 12px; color: var(--soft); font-variant-numeric: tabular-nums; }
.layouts p { margin: 4px 0 0; color: var(--soft); font-size: 14px; }
.jump { margin-top: 26px; }
.char { margin-top: 30px; scroll-margin-top: 70px; }
.char-head { display: flex; align-items: center; gap: 14px; border-bottom: 1.5px dashed var(--line); padding-bottom: 10px; margin-bottom: 14px; }
.char-head .av { width: 58px; flex: none; }
.char-head h2 { font-size: 26px; font-weight: 800; }
.char-head p { margin: 0; font-weight: 800; font-size: 12px; letter-spacing: .06em; text-transform: uppercase; color: var(--clay-deep); }
.posts { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 18px; align-items: start; }
.post { margin: 0; background: var(--paper); border: 1.5px solid var(--line); border-radius: 24px; padding: 14px; display: flex; flex-direction: column; gap: 10px; }
.post-img { background: var(--t-cream); border-radius: 16px; padding: 14px; display: grid; place-items: center; }
.post-img img { display: block; width: 100%; height: auto; border-radius: 6px; box-shadow: 0 8px 22px rgba(43,36,29,.18); }
.post-img.tall img { width: 56%; }
.post-img.port img { width: 80%; }
.post h3 { font-size: 18px; font-weight: 700; }
.meta { display: flex; flex-wrap: wrap; gap: 6px; }
.chip { font-size: 11px; font-weight: 800; letter-spacing: .05em; text-transform: uppercase; border-radius: 999px; padding: 3px 9px; background: var(--t-peach); color: var(--clay-deep); }
.chip.alt { background: var(--t-mint); color: var(--ink); text-transform: none; letter-spacing: 0; }
.src { margin: 0; color: var(--soft); font-size: 13px; }
.flag { color: var(--clay-deep); font-weight: 700; }
@media (max-width: 860px) { .layouts { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
@media (max-width: 560px) { .posts, .layouts { grid-template-columns: minmax(0, 1fr); } }
`;
const card = (p) => {
  const cls = p.h === 1920 ? ' tall' : p.h === 1350 ? ' port' : '';
  const flag = /no .* copy exists yet/.test(p.source);
  return `<figure class="post"><div class="post-img${cls}"><img src="${jpg(p.file)}" alt="${p.title} post" loading="lazy" width="${p.w}" height="${p.h}"></div>
    <figcaption><h3>${p.title.split(' · ')[1]}</h3></figcaption>
    <div class="meta"><span class="chip">${p.size}</span><span class="chip alt">${p.file}.png</span></div>
    <p class="src${flag ? ' flag' : ''}"><b>Copy:</b> ${p.source}.</p></figure>`;
};
const groups = ORDER.map((k) => {
  const C = SB.C[k], list = POSTS.filter((p) => p.char === k);
  return `<section class="char" id="${k}" aria-labelledby="${k}-h"><div class="char-head"><div class="av">${SB.svg(C, 'happy', { label: '', standalone: true })}</div><div><p>${FEATURE[k]}</p><h2 id="${k}-h">${C.name}</h2></div></div>
    <div class="posts">${list.map(card).join('')}</div></section>`;
}).join('');

const html = `<title>MudKitchen Social Templates</title>
<meta name="claude:viewport-fit-sides" content="cover">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,500;12..96,700;12..96,800&family=Gochi+Hand&family=Nunito:wght@400;600;700;800&display=swap">
<style>${css}</style>
<header class="top"><div class="wrap">
  <p class="eyebrow">Social templates · the whole crew</p>
  <h1>Twelve features, <em>ready to post</em></h1>
  <p class="intro">Two posts for every character: ${POSTS.length} in total, across six layouts in feed, portrait and story sizes. Every headline, answer, stat and notification is word for word from the MudKitchen site.</p>
  <p class="note" aria-hidden="true">jump to a character ↓</p>
</div></header>
<main class="wrap">
  <section aria-label="Layouts"><div class="layouts">${LAYOUTS.map(([n, s, d]) => `<div><h3>${n} <span>${s}</span></h3><p>${d}</p></div>`).join('')}</div></section>
  <nav class="jump" aria-label="Jump to a character">${ORDER.map((k) => `<a href="#${k}">${SB.C[k].name}</a>`).join('')}</nav>
  ${groups}
  <section class="take next" aria-labelledby="next-h"><h3 id="next-h">Copy still needed</h3>
  <p>The site has no marketing copy for Photos or Committees yet, so Flicker and Tansy borrow real lines from the family-portal and teacher sections. Send a sentence or two for each and those four posts can be updated in minutes.</p></section>
</main>
<footer class="wrap foot"><p>Previews are compressed. Full-size PNG and editable SVG files are in design/mascot-social.</p></footer>`;
fs.writeFileSync(path.join(D, 'social.html'), html);
fs.writeFileSync(path.join(D, 'social-preview.html'), `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"></head><body style="margin:0">${html}</body></html>`);
console.log('social.html', (html.length / 1024).toFixed(0) + 'KB');
