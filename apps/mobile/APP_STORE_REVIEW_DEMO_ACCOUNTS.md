# App Store Review — Mud School demo accounts

Use this text in **App Store Connect → App Review Information** (username/password fields and notes). Reply to Apple’s rejection message with the same content before resubmitting.

## Demo accounts (production)

All accounts sign in to **Mud School** in the MudKitchen mobile app.

| Role | Email | Password | What reviewers should see |
|------|-------|----------|---------------------------|
| Family / parent | `testparent@gmail.com` | `##testparent$$` | Family portal with enrolled children Alex and Maya |
| Staff / teacher | `testteacher@gmail.com` | `##testteacher$$` | Staff portal (home, calendar, my students, messages) |
| School admin | `testadmin@gmail.com` | `##testadmin$$` | School admin portal (dashboard, admissions, students) |

## Sign-in steps (required)

Apple reviewers must use **password** sign-in, not email verification codes.

1. Open **MudKitchen**.
2. On **Sign in to your school**, tap **Mud School**.
3. On the email screen, tap **Use password instead** (do not request a verification code).
4. Enter the email and password from the table above, then tap **Sign in**.

Each account opens the correct portal automatically based on role. To review another role, sign out from the app account/settings flow and repeat with the next email.

## Database setup (your side)

Run these SQL files in the **production** Supabase SQL Editor (in order):

1. [`supabase/migrations_manual/seed_mud_school_test_parent_2026_09_23.sql`](../../supabase/migrations_manual/seed_mud_school_test_parent_2026_09_23.sql) (if not already applied)
2. [`supabase/migrations_manual/seed_mud_school_app_review_staff_admin_2026_09_30.sql`](../../supabase/migrations_manual/seed_mud_school_app_review_staff_admin_2026_09_30.sql)

Confirm Mud School has `organizations.status = 'live'` so it appears in the school picker.

**Alternative for auth only:** Supabase Dashboard → **Authentication → Users** → create or edit users with the emails above, set passwords, and enable **Auto Confirm User**. Then run only the public-table sections of the staff/admin seed (memberships, staff member, classroom block) if users already exist.

## Pre-resubmit verification checklist

- [ ] Ran staff/admin seed SQL on production Supabase
- [ ] `testparent@gmail.com` — password login → Family portal
- [ ] `testteacher@gmail.com` — password login → Staff portal; **My Students** shows Alex/Maya when classroom seed applied
- [ ] `testadmin@gmail.com` — password login → School admin dashboard
- [ ] Tested on **iPad** (Apple reviewed on iPad Air 11-inch) via TestFlight or App Store build
- [ ] Updated App Review Information and replied in App Store Connect
- [ ] Resubmitted the app for review

## Suggested reply to Apple (paste into App Store Connect)

We added dedicated demo accounts for every portal type at Mud School and documented password sign-in (the app defaults to email OTP, which does not work for shared demo inboxes).

**Parent:** testparent@gmail.com / ##testparent$$ — Family portal with enrolled students.

**Staff:** testteacher@gmail.com / ##testteacher$$ — Staff portal with classroom roster and calendar.

**School admin:** testadmin@gmail.com / ##testadmin$$ — School admin portal with dashboard, admissions, and students.

**How to sign in:** Open the app → select **Mud School** → tap **Use password instead** → enter email and password → Sign in. Sign out between accounts to review each role.

Thank you for reviewing MudKitchen.
