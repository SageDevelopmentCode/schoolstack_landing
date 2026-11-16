// Builds crew.html (the MudKitchen Crew sheet) and optionally exports SVGs.
const fs = require('fs');
const path = require('path');
const K = require('./crew.js');
const R1 = require('./mascots.js');

const OUT_DIR = process.argv[2];

const META = {
  terra: { feature: 'School Website', kind: 'the pot snail', role: "Carries the school's home on their back.",
    bio: 'A snail with a garden on their back, the way your website carries your school wherever families find it. Calm, welcoming and always open.',
    sig: 'Eye-stalks and a terracotta pot that blooms.', voice: 'Calm, welcoming, quietly proud.', posts: 'Website launches, open-house pages, "your school, online".' },
  pip: { feature: 'Enrollment', kind: 'the sprout', role: 'Plants every new family.',
    bio: 'A sprout of garden clay who greets every new family. Pip handles the first hello: inquiries, applications, waitlists and the day a family officially joins.',
    sig: 'The two-leaf sprout and a seed packet.', voice: 'Warm, eager, encouraging.', posts: 'Enrollment season, new-family welcomes, application tips.' },
  nutmeg: { feature: 'Tuition & Billing', kind: 'the acorn', role: 'Keeps the acorns counted.',
    bio: 'Steady and dependable. Nutmeg keeps tuition, fees and payments in order, the way a good acorn stash gets a family through winter.',
    sig: 'A tilted cap and a green ledger with a gold coin.', voice: 'Reassuring, organised, a little dry.', posts: 'Autopay, payment reminders, billing tips.' },
  fennel: { feature: 'Attendance', kind: 'the frog', role: 'Takes the morning roll call.',
    bio: 'A bow-tied frog with a clipboard who knows who is here, who is running late and who is home sick. Fennel is the teacher\'s right hand at check-in.',
    sig: 'A bow tie and a clipboard of ticks.', voice: 'Cheerful, punctual, kind.', posts: 'Check-in features, absence reporting, teacher tips.' },
  clover: { feature: 'Timeclock', kind: 'the bumblebee', role: 'Clocks the busy hours.',
    bio: 'The busiest bee on staff. Clover tracks shifts and hours so payroll stays simple and nobody has to chase timesheets.',
    sig: 'Stripes, wings and a gold pocket watch.', voice: 'Brisk, upbeat, on time.', posts: 'Staff hours, payroll exports, month-end reminders.' },
  marigold: { feature: 'Marketing', kind: 'the marigold', role: 'Turns heads toward your school.',
    bio: 'Bright enough to stop anyone mid-scroll. Marigold helps your school get noticed with landing pages, campaigns and open-house buzz.',
    sig: 'A ring of petals and a trumpet-flower megaphone.', voice: 'Confident, bright, persuasive.', posts: 'Campaign launches, growth tips, open-house promos.' },
  dig: { feature: 'Admin Portal', kind: 'the mole', role: 'Runs the kitchen behind the scenes.',
    bio: 'Down in the tunnels where the real work happens. Dig keeps the admin side running, from records and settings to the daily to-do list, spoon always in paw.',
    sig: 'Round glasses, an apron and a wooden spoon.', voice: 'Wise, unflappable, gently funny.', posts: 'Admin tips, dashboard features, behind-the-scenes.' },
  loam: { feature: 'Messages', kind: 'the earthworm courier', role: 'Delivers every note home.',
    bio: 'Loam tunnels between home and school with a satchel full of notes. Announcements, replies and reminders all arrive on time.',
    sig: 'A courier cap and a forest-green satchel.', voice: 'Friendly, reliable, chatty.', posts: 'Messaging features, announcements, "stay in touch".' },
  dot: { feature: 'Calendar & Events', kind: 'the ladybug', role: 'Never misses a date.',
    bio: 'Every spot on Dot\'s shell is a date, and the gold one is today. Field trips, picture day and parent nights all land on the calendar.',
    sig: 'A shell of calendar dots, one marked gold.', voice: 'Organised, sunny, upbeat.', posts: 'Upcoming events, calendar sync, term dates.' },
  flicker: { feature: 'Photos', kind: 'the firefly', role: 'Lights up the best moments.',
    bio: 'Flicker glows whenever something worth remembering happens, and always has a camera ready. Classroom photos and albums are Flicker\'s home turf.',
    sig: 'A glowing tail and a little camera.', voice: 'Delighted, sentimental, quick.', posts: 'Photo sharing, privacy settings, moments from class.' },
  bramble: { feature: 'Forms', kind: 'the hedgehog', role: 'Keeps the paperwork sharp.',
    bio: 'Bramble keeps a pencil tucked in every quill. Permission slips, medical forms and signatures get filled in and filed without a single lost sheet.',
    sig: 'Pencils in the quills and a signed form.', voice: 'Precise, patient, quietly funny.', posts: 'Form builder, e-signatures, back-to-school paperwork.' },
  tansy: { feature: 'Committees', kind: 'the ant', role: 'Rallies the volunteers.',
    bio: 'Ants get big things done together. Tansy organises committees, volunteer sign-ups and parent groups, leaf banner held high.',
    sig: 'Elbowed antennae and a leaf banner.', voice: 'Rallying, warm, team-first.', posts: 'Volunteer drives, committee features, community spotlights.' },
};
const GROUPS = [
  ['core', 'Core modules', ['terra', 'pip', 'nutmeg', 'fennel', 'clover', 'marigold', 'dig']],
  ['parent', 'Parent portal', ['loam', 'dot', 'flicker', 'bramble', 'tansy']],
];
const ORDER = GROUPS.flatMap((g) => g[2]);
const NAME = (c) => K.C[c].name;
const POSES = [
  ['happy', 'Happy'], ['curious', 'Curious'], ['silly', 'Wry'],
  ['supportive', 'Supportive'], ['celebrate', 'Celebrating'], ['wave', 'Waving'],
];
const TINT = { happy: 'butter', curious: 'sky', silly: 'lav', supportive: 'mint', celebrate: 'peach', wave: 'cream' };

