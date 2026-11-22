# Outreach reference

Everything the school-outreach-research skill writes from. The full playbook (with sources) is the
"MudKitchen Cold Outreach Playbook" doc: https://claude.ai/artifact/WD2mEghd6CUmHfLSixXDnq

## Footer (added at send time, never write it into the body)

```
--
Julius Cecilia · MudKitchen (trymudkitchen.com) · Sage Field, Round Rock, TX · {OUTREACH_POSTAL_ADDRESS}
If this isn't useful, reply "no thanks" and I won't email again.
```

## Who's writing

Julius Cecilia runs **Sage Field**, an outdoor-focused private microschool in Round Rock, Texas
(ages 4–11), and built MudKitchen (trymudkitchen.com) to run it: website, enrollment, tuition,
parent portal, teacher and admin dashboards. Emails are from Julius, a person, not from "the MudKitchen team".

## Proof points we can use

| Proof | Source | Notes |
| --- | --- | --- |
| Sage Field went from 0 to 35 students in under 3 months on MudKitchen | trymudkitchen.com/customers/sagefield (`src/components/customers/sagefield-garden/sagefield-copy.ts`) | Always safe to use |
| Rooted Meadows, a K–8 school in Rigby, Idaho, opened August 2026 on MudKitchen | Julius (customer, may be named) | Keep "opened on it this August" in `checkBeforeSending` until confirmed |

Never invent other customers, numbers or results.

## Voice rules

- Write like a short note to a founder you respect. Read it aloud; if you wouldn't say it, cut it.
- Open with one fact from **their own** site or a directory, with the detail that makes it real
  (a price, a program name, a step in how families join, a funding source).
- Say plainly why you're writing to *this* school.
- One number for proof (0 → 35 in under 3 months).
- **Name MudKitchen once in the first email**, as what Julius built and runs Sage Field on
  ("…0 to 35 students in under 3 months on MudKitchen, the enrollment and tuition system I built for it").
  No link in the body: the footer carries trymudkitchen.com. The validator fails a first email without it.
- One small ask. First email: permission ("Want me to send it?"). No calendar links, no meeting asks.
- First email 50–125 words (aim 60–90); follow-ups 20–80; social note under 200 characters.
- Subject: 2–6 words, honest, specific to them ("TEFA families at Athena"), lowercase is fine.
- At most one link in the first email; prefer none.
- Greet "Hi {first name}," and sign "Julius". Contractions are good. No colons-into-feature-lists,
  no groups of three adjectives, no exclamation marks.

## Phrases that make it read as generated (the test rejects these)

quick question · I hope this finds you · hope you're well · worth a look · yours to keep · touch base ·
circle back · I came across · just following up · following up on my last email · did you get a chance ·
fellow founder · best-in-class · game-changer · take it to the next level · streamline · leverage

The full list lives in `STOCK_PHRASES` in `src/lib/admin-crm/outreach-email.ts`.

## Sequence

| Step | Business day | Adds |
| --- | --- | --- |
| `first` | 0 | The researched fact + proof + permission ask |
| `follow-1` | 3 | Resource: a 60-second Loom of *their* demo (`{loom link}`) |
| `social` | 5 | A hello on Instagram, Facebook or LinkedIn. No pitch (LinkedIn forbids promotional connection notes) |
| `follow-2` | 8 | Proof (Rooted Meadows) or a different angle from another fact on their site |
| `close` | 20 | An honest close; the demo stays up |

Any reply stops the sequence (the funnel does this automatically when the status moves to Replied).

## Why these rules (data)

