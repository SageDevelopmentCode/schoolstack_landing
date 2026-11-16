// Builds index.html (the design-sheet page) and exports every view as SVG.
const fs = require('fs');
const path = require('path');
const M = require('./mascots.js');

const OUT_DIR = process.argv[2];

const META = {
  pip: {
    name: 'Pip', kind: 'the mud-pie sprout', option: 'A',
    bio: 'A warm little dollop of garden mud with a seedling on top that grows as your school does. Pip is the eager helper: first to cheer, a bit impatient, always sprouting a new idea.',
    hook: 'The two-leaf sprout. The leaves perk up, droop and flop with the mood, so Pip still reads at 24px.',
    voice: 'Bouncy, upbeat, first to say "you did it!"',
    fit: 'Mud is in the name. The most ownable and the simplest shape to animate.',
    risk: 'A plain brown blob can drift toward a poop emoji. Keep the sprout and the clay orange at every size.',
    swatches: ['#C97A58', '#93492F', '#7FA86A', '#EE8A72'],
  },
  nutmeg: {
    name: 'Nutmeg', kind: 'the acorn kid', option: 'B',
    bio: 'A small acorn with a big future and a cap that never sits straight. Nutmeg is the curious explorer: pockets full of treasures, always asking "what\'s this?"',
    hook: 'The tilting cap. It slides, tips and pops off with the mood, like a kid\'s beanie.',
    voice: 'Curious and earnest, a little goofy.',
    fit: 'Little acorns grow into oaks, a natural match for milestones and growth.',
    risk: 'Acorns are a common motif, so the cap behaviour has to carry the identity.',
    swatches: ['#D49354', '#6B452B', '#7FA86A', '#EE8A72'],
  },
  dig: {
    name: 'Dig', kind: 'the little mole chef', option: 'C',
    bio: 'A bespectacled mole in a mud-kitchen apron, wooden spoon always in paw. Dig is the hands-on teacher type: stirs up mud pies, digs into every project and is quietly proud of everyone.',
    hook: 'Round glasses, a pink nose and a spoon. Recognisable from the face alone.',
    voice: 'Warm, wise, gently funny.',
    fit: 'The most "mud kitchen" of the four. Glasses make it feel trustworthy to parents and teachers.',
    risk: 'More detail than the others, so the app icon needs the face crop. Moles are less instantly cute to some people.',
    swatches: ['#84665A', '#F2CF5E', '#EE8F7F', '#C48E57'],
  },
  terra: {
    name: 'Terra', kind: 'the pot snail', option: 'D',
    bio: 'A snail who carries a garden on their back: a terracotta pot that blooms as families settle in. Terra is the patient one, never rushes and always notices the small wins.',
    hook: 'Eye-stalks and a blooming pot. The flower opens wider as progress grows.',
    voice: 'Calm, kind, quietly delighted.',
    fit: 'The terracotta pot echoes the current bowl logo. The most distinctive silhouette of the four.',
    risk: 'A snail reads as slow, which can clash with "set up in minutes" messaging. Eye-stalks take more work to animate.',
    swatches: ['#E9B798', '#BF6441', '#FFE07A', '#7FA86A'],
  },
};
const POSES = [
  ['happy', 'Happy & excited', 'Photos shared, message sent'],
  ['curious', 'Curious & thinking', 'Empty states, tips, search'],
  ['silly', 'Silly & mischievous', 'Loading, 404, playful nudges'],
  ['supportive', 'Supportive', 'Reminders, unsigned forms'],
  ['celebrate', 'Celebrating', 'Enrollment done, tuition paid'],
  ['wave', 'Waving hello', 'Login, welcome, first open'],
];
const TINT = { happy: 'butter', curious: 'sky', silly: 'lav', supportive: 'mint', celebrate: 'peach', wave: 'cream' };
const ORDER = ['pip', 'nutmeg', 'dig', 'terra'];

