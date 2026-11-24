# Forms & documents

Slug: `forms-documents`. Researched Nov 22, 2026. Rivals: Brightwheel, Playground and Transparent Classroom (see `_rivals.md`).

> **Read first: what this feature is and isn't.**
> - **It is:** sending a form to families and collecting typed e-signatures. A form is either an uploaded PDF/Word file families review and sign, or a form built from fields.
> - **It is not, as of today:**
>   - A general **document library** for families (handbook, policies). Committees have role-limited Resources, but no school-wide family library exists.
>   - **Automatic or manual reminders** for unsigned forms. Classroom signups have reminders; forms don't.
>   - **Push notifications** for new forms (email only).
>   - **Drawn signatures** (typed only).
>
> Keep the page copy inside these lines.

## Product truth (capabilities by role, with file paths; web/mobile)

Feature flags:
- `forms_documents` is a teacher feature ("Family forms for classroom signatures") and a parent feature ("View and sign forms from your child's teachers") — `src/lib/organization-settings/catalog.ts:329-336,431-436`. It is on by default for both (`catalog.ts:152,166`).
- The admin version is a My School subtab: `my_school / forms_documents` (`src/app/school/[slug]/admin/(protected)/[feature]/[subtab]/page.tsx:421-438`).
- **Admin and teacher form tools are web-only.** The mobile app has no admin or teacher forms route. Families can sign on web and mobile.

### Admin / founder (web only)

| Capability | Proof |
|---|---|
| One workspace showing **every form any staff member created**, with a "Created by" column and filters by status (All / Draft / Active / Archived) and by creator (Everyone / Me / each staff member). | `src/components/school-admin/forms-documents/FormsDocumentsWorkspace.tsx:344-370,433`; `useFormsDocumentsModel.ts`; `src/lib/school-admin/forms-documents/types.ts` (`AdminParentForm` adds `createdByName`) |
| Metrics: Active forms, Pending signatures, Completed this month. | `FormsDocumentsWorkspace.tsx:118,327-338` |
| Per-form progress: "X of Y families signed". | `FormsDocumentsWorkspace.tsx:418,470` |
| Create forms (same wizard as teachers) and send them to classrooms or specific families. A draft nudge says "<form> hasn't been sent to families yet… Review and send". | `FormsDocumentsWorkspace.tsx:276-315`; `src/lib/school-admin/forms-documents/mutations.ts`, `parse-publish-input.ts`, `load-admin-classroom-options.ts` |
| Open a form to see each family's status (Pending / Signed / Overdue), duplicate it, archive it ("It moves to Archived. You can still open it there."), and download the file. | `FormsDocumentsWorkspace.tsx:207-240`; `src/lib/school-admin/forms-documents/fetch-admin-form-download-url.ts`; `src/components/school-teacher/forms-documents/TeacherFormDetailSidebar.tsx` (Duplicate, Download, Archive) |
| Empty-state examples: "liability waivers, field trip permissions, or photo releases". | `FormsDocumentsWorkspace.tsx:282` |
| Related: tuition/enrollment **agreements** use the same engine with `formCategory: "tuition"`. | `src/lib/school-teacher/forms-documents/types.ts` (`TeacherParentFormCategory`); `src/components/school-admin/tuition/TuitionFormsPanel.tsx`; parent guide "Sign your enrollment agreement" `parent-documentation.ts:131-134` |

### Staff / teachers (web only)

| Capability | Proof |
|---|---|
| Two ways to create: "Upload a file — PDF or Word document families will review and sign" or "Build a form — Add questions and a signature field for families to complete." | `src/components/school-teacher/forms-documents/TeacherFormCreateWizard.tsx:633-642`; `TeacherFormUploadStep.tsx:37` (accepts .pdf or .doc/.docx) |
| Field types: short text, long text, checkbox, multiple choice, date, signature. Each field can be required. | `src/lib/school-teacher/forms-documents/types.ts` (`TeacherFormFieldType`, `FIELD_TYPE_LABELS`); `TeacherFormBuilderCanvas.tsx`, `TeacherFormBuilderOutline.tsx` |
| Title, description, optional due date, and a "Require signature" toggle. | `TeacherFormCreateWizard.tsx` (fields around lines 247-302) |
| Audience: one or more **classrooms**, **specific families**, or "Saved for later". | `types.ts` (`FORM_AUDIENCE_TYPE_LABELS`); `TeacherFormAudienceOptionTabs.tsx`, `TeacherFormClassroomPickerSheet.tsx`, `TeacherFormFamilyPicker.tsx`; `src/lib/school-teacher/forms-documents/audience.ts` |
| Signature table per form: family, students, Pending / Signed / **Overdue** (pending after the due date), and signed-at time. | `TeacherFormSignatureTable.tsx`; `types.ts` (`TeacherFormSignatureRow`); `db-mapper.ts:82-85` |
| Email when a family signs. | `src/lib/school-teacher/forms-documents/teacher-parent-form-notifications.ts` (`sendTeacherParentFormResponseSignedNotification`) |
| Duplicate last year's form, archive old ones, download. | `TeacherFormDetailSidebar.tsx:5,38,205,282-285` |