- Hunter, State of Email Outreach 2026 (31M emails, https://hunter.io/the-state-of-cold-email):
  69% of US decision makers are bothered by AI-written email unless it feels human; manually edited
  emails get 5.2% replies vs 4.4% automated; two personalized details 5.6% vs 3.6% with none;
  three messages 6.8% vs 3.3% for one, with three or more follow-ups doing worse; "quick question"
  subjects underperform; 5–6 word subjects reply best.
- Gong (300K+ emails): asking about interest books about 2x the meetings of proposing a time, cold.
- Cold Email, LinkedIn Outreach & Deliverability plugin: one sourced, dated fact tied to the offer;
  ask whether a task happens rather than presuming how; every follow-up needs a new reason; honest
  subjects; sender identity, postal address and opt-out in every email (CAN-SPAM has no B2B exemption:
  https://www.ftc.gov/business-guidance/resources/can-spam-act-compliance-guide-business).

## Approved examples

Each passed review. Use them for shape and tone, never copy their facts.

**Why now (Athena Micro-academy).** Subject: *TEFA families at Athena*

```
Hi Mily,

Your FAQ says Athena is an approved TEFA vendor on Odyssey. At $17,000 tuition, a TEFA family still owes about $6,500 on top of the $10,474 the state pays, so one student can mean two payers.

I run Sage Field, a microschool in Round Rock. We went from 0 to 35 students in under 3 months on MudKitchen, the enrollment and tuition system I built for it. I set up a version for Athena with your programs in it.

Want me to send it?

Julius
```

**One real question (Wild Hearts Adventure Co.).** Subject: *charter funds at Wild Hearts*

```
Hi Cara,

I was reading the Wild Hearts site. Families can pay with charter enrichment funds, afternoon classes are $60 a month each, and Family Info sits behind a shared password.

Do families come through more than one charter? I'm curious how you keep that straight alongside the afternoon class sign-ups.

I ask because I run a small outdoor microschool in Round Rock, TX, and billing like that is why I built MudKitchen, the software we run it on.

Julius
```

**Proof + their process (Zoe Learning House).** Subject: *Zoe's admissions steps*

```
Hi Emily,

Zoe's intro page lays out three steps to join: the interest form, a visit with the literacy and math check, then the Child Visit Day.

I run Sage Field, a microschool in Round Rock, and built MudKitchen to track every family through steps like that in one place. We grew from 0 to 35 students in under 3 months on it, and Rooted Meadows in Idaho opened on it this August.

I set up a version for Zoe with your interest form and 1–5 day options. Want me to send it?

Julius
```

**Do not email (Nature's Schoolhouse).** Wonderschool listed them as "currently pausing operations"
and their site returned 404, so the plan has `doNotEmail` and no steps.

## Research checklist

- [ ] Their site: home, about/team, FAQ, admissions, tuition, programs, family info
- [ ] Directories (Wonderschool, KaiPod, Alt Ed Austin, microschool.directory): open? enrolling?
- [ ] Job posts (WorkNOLA, Indeed, careers page)
- [ ] Facebook / Instagram / LinkedIn: recent news
- [ ] State funding programs that apply (TEFA in Texas, charter enrichment funds in California, ESAs elsewhere)
- [ ] What the demo actually shows (so the email doesn't over-claim)

## Re-contact and the snapshot (Nov 2026)

Why the re-contact sequence looks the way it does:

- **Offer, don't link, in the first email.** An Overloop A/B test found a URL in email 1 cut replies from
  9.4% to 5.1%, and Gong found interest-based asks book about 2x the meetings of meeting asks. So the
  first email offers the snapshot ("Want me to send the snapshot?") and follow-up 2 sends it anyway.
- **A new reason, honestly framed.** These schools already got the demo link by hand months ago. Vendor
  guidance says wait about 3 months and bring something new; the snapshot is that. Say once that you
  wrote before; never pretend it's a first email, and never "just following up".
- **No hard data on free reports in cold email** (only templates), so make the snapshot earn its place:
  4–8 real gaps found by auditing the whole site, each sourced, direct but kind, with what it costs a
  family and what we'd do. Judge it by replies after 30 schools.
- **Fixes can go beyond the demo.** If MudKitchen could solve a gap (shipped but not in their demo, or
  custom work we'd build), include it as "We can set this up for you", and list custom work in
  `checkBeforeSending`. Never present unbuilt work as existing.
- **Proof:** Sage Field 0 → 35 students in under 3 months (always fine). Rooted Meadows opened on
  MudKitchen in August 2026 (keep in `checkBeforeSending` until confirmed).
