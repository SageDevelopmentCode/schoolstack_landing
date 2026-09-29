// Single source of truth for every frame range in the film.
// TREATMENT.md's shot list is generated from SHOTS (npm run shotlist), so the
// doc and the render cannot drift apart.

export const FPS = 30;
export const DURATION = 1800; // 60.0s
export const BPM = 92;
export const BEAT = (FPS * 60) / BPM; // ~19.565 frames
export const beat = (n: number) => Math.round(n * BEAT);

export type ColorMode = "forest" | "forestDeep" | "cream" | "flash" | "split";

export type Shot = {
  id: string;
  act: "I" | "II" | "III" | "IV" | "V" | "VI";
  from: number;
  to: number;
  title: string;
  camera: string;
  text: string;
  sound: string;
  color: ColorMode;
  center916: "safe" | "relayout";
};

export const ACTS = {
  I: { from: 0, to: 360 },
  II: { from: 360, to: 660 },
  III: { from: 660, to: 1020 },
  IV: { from: 1020, to: 1380 },
  V: { from: 1380, to: 1620 },
  VI: { from: 1620, to: 1800 },
} as const;

// Key hits inside acts (absolute frames). Scenes convert to local frames.
export const HIT = {
  ringIn: 20,
  linesSwap: 48,
  evidence: [96, 142, 186], // forms, texts, spreadsheets (one VO clip each)
  pileUp: 220, // every pill lights with a count badge while the sheet holds
  pushIn: 236,
  hookLine1: 240,
  hookLine2: beat(16), // 313, the kick lands on "everything feels harder."
  hookOut: 342,
  trailsStart: 372,
  logoBloom: 376,
  collapse: 486, // "collapse": tools spiral into the bowl, chips glide out to the tools' spots
  lockIn: 534, // "workspace": bowl becomes the One workspace card, glass chime
  // Word onsets in VO clip 09: enrollment, billing, messaging, calendar, files.
  listWords: [540, 565, 584, 608, 627],
  listMore: 647, // "and more"
  adminExpand: 652,
  finFlash: 948,
  bubbleMorph: 972,
  creamFlood: 996,
  gmailPeek: 1344,
  gmailThud: 1362,
  miniHub: 1620,
  lockup: 1665,
  logoSting: beat(86), // 1683
} as const;