// ---------- export files ----------
if (OUT_DIR) {
  ORDER.forEach((c) => {
    const d = path.join(OUT_DIR, c);
    fs.mkdirSync(d, { recursive: true });
    const files = [['01-neutral', 'neutral'], ...POSES.map(([e], i) => [`0${i + 2}-${e}`, e])];
    files.forEach(([f, e]) => fs.writeFileSync(path.join(d, `${f}.svg`), M.render(c, e, { label: `${META[c].name}, ${e}` })));
    M.CHARS[c].icon.bgs.forEach((_, i) => fs.writeFileSync(path.join(d, `08-app-icon-${i === 0 ? 'a' : 'b'}.svg`), M.icon(c, i, { label: `${META[c].name} app icon` })));
  });
}

// ---------- page ----------
const lineup = ORDER.map((c) => {
  const m = META[c];
  return `<a class="pick" href="#${c}">
    <span class="opt">Option ${m.option}</span>
    <div class="pick-art">${M.render(c, 'neutral', { label: `${m.name}, standing` })}</div>
    <h3>${m.name}</h3>
    <p class="kind">${m.kind}</p>
    <div class="pick-tests" aria-hidden="true">
      <div class="sil">${M.render(c, 'neutral', { label: '' })}</div>
      <div class="tiny">${M.icon(c, 0)}</div>
      <div class="tiny t24">${M.icon(c, 0)}</div>
    </div>
  </a>`;
}).join('');

const sheet = (c) => {
  const m = META[c];
  const ic = M.CHARS[c].icon;
  return `<section class="sheet" id="${c}" aria-labelledby="${c}-h">
  <div class="sheet-head">
    <figure class="hero">
      <span class="fig-label">1 · Neutral</span>
      ${M.render(c, 'neutral', { label: `${m.name}, standing`, cls: 'bob' })}
    </figure>
    <div class="bio">
      <p class="opt">Option ${m.option}</p>
      <h2 id="${c}-h">${m.name} <span>${m.kind}</span></h2>
      <p class="lead">${m.bio}</p>
      <dl class="traits">
        <div><dt>Signature</dt><dd>${m.hook}</dd></div>
        <div><dt>Voice</dt><dd>${m.voice}</dd></div>
        <div><dt>Why it fits</dt><dd>${m.fit}</dd></div>
        <div><dt>Watch out</dt><dd>${m.risk}</dd></div>
      </dl>
      <div class="swatches" aria-label="Key colours">${m.swatches.map((s) => `<span style="background:${s}" title="${s}"></span>`).join('')}</div>
    </div>
  </div>
  <ol class="poses">
    ${POSES.map(([e, label, use], i) => `<li class="pose t-${TINT[e]}">
      ${M.render(c, e, { label: `${m.name}, ${label.toLowerCase()}` })}
      <p class="pose-name"><span>${i + 2}</span> ${label}</p>
      <p class="pose-use">${use}</p>
    </li>`).join('')}
  </ol>
  <div class="system">
    <div class="panel icons">
      <h3><span>8</span> App icon</h3>
      <div class="icon-row">
        ${ic.bgs.map((_, i) => `<div class="icon-big">${M.icon(c, i, { label: `${m.name} app icon` })}</div>`).join('')}
      </div>
      <div class="sizes" aria-label="Size test">
        ${[96, 48, 32, 24].map((s) => `<figure><div style="width:${s}px">${M.icon(c, 0, { label: '' })}</div><figcaption>${s}px</figcaption></figure>`).join('')}
      </div>
    </div>
    <div class="panel context">
      <h3>In context <span class="sample">sample copy</span></h3>
      <div class="notif">
        <div class="notif-icon">${M.icon(c, 0, { label: '' })}</div>
        <div class="notif-body"><p class="notif-top"><b>MudKitchen</b><span>now</span></p><p>Maya's enrollment is complete. Welcome to the family!</p></div>
      </div>
      <div class="toast">
        <div class="toast-art">${M.render(c, 'celebrate', { label: '' })}</div>
        <div><p class="toast-title">All forms signed</p><p class="toast-sub">That's everything for this term.</p></div>
      </div>
      <div class="empty">
        <div class="empty-art">${M.render(c, 'curious', { label: '' })}</div>
        <div><p class="toast-title">No photos yet</p><p class="toast-sub">Class photos will show up here.</p></div>
      </div>
    </div>
  </div>
</section>`;
};