### Families / parents (web + mobile)

| Capability | Proof | Web | Mobile |
|---|---|---|---|
| Email when a form is sent, to each family's notification addresses. | `teacher-parent-form-notifications.ts` (`sendTeacherParentFormPublishedNotifications`, `loadFamilyNotificationEmails`) | email | email |
| Forms list with a "Next up" card, To do / Signed filter, and "Review & sign" or "View". | `src/components/school-parent/forms-documents/garden/FormsNextUpCard.tsx`, `FormsListCard.tsx:24,90-141`, `FormsRailCards.tsx` | ✓ | ✓ (`apps/mobile/src/components/parent/forms-documents/parent-forms-documents-screen.tsx`) |
| Preview the uploaded PDF in place, fill in fields, then sign. | `garden/GardenFormDocumentPreview.tsx`, `GardenFormFields.tsx`, `GardenFormDetailDialog.tsx`; mobile `parent-form-detail-screen.tsx`, `garden/garden-form-fields.tsx` | ✓ | ✓ |
| **Typed signature**: "Type your full legal name to sign… Your typed name becomes your signature on this form." | `garden/GardenSignatureField.tsx:25,84-111`; mobile `garden/garden-signature-field` | ✓ | ✓ |
| Signed forms stay viewable later. | `FormsListCard.tsx` ("View" when signed) | ✓ | ✓ |
| Enrollment checklist: forms, uploads and agreement after acceptance (enrollment flow, not this tab). | `parent-documentation.ts:430-456` | ✓ | — |

## Founder pain (with quotes + sources)

Reddit and parent forums blocked automated access. These examples come from microschool websites we read for outreach (`src/data/outreach/*.ts`; each line cites the school's public URL) and from published reports.

- **Six links for one family.** After acceptance, Homework Hub's Learning Pod families "complete six separate forms (registration, membership agreement, field trip waiver, card authorization, medical safety, handbook acknowledgement)" (our research note) and set up a payment account. — https://www.homeworkhubtutoring.com/our-registration-forms (via `src/data/outreach/homework-hub.ts:31,109`)
- **Last year's waiver, still in use.** Gathered Oak Farm's 2026 summer camp registration sends families to a separate Jotform titled "2024-2025 Gathered Oak Farm Release Form" and asks them to tick that they signed it. — via `src/data/outreach/gathered-oak-farm.ts:53,181`
- **Opt-ins as loose Google Forms.** Hilton Horizons Academy links a Curriculum Opt-In and a MAP Testing Opt-Out as two Google Forms, separate from enrollment. — https://www.hiltonhorizonsacademy.com/program (via `src/data/outreach/hilton-horizons-academy.ts:145-146`)
- **"Paperwork" with no stated way to sign it.** Inspired Learning Academy's step 4 says families "submit the enrollment paperwork along with the $350 registration fee", but the site doesn't say how it's signed (via `inspired-learning-academy.ts:106-107`). Ascend Micro School gives families one week to return "enrollment paperwork, or the spot is released" (via `ascend-micro-school.ts:31,133`).
- **Compliance eats founder time.** "93 hours per year — that's the average amount of time microschool leaders spend on compliance issues." — The 74, reporting the National Microschooling Center's 2026 update, June 11, 2026 — https://www.the74million.org/article/exclusive-7-things-to-know-about-microschools-in-2026/ (much of this is government approval, not family forms, so use it as context only)
- **A sign of rival friction.** Brightwheel's help center notes "The name in the Parent Name and Parent Signature fields must match exactly including spaces and capitalization to submit the form." (search snippet of help.mybrightwheel.com/en/articles/4404606; that article now redirects to "create-digital-forms", which doesn't show the line.)