export const SHOTS: Shot[] = [
  {
    id: "S01", act: "I", from: 0, to: 96, title: "Too many tools",
    camera: "Locked off. Kicker assembles in place at the top (letters rise with a 1.5-frame stagger, dot rows fade in either side) and holds. Centered Lora line 'Too many tools.' at f12 swaps to 'Too many tabs.' at f48 (old line exits up, new line enters from below). Ten glass pills pop onto the outer ellipse on the site's delay wave from f20 with a steady 4px drift; dashed connectors reach 72% of the way in and stop.",
    text: "SCATTERED TODAY (kicker) / Too many tools. / Too many tabs.",
    sound: "Low room hum + single vinyl crackle at f0. Music bed starts at f0. Soft tick as the kicker assembles. Glassy tick per pill.",
    color: "forest", center916: "relayout",
  },
  {
    id: "S02", act: "I", from: 96, to: 236, title: "Evidence",
    camera: "An empty dashed circle anchors the center (the missing hub). On each VO clip one tool group lights up (clay border, 1.08x, flowing connector) while the rest dim to 55%, and a card slides in along the lit connector: form fragment (Forms, DocuSign, Calendly), group-text stack (Gmail), roster sheet (Sheets, Docs, Drive). f220-236: the roster sheet holds steady while every pill lights in sequence with clay count badges (the pile-up).",
    text: "Card fragments only (captions carry the VO)",
    sound: "Soft tick on each evidence beat (f96, f142, f186).",
    color: "forest", center916: "relayout",
  },
  {
    id: "S03", act: "I", from: 236, to: 360, title: "Hook typography",
    camera: "Short push-in (f236-248): ring and card scale 1 to 1.25 and fade, max 4px blur. Hook starts at f240 so no frame is empty. Line 1 reveals word by word (rise + blur, no scale). On the kick (f313) the cream highlighter swipes first, then 'everything feels harder.' lands as one line (1.12 to 1 spring, 2px shake). f342-360 the type recedes (1 to 0.85, fade) into the hub pull-back.",
    text: "When your school runs in five different places, / everything feels harder.",
    sound: "Whoosh-in on the push (f232). Kick drum on 'everything feels harder.' (f313).",
    color: "forest", center916: "relayout",
  },
  {
    id: "S04", act: "II", from: 360, to: 486, title: "Tool to feature",
    camera: "Pull back to the hub. Each pill fires a light trail down its spoke (site delays 0-1.0s, wave around the ring). White feature chips pop in on arrival. MudKitchen bowl blooms at center.",
    text: "Enrollment, Payments, Billing, Messaging, Contracts, Calendar, Files, Staff, Reports, Website (chip labels)",
    sound: "Rising shimmer per trail, pitched up around the ring. Soft bloom swell on the logo.",
    color: "forest", center916: "relayout",
  },
  {
    id: "S05", act: "II", from: 486, to: 640, title: "Collapse, then the list docks",
    camera: "On 'collapse' (f486) the tool pills detach and spiral into the bowl as particles (motion blur) while the feature chips glide out to the tools' old spots. On 'workspace' (f534) the bowl shrinks into the header of a clay 'One workspace' card with a 2x3 grid of dashed module slots. Each spoken feature flies from its ring spot into its slot on its word: Enrollment f540, Billing f565, Messaging f584, Calendar f608, Files f627 (9:16 has no Billing / Files chips, so those pop in place).",
    text: "One workspace (card header) / Enrollment, Billing, Messaging, Calendar, Files (docked modules)",
    sound: "Layered whoosh (f482), magnetic snap (f529), glass chime on lock-in (f534), soft tick as each module docks.",
    color: "forest", center916: "relayout",
  },
  {
    id: "S06", act: "II", from: 640, to: 660, title: "And more, then punch",
    camera: "On 'and more' (f647) the remaining chips rush the last slot, which flips through Payments, Contracts, Staff, Reports, Website, Attendance, Admissions every 1.5 frames, then '+ 12 more'. f652-660 a cream #FFFAF4 circle punches out from the card center (match cut into Act III).",
    text: "Payments / Contracts / Staff / Reports / Website / Attendance / Admissions / + 12 more (flip)",
    sound: "Whoosh as the remaining features rush in (f645).",
    color: "forest", center916: "relayout",
  },
  {
    id: "S07", act: "III", from: 660, to: 732, title: "Admin: Dashboard",
    camera: "Cream #FFFAF4 backing. The website's admin demo in the homepage frame (16px radius, #DDD0BE border, no browser chrome): sidebar with Logo, clay 'Need help?' pill, MAIN / TOOLS groups. 'Good morning, Admin.' header, Today's focus queue (8 applications, 3 shadow days, 1 not marked), School signal card, metric cards count up (22 / 6 / $12,480 / 4), page scrolls to Today's attendance. Tour cursor rests on 'Review admissions', then clicks Admissions.",
    text: "SCHOOL ADMIN (kicker) / Know what needs you.",
    sound: "Soft UI tick on the nav click.",
    color: "cream", center916: "relayout",
  },
  {
    id: "S08", act: "III", from: 732, to: 804, title: "Admin: Admissions",
    camera: "Admissions opens with Enrollment Flows / Submissions subtabs. Filter pills (All 17, New 3, Contacted, App Sent, Enrolled, Lost) over the submissions table. Jennifer Walsh's new row slides in; the cursor clicks the Rivera status and it flips Contacted to Enrolled (pill counts update).",
    text: "Every family. One pipeline.",
    sound: "Card slides: soft paper swipes on the beat.",
    color: "cream", center916: "relayout",
  },
  {
    id: "S09", act: "III", from: 804, to: 876, title: "Admin: My School > My Students",
    camera: "My School opens (My Students, Programs, Staff, Classrooms, Tuition). Metric cards and the student table with photos. Cursor assigns Emma Rivera to Oak Room, then to Jordan Taylor; each chip pops and Needs attention counts down 2, 1, 0.",
    text: "Records that stay current.",
    sound: "Two soft notification pings on the assignments.",
    color: "cream", center916: "relayout",
  },
  {
    id: "S10", act: "III", from: 876, to: 948, title: "Admin: Finances overview",
    camera: "Finances > Overview: Total Revenue $47,320, Expenses $31,840, Net Profit $15,480, Burn Rate count up; Revenue vs Expenses area chart draws on; category spending rings fill.",
    text: "Finances without the spreadsheet.",
    sound: "Light ticks as the figures settle.",
    color: "cream", center916: "relayout",
  },
  {
    id: "S11", act: "III", from: 948, to: 963, title: "Finances flash",
    camera: "0.5s stutter: giant cropped figures cut every 5 frames on cream, forest, then clay.",
    text: "$47,320 / $12,480 / Paid",
    sound: "Three tape-stop hits.",
    color: "cream", center916: "safe",
  },
  {
    id: "S12", act: "III", from: 963, to: 1020, title: "Notification to message",
    camera: "A white admin alert ('Rivera family is enrolled', thread #218) morphs into the parent message bubble 'Welcome to Oak Room, Emma!' with a delivered check. The bubble shrinks toward the phone position as a soft circular reveal opens the parent act.",
    text: "Welcome to Oak Room, Emma! (thread #218)",
    sound: "Swoosh plus a bright 'sent' pop; room opens up (reverb tail).",
    color: "cream", center916: "safe",
  },
  {
    id: "S13", act: "IV", from: 1020, to: 1095, title: "Parent: Home",
    camera: "The MudKitchen mobile app on the phone. Parent home: forest gradient header ('Good morning, Sarah.', date pill, help / bulletin / notification buttons), Start here card, Upcoming events (Spring art showcase), then scrolls to child cards for Emma, Jake and Liam over the floating tab bar. Tap on Emma's 'Enrollment checklist'.",
    text: "One place to stay in the loop.",
    sound: "Warm pad opens, birdsong-level texture (very low).",
    color: "cream", center916: "relayout",
  },
  {
    id: "S14", act: "IV", from: 1095, to: 1185, title: "Parent: Apply + enroll",
    camera: "Emma's enrollment checklist pushes in. Google Forms and DocuSign ghosts dissolve into the phone. Rows tick off and the progress bar fills; an immunizations.pdf chip lands on Immunizations; the Community Agreement sheet slides up and the signature draws on, then Signed.",
    text: "Apply, upload, sign. Done.",
    sound: "Pen scratch on signature. Soft click on upload.",
    color: "cream", center916: "relayout",
  },
  {
    id: "S15", act: "IV", from: 1185, to: 1275, title: "Parent: Billing",
    camera: "Billing tab: 'Family tuition' header with Family view / Emma / Jake / Liam / Forms pills, Next payment card ($1,250.00, due May 15, $4,500.00 remaining). Venmo and PayPal ghosts dissolve into the Pay button. Press, squash, 'Paid · Thank you!', last-payment banner, Emma's May tuition flips to Paid.",
    text: "One tuition. One button.",
    sound: "Button press thock, success chime.",
    color: "cream", center916: "relayout",
  },
  {
    id: "S16", act: "IV", from: 1275, to: 1344, title: "Parent: Carousel",
    camera: "Carousel of app screens in phones, one per beat: Messages, Family calendar, Forms & agreements, My children.",
    text: "EVERYTHING FAMILIES NEED (kicker) + screen titles",
    sound: "Page flicks on each beat.",
    color: "cream", center916: "relayout",
  },
  {
    id: "S17", act: "IV", from: 1344, to: 1380, title: "Gmail peek gag",
    camera: "Phone returns on the Messages tab. Gmail icon peeks out from behind it; the phone slides shut on it with a soft thud and a small squash. f1370-1380 a #F0E6D8 sheet wipes up into the teacher act.",
    text: "(none)",
    sound: "Tiny cartoon 'boop' on peek, cushioned thud on close.",
    color: "cream", center916: "safe",
  },
  {
    id: "S18", act: "V", from: 1380, to: 1440, title: "Teacher: Dashboard",
    camera: "#F0E6D8 fades to cream. The website's teacher demo in the homepage frame: white top nav (MudKitchen logo, Dashboard / My Students / Messages / Calendar / Attendance pills, JT avatar). 'Good morning, Jordan.', Start here card, Classroom snapshot (8 learners), then scrolls to Oak / Maple / Cedar Room cards and the school bulletin. Cursor clicks Attendance.",
    text: "TEACHER PORTAL (kicker) / Your class, at a glance.",
    sound: "Music thins to pad + light shaker.",
    color: "cream", center916: "relayout",
  },
  {
    id: "S19", act: "V", from: 1440, to: 1500, title: "Teacher: Attendance",
    camera: "Today's attendance for Monday, May 11. Cursor clicks 'Mark all present'; rows check off top to bottom, each check sends a ripple ring outward and its badge flips to Present; the button becomes 'Attendance saved'.",
    text: "Attendance, done by 8:05.",
    sound: "Rising pitched plinks per check (satisfying scale).",
    color: "cream", center916: "relayout",
  },
  {
    id: "S20", act: "V", from: 1500, to: 1560, title: "Teacher: Messages",
    camera: "Messages with the Rivera Family thread open (same family from Acts III and IV). Sarah's pickup note sits in the thread; Jordan's reply types into the composer and is sent at f1538 with a Sent receipt.",
    text: "Every family, one thread.",
    sound: "Keyboard taps, sent pop.",
    color: "cream", center916: "relayout",
  },
  {
    id: "S21", act: "V", from: 1560, to: 1620, title: "Teacher: Calendar",
    camera: "School calendar for May 2026: Staff Meeting, Nature Walk, Art Showcase and Field Day chips pop onto the grid and the Coming up list; super lands on the downbeat. f1606-1620 the frame shrinks while a forest sheet rises into the finale.",
    text: "Teach more. Chase less.",
    sound: "Downbeat hit on super.",
    color: "cream", center916: "safe",
  },
  {
    id: "S22", act: "VI", from: 1620, to: 1665, title: "Mini hub return",
    camera: "Pull back. Only MudKitchen and three portal orbs orbit on a dashed ellipse (no tools left).",
    text: "Parent / School Admin / Teacher (orb labels)",
    sound: "Music builds to final chord.",
    color: "forest", center916: "safe",
  },
  {
    id: "S23", act: "VI", from: 1665, to: 1800, title: "Lockup",
    camera: "Orbs fold into the bowl. Wordmark types on in serif, sub line fades up, clay CTA pill springs in, tag last.",
    text: "MudKitchen / Enrollment, billing & school operations, in one place. / Book a demo, trymudkitchen.com/get-started / Built inside a real microschool.",
    sound: "Final chord + logo sting (f1683). Tail decays to silence by f1800.",
    color: "forest", center916: "relayout",
  },
];