const compareRows = [
  ['Reads at 24px', ['Strong: sprout + blob', 'Good: cap shape', 'Good: glasses', 'Strong: stalks + pot']],
  ['Expression range', ['Face + leaves', 'Face + cap', 'Face, paws, spoon', 'Stalks + bloom']],
  ['Feels like MudKitchen', ['Mud, literally', 'Garden, growth', 'Mud kitchen, cooking', 'Gardening, logo pot']],
  ['Parent & teacher trust', ['Friendly', 'Friendly', 'Highest (glasses)', 'Calm, gentle']],
  ['Ease to animate', ['Easiest', 'Easy', 'Medium', 'Harder']],
];

const css = fs.readFileSync(path.join(__dirname, 'page.css'), 'utf8');

const html = `<title>MudKitchen Mascot Options</title>
<meta name="claude:viewport-fit-sides" content="cover">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,500;12..96,700;12..96,800&family=Gochi+Hand&family=Nunito:wght@400;600;700;800&display=swap">
<style>${css}</style>
<header class="top">
  <div class="wrap">
    <p class="eyebrow">Brand exploration · Mascot round 1</p>
    <h1>Who should grow up <em>with MudKitchen?</em></h1>
    <p class="intro">Four original characters from the world of mud kitchens and gardens. Each one has the same eight-part sheet: neutral, five moods, two poses and an app icon. Compare them side by side, then pick one to refine.</p>
    <p class="note" aria-hidden="true">pick a favourite ↓</p>
  </div>
</header>
<main class="wrap">
  <section class="lineup" aria-label="The four options">${lineup}</section>
  <p class="legend">Under each character: the silhouette, then the app icon at 48px and 24px.</p>
  <nav class="jump" aria-label="Jump to a sheet">${ORDER.map((c) => `<a href="#${c}">${META[c].option} · ${META[c].name}</a>`).join('')}<a href="#compare">Compare</a></nav>
  ${ORDER.map(sheet).join('')}
  <section class="compare" id="compare" aria-labelledby="compare-h">
    <h2 id="compare-h">How they compare</h2>
    <div class="table-wrap"><table>
      <thead><tr><th scope="col"></th>${ORDER.map((c) => `<th scope="col"><span class="th-art">${M.icon(c, 0, { label: '' })}</span>${META[c].name}</th>`).join('')}</tr></thead>
      <tbody>${compareRows.map(([k, v]) => `<tr><th scope="row">${k}</th>${v.map((x) => `<td>${x}</td>`).join('')}</tr>`).join('')}</tbody>
    </table></div>
    <div class="take">
      <h3>My take</h3>
      <p><b>Pip</b> is the strongest brand mark. It has the simplest silhouette, the sprout works on its own as an icon, and "mud" is literally in the name. <b>Dig</b> has the most personality for in-app moments and earns parents' trust fastest. If neither is quite right, a common next step is to cross the two: Pip's shape and sprout with Dig's apron and spoon.</p>
      <p>Once you pick a direction, round 2 refines it: final proportions, a turnaround (front, side, back), more expressions, and Lottie-ready animation layers.</p>
    </div>
  </section>
</main>
<footer class="wrap foot"><p>Vector drafts, drawn in code. Every pose shares one body, so the characters stay on-model.</p></footer>`;

fs.writeFileSync(path.join(__dirname, 'index.html'), html);
console.log('index.html', (html.length / 1024).toFixed(0) + 'KB');