## Evidence (numbered: quote — publisher, year — URL)

1. "76% of all successful eSignature transactions on our platform were completed in less than 24 hours and 41% within 15 minutes." — Docusign, "Free electronic signature" page, checked Nov 2026 — https://www.docusign.com/learn/free-electronic-signature. *Vendor data. Docusign's walkthrough post gives 79% / 44% (https://www.docusign.com/blog/esignature-feature-walkthrough). Quote one page and attribute it to Docusign.*
2. A signature "may not be denied legal effect, validity, or enforceability solely because it is in electronic form". — U.S. Code, 15 U.S.C. §7001(a)(1) (ESIGN Act, 2000) — https://www.law.cornell.edu/uscode/text/15/7001. *Not legal advice. State rules for specific documents still apply.*
3. "About nine-in-ten (91%) own a smartphone". The figure is 97% for ages 30–49. Survey "conducted Jan. 30-June 18, 2026." — Pew Research Center, Mobile Fact Sheet, 2026 — https://www.pewresearch.org/internet/fact-sheet/mobile/
4. "93 hours per year — that's the average amount of time microschool leaders spend on compliance issues." The same article says "The median number of students attending private microschools is 20." — The 74 / National Microschooling Center, 2026 — https://www.the74million.org/article/exclusive-7-things-to-know-about-microschools-in-2026/
5. **Our own data (internal, describe it as such):** Of 46 microschool websites we reviewed in 2026, **14 run family paperwork or applications on Google Forms and 6 on Jotform**. One school sends accepted families six separate forms. — MudKitchen outreach research, `src/data/outreach/*.ts` (`toolStack` entries), 2026

## Tool stack alternative

