import type { FeatureShot } from "./types";

/**
 * Real screenshots of the fictional "Your School" demo org (local Supabase, scripts/seed-your-school-features-local.ts),
 * generated from public/images/features/manifest.json. Re-capture rather than hand-edit.
 */
export const FEATURE_SHOTS: Record<string, FeatureShot[]> = {
  "school-website": [
    {
      "src": "/images/features/school-website/web-family-website-home.webp",
      "alt": "The home page of a sample school website: a headline, enrollment buttons, photos and quick facts about ages and class size.",
      "caption": "School website · Home page",
      "role": "family",
      "platform": "web",
      "width": 1600,
      "height": 1000
    },
    {
      "src": "/images/features/school-website/mobile-family-website-home.webp",
      "alt": "The same sample school website on a phone, with Apply for a Spot and See Our Programs buttons.",
      "caption": "School website · On a phone",
      "role": "family",
      "platform": "mobile",
      "width": 720,
      "height": 1558
    }
  ],
  "admissions": [
    {
      "src": "/images/features/admissions/web-admin-flows.webp",
      "alt": "The enrollment flows builder showing each program's apply form, post-submit steps and enrollment checklist.",
      "caption": "Admissions · Enrollment flows",
      "role": "admin",
      "platform": "web",
      "width": 1600,
      "height": 1000
    },
    {
      "src": "/images/features/admissions/web-admin-submission-detail.webp",
      "alt": "An application review panel for one applicant with accept, decline and review actions and the form steps.",
      "caption": "Admissions · Submission detail",
      "role": "admin",
      "platform": "web",
      "width": 1600,
      "height": 1000
    },
    {
      "src": "/images/features/admissions/web-admin-submissions.webp",
      "alt": "The admin list of application submissions with status filters, progress and the next step for each family.",
      "caption": "Admissions · Submissions",
      "role": "admin",
      "platform": "web",
      "width": 1600,
      "height": 1000
    },
    {
      "src": "/images/features/admissions/web-parent-enrollment-checklist.webp",
      "alt": "A family's enrollment checklist with completed tasks and an enrollment deposit ready to pay.",
      "caption": "Enrollment checklist",
      "role": "family",
      "platform": "web",
      "width": 1600,
      "height": 1000
    },
    {
      "src": "/images/features/admissions/mobile-admin-submissions.webp",
      "alt": "The admin app admissions screen with application counts, the next review and a family's progress.",
      "caption": "Admissions",
      "role": "admin",
      "platform": "mobile",
      "width": 720,
      "height": 1565
    }
  ],
  "attendance": [
    {
      "src": "/images/features/attendance/web-admin-attendance.webp",
      "alt": "The admin attendance page with today's roll call progress and the full student roster.",
      "caption": "Attendance",
      "role": "admin",
      "platform": "web",
      "width": 1600,
      "height": 1000
    },
    {
      "src": "/images/features/attendance/web-parent-attendance.webp",
      "alt": "A parent's view of their child's attendance: today's check-in, a week-by-week calendar and history.",
      "caption": "Attendance",
      "role": "family",
      "platform": "web",
      "width": 1600,
      "height": 1000
    },
    {
      "src": "/images/features/attendance/web-teacher-roll-call.webp",
      "alt": "The staff attendance page with today's roster, counts of present and absent students and mark buttons.",
      "caption": "Attendance",
      "role": "staff",
      "platform": "web",
      "width": 1600,
      "height": 1000
    },
    {
      "src": "/images/features/attendance/mobile-admin-attendance.webp",
      "alt": "The admin app attendance roster for today with present, unmarked and pickup actions.",
      "caption": "Attendance",
      "role": "admin",
      "platform": "mobile",
      "width": 720,
      "height": 1565
    },
    {
      "src": "/images/features/attendance/mobile-parent-attendance.webp",
      "alt": "The parent app attendance screen with today's check-in and a calendar of recent school days.",
      "caption": "Attendance",
      "role": "family",
      "platform": "mobile",
      "width": 720,
      "height": 1565
    },
    {
      "src": "/images/features/attendance/mobile-teacher-roll-call.webp",
      "alt": "The teacher app roll call with students to mark present and pickups to record.",
      "caption": "Attendance",
      "role": "staff",
      "platform": "mobile",
      "width": 720,
      "height": 1565
    }
  ],
  "bulletin": [
    {
      "src": "/images/features/bulletin/web-admin-bulletin.webp",
      "alt": "The admin bulletin with active announcements for the whole school, families and teachers.",
      "caption": "Bulletin",
      "role": "admin",
      "platform": "web",
      "width": 1600,
      "height": 1000
    },
    {
      "src": "/images/features/bulletin/web-parent-home.webp",
      "alt": "The parent home with the school bulletin panel open showing current announcements.",
      "caption": "Home · School Bulletin",
      "role": "family",
      "platform": "web",
      "width": 1600,
      "height": 1000
    },
    {
      "src": "/images/features/bulletin/web-teacher-dashboard.webp",
      "alt": "The teacher dashboard with the school bulletin panel open showing staff and school-wide posts.",
      "caption": "Dashboard · School Bulletin",
      "role": "staff",
      "platform": "web",
      "width": 1600,
      "height": 1000
    },
    {
      "src": "/images/features/bulletin/mobile-admin-bulletin.webp",
      "alt": "The admin app bulletin with active announcements and post counts.",
      "caption": "Bulletin",
      "role": "admin",
      "platform": "mobile",
      "width": 720,
      "height": 1565
    }
  ],
  "calendar": [
    {
      "src": "/images/features/calendar/web-admin-schedule.webp",
      "alt": "The admin schedule with upcoming tours, interviews and observation days next to school events.",
      "caption": "Schedule",
      "role": "admin",
      "platform": "web",
      "width": 1600,
      "height": 1000
    },
    {
      "src": "/images/features/calendar/web-parent-calendar.webp",
      "alt": "A parent's month calendar of school events with an upcoming family agenda.",
      "caption": "Calendar",
      "role": "family",
      "platform": "web",
      "width": 1600,
      "height": 1000
    },
    {
      "src": "/images/features/calendar/web-teacher-calendar.webp",
      "alt": "A teacher's month calendar of school events with the upcoming school agenda.",
      "caption": "Calendar",
      "role": "staff",
      "platform": "web",
      "width": 1600,
      "height": 1000
    },
    {
      "src": "/images/features/calendar/mobile-admin-schedule.webp",
      "alt": "The admin app schedule with open tour slots and upcoming tours and interviews.",
      "caption": "Schedule",
      "role": "admin",
      "platform": "mobile",
      "width": 720,
      "height": 1565
    },
    {
      "src": "/images/features/calendar/mobile-parent-calendar.webp",
      "alt": "The parent app month calendar with colour-coded school events and the next event.",
      "caption": "Calendar",
      "role": "family",
      "platform": "mobile",
      "width": 720,
      "height": 1565
    },
    {
      "src": "/images/features/calendar/mobile-teacher-calendar.webp",
      "alt": "The teacher app month calendar of school events with the next event.",
      "caption": "Calendar",
      "role": "staff",
      "platform": "mobile",
      "width": 720,
      "height": 1565
    }
  ],
  "classroom-signups": [
    {
      "src": "/images/features/classroom-signups/web-parent-signups.webp",
      "alt": "A parent's classroom signups with one request to respond to and one they've signed up for.",
      "caption": "Classroom signups",
      "role": "family",
      "platform": "web",
      "width": 1600,
      "height": 1000
    },
    {
      "src": "/images/features/classroom-signups/web-teacher-signups.webp",
      "alt": "A teacher's classroom signups with volunteer roles and time slots and how many are filled.",
      "caption": "Classroom signups",
      "role": "staff",
      "platform": "web",
      "width": 1600,
      "height": 1000
    },
    {
      "src": "/images/features/classroom-signups/mobile-parent-signups.webp",
      "alt": "The parent app classroom signups with one request to answer and one the family signed up for.",
      "caption": "Classroom signups",
      "role": "family",
      "platform": "mobile",
      "width": 720,
      "height": 1565
    }
  ],
  "classrooms": [
    {
      "src": "/images/features/classrooms/web-admin-classrooms.webp",
      "alt": "The admin classrooms page with a classroom's lead teacher and student roster.",
      "caption": "Classrooms",
      "role": "admin",
      "platform": "web",
      "width": 1600,
      "height": 1000
    },
    {
      "src": "/images/features/classrooms/mobile-admin-classrooms.webp",
      "alt": "The admin app classrooms list with student and staff counts and lead teachers.",
      "caption": "Classrooms",
      "role": "admin",
      "platform": "mobile",
      "width": 720,
      "height": 1565
    }
  ],
  "committees": [
    {
      "src": "/images/features/committees/web-admin-committees.webp",
      "alt": "The admin committees page with three volunteer committees and a parent's join request to approve.",
      "caption": "Committees",
      "role": "admin",
      "platform": "web",
      "width": 1600,
      "height": 1000
    },
    {
      "src": "/images/features/committees/web-parent-committees.webp",
      "alt": "A parent's committees page with their committee workspaces, unread updates and open tasks.",
      "caption": "Committees",
      "role": "family",
      "platform": "web",
      "width": 1600,
      "height": 1000
    },
    {
      "src": "/images/features/committees/mobile-admin-committees.webp",
      "alt": "The admin app committees screen with volunteer counts and a join request to review.",
      "caption": "Committees",
      "role": "admin",
      "platform": "mobile",
      "width": 720,
      "height": 1565
    },
    {
      "src": "/images/features/committees/mobile-parent-committees.webp",
      "alt": "The parent app committees screen with the parent's committee workspaces and unread updates.",
      "caption": "Committees",
      "role": "family",
      "platform": "mobile",
      "width": 720,
      "height": 1565
    },
    {
      "src": "/images/features/committees/mobile-teacher-committees.webp",
      "alt": "The teacher app committees screen with a committee workspace and its unread updates.",
      "caption": "Committees",
      "role": "staff",
      "platform": "mobile",
      "width": 720,
      "height": 1565
    }
  ],
  "forms-documents": [
    {
      "src": "/images/features/forms-documents/web-admin-forms.webp",
      "alt": "The admin family forms list with a handbook PDF, a field trip permission slip and signature progress.",
      "caption": "Forms & documents",
      "role": "admin",
      "platform": "web",
      "width": 1600,
      "height": 1000
    },
    {
      "src": "/images/features/forms-documents/web-parent-form-sign.webp",
      "alt": "A field trip permission slip open for a parent to answer questions and sign.",
      "caption": "Forms & documents · Sign",
      "role": "family",
      "platform": "web",
      "width": 1600,
      "height": 1000
    },
    {
      "src": "/images/features/forms-documents/web-parent-forms.webp",
      "alt": "A parent's forms page with forms waiting for a signature and their signing progress.",
      "caption": "Forms & documents",
      "role": "family",
      "platform": "web",
      "width": 1600,
      "height": 1000
    },
    {
      "src": "/images/features/forms-documents/mobile-parent-forms.webp",
      "alt": "The parent app forms screen with a permission slip to sign and signing progress.",
      "caption": "Forms & documents",
      "role": "family",
      "platform": "mobile",
      "width": 720,
      "height": 1565
    }
  ],
  "messages": [
    {
      "src": "/images/features/messages/web-admin-messages.webp",
      "alt": "The admin inbox with family and staff conversations and an open thread with a parent about tuition.",
      "caption": "Messages",
      "role": "admin",
      "platform": "web",
      "width": 1600,
      "height": 1000
    },
    {
      "src": "/images/features/messages/web-parent-messages.webp",
      "alt": "A parent's inbox with an open conversation with their child's teacher.",
      "caption": "Messages",
      "role": "family",
      "platform": "web",
      "width": 1600,
      "height": 1000
    },
    {
      "src": "/images/features/messages/web-teacher-messages.webp",
      "alt": "A teacher's inbox with an open conversation with a parent about her child's day.",
      "caption": "Messages",
      "role": "staff",
      "platform": "web",
      "width": 1600,
      "height": 1000
    },
    {
      "src": "/images/features/messages/mobile-admin-messages.webp",
      "alt": "The admin app inbox with family conversations and parent–teacher threads to review.",
      "caption": "Messages",
      "role": "admin",
      "platform": "mobile",
      "width": 720,
      "height": 1565
    },
    {
      "src": "/images/features/messages/mobile-parent-messages.webp",
      "alt": "The parent app inbox with conversations with the teacher and the school office.",
      "caption": "Messages",
      "role": "family",
      "platform": "mobile",
      "width": 720,
      "height": 1565
    },
    {
      "src": "/images/features/messages/mobile-teacher-messages.webp",
      "alt": "The teacher app inbox with parent and office conversations and unread counts.",
      "caption": "Messages",
      "role": "staff",
      "platform": "mobile",
      "width": 720,
      "height": 1565
    }
  ],
  "mobile-app": [
    {
      "src": "/images/features/mobile-app/mobile-admin-dashboard.webp",
      "alt": "The admin app dashboard with the top items needing attention today.",
      "caption": "Dashboard",
      "role": "admin",
      "platform": "mobile",
      "width": 720,
      "height": 1565
    },
    {
      "src": "/images/features/mobile-app/mobile-parent-home.webp",
      "alt": "The parent app home with to-dos, the next event, the latest bulletin post and forms waiting to be signed.",
      "caption": "Home",
      "role": "family",
      "platform": "mobile",
      "width": 720,
      "height": 1565
    },
    {
      "src": "/images/features/mobile-app/mobile-teacher-home.webp",
      "alt": "The teacher app home with the time clock running, weekly hours and today's to-do list.",
      "caption": "Home",
      "role": "staff",
      "platform": "mobile",
      "width": 720,
      "height": 1565
    }
  ],
  "newsletters": [
    {
      "src": "/images/features/newsletters/web-admin-newsletter-editor.webp",
      "alt": "The newsletter editor with section checklist, a live family preview with a cover photo and publish readiness.",
      "caption": "Newsletter editor",
      "role": "admin",
      "platform": "web",
      "width": 1600,
      "height": 1000
    },
    {
      "src": "/images/features/newsletters/web-admin-newsletters.webp",
      "alt": "The admin newsletters list with a draft in progress and a published edition.",
      "caption": "Newsletters",
      "role": "admin",
      "platform": "web",
      "width": 1600,
      "height": 1000
    },
    {
      "src": "/images/features/newsletters/web-parent-newsletter-reader.webp",
      "alt": "A parent reading a published school newsletter with its cover photo and stories.",
      "caption": "Newsletter reader",
      "role": "family",
      "platform": "web",
      "width": 1600,
      "height": 1000
    },
    {
      "src": "/images/features/newsletters/web-parent-newsletters.webp",
      "alt": "A parent's newsletter list featuring the latest published edition with its cover photo.",
      "caption": "Newsletters",
      "role": "family",
      "platform": "web",
      "width": 1600,
      "height": 1000
    },
    {
      "src": "/images/features/newsletters/mobile-parent-newsletters.webp",
      "alt": "The parent app newsletters list with the latest published edition and its cover photo.",
      "caption": "Newsletters",
      "role": "family",
      "platform": "mobile",
      "width": 720,
      "height": 1565
    }
  ],
  "photos": [
    {
      "src": "/images/features/photos/web-admin-photos.webp",
      "alt": "The admin school photo gallery grouped by day with upload and photo permission controls.",
      "caption": "Photos",
      "role": "admin",
      "platform": "web",
      "width": 1600,
      "height": 1000
    },
    {
      "src": "/images/features/photos/web-parent-photos.webp",
      "alt": "A parent's school photo gallery grouped by day next to their children's photo permissions.",
      "caption": "Photos",
      "role": "family",
      "platform": "web",
      "width": 1600,
      "height": 1000
    },
    {
      "src": "/images/features/photos/mobile-admin-photos.webp",
      "alt": "The admin app school photo gallery grouped by day with upload and photo permissions.",
      "caption": "Photos",
      "role": "admin",
      "platform": "mobile",
      "width": 720,
      "height": 1565
    },
    {
      "src": "/images/features/photos/mobile-parent-photos.webp",
      "alt": "The parent app photos screen with each child's photo permission and the school gallery.",
      "caption": "Photos",
      "role": "family",
      "platform": "mobile",
      "width": 720,
      "height": 1565
    },
    {
      "src": "/images/features/photos/mobile-teacher-photos.webp",
      "alt": "The teacher app photos screen with photo upload and the school gallery by day.",
      "caption": "Photos",
      "role": "staff",
      "platform": "mobile",
      "width": 720,
      "height": 1565
    }
  ],
  "staff": [
    {
      "src": "/images/features/staff/web-admin-staff-detail.webp",
      "alt": "A staff profile for a lead teacher showing job title, portal access and assigned learners.",
      "caption": "Staff · Profile",
      "role": "admin",
      "platform": "web",
      "width": 1600,
      "height": 1000
    },
    {
      "src": "/images/features/staff/web-admin-staff.webp",
      "alt": "The admin staff list with roles and portal access next to one staff member's profile.",
      "caption": "Staff",
      "role": "admin",
      "platform": "web",
      "width": 1600,
      "height": 1000
    },
    {
      "src": "/images/features/staff/mobile-admin-staff.webp",
      "alt": "The admin app staff list with roles and portal access.",
      "caption": "Staff",
      "role": "admin",
      "platform": "mobile",
      "width": 720,
      "height": 1565
    }
  ],
  "staff-hours": [
    {
      "src": "/images/features/staff-hours/web-admin-staff-hours.webp",
      "alt": "The admin staff hours page showing who is on the clock today and a pending hours change to approve.",
      "caption": "Staff hours",
      "role": "admin",
      "platform": "web",
      "width": 1600,
      "height": 1000
    },
    {
      "src": "/images/features/staff-hours/web-teacher-my-hours.webp",
      "alt": "A teacher's time clock while clocked in, with weekly hours, a pending change request and recent days.",
      "caption": "My Hours",
      "role": "staff",
      "platform": "web",
      "width": 1600,
      "height": 1000
    },
    {
      "src": "/images/features/staff-hours/mobile-admin-staff-hours.webp",
      "alt": "The admin app staff hours screen with who is clocked in and an hours change to approve.",
      "caption": "Staff hours",
      "role": "admin",
      "platform": "mobile",
      "width": 720,
      "height": 1565
    },
    {
      "src": "/images/features/staff-hours/mobile-teacher-my-hours.webp",
      "alt": "The teacher app time clock while clocked in, with weekly progress and today's session.",
      "caption": "My Hours",
      "role": "staff",
      "platform": "mobile",
      "width": 720,
      "height": 1565
    }
  ],
  "students": [
    {
      "src": "/images/features/students/web-admin-student-detail.webp",
      "alt": "A student profile panel with details, classroom, teacher, photo permission and enrollment.",
      "caption": "Student profile",
      "role": "admin",
      "platform": "web",
      "width": 1600,
      "height": 1000
    },
    {
      "src": "/images/features/students/web-admin-students.webp",
      "alt": "The admin student roster with grade, program, classroom, teacher and family for each student.",
      "caption": "My Students",
      "role": "admin",
      "platform": "web",
      "width": 1600,
      "height": 1000
    },
    {
      "src": "/images/features/students/web-parent-children.webp",
      "alt": "A parent's child profile with a health next step, school record tabs and the child's teacher.",
      "caption": "My children",
      "role": "family",
      "platform": "web",
      "width": 1600,
      "height": 1000
    },
    {
      "src": "/images/features/students/web-teacher-my-students.webp",
      "alt": "A teacher's roster of assigned students with classroom groups and health flags.",
      "caption": "My Students",
      "role": "staff",
      "platform": "web",
      "width": 1600,
      "height": 1000
    },
    {
      "src": "/images/features/students/mobile-admin-students.webp",
      "alt": "The admin app student roster with grades, classrooms and lead teachers.",
      "caption": "Students",
      "role": "admin",
      "platform": "mobile",
      "width": 720,
      "height": 1565
    },
    {
      "src": "/images/features/students/mobile-parent-children.webp",
      "alt": "The parent app child profile with enrollment status, the child's teacher and school record.",
      "caption": "My children",
      "role": "family",
      "platform": "mobile",
      "width": 720,
      "height": 1565
    },
    {
      "src": "/images/features/students/mobile-teacher-my-students.webp",
      "alt": "The teacher app roster of assigned students grouped by classroom.",
      "caption": "My Students",
      "role": "staff",
      "platform": "mobile",
      "width": 720,
      "height": 1565
    }
  ],
  "tuition-billing": [
    {
      "src": "/images/features/tuition-billing/web-admin-transactions.webp",
      "alt": "The admin payments ledger with collected totals, a failed payment flagged for follow-up and recent payments.",
      "caption": "Finances · Transactions",
      "role": "admin",
      "platform": "web",
      "width": 1600,
      "height": 1000
    },
    {
      "src": "/images/features/tuition-billing/web-admin-tuition.webp",
      "alt": "The admin tuition page with collected and outstanding totals, family list and one family's enrollment assignments.",
      "caption": "Tuition",
      "role": "admin",
      "platform": "web",
      "width": 1600,
      "height": 1000
    },
    {
      "src": "/images/features/tuition-billing/web-parent-billing.webp",
      "alt": "A parent's tuition page showing the next payment due, autopay turned on and tuition setup steps.",
      "caption": "Billing",
      "role": "family",
      "platform": "web",
      "width": 1600,
      "height": 1000
    },
    {
      "src": "/images/features/tuition-billing/mobile-admin-transactions.webp",
      "alt": "The admin app transactions screen with money collected this month and a failed payment to follow up.",
      "caption": "Transactions",
      "role": "admin",
      "platform": "mobile",
      "width": 720,
      "height": 1565
    },
    {
      "src": "/images/features/tuition-billing/mobile-parent-billing.webp",
      "alt": "The parent app billing tab with the family's next amount due, autopay on and the last payment.",
      "caption": "Billing",
      "role": "family",
      "platform": "mobile",
      "width": 720,
      "height": 1565
    }
  ]
};
