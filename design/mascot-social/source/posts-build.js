// Builds all social posts (SVG) + list.txt for the PNG step. Usage: node posts-build.js [exportDir]
// Copy is word for word from: src/components/home/home-copy.ts (STORY, PAIN, FAMILY, TEACHER),
// src/lib/marketing/product-preview-tabs.ts, get-started-showcase-slides.ts, download-app-slides.ts,
// microschool-monday-check.ts, and the sample notifications in src/components/home/FloatingStickers.tsx.
// Handwritten notes ("say hi to …", "here's how", "hooray!") are decorative only.
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const D = __dirname, FONTS = path.join(D, '..', 'fonts');
const OUT = process.argv[2];

const ctx = {};
vm.createContext(ctx);
vm.runInContext(['sb-kit.js', 'sb-pip.js', 'sb-chars.js'].map((f) => fs.readFileSync(path.join(D, f), 'utf8')).join('\n') + ';this.SB=SB;', ctx);
const SB = ctx.SB;
const b64 = (f) => fs.readFileSync(path.join(FONTS, f)).toString('base64');
const face = (fam, file, weight) => `@font-face{font-family:'${fam}';font-weight:${weight};font-style:normal;src:url(data:font/woff2;base64,${b64(file)}) format('woff2');}`;
const ASSETS = {
  fontsCss: face('Bricolage Grotesque', 'BricolageGrotesque-800.woff2', '200 800') + face('Nunito', 'Nunito-600.woff2', '200 1000') + face('Gochi Hand', 'GochiHand-400.woff2', '400'),
  logo: 'data:image/png;base64,' + b64('logo-160.png'),
};
const Posts = require('./posts.js')(SB, ASSETS);
const { T } = Posts;

const wrap = (s, n) => { const out = []; let line = ''; s.split(' ').forEach((w) => { if ((line + ' ' + w).trim().length > n && line) { out.push(line); line = w; } else line = (line + ' ' + w).trim(); }); if (line) out.push(line); return out; };
const fit = (chars, width, max) => Math.min(max, Math.floor(width / (chars * 0.54)));

const N = {
  paid: { title: 'Payment received', sub: 'Paid on time', color: '#059669', icon: 'card' },
  invoice: { title: 'Invoice sent', sub: 'November tuition', color: '#7C3AED', icon: 'mail' },
  tuitionPaid: { title: 'Tuition paid', sub: 'October · autopay', color: '#059669', icon: 'card' },
  attendance: { title: 'Attendance logged', sub: '14 of 15 present', color: '#10b981', icon: 'cal' },
  pickup: { title: 'Pickup confirmed', sub: 'Authorized contact', color: '#4A6B52', icon: 'check' },
  clockIn: { title: 'Clocked in', sub: '7:58 AM', color: '#10b981', icon: 'clock' },
  weekly: { title: 'Weekly hours', sub: 'Ready for review', color: '#0D9488', icon: 'cal' },
  campaign: { title: 'Campaign sent', sub: 'Open house invite', color: '#f97316', icon: 'mail' },
  lead: { title: 'Lead nurtured', sub: 'Tour scheduled', color: '#A05C45', icon: 'user' },
  application: { title: 'New application', sub: 'Grade 2 · Fall', color: '#f97316', icon: 'user' },
  complete: { title: 'Enrollment complete', sub: 'All forms signed', color: '#4A6B52', icon: 'check' },
  message: { title: 'New message', sub: 'From Ms. Rivera', color: '#0284C7', icon: 'msg' },
  replied: { title: 'Parent replied', sub: 'Field trip form', color: '#0284C7', icon: 'msg' },
  packet: { title: 'Packet signed', sub: 'Enrollment agreement', color: '#4F46E5', icon: 'check' },
  checklist: { title: 'Checklist done', sub: 'Health + emergency', color: '#059669', icon: 'check' },
};

