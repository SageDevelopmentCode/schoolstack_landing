# Tuition & billing

Slug: `tuition-billing`. Researched Nov 22, 2026. Rivals: Brightwheel, Playground, Transparent Classroom (`docs/features-research/_rivals.md`). Procare notes are marked "not used".

## Product truth (capabilities by role, with file paths; web/mobile)

The source of truth is the help guides in `src/lib/school-admin/admin-documentation.ts` (Tuition, Payments) and `src/lib/parent-portal/parent-documentation.ts` (Billing). Payments run on **Stripe Connect**: the school connects its own Stripe account (`connect-stripe` guide; `src/components/school-admin/admissions/PaymentsSetupPage.tsx`).

### School admin / founder

| Capability | Proof | Web / mobile |
|---|---|---|
| Tuition setup wizard: program tiers, rates, payment options, additional fees, then review and activate | `admin-documentation.ts` → `setup-tuition-rate-plan`; `src/components/school-admin/tuition/TuitionSetupWizard.tsx`, `TuitionTiersStep.tsx`, `TuitionFeesStep.tsx`, `TuitionPaymentOptionsStep.tsx`, `TuitionReviewStep.tsx` | Web |
| Billing basis: annual, monthly, weekly or per-session. Fees can be timed at enrollment, with the first installment, or annually | `src/lib/tuition/types.ts` (`BillingBasis`, `FeeTiming`) | Web |
| Rate catalog with single or multiple rates per plan | `TuitionRateCatalogPanel.tsx` (labels "Single rate", "Multiple rates") | Web |
| Families panel with balances and assignments. New enrollees sync in from admissions | `manage-tuition-assignments`; `TuitionFamiliesPanel.tsx` | Web |
| Per-family discounts as a % or $ amount, each with a reason (e.g. Scholarship, Staff discount). Discounts stack | `apply-family-tuition-discount`, `create-tuition-discount-reason`; `TuitionAdjustPanel.tsx`, `TuitionAdjustmentReasonsModal.tsx` | Web |
| Sibling discount rules applied automatically | `TuitionRulesPanel.tsx` ("Sibling discount rule added"); `src/lib/tuition/rules-engine.ts` | Web |
| Split billing between guardians, so each guardian gets separate charges for their share | `TuitionBillingSplitModal.tsx` ("Split between guardians", "Each guardian gets separate charges for their share.") | Web |
| Send an invoice email that families pay from their billing tab | `send-tuition-invoice`; `src/lib/tuition/send-invoice.ts` | Web |
| Automatic late fees, off by default. Charge once per billing period or "each month until paid", with grace days | `TuitionLateFeeSettingsPanel.tsx` ("Should your school charge automatic late fees?", "Yes, each month until paid"); `src/lib/tuition/org-settings.ts` (`lateFeeEnabled` default false, `graceDays`) | Web |
| Record manual (offline) payments such as cash or check | `TuitionManualPaymentModal.tsx` ("Record manual payment"); `src/lib/tuition/payments.ts` | Web |
| Waive charges | `src/lib/tuition/charge-waive.ts` | Web |
| Refund a tuition payment | `src/app/api/tuition/payments/[id]/refund/route.ts`; `TuitionPaymentHistoryPanel.tsx` | Web |
| Tuition agreements: upload a service-for-tuition agreement or build a custom form, assign it to families, track pending signatures | `TuitionFormsPanel.tsx` ("Upload a service-for-tuition agreement or build a custom form, then assign it to specific families.") | Web |
| KPI breakdown and outstanding-balance views | `TuitionKpiBreakdownPanel.tsx`, `TuitionOutstandingPeriodSelect.tsx` | Web |
| Finances: Revenue (collected this month, collected YTD, by source: application, enrollment and tuition) and Transactions (payment ledger, "May need follow-up") | `src/components/school-admin/finances/FinancesRevenuePage.tsx`, `FinancesTransactionsPage.tsx` | Web. Transactions also on mobile (`apps/mobile/src/app/school-admin/[slug]/more/transactions.tsx`) |
| Application and enrollment fees flow into the same revenue view | `FinancesRevenuePage.tsx` ("Application, enrollment and tuition payments add up here as families pay.") | Web |
| Email alerts for payments | `src/lib/organization-settings/catalog.ts` (`notifications`) | Email |

Note: the Finances catalog entry says "Budget, revenue, expenses, payroll", but only **Revenue and Transactions** are built. Don't claim budget, expenses or payroll.

### Families / parents

