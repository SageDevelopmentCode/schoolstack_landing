# Handwritten letter: voice and checklist

A letter is one person writing to another about why they both started a school. It is not a pitch.
The product stays in the P.S. and on the card. The tone is warm and kind, like a note to a fellow
founder you admire: Julius read something about them, enjoyed it, and says so.

## Our story (the only approved source for the "us" line)

Say it plainly, in three short sentences, the last one naming their school by `shortSchoolName`:

> My fiancée and I run Sage Field, an outdoor microschool in Round Rock, Texas. We built MudKitchen from
> the start to run our whole school, and it's a big part of how we grew. So I set up a version of it for <school>.

MudKitchen runs the whole school (website, enrollment, tuition, parent portal, staff), so don't narrow it
to "enrollment and tuition". The last sentence is what carries the reader to the card; don't add
"Now we offer it to other microschools" or anything else about selling it.

Background, for context only: Julius and his fiancée went to the same middle school and were both told
growing up they were too playful. That's why Sage Field is an outdoor school built around play and time
outside. Use at most one plain clause of this, and only when it genuinely matches the founder. Never
dramatise it.

Write as "I" and "my fiancée and I / we"; sign "Julius". Don't use the "0 to 35 students" number in
letters (it stays in the emails).

## Why a letter works (from the Offline Outreach Playbook)

- Cold mail gets 2–4.4% response against 0.12% for email; a handwritten note lifts it further.
- The personal part matters more than the ink: a specific, true detail beats a generic note.
- A separate sticky note on the fold beat the same words written on the letter (Garner, 2005).
- Founders like helping founders: asking for advice or coffee gets more replies than offering a product.

## The shape (body 80–110 words; P.S. 35 or fewer)

1. **Them.** One specific thing about them, said warmly: what they said on a podcast, why they started,
   a milestone. "I listened to your LiberatED episode and loved how you're keeping Athena small on purpose."
2. **Bridge, then us.** Paragraph 2 opens with one short bridge sentence that picks up the detail from
   paragraph 1 and turns to us, so the letter reads as one thought, not two pasted blocks. Then the three
   sentences above, ending "So I set up a version of it for <school>." MudKitchen is named here, once.
3. **One small ask, last.** Its own paragraph, closing the letter: "I'd love to hear how…" about their
   school. Coffee for Austin-area schools (Austin, Georgetown, Pflugerville, Cedar Park, Leander, Hutto):
   "If you're ever up for coffee, I'd love to hear how…". Don't add "A text is plenty" or any other
   line after the ask.

### The bridge

One sentence, under about 12 words, written for this letter's detail. It may only lean on true things:
Julius is writing because of what he read or heard; he runs a small school too; Sage Field is an
outdoor school built around play and time outside; he and his fiancée run it together. It never claims
their story is ours ("we did the same") and never invents a Sage Field fact (no "we have goats too"
unless it's true). Examples:

- "Stories like hers are why I wanted to write."
- "Time outside is a big part of our days too." (outdoor, farm or nature schools)
- "Running a small school ourselves, I know how much that takes." (a milestone, move, accreditation)
- "That's the kind of school we love hearing about." (a distinctive program or philosophy)
- "Hearing from founders like you is my favorite part of this work." (a podcast or interview)
4. **"Julius".** His cell number is written by hand, never stored.
5. **P.S.** Points to the card, without naming MudKitchen or repeating the "set up a version" line:
   "The card inside has a QR code for it, plus a parent's-eye look at your enrollment." Don't mention
   earlier emails, even for re-contact schools: it spends words on us, not them.

**Sticky note** (15 words or fewer): first name, a plain reason to open it, initial.
"Mily, a note from a microschool up the road. J"

## Don't

- Mirror their story as ours ("felt very familiar", "could have come from us", "the same kind of reason").
- Hype or big verdicts ("amazing", "inspiring", "takes real nerve", "says you were right"). Short, sincere
  appreciation is good ("I loved that…", "What a way to start a school.", "That made me smile.").
- Over-familiar lines ("stuck with me", "stayed with me", "allowed to be kids").
- Sell, explain features, or use more than one sentence about us (the bridge doesn't count).

## Founders' own stories

- A founder's publicly shared founding story may be mentioned gently, even when it involves their child
  or grandchild (for example a podcast titled "Building the School Her Son Needed"). Say it the way they
  said it, nothing more.
- Never names, ages, health, diagnoses, spouses, homes or private social media, and nothing they didn't
  say themselves in public about the school.
- Names collide: confirm the page names their school, town or work before you use it.

## Rules the validator enforces

- Body 80–110 words, "Hi <first name>," first, "Julius" last. P.S. present, mentions the card, 35 words or fewer.
- No links, no "trymudkitchen", no `{placeholders}`, no exclamation marks.
- MudKitchen at most once (in the "us" line, not the P.S.); Sage Field named.
- None of the email `STOCK_PHRASES` and none of: "dear founder", "to whom it may concern",
  "I hope this letter finds you", "reaching out", "innovative", "revolutionize", "cutting-edge",
  "seamless", "solution", "platform".
- The hook is one of `founderFacts`, word for word; every fact has an https URL and a read date.
- A mailing address (`mailTo.lines` is the whole envelope, one line each: recipient, school, street, city) with the https page it's published on, or `mailTo: null` until one is found; a snapshot on the plan; a unique short code.

## Read it aloud

- Would Julius say this to them over coffee? If a sentence sounds like marketing or a greeting card, cut it.
- Contractions. Short sentences. No groups of three adjectives, no colon into a list, no "excited to".
- Warm and kind, never gushing. One specific detail beats three general ones.
- Does paragraph 1 lead into paragraph 2? If the "My fiancée and I" line could follow any opening, the
  bridge is missing or too generic.

## Example (Athena Micro-academy, Nov 2026)

> Hi Mily,
>
> I listened to your LiberatED episode and loved how you're keeping Athena small on purpose, planning
> each student's work around where they want to go after high school.
>
> Hearing from founders like you is my favorite part of this work. My fiancée and I run Sage Field, an outdoor microschool up in Round Rock. We built MudKitchen from the
> start to run our whole school, and it's a big part of how we grew. So I set up a version of it for Athena.
>
> If you're ever up for coffee, I'd love to hear how your first semester is going.
>
> Julius
>
> P.S. The card inside has a QR code for it, plus a parent's-eye look at your enrollment.