const spot = (char, view, feature, card, body, file, src) => {
  const name = SB.C[char].name, chars = Math.max(`${feature},`.length, `meet ${name}.`.length);
  return { char, file, layout: 'spotlight', title: `${name} · Feature spotlight`, size: '1080 × 1080 · feed', w: 1080, h: 1080, source: src,
    svg: Posts.spotlight({ char, name, view, feature, card, note: false, headSize: fit(chars, 930, 78), headline: [[[`${feature},`, T.ink]], [['meet ', T.ink], [`${name}.`, T.clay]]], body: wrap(body, 26), cta: 'Book a Demo' }) };
};
const ques = (char, view, feature, q, a, notifs, theme, file, src) => {
  const name = SB.C[char].name, lines = wrap(q, 24);
  return { char, file, layout: 'question', title: `${name} · Question`, size: '1080 × 1350 · feed portrait', w: 1080, h: 1350, source: src,
    svg: Posts.question({ char, name, view, feature, question: lines, qSize: lines.length > 2 ? 56 : 64, answer: wrap(a, 25), notifs, theme, cta: 'Book a Demo' }) };
};
const app = (char, feature, lead, accent, caption, notifs, card, theme, file, src) => {
  const name = SB.C[char].name, L = wrap(lead, 31), A = wrap(accent, 31);
  return { char, file, layout: 'appMoment', title: `${name} · App moment`, size: '1080 × 1920 · story / reel', w: 1080, h: 1920, source: src,
    svg: Posts.appMoment({ char, name, view: 'point', feature, headSize: 62, headline: [...L.map((l) => [[l, T.ink]]), ...A.map((l) => [[l, T.clay]])], caption: wrap(caption, 44), notifs, card, theme, cta: 'Book a Demo' }) };
};

