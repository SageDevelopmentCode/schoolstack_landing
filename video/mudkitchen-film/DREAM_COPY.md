# Dream ad: copy and story

Compositions: `Dream-9x16-40s` (36s master) and `Dream-9x16-15s` (15s cutdown) in Remotion Studio, folder **Dream**.
Timing lives in `src/dream/edl.ts`, footage in `src/dream/shots.ts`, shot list in `DREAM_SHOTLIST.md`.

## The story in one line

A founder who started a school to be with kids is buried in admin at 11:47pm. We show the life they wanted (as questions they answer in their head), prove it's real, and hand them the keys.

**Hero:** the founder (the viewer). **Guide:** MudKitchen. **Villain:** invoices, forms, chasing parents. **Transformation:** buried → present.

## Why it's built this way (from the Anthropic spot)

1. **Questions, not claims.** "What if every family paid on time?" makes the viewer picture it. A claim ("Automated billing!") gets argued with.
2. **One word, one shot.** Readable with the sound off, and every word is a cut on the beat.
3. **Hook first.** The Anthropic spot opens on its logo; a paid vertical ad can't. Ours opens on the pain, with text on frame 0.
4. **Fast → breath → fast → still.** Questions at word speed, one slow drone shot, a rapid proof montage, then silence on the end card.
5. **Proof in mono.** Each `\ tag \` names something MudKitchen really does. Never invent a customer, number or result.
6. **The customer replaces "we".** "Built for Sage Field → your school." puts the viewer in the hero's place.

## Script: 36s master

| Time | Picture | On screen | Sound |
|---|---|---|---|
| 0.0–3.3 | Phone buzzing at 11:47pm → founder lit by laptop | You didn't start a school / to chase invoices. | Buzz, clock tick, no music |
| 3.3 | Black, half a beat | | Silence |
| 3.6 | Pickup, family arriving, thumb tap, coffee in sun | What if every family paid on time? | Whoosh, downbeat, music in |
| | Empty classroom → full classroom (match cut) | What if enrollment filled *itself?* | |
| | Car line, pickup hug, relieved parent | What if parents never had to *ask?* | |
| | Teacher kneeling, kid laughing, name cubbies | Know every kid by name? | |
| | Papers flying → kids running out → mud kitchen | Less *paperwork.* More *this.* | Thud on "this." |
| ~20 | Drone over a small schoolhouse | | Music thins, shimmer |
| ~23 | Macro textures + 3 product flashes | `\ morning-attendance \` … `\ Sage-Field-runs-on-MudKitchen \` | Tick per tag, crackle per flash |
| ~28 | Cream paper | Built for Sage Field. → logo → *your school.* | Music cuts dead |
| ~32 | Logo | MudKitchen · *Run the school you imagined.* · Book a demo · trymudkitchen.com | Sting, kids laughing far off |

## Hook variants (A/B test the first 3 seconds)

1. You didn't start a school / to chase invoices. *(current)*
2. It's 11:47pm. / You're still doing tuition.
3. You became a founder / to teach kids. Not spreadsheets.

## End-line variants

- Run the school you imagined. *(current)*
- Back to the kids.
- Run your school. Not your spreadsheets.

Change `END_COPY` in `src/dream/EndCard.tsx`.

## Post captions

**A (story)**
> You didn't start a school to chase invoices.
> You started it for the mornings, the muddy hands, the kid who finally gets it.
> MudKitchen runs enrollment, tuition, forms and parent messages so you can get back to them.
> Book a demo: trymudkitchen.com

**B (questions)**
> What if every family paid on time? What if parents never had to ask?
> That's what running a microschool on MudKitchen feels like.
> See it with your school's name on it → trymudkitchen.com

**C (short)**
> Less paperwork. More this. 🌱 MudKitchen, the all-in-one system for microschools. Link in bio.

## Music brief (what to search for)

Cinematic, hopeful build, 95–110 BPM: felt piano or plucked strings over a soft pulse, building to a full but warm lift around 15–20 seconds in, with a clean point where it can cut to silence. Search terms: "hopeful cinematic build piano", "inspiring documentary pulse", "uplifting minimal strings".

- License it on a plan that covers **paid social ads** (Artlist and Epidemic Sound put ads on higher tiers; check before running).
- Save it as `public/audio/dream/music.mp3`, set `BPM` in `src/dream/edl.ts` to the track's tempo, and set `MUSIC_OFFSET_SEC` to the second where its first big downbeat lands. Then run `npm run sync-assets`.
- Until then the edit plays a click track at the same BPM (`npm run audio:dream`).

## Before posting

- Sage Field's OK to show its name and logo on the end card.
- Every proof tag is true.
- License receipts saved for every clip and the track.
- AI-generated footage labelled where the platform requires it.