- **Paper permission slips in backpacks.** These get lost and come back late. Someone retypes allergy info, and the founder hunts for the signed copy on the field-trip morning.
- **Google Forms.** There's no real signature (at best a "type your name" short-answer). Each new form is a new link and a new spreadsheet, nothing ties back to the child's record, and nobody sees who hasn't responded unless you compare lists by hand. Old links stay live (see the "no longer accepting responses" and 2024–25 release-form examples above).
- **Jotform.** Has e-signature fields but lives outside the school's family records. A per-form link has to be emailed, and plan limits apply. Several prospects use a network's (KaiPod's) Jotform account rather than their own (`athena-microacademy.ts:53`).
- **DocuSign / Dropbox Sign / SignNow.** Built for contracts, priced per sender, and needs every parent's email entered per envelope. Overkill for a photo release.
- **Google Drive folder of PDFs** for the handbook and policies. Families can't tell what's current, and there's no record of who read it.
- **Email chains** to chase the last few families. Nothing shows which family is still missing.

## Rivals (per rival: facts + URL + "checked Nov 2026")

**Brightwheel**: **Included** (pricing says "access to all features on the platform").
- Custom digital forms sent by "Admins and Managers… to families". "Submissions are stored in one place, making it easy to track the families that still need to submit any program forms."
- Limits:
  - "Forms can't be shared with staff."
  - Fees can't be collected on an individual form.
  - Editing a form doesn't change past submissions.
  - Room targeting is not mentioned.
  - Reminders for incomplete forms are not mentioned in the help article.
- Source: https://help.mybrightwheel.com/en/articles/4404606-create-digital-forms (checked Nov 2026)
- Fillable PDFs: "Create fillable PDFs and forms from brightwheel and share them directly with families". Families "access, complete, and sign forms from the mobile app". "Brightwheel offers unlimited storage." — https://mybrightwheel.com/childcare-forms/ (checked Nov 2026)
- Signature types: guardians can type and/or draw a signature (search snippet of the older help article; **unconfirmed** on the current page).
- Pricing: quote only. — https://mybrightwheel.com/pricing (checked Nov 2026)

**Playground**: **Included**, "Included in Playground. Unlimited. No fine print."
- "Drag-and-drop builder", "Upload PDFs and make them fillable", "every eSignature is dated, timestamped, and stored securely".
- Prebuilt "state-compliant form templates".
- "Send a bulk nudge to everyone missing a form", plus expiration tracking and email reminders before documents expire.
- Share with specific families, classrooms or groups. Approve or reject submissions. "Families complete paperwork in their portal — on any device."
- Source: https://www.tryplayground.com/paperwork (checked Nov 2026)
- Pricing: custom quote. — https://www.tryplayground.com/llms.txt (checked Nov 2026)

**Transparent Classroom**: **Included** in the $2/child/month price.
- Custom forms assigned to families per child.
- Digital signatures only on "Normal Form" types: Normal Forms "can include digital signatures", while applications "cannot digitally sign the form". — https://transparent-classroom.helpscoutdocs.com/article/54-application-verses-enrollment-forms (checked Nov 2026)
- Assign under Children > Forms, with an optional due date and an automatic reminder a set number of days before, or "More" > "Send reminder". Parents must be in the Parent Directory first. — https://transparent-classroom.helpscoutdocs.com/article/264-assigning-forms-to-families (checked Nov 2026)
- Overview and PDF attachments: https://transparent-classroom.helpscoutdocs.com/article/51-using-forms-overview (checked Nov 2026)
- Pricing: https://www.transparentclassroom.com/pricing (checked Nov 2026)

**Honest read:** all three rivals have digital forms with signatures, and Playground and Transparent Classroom have reminders that MudKitchen forms don't. MudKitchen's edge is narrower:
- Teachers can create and send forms to their own classrooms.
- The founder sees every staff member's forms in one place.
- Families sign on the same app they use for billing, messages and signups, at a microschool (not daycare) fit.

Don't claim "only MudKitchen has e-signatures".

## Draft copy (sections as in 2e)

Reference pages (structure): Playground Paperwork (above): outcome headline, builder, e-sign and nudge blocks, "Included… no fine print". Brightwheel Childcare Forms (above): template-led, with an FAQ on e-signature validity. Jotform "online permission slips" (https://www.jotform.com/blog/online-permission-slips/): use-case-led.

**Hero headline:** Permission slips signed *before the bus leaves* (lead: "Permission slips signed" / accent: "before the bus leaves", 7 words)

**Hero body (33 words):** Upload a PDF or build a form, send it to a class or a few families, and watch signatures come in. Families sign on their phone. You see who's still missing.

**One-liner (9 words):** Send forms, collect signatures, and know who's still missing.

**Capabilities: Admin / founder**
- **Every form, one view.** See forms from every teacher, filter by status or creator, and spot drafts never sent.
- **Know who's missing.** Each form shows "X of Y families signed", with Pending, Signed and Overdue per family.
- **Upload or build.** Turn your existing PDF or Word waiver into a signable form, or build one with six field types.
- **Send to the right families.** Pick one or more classrooms or specific families, so nobody gets forms that aren't theirs.
- **Reuse next year.** Duplicate last year's field-trip form, archive old ones, and download the original file anytime.

**Capabilities: Staff**
- **Send your own slips.** Teachers create classroom forms without asking the office.
- **Set a due date.** Families past the date show as Overdue on your signature list.
- **Hear when it's signed.** Get an email each time a family signs.
- **Start from a copy.** Duplicate a form and change the date instead of rebuilding it.

**Capabilities: Families**
- **Get it by email.** A new form arrives in your inbox with a link to sign.
- **Read, then sign.** Preview the PDF, fill in any questions, and type your name to sign.
- **Sign on your phone.** Use the MudKitchen app on iPhone or Android, or any browser.
- **Find it later.** Signed forms stay in Forms & documents to reopen anytime.

**Use cases**
1. **Field trip Friday.** *Scenario:* On Monday a teacher uploads the farm-visit permission slip, sends it to her two classrooms and sets Thursday as the due date. *Outcome:* By Thursday she can see the three families still pending and message them directly, so no one is turned away at the bus.
2. **New-year photo release.** *Scenario:* The founder duplicates last year's photo release and sends it to every classroom. *Outcome:* One list shows signed vs pending across the school instead of a stack of paper to file.
3. **One family's medication form.** *Scenario:* A child starts an inhaler mid-year. *Outcome:* The teacher builds a short form with a date, checkbox and signature, sends it to that one family, and gets an email when it's signed.
4. **Swapping six links for one place.** *Scenario:* A school sends accepted families separate links for registration, waiver, medical and handbook acknowledgement. *Outcome:* Families see each form in one list in the portal, and the founder sees completion per form. *(Keep enrollment-checklist claims to what the enrollment flow supports.)*

**FAQ**
- **Are typed e-signatures legally valid?** U.S. federal law (the ESIGN Act) says a signature can't be denied legal effect just because it's electronic. MudKitchen records the typed name and when it was signed. Some documents have state-specific rules, so check with your licensing body or attorney if unsure.
- **Can I use my existing PDF?** Yes. Upload a PDF or Word document. Families review it in the portal and sign. Or build a new form with short text, long text, checkbox, multiple choice, date and signature fields.
- **Can teachers send forms, or only the office?** Both. Teachers send forms to their own classrooms or chosen families from the staff portal. Admins see every form across the school.
- **How do families know there's something to sign?** They get an email when a form is sent, and it appears in Forms & documents in their portal and app.
- **Do forms send reminders?** Not automatically yet. Forms past their due date show as Overdue so you can follow up. *(Update when reminders ship.)*

**Comparison rows**

| Label | MudKitchen | Tool stack (paper + Google Forms + DocuSign) | Brightwheel | Playground | Transparent Classroom |
|---|---|---|---|---|---|
| Upload a PDF to sign | Yes (PDF or Word) | DocuSign, per envelope | Yes, fillable PDFs ([forms](https://mybrightwheel.com/childcare-forms/)) | Yes ([paperwork](https://www.tryplayground.com/paperwork)) | PDF attachments in forms ([overview](https://transparent-classroom.helpscoutdocs.com/article/51-using-forms-overview)) |
| Build a custom form | Yes, 6 field types | Google Forms | Yes ([help](https://help.mybrightwheel.com/en/articles/4404606-create-digital-forms)) | Yes, drag-and-drop | Yes |
| E-signature | Typed | Typed name in a form, or paid e-sign | Typed and/or drawn (unconfirmed on current page) | Yes, timestamped | Normal Forms only ([help](https://transparent-classroom.helpscoutdocs.com/article/54-application-verses-enrollment-forms)) |
| Teachers send their own forms | Yes | Yes, but each in its own tool | Admins and Managers ([help](https://help.mybrightwheel.com/en/articles/4404606-create-digital-forms)) | Unconfirmed | Unconfirmed |
| Send to a classroom | Yes, one or more | Copy email lists | Not mentioned | Yes ([paperwork](https://www.tryplayground.com/paperwork)) | Per child ([assigning](https://transparent-classroom.helpscoutdocs.com/article/264-assigning-forms-to-families)) |
| See who's missing | X of Y signed; Pending / Overdue | Compare lists by hand | Yes, submissions list | Yes, bulk nudge | Yes |
| Reminders | Not yet (Overdue status) | Manual email | Not mentioned in help | Yes ([paperwork](https://www.tryplayground.com/paperwork)) | Yes, auto before due date |
| Families sign on phone | Yes, iOS/Android app | Mobile browser | Yes, app | Yes, any device | Unconfirmed |
| Price | MudKitchen plan | Free–paid per tool | Quote only | Quote only; "Included… Unlimited" | $2/child/month ([pricing](https://www.transparentclassroom.com/pricing)) |

## Open questions / things you could not verify

- **No reminders for unsigned forms.** Every rival has some kind of follow-up. This is the biggest gap for the comparison table. Classroom signups already have a reminder engine (`src/lib/classroom-signups/signup-reminders.ts`) that could be reused.
- **No push notification** for new forms (no `sendExpoPushToUsers` in the forms code). Email only.
- **No school-wide document library** (handbook, policies) for families. The brief mentioned one, but it isn't in the code.
- **Drawn signatures:** not supported (typed only). Brightwheel offers both (per a search snippet).
- **Signature audit detail:** we store signed-at time and typed name. Whether IP address or a signed-PDF certificate is captured wasn't checked; look at `src/lib/school-teacher/forms-documents/mutations.ts` before making any audit-trail claim.
- **Brightwheel exact-match rule** ("must match exactly including spaces and capitalization"): from a search snippet of an older help-article version.
- **No independent paper-vs-digital return-rate study found.** Figures like "85–95% vs 60–70%" and "68% of parents find slips after the deadline (National PTA)" appear on vendor blogs without primary sources. Don't use them.
- Adobe/IDC K-12 research reportedly says 33% of K-12 respondents were converting paper forms to digital and 25% were moving wet signatures to digital. The infographic PDF couldn't be read, so this is unverified.