| Capability | Proof | Web / mobile |
|---|---|---|
| Billing tab with invoices, balance, upcoming charges and payment history | `parent-documentation.ts` → `view-pay-invoices`; `src/components/school-parent/billing/*` | Web + mobile (`apps/mobile/src/app/parent/[slug]/billing.tsx`) |
| Pay online by card or US bank account (ACH) on Stripe's secure checkout | `src/lib/stripe/processing-fee.ts` (`"card" \| "us_bank_account"`); mobile string "You'll finish on Stripe's secure page, then come right back here." | Web + mobile |
| Processing fee shown before paying. The fee is added to the family's payment, so the school receives the full charge (card 2.9% + 30¢; bank 0.8%, capped at $5) | `src/lib/stripe/processing-fee.ts` (`CARD_PERCENT = 0.029`, `CARD_FIXED_CENTS = 30`, `ACH_PERCENT = 0.008`, `ACH_CAP_CENTS = 500`; `quoteProcessingFee` grosses up the net amount); `PaymentMethodSelectionModal.tsx` | Web + mobile |
| Autopay on card or bank: "we'll process each scheduled tuition payment on its due date" | `src/lib/tuition/autopay.ts`; `src/lib/stripe/tuition-autopay-charge.ts` (card or `us_bank_account`); `ParentAutopayConfirmModal.tsx`; mobile `billing-autopay-sheet.tsx` | Web + mobile |
| Choose the payment schedule when the school requires one ("Schedule needed") | `setup-tuition-payment-schedule`; `ParentTuitionPlanSelector.tsx`; mobile `billing-schedule-setup.tsx` | Web + mobile |
| Pay a different amount or a lump sum, after which remaining installments are recalculated automatically | `src/lib/tuition/tuition-pay-copy.ts` ("Pay a different amount"; "Remaining installments are recalculated automatically.") | Web + mobile |
| Receipts in the app and by email | `ParentBillingPaymentReceiptPanel.tsx`; mobile `billing-receipt-sheet.tsx`; `sendTuitionPaymentReceiptEmail` in `src/lib/emails.ts` | Web + mobile + email |
| Sign tuition agreements | `ParentBillingTuitionAgreementsSection.tsx`; mobile `billing-agreements.tsx` | Web + mobile |
| Automatic emails: due-date reminder (default 3 days before, set per school), autopay upcoming, confirmation and failure, late fee, ACH settlement failed, bank verification | `src/lib/tuition/reminders.ts`, `org-settings.ts` (`reminderDaysBefore`); `src/lib/emails.ts` (`sendTuitionDueReminderEmail`, `sendTuitionAutopayUpcomingEmail`, `sendTuitionAutopayConfirmationEmail`, `sendTuitionAutopayFailedEmail`, `sendTuitionLateFeeEmail`, `sendTuitionAchSettlementFailedEmail`, `sendAchBankVerificationEmail`) | Email |
| In-app notices: late fee added, autopay failed (with "Update your card for autopay") | mobile billing strings "Late fee added", "Autopay failed" | Web + mobile |

Push notifications: the mobile push catalog (`src/lib/notifications/mobile-push-catalog.ts`) has **no billing pushes**. Billing reminders go by email only. Don't claim push payment reminders.

Approved copy already live: "Tuition and billing where families already are." / "See balances, pay tuition, and manage autopay in one place." (`src/lib/marketing/download-app-slides.ts`); "Families view invoices, make payments, and track tuition history in one place." (`src/lib/marketing/product-preview-tabs.ts`); pricing feature "Tuition, fees, and Stripe payments" (`home-copy.ts`).

### Staff / teachers