// ---------- export ----------
if (OUT_DIR) {
  ORDER.forEach((c) => {
    const d = path.join(OUT_DIR, c);
    fs.mkdirSync(d, { recursive: true });
    [['01-neutral', 'neutral'], ...POSES.map(([e], i) => [`0${i + 2}-${e === 'silly' ? 'wry' : e}`, e])]
      .forEach(([f, e]) => fs.writeFileSync(path.join(d, `${f}.svg`), K.render(c, e)));
    K.ICON[c].bgs.forEach((_, i) => fs.writeFileSync(path.join(d, `08-app-icon-${i ? 'b' : 'a'}.svg`), K.icon(c, i)));
  });
}

// ---------- page ----------
const card = (c) => `<a class="cast-card" href="#${c}">
  <span class="feat">${META[c].feature}</span>
  <div class="cast-art">${K.render(c, 'neutral', { label: `${NAME(c)}, ${META[c].kind}` })}</div>
  <h3>${NAME(c)}</h3>
  <p>${META[c].role}</p>
</a>`;

const cast = GROUPS.map(([id, label, list]) => `<section class="group" aria-labelledby="g-${id}">
  <div class="group-head"><h2 id="g-${id}">${label}</h2><span>${list.length} characters</span></div>
  <div class="cast cast-${id}">${list.map(card).join('')}</div>
</section>`).join('');

const before = ['pip', 'nutmeg', 'dig', 'terra'].map((c) => `<figure class="ba">
  <div class="ba-pair">
    <div><span>Round 1</span>${R1.render(c, 'neutral', { label: `${NAME(c)}, round 1` })}</div>
    <div><span>Now</span>${K.render(c, 'neutral', { label: `${NAME(c)}, refined` })}</div>
  </div>
  <figcaption>${NAME(c)}</figcaption>
</figure>`).join('');

