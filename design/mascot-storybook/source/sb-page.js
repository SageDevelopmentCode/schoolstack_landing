// Page logic shared by the build (static first frame) and the browser (tab switching).
var SBPAGE = (function () {
  const GROUPS = [
    ['Core modules', ['terra', 'pip', 'nutmeg', 'fennel', 'clover', 'marigold', 'dig']],
    ['Parent portal', ['loam', 'dot', 'flicker', 'bramble', 'tansy']],
  ];
  const ORDER = GROUPS.flatMap((g) => g[1]);
  const META = {
    terra: ['School Website', 'the pot snail', 'A snail with a whole garden on their back, the way your website carries your school wherever families find it. Calm, welcoming and always open.', 'Eye-stalks and a terracotta pot that blooms bigger as the school grows.'],
    pip: ['Enrollment', 'the mud-pie sprout', 'A warm dollop of garden mud with a sprout on top. Pip handles the first hello: inquiries, applications and the day a family officially joins.', 'A two-leaf sprout that perks up, droops and flops with every mood.'],
    nutmeg: ['Tuition & Billing', 'the acorn kid', 'Steady, dependable and a little goofy. Nutmeg keeps tuition, fees and payments in order, the way a good acorn stash gets a family through winter.', 'A cap that never sits straight, plus a green ledger and a gold coin.'],
    fennel: ['Attendance', 'the frog', 'A bow-tied frog with a clipboard who knows who is here, who is running late and who is home sick. The teacher\'s right hand at morning check-in.', 'A polka-dot bow tie and a clipboard full of ticks.'],
    clover: ['Timeclock', 'the bumblebee', 'The busiest bee on staff. Clover tracks shifts and hours so payroll stays simple and nobody has to chase timesheets.', 'Fuzzy stripes, buzzing wings and a gold pocket watch.'],
    marigold: ['Marketing', 'the marigold', 'Bright enough to stop anyone mid-scroll. Marigold helps your school get noticed with campaigns, landing pages and open-house buzz.', 'A ring of sunny petals and a trumpet-flower megaphone.'],
    dig: ['Admin Portal', 'the mole chef', 'Down in the tunnels where the real work happens. Dig keeps the admin side running, from records to the daily to-do list, wooden spoon always in paw.', 'Round glasses, a patched apron and a mud-pie spoon.'],
    loam: ['Messages', 'the earthworm courier', 'Loam tunnels between home and school with a satchel full of notes. Announcements, replies and reminders all arrive on time.', 'A courier cap and a forest-green satchel.'],
    dot: ['Calendar & Events', 'the ladybug', 'Every spot on Dot\'s shell is a date, and the gold one is today. Field trips, picture day and parent nights all land on the calendar.', 'A shell of calendar dots, one marked gold.'],
    flicker: ['Photos', 'the firefly', 'Flicker glows whenever something worth remembering happens, and always has a camera ready for classroom photos and albums.', 'A glowing tail and a little camera.'],
    bramble: ['Forms', 'the hedgehog', 'Bramble keeps a pencil tucked in the quills. Permission slips, medical forms and signatures get filled in without a single lost sheet.', 'Pencils in the quills and a freshly signed form.'],
    tansy: ['Committees', 'the ant', 'Ants get big things done together. Tansy rallies committees, volunteer sign-ups and parent groups, leaf banner held high.', 'Elbowed antennae and a leaf banner.'],
  };
  const TINTS = ['butter', 'sky', 'lav', 'mint', 'peach', 'cream'];
  function tile(C, v, i) {
    return `<li class="pose t-${TINTS[i % TINTS.length]}">${SB.svg(C, v, { label: `${C.name}, ${v.label.toLowerCase()}` })}<p class="pose-name">${v.label}</p></li>`;
  }
  function sheet(key) {
    const C = SB.C[key], m = META[key], i = ORDER.indexOf(key);
    const prev = ORDER[(i + ORDER.length - 1) % ORDER.length], next = ORDER[(i + 1) % ORDER.length];
    const faces = SB.VIEWS.filter((v) => v.group === 'face'), poses = SB.VIEWS.filter((v) => v.group === 'pose');
    return `<div class="sheet-top">
      <a class="step" href="#${prev}" aria-label="Previous character: ${SB.C[prev].name}">← ${SB.C[prev].name}</a>
      <span class="count">${i + 1} of ${ORDER.length}</span>
      <a class="step" href="#${next}" aria-label="Next character: ${SB.C[next].name}">${SB.C[next].name} →</a>
    </div>
    <div class="sheet-head">
      <figure class="hero">${SB.svg(C, 'neutral', { label: `${C.name}, standing`, cls: 'bob' })}</figure>
      <div class="bio">
        <p class="feat feat-lg">${m[0]}</p>
        <h2 id="sheet-h">${C.name} <span>${m[1]}</span></h2>
        <p class="lead">${m[2]}</p>
        <dl class="traits"><div><dt>Signature</dt><dd>${m[3]}</dd></div></dl>
        <div class="mini">
          <div class="mini-icons">${C.icon.bgs.map((_, b) => `<div class="ic">${SB.icon(C, b)}</div>`).join('')}</div>
          <div class="mini-sizes" aria-label="App icon at 48, 32 and 24 pixels">${[48, 32, 24].map((s) => `<div style="width:${s}px">${SB.icon(C, 0, { label: '' })}</div>`).join('')}</div>
        </div>
      </div>
    </div>
    <h3 class="set-h">Faces <span>${faces.length}</span></h3>
    <ul class="poses">${faces.map((v, j) => tile(C, v, j)).join('')}</ul>
    <h3 class="set-h">Poses <span>${poses.length}</span></h3>
    <ul class="poses">${poses.map((v, j) => tile(C, v, j + 2)).join('')}</ul>`;
  }
  function cast(active) {
    return GROUPS.map(([label, list]) => `<section class="group"><div class="group-head"><h2>${label}</h2><span>${list.length} characters</span></div>
      <div class="cast cast-${list.length}">${list.map((k) => `<a class="cast-card${k === active ? ' on' : ''}" href="#${k}" data-k="${k}"${k === active ? ' aria-current="true"' : ''}>
        <span class="feat">${META[k][0]}</span><div class="cast-art">${SB.svg(SB.C[k], k === 'pip' ? 'happy' : 'neutral', { label: `${SB.C[k].name}, ${META[k][1]}` })}</div><h3>${SB.C[k].name}</h3><p>${META[k][1]}</p></a>`).join('')}</div></section>`).join('');
  }
  return { ORDER, META, sheet, cast };
})();

if (typeof window !== 'undefined') {
  (function () {
    const el = document.getElementById('sheet');
    let current = el.getAttribute('data-k');
    function show(scroll) {
      const k = location.hash.slice(1);
      const key = SB.C[k] ? k : 'pip';
      if (key !== current) { el.innerHTML = SBPAGE.sheet(key); el.setAttribute('data-k', key); current = key; }
      document.querySelectorAll('.cast-card').forEach((a) => { const on = a.getAttribute('data-k') === key; a.classList.toggle('on', on); if (on) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current'); });
      if (scroll) el.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
    }
    window.addEventListener('hashchange', () => show(true));
    show(false);
  })();
}