Staff have no tuition role. Teacher docs (`teacher-documentation.ts`) have no billing guides. Skip the staff tab, or say "Teachers never see family balances." *(Unverified as a permission statement: I found no teacher billing UI, but didn't audit row-level access.)*

## Founder pain (with quotes + sources)

- **Our own case study's "before" (Sage Field):** "Manual invoices via Venmo, Zelle, or bank transfer. Chasing payments every month." (`src/components/customers/sagefield-garden/sagefield-copy.ts`). This is the most credible founder pain we have, because it's from our own customer.
- **Payment apps leave no record:** payments "live across multiple apps with no automated record"; providers end up "matching screenshots and bank deposits after hours instead of focusing on children"; families pay "whenever they remember". Brightwheel (a rival vendor), 2026. https://mybrightwheel.com/in-home-child-care/accepting-tuition-via-venmo-zelle-cashapp-or-paypal-with-no-automated-record/
- **Business skills gap:** "Most founders excel at education but struggle with basic business operations." Founders face "unrealistic budgets, inadequate pricing strategies and poor accounting practices," and "Many resort to personal credit cards or retirement savings to fund operations." Allison Serafin, The 74, Dec 15, 2025. https://www.the74million.org/article/we-launched-a-microschool-loan-program-and-were-surprised-by-what-we-learned/
- **Money is the top need:** "the most popular answer by far (stated by 75% of respondents) is 'funding sources.'" EdChoice, Jun 12, 2025. https://www.edchoice.org/the-state-of-microschooling/. Cash flow matters, so late tuition hurts.
- **Discounts are the norm, which makes billing complex:** "65 percent offering sliding scale tuition and discounts". National Microschooling Center, May 2025 (see Evidence).

## Evidence (numbered: quote — publisher, year — URL)

1. "over half (56%) of small businesses surveyed reported being owed money from unpaid invoices, averaging $17.5K per business." Intuit QuickBooks, *2025 US Small Business Late Payments Report* (Jan 2025 survey, n=2,487 US small businesses, 0–100 employees), published May 28, 2025. https://quickbooks.intuit.com/r/small-business-data/small-business-late-payments-report-2025/. The report also says 47% had invoices 30+ days overdue (paraphrased from the page).
2. "74 percent of microschools have annual tuition and fees at or below $10,000" and "65 percent offering sliding scale tuition and discounts". National Microschooling Center, *American Microschools: A Sector Analysis*, May 2025. https://microschoolingcenter.org/news-blog/2025-american-microschools-sector-analysis. Why it matters: thin margins plus per-family pricing make discounts, rules and accurate balances essential.
3. "When asked what they need, the most popular answer by far (stated by 75% of respondents) is 'funding sources.'" EdChoice, 2025. https://www.edchoice.org/the-state-of-microschooling/
4. Card processing is "2.9% + 30¢" per successful domestic card transaction, and ACH Direct Debit is "0.8%" with a "$5.00 cap". Stripe pricing page, checked Nov 2026. https://stripe.com/pricing. On a $900 tuition payment, that's $26.40 by card vs $5.00 by bank. Bank payments matter for tuition-sized amounts.
5. Zelle: "Make sure you only send money to people you personally know and trust. If you don't know a person or aren't sure you'll get what you paid for, using your credit card may be a better payment option." Zelle safety page (via search), checked Nov 2026. https://www.zelle.com/security. It also says it offers no protection program for authorized payments. Why it matters: families paying a new school by Zelle have no recourse, and the school has no ledger.
6. Venmo business profiles: "1.9% + 10¢" for direct and QR payments, and seller fees aren't refundable. Venmo help center (via search), checked Nov 2026. https://help.venmo.com/cs/articles/business-profile-transaction-fees-vhel221. A personal Venmo is no fee-free substitute: business use is meant to go through a business profile.

Vendor claims (use only as rival context, not as evidence): Brightwheel says "Save up to 5 hours each week with automated invoicing, payment notifications, and autopay" (https://mybrightwheel.com/features/billing). Procare says centers "save up to 12 hours per month" (https://www.procaresoftware.com/capabilities/payment-processing/). A Playground customer testimonial claims "a 93% reduction in delinquent payments" (https://www.tryplayground.com/solutions/billing).

## Tool stack alternative

- **Venmo / Zelle / PayPal / Cash App.** In our 46 prospect research files (`src/data/outreach/*.ts`), keyword matches are Zelle 4 and Venmo 3. Families send money when they remember. There's no schedule, no autopay tied to a tuition plan, and no per-child ledger. The founder reconciles screenshots against bank deposits (Brightwheel page above). Zelle gives families no protection; Venmo business profiles charge 1.9% + 10¢ (Evidence 5–6). Discounts, sibling pricing and split-guardian billing live in the founder's head or a spreadsheet.
- **QuickBooks / Wave invoices.** Real invoices, but they aren't connected to enrollment: every new family, sibling discount or schedule change is re-keyed by hand. The bookkeeping is good, but families still have no portal next to their school info. *QuickBooks payments fees weren't checked this session.*
- **Google Sheets tracker.** "Who paid for October?" lives in a sheet the founder updates from bank notifications. Late fees are calculated, and often forgiven, by hand.
- **Stripe Payment Links / Square invoices.** Fine for one-off charges. Recurring tuition with mid-year changes, lump-sum pay-aheads and per-guardian splits needs custom work.
- **Paper checks.** No online record. Brightwheel even advertises "snap and deposit" for checks, which shows how common they still are in small programs (https://mybrightwheel.com/features/billing).

## Rivals (per rival: facts + URL + "checked Nov 2026")

### Brightwheel (checked Nov 2026)
- **Billing: included.** Automated recurring invoices (weekly, biweekly, bimonthly, monthly), one-time charges, discounts, "split between payers", attendance-based billing, tuition agreements with payment method in one step, ACH, card and check deposit in-app, autopay, late fees as one-time charges, automated payment reminders, failed-card alerts, subsidies, tax statements. Online payments submitted by 7 pm ET are deposited the next business day. https://mybrightwheel.com/features/billing
- **Fees:** "only two service fees ever", one for card and one for ACH/check deposit, with no percentages on the page. The help center says "We recommend paying by direct bank transfer for at most a $2.00 fee, instead of using a card"; fees are charged to the payer and "only apply to successful transactions". https://help.mybrightwheel.com/en/articles/12805195-why-am-i-being-charged-service-fees-for-payers. Settings include "Pass service fees to payers", "Make autopay required at your school", card acceptance off by default, and an optional late fee policy. https://help.mybrightwheel.com/en/articles/5599596-customize-your-billing-experience-in-settings. Premium gets "Discounted ACH and credit card service fees" vs "Competitive" on free. https://mybrightwheel.com/blog/how-much-is-brightwheel-premium
- **Pricing:** quote only. "Brightwheel Premium pricing is customized for each program rather than published as a price list." Billing is bundled; payroll has an "Additional fee". (Same blog URL; https://mybrightwheel.com/pricing.)
- **Fit:** "#1 childcare billing software". Subsidies, attendance-based billing and check-in are daycare-centric.

### Playground (checked Nov 2026)
- **Billing: included.** "The easiest way to manage billing for child care"; "Automatic billing, flexible payment plans". With autopay, "payments are automatically pulled and deposited in your account next business day"; "Cards are automatically updated when expiration dates pass"; "instant payment failure alerts and automatic payment retries"; "Discounts, bulk edits, invoice proration, and billing alerts"; "Automatically collect application, enrollment, and deposit fees"; families "pull their own end of year statements"; QuickBooks import. https://www.tryplayground.com/solutions/billing
- **Fees and settings:** Admins choose, per fee type, whether the program or families cover processing costs. Processing fees aren't refunded on refunds, and Playground charges nothing for "refunds, sweeps, or failed payment fees". Fee amounts aren't published: Playground "can't directly reveal" them, and admins hover a "?" in settings. Mandatory autopay is optional. Statement emails go out a set number of days before the due date, and overdue reminders "every 3, 5, 7, or 10 days". Online methods are ACH and card; offline payments can be recorded. https://help.tryplayground.com/en/articles/6267221-configure-billing-settings. A third-party blog (Illumine) reports card 3% + $0.30 and ACH $1.00 flat. *Unconfirmed on Playground's own pages.* https://illumine.app/blog/playground-pricing
- **Late fees:** the billing page mentions late *pickup* fees "based on your rules". Automatic late tuition fees are unconfirmed.
- **Pricing:** none published (phone number only). https://www.tryplayground.com/pricing
- **Fit:** childcare ("5,000+ child care programs", homepage https://www.tryplayground.com/). Subsidy and food-program tools are center-oriented.

### Transparent Classroom (checked Nov 2026)
- **Billing: not in the core product.** The pricing page ("$2.00 USD" per child per month) doesn't mention tuition billing. https://www.transparentclassroom.com/pricing. Billing comes through a **partnership with Onespot**: "Through this partnership, we are providing schools with highly requested features like tuition billing, group chats, push notifications, text messaging, and more!" https://transparent-classroom.helpscoutdocs.com/article/452-onespot-transparent-classroom-partnership (via search)
- **Onespot fees:** "Onespot Fees (0.3% on all transactions)" on top of Stripe processing, per Onespot's help center (via search). https://onespot.helpscoutdocs.com/article/69-stripe-onespot-payments-fee-structure. A bundle of $4 per enrolled student per month is reported by Onespot marketing (via search; unconfirmed). https://www.onespotapps.com/
- **Fit:** a records tool with billing bolted on through a second vendor and a second login.

### Procare (checked Nov 2026), not used
- Payments run through its own processor, Tuition Express. "By default, Procare Online accounts are set up to absorb processing fees". There's a monthly minimum of up to $25, an ACH return fee of $3.50 and a chargeback fee of $25. Refunds don't return the original processing fee. A card example rate of 2.70% + $0.30. https://www.procaresupport.com/procare-online/docs/card-payment. Pricing isn't public. https://www.procaresoftware.com/pricing-table/

### Better-fit microschool rivals (not in the shared set)
KaiPod **Newton** ("Microschool Management Software"; recurring tuition "by credit card or direct bank withdrawal"; no public pricing; https://www.kaipodlearning.com/newton-microschool-management-software/). Billing-only tools marketed to microschools (**Microschool Ledger**, **MicroCampus**, **Omella**, **TUIO**) appear in roundups (search, vendor pages). None has adoption evidence in our 46 prospect stacks (`_rivals.md`), so no column is recommended.

## Draft copy (sections as in 2e)

### Patterns from converting pages (Brightwheel billing, Playground billing, Procare billing)
- Headlines promise ease ("The easiest way to manage billing for child care"; "Simplify your childcare billing"). That's hype-adjacent, so we lead with the concrete outcome instead.
- Every page leads with **autopay plus next-day deposits**, then failed-payment handling, then fees transparency ("only two service fees ever").
- Proof is a time-saved or delinquency number. We have none measured, so use the Sage Field before/after instead of a number.
- FAQs answer "who pays the processing fee?" directly. Ours should too.

### Hero
- **Headline:** Tuition that collects itself, **on every due date.** (8 words)
- **Body:** Set your rates, discounts and payment schedule once. Families pay by card or bank, turn on autopay, and get reminders before each due date. You see who's paid without checking Venmo. (34 words)
- **One-liner:** Tuition plans, autopay and reminders, connected to enrollment. (8 words)

### Capabilities, admin / founder
1. **Set up tuition once.** Program tiers, rates, schedules and fees in one guided setup. Newly enrolled students sync straight in from admissions.
2. **Discounts with a reason.** Apply % or $ discounts for scholarships, staff or siblings. Sibling rules apply automatically, and every adjustment records why.
3. **Split between guardians.** Bill each guardian their share separately, or send one combined bill. You choose per family.
4. **Late fees, if you want them.** Off by default. Turn on an automatic late fee after a grace period, once or monthly until paid.
5. **Every payment in one ledger.** Online, autopay and recorded cash or check payments together, with revenue by month and by source.
6. **Refunds and waivers.** Refund a payment or waive a charge from the family's record without a separate tool.

### Capabilities, families
1. **Pay from your phone.** See your balance and pay by card or bank in the MudKitchen app or browser.
2. **Turn on autopay.** Save a card or bank account and each scheduled payment runs on its due date.
3. **Know what's coming.** Upcoming charges, payment history and receipts are in one place. Email reminders arrive before each due date.
4. **Pay ahead.** Put a lump sum or tax credit toward tuition, and your remaining installments recalculate.
5. **See fees upfront.** The card or bank processing fee is shown before you pay, with no surprises.

### Capabilities, staff
Not applicable. Skip this tab.

### Use cases
1. **The first of the month.** *Scenario:* Tuition for 20 families is due. *Outcome:* Autopay families pay on the due date, and the others got a reminder three days earlier. The founder opens Transactions to see who still needs a nudge.
2. **A scholarship mid-year.** *Scenario:* A family qualifies for a 25% scholarship in January. *Outcome:* The founder applies a % discount with the reason "Scholarship", and the remaining installments update on the family's billing tab.
3. **Two households, one student.** *Scenario:* Separated parents split tuition 50/50. *Outcome:* Each guardian gets their own charges and pays from their own login.
4. **A family pays by check.** *Scenario:* A grandparent mails a check for spring tuition. *Outcome:* The founder records it as a manual payment, so the balance and revenue stay right.

### FAQ
1. **Who pays the card or bank processing fee?** At checkout the family sees the card fee (2.9% + 30¢) or bank fee (0.8%, capped at $5), and it's added to their payment. Your school receives the full tuition amount. *(Confirm: no school-absorbs option was found in code.)*
2. **Do I need a Stripe account?** Yes. You connect your school's own Stripe account once under Payments, and payouts go to your bank through Stripe. We walk you through setup.
3. **Can families pay by bank transfer?** Yes. Families can pay with a US bank account (ACH) one time or on autopay. For tuition-sized payments, bank fees are capped at $5 per payment.
4. **Can I take cash or checks too?** Yes. Record a manual payment on the family's charge and their balance, history and your revenue totals update.
5. **Does it handle sibling and scholarship discounts?** Yes. Set sibling discount rules that apply automatically, or add a % or $ discount to one family with a reason you choose.

### Comparison rows

| Row | MudKitchen | Venmo / Zelle + spreadsheet | Brightwheel | Playground | Transparent Classroom |
|---|---|---|---|---|---|
| Autopay on card or bank | Yes (`src/lib/stripe/tuition-autopay-charge.ts`) | No; families send manually | Yes, can be required. https://help.mybrightwheel.com/en/articles/5599596-customize-your-billing-experience-in-settings | Yes, can be mandatory. https://help.tryplayground.com/en/articles/6267221-configure-billing-settings | Via Onespot partner (separate vendor). https://transparent-classroom.helpscoutdocs.com/article/452-onespot-transparent-classroom-partnership |
| Processing fees | Shown at checkout: card 2.9% + 30¢, bank 0.8% (cap $5), added to the family's payment | Venmo business 1.9% + 10¢; Zelle free but no protection. https://help.venmo.com/cs/articles/business-profile-transaction-fees-vhel221 | Not published as %; bank "at most a $2.00 fee"; school can pass to payers. https://help.mybrightwheel.com/en/articles/12805195-why-am-i-being-charged-service-fees-for-payers | Not published ("can't directly reveal"); school chooses who pays. (settings article above) | Stripe fees + Onespot "0.3% on all transactions". https://onespot.helpscoutdocs.com/article/69-stripe-onespot-payments-fee-structure |
| Reminders before the due date | Email, default 3 days before (set per school) | Manual texts | "Automated payment reminders". https://mybrightwheel.com/features/billing | Statement email before due date; overdue reminders every 3–10 days. (settings article above) | Unconfirmed |
| Automatic late tuition fees | Yes, optional: once or monthly until paid | Manual | Optional late payment fee policy. (settings article above) | Late *pickup* fees by rule. Late tuition fees unconfirmed. https://www.tryplayground.com/solutions/billing | Unconfirmed |
| Discounts and sibling rules | % or $ with reasons; sibling rules | Spreadsheet | Discounts on billing plans. https://mybrightwheel.com/features/billing | "Discounts…all included". https://www.tryplayground.com/solutions/billing | Unconfirmed |
| Split billing between guardians | Yes | Manual | "split between payers". https://mybrightwheel.com/features/billing | Split subsidy payments mentioned; family split unconfirmed | Payment profile per child (Onespot, via search) |
| Connected to admissions and enrollment | Yes: enrolled students sync to tuition | No | Yes (same platform) | Yes (same platform) | Records in TC, billing in Onespot |
| Published price | Book a demo | n/a | Quote only. https://mybrightwheel.com/pricing | Quote only. https://www.tryplayground.com/pricing | $2/child/month for TC (billing extra via Onespot). https://www.transparentclassroom.com/pricing |

Honest takeaway: Brightwheel and Playground have mature billing (next-day deposits, card updater, retries). MudKitchen's contrast is tuition built for K–8 school-year pricing (annual and installment plans, pay-ahead recalculation, per-guardian splits, tuition agreements) for a founder-run school, plus fees disclosed at checkout.

## Open questions / things you could not verify

- **Processing-fee policy:** the code always grosses up so the family pays the fee. Can a school choose to absorb it? No setting was found. Also confirm MudKitchen takes **no platform cut** of payments (no Stripe `application_fee_amount` found in `src/lib/stripe`), since that's a strong selling point if true.
- **Payout timing** to the school's bank (Stripe default schedule) isn't stated anywhere in our copy. Don't claim "next-day deposits".
- **Free plan:** Tuition and Payments are "In the full plan" (`free-school-home-copy.ts`).
- **Push notifications for billing:** none exist. Email only.
- **ESA / state-scholarship billing** (e.g. Florida Step Up, Arizona ESA) isn't a general feature. The Idaho tax-credit banner is school-specific (`ParentBillingTaxCreditBanner.tsx`) and shouldn't be marketed generally.
- **Rival rates:** Playground's card/ACH rates (3% + $0.30 / $1) come from a third party only. Brightwheel's card % isn't published.
- I found no first-hand founder quotes from Reddit or forums (not indexed or blocked). The Sage Field before/after is the best founder evidence; get a direct quote from Sabrina about tuition if possible.