const sheet = (c) => {
  const m = META[c];
  return `<section class="sheet" id="${c}" aria-labelledby="${c}-h">
  <div class="sheet-head">
    <figure class="hero"><span class="fig-label">Neutral</span>${K.render(c, 'neutral', { label: `${NAME(c)}, standing`, cls: 'bob' })}</figure>
    <div class="bio">
      <p class="feat feat-lg">${m.feature}</p>
      <h2 id="${c}-h">${NAME(c)} <span>${m.kind}</span></h2>
      <p class="lead">${m.bio}</p>
      <dl class="traits">
        <div><dt>Signature</dt><dd>${m.sig}</dd></div>
        <div><dt>Voice</dt><dd>${m.voice}</dd></div>
        <div><dt>Post ideas</dt><dd>${m.posts}</dd></div>
      </dl>
      <div class="mini">
        <div class="mini-icons">${K.ICON[c].bgs.map((_, i) => `<div class="ic">${K.icon(c, i)}</div>`).join('')}</div>
        <div class="mini-sizes" aria-label="Size test">${[48, 32, 24].map((s) => `<div style="width:${s}px">${K.icon(c, 0, { label: '' })}</div>`).join('')}</div>
        <div class="sil">${K.render(c, 'neutral', { label: '' })}</div>
      </div>
    </div>
  </div>
  <ul class="poses">
    ${POSES.map(([e, label]) => `<li class="pose t-${TINT[e]}">${K.render(c, e, { label: `${NAME(c)}, ${label.toLowerCase()}` })}<p class="pose-name">${label}</p></li>`).join('')}
  </ul>
</section>`;
};

const css = fs.readFileSync(path.join(__dirname, 'page.css'), 'utf8') + fs.readFileSync(path.join(__dirname, 'crew.css'), 'utf8');

const html = `<title>MudKitchen Crew</title>
<meta name="claude:viewport-fit-sides" content="cover">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,500;12..96,700;12..96,800&family=Gochi+Hand&family=Nunito:wght@400;600;700;800&display=swap">
<style>${css}</style>
<header class="top">
  <div class="wrap">
    <p class="eyebrow">Brand exploration · Mascot round 2</p>
    <h1>Meet the <em>MudKitchen Crew</em></h1>
    <p class="intro">Twelve characters, one for each part of MudKitchen. They share one refined style and the same eight-part sheet, so any of them can front a feature post, an onboarding tip or a launch.</p>
    <p class="note" aria-hidden="true">find your feature ↓</p>
  </div>
</header>
<main class="wrap">
  ${cast}
  <section class="grown" aria-labelledby="grown-h">
    <div class="group-head"><h2 id="grown-h">Grown up a little</h2><span>Options A–D, before and after</span></div>
    <p class="grown-note">Taller proportions, smaller faces set higher, almond eyes with lids and brows, no blush, slim arms with hands, muted earth tones, and a prop that names the feature.</p>
    <div class="ba-row">${before}</div>
  </section>
  <nav class="jump" aria-label="Jump to a character">${ORDER.map((c) => `<a href="#${c}">${NAME(c)}</a>`).join('')}</nav>
  ${ORDER.map(sheet).join('')}
  <section class="take next" aria-labelledby="next-h">
    <h3 id="next-h">Next steps</h3>
    <p>Pick any characters to take further. Round 3 can add a front, side and back turnaround, a wider expression set, social post templates in your brand layout, and layered files ready for Lottie animation.</p>
  </section>
</main>
<footer class="wrap foot"><p>Vector drafts, drawn in code. Every pose shares one body, so the characters stay on-model.</p></footer>`;

fs.writeFileSync(path.join(__dirname, 'crew.html'), html);
console.log('crew.html', (html.length / 1024).toFixed(0) + 'KB');