const POSTS = [
  // ---------- Terra · School Website ----------
  { char: 'terra', file: 'terra-1-spotlight', layout: 'spotlight', title: 'Terra · Feature spotlight', size: '1080 × 1080 · feed', w: 1080, h: 1080, source: 'Website tab caption and description',
    svg: Posts.spotlight({ char: 'terra', name: 'Terra', view: 'wave', feature: 'School Website', headline: [[['Meet Terra,', T.ink]], [['your ', T.ink], ['School Website.', T.clay]]],
      body: ['A full school website with', 'programs, FAQs, team, and', 'calls to action.'], cta: 'Book a Demo' }) },
  { char: 'terra', file: 'terra-2-proof', layout: 'proof', title: 'Terra · Customer proof', size: '1080 × 1350 · feed portrait', w: 1080, h: 1350, source: 'Customer story: headline, location and stats',
    svg: Posts.proof({ char: 'terra', name: 'Terra', view: 'celebrate', badge: 'Customer story', location: 'Sage Field · Round Rock, TX', headLead: 'From 0 to 35 students', headAccent: 'in under 3 months.', polaroidNote: 'hooray!',
      stats: [['35', 'Students enrolled'], ['< 3 mo', 'To launch'], ['1', 'Unified platform']], cta: 'Read the case study' }) },
  // ---------- Pip · Enrollment ----------
  { char: 'pip', file: 'pip-1-before-after', layout: 'beforeAfter', title: 'Pip · Before and after', size: '1080 × 1080 · feed', w: 1080, h: 1080, source: '"Too many tools" section: headline, labels and body sentences',
    svg: Posts.beforeAfter({ char: 'pip', name: 'Pip', beforeView: 'oops', afterView: 'happy', headLead: ['When your school runs in', 'five different places,'], headAccent: 'everything feels harder.',
      beforeLabel: 'Scattered today', afterLabel: 'All in one shared system', scattered: [['Enrollment lives', 'in a form builder.'], ['Parent updates', 'happen in texts', 'and email.'], ['Student details sit', 'in spreadsheets.']],
      tidy: ['Enrollment', 'Parent updates', 'Student details'], cta: 'Book a Demo' }) },
  { char: 'pip', file: 'pip-2-quote-story', layout: 'quote', title: 'Pip · Customer quote', size: '1080 × 1920 · story / reel', w: 1080, h: 1920, source: 'Customer story: quote, author and stat',
    svg: Posts.quote({ char: 'pip', name: 'Pip', view: 'tears', badge: 'Customer story', location: 'Sage Field · Round Rock, TX',
      quoteLines: ['MudKitchen handled', 'everything from', 'enrollment to tuition', 'so we could focus on', 'the kids. I don’t know', 'how we would have', 'launched without it.”'],
      author: 'Sabrina Obnamia', role: 'Co-Founder, Sage Field', stat: ['35', 'Students enrolled'], cta: 'Read the case study' }) },
  // ---------- Nutmeg · Tuition & Billing ----------
  spot('nutmeg', 'thumbs', 'Tuition & Billing', 'billing', 'Families view invoices, make payments, and track tuition history in one place.', 'nutmeg-1-spotlight', 'Tuition tab caption and description'),
  ques('nutmeg', 'thinking', 'Tuition & Billing', 'Hard to collect tuition on time?', 'Families see bills, pay online, and view payment history.', [N.paid, N.invoice], { bg: '#FFF3DC', note: '#FFE58A' }, 'nutmeg-2-question', 'Get-started question and answer + tuition notifications'),
  // ---------- Fennel · Attendance ----------
  spot('fennel', 'wave', 'Attendance', 'attendance', 'Log daily attendance for every student, track who showed up, and navigate week by week.', 'fennel-1-spotlight', 'Attendance tab caption and description'),
  ques('fennel', 'curious', 'Attendance', 'Who’s here today?', 'Teachers mark attendance by class and move week to week.', [N.attendance, N.pickup], { bg: '#E9F4E2', note: '#DDEBD5', pill: T.forest }, 'fennel-2-question', 'Get-started question and answer + attendance notifications'),
  // ---------- Clover · Timeclock ----------
  spot('clover', 'point', 'Timeclock', 'timeclock', 'Log hours, track sessions, and view weekly and monthly totals in one place.', 'clover-1-spotlight', 'Timeclock tab caption and description'),
  ques('clover', 'thinking', 'Timeclock', 'Track staff hours without spreadsheets?', 'Clock in and out and see weekly and monthly totals.', [N.clockIn, N.weekly], { bg: '#FFF6D6', note: '#FFE58A' }, 'clover-2-question', 'Get-started question and answer + timeclock notifications'),
  // ---------- Marigold · Marketing ----------
  spot('marigold', 'wave', 'Marketing', 'marketing', 'Automated email campaigns and lead nurture sequences, all tied to your pipeline.', 'marigold-1-spotlight', 'Marketing tab caption and description'),
  ques('marigold', 'curious', 'Marketing', 'Want emails to send on their own?', 'Set up emails that go out when families hit each step.', [N.campaign, N.lead], { bg: '#FDEBDD', note: '#F8DDCF' }, 'marigold-2-question', 'Get-started question and answer + marketing notifications'),
  // ---------- Dig · Admin Portal ----------
  spot('dig', 'thumbs', 'Admin Portal', 'admin', 'Enrollment, billing, and daily operations in one workspace — from first click to enrolled.', 'dig-1-spotlight', 'Admin tab caption and description'),
  app('dig', 'Admin Portal', 'Enrollment is on track', 'with admissions at a glance.', 'School admins see applications, tuition, and messages together.', [N.application, N.complete], 'admin', { top: '#FFF3CF', bottom: '#F8DDCF' }, 'dig-2-app-story', 'App slide headline and caption + admin notifications'),
  // ---------- Loam · Messages ----------
  spot('loam', 'wave', 'Messages', 'messages', 'Real conversations with teachers, not lost in email.', 'loam-1-spotlight', 'App slide: messages'),
  app('loam', 'Messages', 'Give families one clear place', 'to stay in the loop.', 'Message staff directly in the app—no digging through inboxes.', [N.message, N.replied], 'messages', { top: '#E3EDFB', bottom: '#DDEBD5' }, 'loam-2-app-story', '"Family clarity" headline + app slide caption + message notifications'),
  // ---------- Dot · Calendar & Events ----------
  spot('dot', 'point', 'Calendar & Events', 'calendar', 'Start here cards and upcoming events keep everyone aligned.', 'dot-1-spotlight', 'App slide: start here cards and upcoming events'),
  ques('dot', 'thinking', 'Calendar & Events', 'A parent needs the calendar, receipt, or form. What happens?', 'MudKitchen parent portal puts calendars, forms, billing, and updates in one calm home base.', [N.tuitionPaid, N.replied], { bg: '#FBE6E2', note: '#FFE58A' }, 'dot-2-question', 'Microschool Monday Check question and MudKitchen answer + parent notifications'),
  // ---------- Flicker · Photos ----------
  spot('flicker', 'wave', 'Photos', 'photos', 'One calm home for school life—built for microschools.', 'flicker-1-spotlight', 'App slide caption (no Photos-specific copy exists yet)'),
  { char: 'flicker', file: 'flicker-2-before-after', layout: 'beforeAfter', title: 'Flicker · Before and after', size: '1080 × 1080 · feed', w: 1080, h: 1080, source: 'App slide headline + "Family clarity" body fragments + "Too many tools" labels',
    svg: Posts.beforeAfter({ char: 'flicker', name: 'Flicker', beforeView: 'oops', afterView: 'excited', headLead: ['Everything your', 'microschool needs'], headAccent: 'together in one app.',
      beforeLabel: 'Scattered today', afterLabel: 'All in one shared system', scattered: [['Old emails'], ['Group chats'], ['Scattered links']], tidy: ['Updates', 'Forms', 'Schedules'], cta: 'Book a Demo' }) },
  // ---------- Bramble · Forms ----------
  spot('bramble', 'thumbs', 'Forms', 'forms', 'Families fill out forms online with uploads and e-signatures.', 'bramble-1-spotlight', 'Get-started answer: online forms'),
  ques('bramble', 'curious', 'Forms', 'Still using paper enrollment forms?', 'Families fill out forms online with uploads and e-signatures.', [N.packet, N.checklist], { bg: '#F6ECE0', note: '#FFE58A' }, 'bramble-2-question', 'Get-started question and answer + enrollment notifications'),
  // ---------- Tansy · Committees ----------
  spot('tansy', 'wave', 'Committees', 'committees', 'Reduce back-and-forth with clearer team communication.', 'tansy-1-spotlight', '"For teachers" bullet (no Committees-specific copy exists yet)'),
  app('tansy', 'Committees', 'Support teachers with a calmer,', 'more connected school day.', 'Keep schedules, notes, and student details in one place.', [], 'committees', { top: '#DDEBD5', bottom: '#FFF3CF' }, 'tansy-2-app-story', '"For teachers" headline and bullet (no Committees-specific copy exists yet)'),
];

fs.mkdirSync(path.join(D, 'posts'), { recursive: true });
POSTS.forEach((p) => fs.writeFileSync(path.join(D, 'posts', `${p.file}.svg`), p.svg));
fs.writeFileSync(path.join(D, 'posts', 'list.txt'), POSTS.map((p) => `${p.file} ${p.w} ${p.h} ${Math.max(p.w, p.h)}`).join('\n') + '\n');
if (OUT) { fs.mkdirSync(OUT, { recursive: true }); POSTS.forEach((p) => fs.writeFileSync(path.join(OUT, `${p.file}.svg`), p.svg)); }
module.exports = { POSTS, SB };
if (require.main === module) console.log(POSTS.length, 'posts');
