# Rival platforms for MudKitchen feature pages

Decided Nov 22, 2026. One set of three rivals for every feature page, so comparison tables line up across the site.

## Decision

| Slot | Rival | Why it's in |
|---|---|---|
| 1 | **Brightwheel** | The software microschools name most. In our own research on 46 prospect microschools (`src/data/outreach/*.ts`, each built from the school's public website), Brightwheel is the only all-in-one platform that shows up more than once: 5 of 46 tool stacks. Third-party "microschool software" guides also put it first, while saying it fits younger (K–5) programs best. |
| 2 | **Playground** (tryplayground.com) | The one childcare platform with first-hand microschool reviews. Search results for its Capterra and G2 pages show owner/directors saying it "works really well for a microschool setting" and "It's been a great fit for my microschool, and I'm glad we made the switch" (search snippets; Capterra returned 403 to direct fetches, so the quotes are unverified). One prospect microschool runs its information-request form on Playground (`src/data/outreach/creation-acres.ts`). |
| 3 | **Transparent Classroom** | The usual pick for Montessori-style microschools, many of which are small and founder-run. Simple public pricing ($2 per child per month) that small schools can find without a sales call. |

### Why not Procare

Procare is the largest childcare-center brand, but this session turned up no microschool evidence for it: 0 of our 46 prospect tool stacks, and its Capterra reviews come from childcare centers. Searches for Procare plus "microschool" returned only general center reviews. Keep it as an alternate if a page needs a "big center software" foil, but don't build tables around it.

### Others considered

- **Google Forms / Jotform**: not platforms, but the real incumbent. Google Forms is in 14 of our 46 prospect tool stacks and Jotform in 6. Each feature page covers them in the "tool stack" column, not as a rival.
- **Wonderschool, Alma, ClassDojo, Sawyer, Homeschool-Life**: 1–2 mentions each in our prospect research. Too thin to anchor a comparison.
- **FACTS, Gradelink, Classe365, Kangarootime, CoopTools**: no microschool adoption evidence found this session.
- **Prism, MicroCampus, Schoolcues, DreamClass**: marketed to microschools or co-ops, but small. The evidence is a founder-community post (Prism on the Microschool Founders Grove Skool group) or vendor listings. Worth watching, not yet worth a column.

Caveat: most "best microschool software" lists we found are lead-generation blogs (for example homeschoolstartguide.com). We used them only to back up the Brightwheel and Playground picks, never as the main evidence.

## Rival profiles (checked Nov 2026)

### Brightwheel
- **Positioning:** "#1 childcare management software". An all-in-one app for check-in, daily reports, billing, messaging and paperwork.
- **Built for:** Childcare centers, preschools, in-home care, before/after-school programs and Montessori programs. It has no microschool page.
- **Public pricing:** None published. The pricing page is a "Request pricing" form: "We'll need some info to customize your pricing." The childcare-forms FAQ says: "Your price is based on enrollment capacity and you get access to all features on the platform." — https://mybrightwheel.com/pricing and https://mybrightwheel.com/childcare-forms/ (checked Nov 2026)
- **Main URLs:**
  - Product: https://mybrightwheel.com/
  - Help center: https://help.mybrightwheel.com/
  - Sign-ups: https://help.mybrightwheel.com/en/articles/11175244-create-sign-up-sheets-for-events-supplies-parent-teacher-conferences-more
  - Forms: https://help.mybrightwheel.com/en/articles/4404606-forms-for-enrollment
  - Fillable documents: https://help.mybrightwheel.com/en/articles/8357845-create-fillable-documents
  - Forms marketing: https://mybrightwheel.com/childcare-forms/

### Playground
- **Positioning:** "the child care management platform that eliminates the administrative work of running a center". The site claims 500,000+ families and 5,000+ programs.
- **Built for:** Childcare. Its "Built for" menu lists Centers, Multi-site, In-home, Head Start, Shared Services, Before & After Care and Camps, with no mention of microschools or private schools. Despite that, microschool owners review it (see above).
- **Public pricing:** None published. llms.txt says "custom pricing based on program size and needs" and points to Book a Demo. The /pricing page rendered no prices when fetched. — https://www.tryplayground.com/llms.txt and https://www.tryplayground.com/pricing (checked Nov 2026)
- **Main URLs:**
  - Product: https://www.tryplayground.com/
  - About: https://www.tryplayground.com/about
  - Paperwork: https://www.tryplayground.com/paperwork (also /solutions/paperwork)
  - Help center: https://help.tryplayground.com/
  - Parent app overview: https://help.tryplayground.com/en/articles/5356813-parent-app-overview

### Transparent Classroom
- **Positioning:** "Simple, Meaningful Record Keeping". Montessori-rooted observation, lesson-planning and progress records, plus admissions, forms and parent communication.
- **Built for:** Montessori and progressive schools, including small ones.
- **Public pricing:** "$2.00 USD per child per month". "Each month, you are charged only for children actively enrolled the previous month." Classrooms, staff and support are unlimited. The pricing page shows no minimum or annual option. A third-party blog reports a $10/month minimum, but we couldn't confirm that on TC's own site. — https://www.transparentclassroom.com/pricing (checked Nov 2026)
- **Main URLs:**
  - Product: https://transparentclassroom.com/
  - Help center: https://transparent-classroom.helpscoutdocs.com/
  - Forms + Applications: https://transparent-classroom.helpscoutdocs.com/category/13-category
  - Using Forms: https://transparent-classroom.helpscoutdocs.com/article/51-using-forms-overview
  - Assigning forms: https://transparent-classroom.helpscoutdocs.com/article/264-assigning-forms-to-families
  - Feature requests: https://transparentclassroom.uservoice.com/forums/145102-general

## Notes for other feature pages
- All three rivals are childcare- or Montessori-first. The honest contrast is "built for daycare/preschool, not a K–8 microschool run by its founder". Don't claim they "can't" do things we haven't checked.
- Brightwheel and Playground don't publish prices, so tables should say "Quote only" rather than guessing. Transparent Classroom is the only one with a public number.
