# Rooted Meadows — enrollment agreement variant groups

After deploying checklist variant groups, configure the enrollment checklist in **Admissions → Enrollment Flows → Enrollment checklist**.

## Goal

Families share one checklist, but admins choose the correct enrollment agreement at kickoff:

- **Standard Enrollment Agreement** — default for most students
- **Conditional Support Agreement** — for students who need a collaborative support plan

## Builder setup

1. Open the draft enrollment checklist.
2. Locate the single **Enrollment Agreement** item (or add one from templates).
3. Select the agreement item and enable **Part of a variant group**.
4. Set:
   - **Group label:** `Enrollment Agreement`
   - **Variant key:** `standard`
   - Check **Default variant**
5. Click **Add another variant** to create the second agreement.
6. On the new variant:
   - **Group label:** `Enrollment Agreement` (same group — synced automatically)
   - **Variant key:** `disability_support`
   - Paste content from the Conditional Support Agreement sections
7. Keep all other steps unchanged (Assumption of Risk, emergency contact, immunization, etc.).
8. Publish the checklist when ready.

## Submissions workflow

1. Open **Admissions → Submissions** and select an **Accepted** application.
2. Click **Start enrollment**.
3. Choose **Standard Enrollment Agreement** or **Conditional Support Agreement**.
4. Confirm — the family’s status becomes **Enrolling** and they see only the selected agreement plus shared steps.

## Content reference

Agreement section text lives in:

- `src/data/school-demos/rooted-meadows-enrollment-contracts.ts`
  - `ROOTED_MEADOWS_STANDARD_ENROLLMENT_SECTIONS`
  - `ROOTED_MEADOWS_CONDITIONAL_SUPPORT_SECTIONS`

Copy section titles and bodies into each variant’s agreement editor in the checklist builder.

## Notes

- Variant groups only apply to agreement item types (`document_sign` / `document_sign_pdf`).
- Each group needs exactly two variants and one default before publishing.
- Changing the variant after enrollment starts is not supported in v1.
