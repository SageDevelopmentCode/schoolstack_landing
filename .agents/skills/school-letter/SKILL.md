---
name: school-letter
description: >
  Research a microschool's founder and write the short handwritten letter Julius mails before the first
  outreach email: one warm line about the founder (podcast, interview, founding story, milestone), that
  Julius and his fiancée run Sage Field and built MudKitchen from the start to run it, that he set up a
  version for them, one small ask to close, and the demo and snapshot on a QR card the P.S. points to. Adds a
  `letter` to the school's plan in src/data/outreach/<slug>.ts, so /admin/research shows it to copy out
  by hand and prints the QR card. Use for "/school-letter athena-microacademy", "write a handwritten
  letter for <school>", or a list of schools. One call is enough: if the school has no demo, plan or
  snapshot yet, it runs the school-outreach steps first. Never mails, sends or commits anything.
---

# Handwritten founder letter

One letter per school, from one founder to another. Julius copies it out by hand on a note card. It goes
first; the email sequence waits until 5 business days after he logs it as mailed in /admin/research.
**You never send, mail, submit forms or commit.**

Scripts run from the repo root: `npx tsx --tsconfig tsconfig.json scripts/outreach/<script>.ts …`,
written `outreach <script>` below. Voice, examples and the checklist are in [reference.md](reference.md).

## Steps

1. **Make sure the school is outreach-ready.** The input can be a school name, demo slug or website.
   If `src/data/outreach/<slug>.ts` doesn't exist or has no `snapshot` (the QR card opens it), follow
   `.agents/skills/school-outreach/SKILL.md` steps 1–8 first (find the school, build and link a demo,
   audit the site, write the plan and snapshot, validate). If the plan has `doNotEmail`, stop: no letter.
2. **Run the scan.** `outreach founder-research <slug>` (add `--name "Full Name"` once you know it, and
   run it again). Read `.founder-research/<slug>.md`: founder paragraphs from their site, mailing address
   leads, podcast episodes from iTunes and the searches to run by hand.
3. **Check every lead by reading the page.** Open each podcast episode, interview, article and About
   page you might use (WebFetch, or the web-fetch agent). Run the "Search by hand" queries with
   WebSearch. A search snippet is not a source.
   - **Same person?** Names collide (a "Kimberly Lind" podcast was a nurse and travel agent, not the
     Georgetown principal). Use a result only when the page names the school, the town or their work.
   - Note each fact with its page title, URL and today's date.
4. **Find the mailing address** the school publishes: contact page, campus pages, footer, schema.org.
   A suite, unit, PO box or mailbox address is fine; when the school lists a separate mailing address,
   use that. If there's no published address, or the only one looks like a home, still write the
   letter: set `mailTo: null` (/admin/research shows "Address needed") and make the first
   `checkBeforeMailing` item "Find a mailing address: <what you checked, any non-home leads>". Never
   store a home address anywhere in the plan; Julius finds the address himself.
5. **Pick one hook.** The best is something the founder said or did in public about the school:
   a podcast episode, an interview, a talk, the founding story in their words, a milestone (opened,
   new campus, accreditation, a grant). Prefer recent. One hook only. If no founder is named, write to
   whoever leads (director, head of school, administrator, board president) and open on a school fact
   from their own site; say so in `checkBeforeMailing`. Don't skip a school for this.
6. **Write the letter** (rules and our story in reference.md): body 80–110 words, "Hi <first name>,"
   … "Julius". One specific thing about them, said warmly; then a one-sentence bridge from that detail
   into the line that we run Sage Field and built MudKitchen from the start to run our whole school,
   which helped us grow, ending "So I set up a version of it for <school>."; then one small ask as the
   last paragraph ("I'd love to hear how…", no "A text is plenty"). The P.S. points to the card ("The card inside has a QR code for it, plus…"),
   plus a sticky note. Read it aloud: it should sound warm and kind and flow from
   paragraph 1 into paragraph 2; cut anything that sounds like marketing or a greeting card (see "Don't" in reference.md).
7. **Add `letter` to the plan** (type `OutreachLetter` in `src/data/outreach/types.ts`):
   `writtenOn`, `founder`, `mailTo`, `founderFacts`, `hook` (the exact `fact` it opens on), `body`,
   `postscript`, `stickyNote`, `shortCode` (`<short school name>-<4 random lowercase letters/digits>`,
   e.g. `athena-k7p2`), `checkBeforeMailing`.
   Then add one natural line to the plan's `first` email saying a handwritten note went out last week
   (the validator checks for "note" or "letter"; see school-outreach-research reference.md, "When the
   school also gets a handwritten letter").
8. **Validate.**
   - `outreach generate-plan-registry`
   - `NODE_ENV=test npx tsx --require ./src/test/integration/mock-server-only.cjs --test --test-name-pattern <slug> src/data/outreach/outreach-plans.test.ts`
   - `npx tsc --noEmit -p tsconfig.json` and `npx eslint src/data/outreach/<slug>.ts`
9. **Report**: the hook and its source, the letter text, the address and where it came from, the
   short link, and anything in `checkBeforeMailing`.

## Privacy rules

- Only public, school-related facts: their teaching career, why they started the school, what they
  said on a podcast or in the press, school milestones.
- A founder's publicly shared founding story may be mentioned gently, even when it involves their
  child or grandchild, said the way they said it. Never names, ages, health, spouses, pets, homes,
  religion beyond the school's own description, or personal social media.
- Never store phone numbers or email addresses in the plan (the validator checks). Julius writes his
  own cell number on the card by hand.
- Don't imply a relationship you don't have ("as we discussed", "fellow founder", "great to connect").
