-- ═══════════════════════════════════════════════════════════════════════════
--  MudKitchen CRM — Run this entire script in the Supabase SQL editor once.
--  It creates the table AND inserts all 56 school prospects.
-- ═══════════════════════════════════════════════════════════════════════════

-- ── 1. Create table ──────────────────────────────────────────────────────────

create table if not exists public.schools (
  id                  uuid primary key default gen_random_uuid(),
  school_id           text unique not null,
  name                text not null,
  state               text not null,
  location            text not null,
  website             text not null,
  school_model        text not null,
  grades              text not null default '',
  estimated_size      text not null default '',
  tuition_schedule    text not null default '',
  strengths           text[] not null default '{}',
  pain_points         text[] not null default '{}',
  software_fit_reason text not null default '',
  priority_score      int  not null default 4,
  confidence          text not null default '',
  is_closing          boolean not null default false,
  source_file         text not null default 'texas',
  -- CRM fields
  crm_status          text not null default 'not_contacted'
                        check (crm_status in (
                          'not_contacted','contacted','nurturing',
                          'demo_scheduled','proposal_sent','not_interested','won'
                        )),
  contact_name        text not null default '',
  contact_email       text not null default '',
  contact_phone       text not null default '',
  notes               text not null default '',
  last_contacted_at   timestamptz,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

-- ── 2. Auto-update updated_at trigger ────────────────────────────────────────

create or replace function public.handle_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists on_schools_updated on public.schools;
create trigger on_schools_updated
  before update on public.schools
  for each row execute procedure public.handle_updated_at();

-- ── 3. Row Level Security (open — internal tool, no auth needed) ─────────────

alter table public.schools enable row level security;

drop policy if exists "Allow all access" on public.schools;
create policy "Allow all access" on public.schools
  for all using (true) with check (true);

-- ── 4. Seed all 56 schools ───────────────────────────────────────────────────

insert into public.schools (
  school_id, name, state, location, website, school_model, grades,
  estimated_size, tuition_schedule, strengths, pain_points,
  software_fit_reason, priority_score, confidence, is_closing, source_file
) values

-- ── CSV 1 · Texas Microschools ────────────────────────────────────────────────

(
  'ahb-community-school',
  'AHB Community School', 'TX', 'Austin, TX', 'https://www.ahbcs.org',
  'Private non-religious micro school / progressive, project-based',
  'K–8', '~80–100 students',
  '~$13,900/year; Mon–Thu 9am–2:30pm + optional Friday Extension (~$2,300)',
  ARRAY[
    'Clear project-based, progressive model with strong family/community culture',
    'Small classes and low student-teacher ratio',
    'Flexible condensed schedule that appeals to homeschool-adjacent families',
    'Accredited reporting, quarterly assessment reports, and parent-teacher conferences',
    'Strong parent satisfaction and student engagement signals'
  ],
  ARRAY[
    'Manual family communication and coordination across condensed schedule',
    'Outdated website and limited digital operations maturity',
    'Admissions/tours appear manually managed rather than through a modern enrollment funnel',
    'Fragmented newsletters, calendar coordination, and class updates',
    'Tight admin bandwidth with small staff'
  ],
  'Strong fit: combines small size, parent partnership, nontraditional reporting, optional care/Friday programs, and frequent class-level communication needs.',
  4, 'High', false, 'texas'
),

(
  'austin-micro-school',
  'Austin Micro School', 'TX', 'Manchaca (south Austin), TX', 'https://www.austinmicroschool.org',
  'Private microschool — First Principles, Montessori-inspired, hands-on, project-based; full-time and hybrid options',
  'K–9 (expanding)', 'Small by design; max 12:1 ratio',
  'Full-time $500/week or $18,000/year; Hybrid from $139/week; 30-day tryout offered',
  ARRAY[
    'Clear differentiated full-time and hybrid enrollment options',
    'Strong emphasis on personalized learning, mastery, and leadership development',
    'Uses diagnostics, portfolios, presentations, and milestone tracking',
    'Mixed-age classrooms and hands-on learning aligned to microschool families',
    'Transparent tuition, schedule, and tour-driven admissions flow'
  ],
  ARRAY[
    'Manual admissions/tour coordination rather than streamlined online enrollment',
    'No obvious public parent portal or automated communication stack',
    'Public reviews and third-party reputation appear sparse',
    'Program details spread across multiple pages — information fragmentation',
    'Hybrid/full-time offerings may increase admin complexity as school scales'
  ],
  'Strong fit: already offers hybrid and full-time pathways, manages personalized learning, and uses layered assessments and family touchpoints that become cumbersome as enrollment grows.',
  4, 'Medium-High', false, 'texas'
),

(
  'inspired-learning-academy',
  'Inspired Learning Academy', 'TX', 'Allen, TX', 'https://www.inspiredlearningacademy.org',
  'Private microschool / hybrid learning program / homeschool umbrella school with self-directed learning and mentorship',
  '6–12', '~22 students; 4:1 student-teacher ratio',
  '~$8,470/year; Tue–Thu on campus, Mon/Fri remote; 9am–3:45pm',
  ARRAY[
    'Clear niche for students who do not fit traditional school',
    'Strong emphasis on personalized learning and mentorship',
    'Small classes and low student-teacher ratio',
    'Flexible hybrid schedule for homeschool and nontraditional families',
    'Visible parent testimonials and community-oriented messaging'
  ],
  ARRAY[
    'Website suggests heavy reliance on manual communication and scheduling',
    'Enrollment is consultative/fit-check driven rather than self-serve',
    'Mixed age/grade references across sources suggest messaging inconsistency',
    'Limited social media footprint beyond Facebook',
    'No obvious online portal, parent app, or modern operational tooling visible'
  ],
  'Strong fit: small, hybrid, parent-facing, and highly dependent on scheduling, communication, enrollment follow-up, class coordination, and progress tracking.',
  4, 'Medium-High', false, 'texas'
),

(
  'esteam-academy-round-rock',
  'ESTEAM Academy Round Rock', 'TX', 'Round Rock, TX', 'https://esteamacademyrr.com',
  'Acton Academy affiliate — learner-driven microschool, self-paced, mastery-based, mixed-age, project-based',
  'Ages 4–18 (PreK–HS); no traditional grade levels', '~54–55 students; max capacity 70',
  '1–5 day options: $4,510–$13,700/year; remote learners $7,500/year; 9am–4pm',
  ARRAY[
    'Clear learner-driven philosophy that appeals to families seeking alternatives',
    'Defined enrollment funnel with tours, interviews, trial week, and onboarding',
    'Multiple schedule and tuition options for full-time, part-time, hybrid, and remote',
    'Strong emphasis on parent partnership, accountability, and community',
    'Small size and mixed-age studios support individualized attention'
  ],
  ARRAY[
    'Website and online presence fragmented across domains and related brands',
    'Enrollment and onboarding appear manual and document-heavy',
    'Communication likely relies on email/website rather than a unified parent portal',
    'Mixed-age groups and flexible schedules require manual progress tracking',
    'Limited public review volume makes reputation harder to verify'
  ],
  'Strong fit: small, high-touch, mixed-age program with flexible schedules, parent onboarding, attendance/tuition workflows, progress tracking, and ongoing family communication needs.',
  4, 'Medium-High', false, 'texas'
),

(
  'apogee-dripping-springs',
  'Apogee Dripping Springs', 'TX', 'Dripping Springs, TX', 'https://www.apogeedrippingsprings.com',
  'Micro high school — mixed-age, project-based, life skills, character development, community-based learning',
  '9–12', 'Very small (3–14 students); closing after graduating class',
  'Tuition not publicly listed; M–F ~8:30am–3:30pm',
  ARRAY[
    'Highly personalized small-community experience',
    'Strong emphasis on life skills, character development, and confidence',
    'Community-as-classroom model with guest speakers, field trips, and local mentors',
    'Hands-on experiential learning plus physical movement and wellness'
  ],
  ARRAY[
    'Very small operating footprint creates manual admin load',
    'Enrollment volatility and waitlist management challenges',
    'Operating from leased church room created space insecurity',
    'Tuition and admissions details not clearly surfaced on official website'
  ],
  'Strong fit for model, but school is closing after current graduating class — lower immediate priority.',
  4, 'High', true, 'texas'
),

(
  'natures-schoolhouse-microschool',
  'Nature''s Schoolhouse Microschool', 'TX', 'Cedar Park, TX', 'https://www.naturesschoolhouse.com',
  'Secular, nature-based, progressive/constructivist microschool with hybrid homeschool feel; drop-off program plus enrichment and teen learning lounge',
  'PK–6 core; 7–12 Teen Learning Lounge', '~15–20 students in core program',
  'Annual tuition; Tue–Thu 9am–2pm; Mon Discovery Days 9am–3:30pm; Sept–May',
  ARRAY[
    'Clear nature-based niche and differentiated philosophy',
    'Small multi-age environment with individualized learning',
    'Hybrid schedule that supports family flexibility',
    'Strong outdoor programming and hands-on enrichment',
    'Visible admissions funnel with staged flow through Wonderschool'
  ],
  ARRAY[
    'Multi-step admissions process appears partly manual or fragmented',
    'Tuition and program details spread across multiple pages and third-party listings',
    'No obvious public parent portal or centralized operations hub',
    'Mixed-age, multi-program structure increases scheduling and calendar complexity',
    'Small-school growth could strain communication and class management'
  ],
  'Strong fit: already runs multiple programs, a hybrid calendar, and a staged enrollment process while serving families who need clear communication, scheduling, updates, and flexible attendance management.',
  4, 'High', false, 'texas'
),

(
  'the-woodlands-microschool',
  'The Woodlands Microschool', 'TX', 'Conroe, TX', 'https://thewoodlandsmicroschool.com',
  'Accredited private microschool / hybrid private school; elementary, junior high, high school, homeschool classes, tutoring, and credit recovery',
  'Elementary (4th–8th) through High School', 'Small; class sizes not publicly stated',
  '$13,500/year including enrollment fee; 4-day week, 4-hour day; M–F office hours 9am–3pm',
  ARRAY[
    'Personalized instruction in small classroom settings',
    'Flexible hybrid scheduling with a short four-day week',
    'Support for homeschooling families, credit recovery, and fast-track HS options',
    'Accommodation for athlete training schedules',
    'Accredited private-school positioning'
  ],
  ARRAY[
    'Admissions appear tour- and phone-driven rather than self-serve online',
    'Website is relatively sparse and may not clearly explain enrollment steps',
    'No obvious parent portal, app, or integrated communication system visible',
    'Program details spread across multiple pages — fragmented information flow',
    'Limited public reputation/review footprint'
  ],
  'Strong fit: hybrid, small-group model with multiple program types, flexible scheduling, and support offerings that require coordinated parent communication, enrollment tracking, and class management.',
  4, 'Medium-High', false, 'texas'
),

(
  'mirus-academy',
  'Mirus Academy', 'TX', 'Katy, TX', 'https://www.mirus-academy.org',
  'Independent, secular private micro-school / college-prep high school',
  '8–12 (min age 13 by Sept 1)', '~25 students; ~6–8 per class',
  '$13,500–$18,250/year; Mon–Thu 9am–3:15pm + 2 Fridays/month; early arrival from 7:45am',
  ARRAY[
    'Very small, personalized learning environment',
    'College-prep academics in a low-stress setting',
    'Flexible scheduling for teens, athletes, and creative students',
    'Built-in work periods/study halls and dual credit options',
    'Selective admissions with year-round enrollment when space is available'
  ],
  ARRAY[
    'Very small staff suggests limited operational bandwidth',
    'Website content-light on key decision details like pricing specifics',
    'Likely relies on manual relationship-based communication',
    'No visible app-rich parent portal or enrollment workflow on public site',
    'Limited social media presence'
  ],
  'Strong fit: tiny, parent-facing, highly customized private school with rolling admissions, trial days, flexible scheduling, and ongoing communication needs.',
  4, 'High', false, 'texas'
),

(
  'katy-houston-life-stem-academy',
  'Katy/Houston LIFE STEM Academy', 'TX', 'Katy, TX', 'https://learningforexcellence.com/katyhomeschool/',
  'Two-day-per-week hybrid homeschool academy with online support and in-person classes; STEM focus with dual-credit pathways',
  '6–12', 'Cap of 24 students',
  '$12,000/year; Tue & Thu 9:30am–3:30pm; rolling admissions',
  ARRAY[
    'Small personalized hybrid setting with stated cap of 24 students',
    'Clear STEM emphasis plus dual-credit / college-credit pathways',
    'Parent partnership and individualized academic plan review',
    'Visible commitment to scheduling, assessments, and academic tracking'
  ],
  ARRAY[
    'No clear street address or full campus contact details surfaced',
    'Light public review footprint — reputation hard to validate externally',
    'Hybrid + individualized plans create manual coordination burdens',
    'Program details spread across website and videos — fragmented information',
    'Small team / small cohort limits administrative bandwidth'
  ],
  'Strong fit: small, parent-facing, schedule-heavy, and personalized. A platform centralizing enrollment, communication, calendars, class management, and student progress would reduce manual admin work.',
  4, 'Medium-High', false, 'texas'
),

(
  'brighter-futures-microschool',
  'Brighter Futures Microschool', 'TX', 'Arlington, TX', 'https://www.brighterfuturesedtherapy.com',
  'Microschool / part-time university model with individualized educational therapy and small-group instruction for students with learning, language, and social differences',
  'K–6 (elementary)', 'Groups of 3–5 students based on skill needs',
  'No public tuition; 3 days/week, 3 hours each day',
  ARRAY[
    'Individualized instruction for learning, language, and social differences',
    'Small-group learning structure (3–5 students)',
    'Strong special-needs and educational-therapy positioning',
    'Parent education / family support orientation',
    'Evidence-based, community-centered brand message'
  ],
  ARRAY[
    'No clear public tuition or enrollment details',
    'Website appears lightweight with limited page depth',
    'Likely relies on manual parent communication and scheduling across therapy + microschool services',
    'Small-group / part-time model may require frequent calendar and roster coordination',
    'No visible online review base or robust public credibility signals yet'
  ],
  'Strong fit: small, parent-facing, and highly individualized, with needs around enrollment, communication, calendars, class grouping, and progress updates.',
  4, 'Medium-High', false, 'texas'
),

(
  'spyrja-academy',
  'Spyrja Academy of New Braunfels', 'TX', 'New Braunfels, TX', 'https://sanewbraunfels.org',
  'Private microschool / alternative school with blended, multimodal, individualized instruction; career and trade-oriented pathways',
  '6–12 (primarily 9–12)', 'Ideal size of ~40 students; current enrollment not published',
  'Tuition not published; 2–5 day schedule options; Fridays for community service/tutoring/labs',
  ARRAY[
    'Flexible attendance models with multiple weekly schedule options',
    'Blended and individualized instruction',
    'Built-in Friday support, labs, and community service',
    'Career and trade-oriented pathways (welding, electrical, plumbing)',
    'Strong focus on master classes and community-based learning'
  ],
  ARRAY[
    'Website does not publish tuition',
    'No clear phone number or direct contact email on contact page',
    'Social proof and independent review volume appears limited',
    'Enrollment and operations seem highly manual and founder-led',
    'Multiple location changes suggest facility instability'
  ],
  'Strong fit: flexible schedules, individualized learning paths, tutoring blocks, community activities, and needs around parent communication, enrollment, class management, and student progress tracking.',
  4, 'Medium-High', false, 'texas'
),

(
  'hill-country-micro-school',
  'Hill Country Micro-School', 'TX', 'Kerrville, TX', 'https://www.hillcountrymicroschool.com',
  'Private microschool / small mixed-grade learning community with individualized curriculum and exploratory, creative instruction',
  'K–8', 'Small; exact enrollment not published',
  'Tuition and schedule not publicly listed',
  ARRAY[
    'Individualized curriculum and student-centered instruction',
    'Small mixed-grade classrooms',
    'Broad enrichment: art, French/Latin, yoga/martial arts, Lego robotics',
    'Clear emphasis on creativity, critical thinking, and exploratory learning'
  ],
  ARRAY[
    'Tuition and schedule are not visible online',
    'Enrollment details and contact info not clearly published',
    'Website appears light on operational information parents need',
    'No obvious parent communication, calendar, or enrollment automation visible',
    'Limited public reputation footprint'
  ],
  'Strong fit: small, multi-age, and likely managing many parent-facing workflows manually. A platform for communication, calendars, enrollment, class updates, and growth management could reduce friction.',
  4, 'Medium', false, 'texas'
),

(
  'the-kinder-haus',
  'The Kinder Haus Microschool', 'TX', 'New Braunfels, TX', 'https://www.thekinderhaus.com/p/about.html',
  'Faith-based non-traditional kindergarten microschool / homeschool hybrid; 2 days in class + 2 teacher-provided at-home days + optional 5th STEM enrichment day',
  'Kindergarten (optional enrichment K–8)', 'Max 12 students',
  'Tuition not published; 2+2 hybrid schedule + optional STEAM Schoolhouse day',
  ARRAY[
    'Clear hybrid model that fits homeschool-family expectations',
    'Very small class size (max 12) and individualized instruction',
    'Teacher-provided at-home materials reduce parent prep burden',
    'Faith-based curriculum may resonate with a defined niche',
    'Optional STEM enrichment day expands offerings beyond core kindergarten'
  ],
  ARRAY[
    'Website appears lightweight — lacks tuition, admissions steps, calendar',
    'No obvious centralized parent portal or enrollment workflow',
    'Limited public social proof or third-party reviews',
    'Hybrid model creates ongoing communication complexity between home and classroom',
    'Small team suggests manual admin processes'
  ],
  'Strong fit: depends on frequent parent communication, hybrid scheduling, assignment coordination, enrollment management, and calendar updates.',
  4, 'Medium', false, 'texas'
),

(
  'book-hooks-schoolhouse',
  'The Book Hooks Schoolhouse', 'TX', 'Houston, TX', 'https://bookhooklearning.com',
  'Christian hybrid microschool / homeschool partnership; 2 on-site days + 3 individualized at-home days',
  '1–12', 'Not publicly disclosed',
  'Tuition not listed; Mon/Wed (elem/jr high) or Tue/Thu (jr high/HS) 9am–3pm on-site',
  ARRAY[
    'Clear hybrid model for homeschool families',
    'Structured daily rhythm with academic blocks, read-aloud, Bible, history, science',
    'Ability-based math/language arts rotations',
    'Monthly field trip or social activity opportunities',
    'Founder presents strong education credentials and multi-age experience'
  ],
  ARRAY[
    'Tuition not publicly posted — can slow inquiries',
    'No obvious online enrollment workflow — contact form appears to be main entry point',
    'Limited public visibility of class capacity, calendars, or detailed FAQ',
    'No confirmed social media presence found',
    'Website appears lightweight, suggesting manual communication/enrollment'
  ],
  'Strong fit: small hybrid program serving homeschool families, runs on a recurring weekly schedule, and likely needs organized parent communication, scheduling, attendance, and streamlined enrollment.',
  4, 'Medium', false, 'texas'
),

(
  'launch-academy',
  'Launch Academy', 'TX', 'Sugar Land, TX', 'https://www.launchacademy.info',
  'Special education / inclusion microschool for neurodiverse students; individualized and small-group instruction with integrated life, social, and vocational skills support',
  '3–12', 'Max 30 students; 5:1 (or 3:1) student-teacher ratio',
  '$22,000/year; $2,000 non-refundable deposit; M–F 8:30am–3:30pm (extended Tue/Thu until 4:30pm)',
  ARRAY[
    'Clear niche serving neurodiverse and differently abled students',
    'Small class sizes and low student-teacher ratios',
    'Strong life-skills, vocational, and transition programming',
    'Multiple support services: speech, OT, ABA, counseling, school psychology',
    'Structured tuition and schedule for a private-school model'
  ],
  ARRAY[
    'No official social media links found on the site',
    'Website appears light on enrollment workflow and calendar detail',
    'Public review volume is very low; mixed reputation evidence',
    'Manual-feeling tuition/payment details suggest administrative complexity',
    'At least one public criticism of disorganization and accreditation concerns'
  ],
  'Strong fit: combines family communication, admissions, schedules, small-class management, therapies/support services, and growth from a very small student base.',
  4, 'Medium-High', false, 'texas'
),

(
  'mcp-academy',
  'MCP Academy', 'TX', 'Mansfield, TX', 'https://www.mcpacademy.org',
  'Private microschool and homeschool hybrid; also offers preschool/Pre-K, camps, and enrichment classes',
  'Pre-K 3 – 8th grade', '50+ families',
  'Not publicly listed; flexible 2–5 day options; 8:30am–3:30pm school hours',
  ARRAY[
    'Flexible attendance options for families',
    'Project- and unit-based, hands-on learning',
    'Strong STEM and enrichment emphasis',
    'Small-group and one-on-one support',
    'Clear parent communication and safety procedures'
  ],
  ARRAY[
    'Public pricing is not transparent',
    'Website does not clearly surface social links or a single contact hub',
    'Heavy handbook/policy burden suggests lots of manual administration',
    'Attendance, pick-up, and emergency processes appear operationally intensive',
    'Communication split across email, Brightwheel, phone, and website updates'
  ],
  'Strong fit: small enough to benefit from simple workflows but complex enough to need parent messaging, enrollment tracking, schedules, attendance, updates, and growth-friendly administration.',
  4, 'Medium-High', false, 'texas'
),

(
  'bright-minds-future-leaders',
  'Bright Minds Future Leaders', 'TX', 'New Caney, TX', 'https://brightmindsfutureleaders.com',
  'Private microschool / private elementary school with ability-based, mixed-age learning and personalized instruction',
  'K–5 (possibly K–8)', 'Max 8–12 students; 12:1 max ratio',
  'Tuition described as affordable but not published; Mon–Thu 8:30am–3:30pm + Friday enrichment',
  ARRAY[
    'Highly personalized learning and small classes',
    'Clear differentiation through ability-based, mixed-age instruction',
    'Hands-on, real-world, community-connected learning',
    'Character development and leadership focus',
    'Simple online application flow and direct contact options'
  ],
  ARRAY[
    'Tuition and schedule not clearly published on the official site',
    'Grade span not clearly and consistently stated across sources',
    'No obvious public social-media footprint found',
    'Likely relies on manual enrollment/communication via phone, email, and web form'
  ],
  'Strong fit: small, parent-facing, enrollment-driven, and built around individualized learning. A platform for communication, enrollment tracking, class management, and calendar updates would reduce manual work.',
  4, 'Medium', false, 'texas'
),

(
  'athena-micro-academy-austin',
  'Athena Micro-Academy of Austin', 'TX', 'South Austin, TX', 'https://www.amaustin.org',
  'Relationship-centered microschool / hybrid, self-directed learning model with personalized coaching, enrichment, and year-round programming',
  '6–11 (12th considered case-by-case); launching Fall 2026', '10–12 students per learning coach (launch stage)',
  'Year-round; annual tuition with monthly/semester/lump-sum options; exact amounts not publicly listed',
  ARRAY[
    'Clear niche for self-directed middle/high schoolers',
    'Strong emphasis on personalized support and small-group ratios',
    'Year-round structure with built-in breaks and enrichment',
    'After-school tutoring and intercession camps add flexibility',
    'Founder has deep K–12 leadership experience'
  ],
  ARRAY[
    'No exact physical address posted yet',
    'Publicly visible tuition details are incomplete or hard to find',
    'New launch — still building enrollment systems, family communication workflows, and school ops',
    'Website relies on multiple separate pages and inquiry steps rather than a streamlined portal'
  ],
  'Strong fit: launch-stage, hybrid/flexible enrollment, year-round scheduling, after-school options, tutoring, and individualized learning support. Those conditions create lots of manual coordination that software can centralize.',
  5, 'Medium-High', false, 'texas'
),

-- ── CSV 2 · Expanded Prospects (TX + CA) ────────────────────────────────────

(
  'primer-potranco',
  'Primer Microschools — Potranco', 'TX', 'San Antonio, TX', 'https://primer.com/schools/potranco-tx',
  'Teacher-led K–8 microschool with mixed-age classrooms, project-based learning, and a foundations-first approach; part of the Primer network',
  'K–8', 'Small early-stage campus; 3–6 mixed-age classrooms typical',
  'Free for TX students via Texas Education Freedom Accounts; small after-school program cost; opening Aug 2026',
  ARRAY[
    'Clear family-facing admissions flow and branded campus page',
    'Teacher-led, small-group microschool model aligned with hybrid/private microschool buyers',
    'Strong emphasis on communication, warmth, and personalized instruction',
    'Built-for-new-campus rollout with dedicated playground and new facility'
  ],
  ARRAY[
    'New campus with no established local operations history or review base',
    'Admissions relies on a short inquiry form and info sessions — room for more structured pipeline',
    'Likely needs coordinated parent communication for mixed-age cohorts, calendars, and after-school programming',
    'High-growth multi-campus rollout can create operational complexity'
  ],
  'Strong fit: private K–8 microschool campus entering launch mode, with small cohorts, mixed ages, rolling admissions, parent communication needs, and multi-campus growth pressure.',
  5, 'High', false, 'expanded'
),

(
  'acton-houston-heights',
  'Acton Academy Houston Heights', 'TX', 'Houston, TX', 'https://actonheights.com',
  'Acton learner-driven affiliate campus — mixed-age, Montessori-influenced with Socratic method and self-paced mastery',
  'Elementary Studio (ages 5–11)', 'Small microschool-scale',
  '$20,000 + $1,000 registration/supply fee/year; M–F 8am–3pm; nine months/year with ~6-week sessions',
  ARRAY[
    'Clear learner-driven model with defined studio structure',
    'Published tuition, calendar, and age range information',
    'Uses SMART goals, portfolios, and MAP Growth assessments',
    'Small-school environment supports high-touch relationships'
  ],
  ARRAY[
    'No obvious public enrollment count or operational scale data',
    'No confirmed active social profiles',
    'Website feels lightweight for complex enrollment and family communication needs',
    'Acton model can create fragmented expectations across affiliates'
  ],
  'Strong fit: small independent learner-driven campus with frequent family communication needs, session-based scheduling, mastery tracking, portfolios, and high-touch enrollment.',
  4, 'High', false, 'expanded'
),

(
  'primer-live-oak',
  'Primer Microschools — Live Oak', 'TX', 'San Antonio, TX', 'https://primer.com/schools/live-oak-tx',
  'Teacher-led K–8 microschool with small mixed-age classrooms, foundations-first academics, and project-based Pursuits; part of the Primer network',
  'K–8', 'Small campus; 3–6 mixed-age classrooms typical',
  'Free via Texas Education Freedom Accounts; small after-school cost; opening Aug 2026',
  ARRAY[
    'Clear microschool positioning with mixed-age, teacher-led classrooms',
    'Strong branding around fundamentals-first academics and small, caring environments',
    'Built for enrollment growth across multiple campuses and scholarship-funded accessibility',
    'Rolling admissions and community-facing info sessions'
  ],
  ARRAY[
    'New campus not yet open — operational maturity unproven locally',
    'No public enrollment count, schedule detail, or tuition for non-scholarship families',
    'Some copy/content-management friction noted on website',
    'Needs strong systems for multi-campus communication, enrollment, schedules, and parent updates'
  ],
  'Strong fit: growing private microschool network with mixed-age cohorts, rolling enrollment, scholarship handling, parent communication needs, and multiple campuses opening at once.',
  4, 'High', false, 'expanded'
),

(
  'cosmic-roots-nature-school',
  'Cosmic Roots Nature School', 'TX', 'Georgetown, TX', 'https://www.cosmicrootsgeorgetown.org',
  'Nature-based, Montessori/Reggio/Waldorf-inspired private microschool with hybrid high school dual-credit option',
  'Ages 3–15; PreK–8 (9th planned)', '~55 students',
  '$850/month elementary; $785/month HS dual-credit hybrid; Mon–Thu 9am–3pm + aftercare until 6pm',
  ARRAY[
    'Clear nature-based and experiential positioning',
    'Broad age range and program ladder from primary through adolescence',
    'High school dual-credit pathway and personalized learning',
    'Enrollment flow already uses ProCare for payments, forms, and handbook access'
  ],
  ARRAY[
    'School is closing after 2025–26 school year — sharply reduces priority',
    'Fragmented family communication across forms, handbook, calendars, and enrollment tools'
  ],
  'Low priority due to planned closure. Model was a strong fit, but the 2026 closure announcement makes this a low-priority prospect unless tracking successor programs.',
  1, 'High', true, 'expanded'
),

(
  'primer-university-heights',
  'Primer Microschools — University Heights', 'TX', 'San Antonio, TX', 'https://primer.com/schools/university-heights-tx',
  'Teacher-led, mixed-age K–8 microschool; one-room-schoolhouse-inspired, with core instruction plus project-based learning blocks; part of the Primer network',
  'K–8', '3–6 mixed-age classrooms; network has ~48 schools across ~20 locations',
  'Free via Texas Education Freedom Accounts; opening Aug 2026; rolling enrollment/open admissions',
  ARRAY[
    'Clear niche: small, teacher-led K–8 microschool model',
    'Strong parent-facing brand around personalized learning and community',
    'Rolling enrollment and multiple San Antonio campuses suggest growth potential',
    'Attractive to voucher-eligible families and homeschool-adjacent parents'
  ],
  ARRAY[
    'Campus not yet open — in build-out mode',
    'Needs heavy enrollment, scheduling, and family communication coordination across multiple campuses',
    'Scholarship/voucher administration may create administrative complexity',
    'Mixed-age classroom management and after-school coordination can be operationally demanding'
  ],
  'Strong fit: private multi-campus, enrollment-driven K–8 microschool network launching new campuses in San Antonio. A platform centralizing parent communication, enrollment, calendars, and class management would help.',
  5, 'High', false, 'expanded'
),

(
  'acton-academy-nw-austin',
  'Acton Academy Northwest Austin', 'TX', 'Austin, TX', 'https://www.actonacademynwaustin.org',
  'Independent Acton Academy campus — learner-driven, network-affiliated microschool using the Hero Journey philosophy',
  'Ages 4–12', '~22 students',
  'Tuition not published; admissions via 20-min call + 30-min Pop-In Tour',
  ARRAY[
    'Clear learner-driven positioning',
    'Strong mission and parent-facing messaging',
    'Simple admissions funnel with info kit, call, and tour',
    'Official network listing confirms campus identity and address'
  ],
  ARRAY[
    'No tuition published publicly',
    'No clear daily schedule or calendar details on the site',
    'Limited public review volume for this exact campus',
    'Website leans on marketing copy rather than operational specifics'
  ],
  'Strong fit: small private Acton network campus serving young learners with high-touch family communication and admissions workflow.',
  4, 'Medium-High', false, 'expanded'
),

(
  'masterpiece-academy',
  'Masterpiece: An Acton Academy', 'TX', 'Pearland, TX', 'https://www.masterpieceacademy.org',
  'Acton Academy-style learner-driven microschool — Montessori-inspired, Socratic, hands-on, faith-based, mixed-age, independent affiliate',
  'Ages 4–11 (PreK–5th); expanding to ages 11–18', 'Small; no public enrollment count',
  'Tuition not publicly stated; August–May calendar',
  ARRAY[
    'Clear Acton-style learner-driven positioning',
    'Mixed-age, self-paced elementary program',
    'Faith-based identity and community focus',
    'Hands-on projects plus online adaptive learning'
  ],
  ARRAY[
    'Website does not show tuition, admissions steps, or a detailed daily schedule',
    'No verified student count or capacity published',
    'Light external review coverage',
    'Likely relies on parent communication and enrollment follow-up that could become fragmented as it grows'
  ],
  'Strong fit: Acton-style private microschool, small and growing, with mixed-age studios, parent partnership, calendar-based operations, and needs around communication, enrollment, and studio management.',
  4, 'Medium-High', false, 'expanded'
),

(
  'brazos-valley-honor-academy',
  'Brazos Valley Honor Academy', 'TX', 'Navasota, TX', 'https://mybvha.com',
  'Christian homeschool/private-school hybrid environment; parent-partnered, multi-day campus program',
  'K–7', 'Small; likely under 100 students',
  '$475/month (Sept–May); $100 enrollment fee + $350 curriculum/technology fee; Tue–Thu 8:30am–3:30pm',
  ARRAY[
    'Clear positioning as a Christian homeschool/private-school hybrid',
    'Publicly stated tuition and schedule — reduces buyer friction',
    'Serves defined K–7 segment with core academics and Bible',
    'Active events and fundraiser updates suggest ongoing community engagement'
  ],
  ARRAY[
    'Website is minimal and template-like with limited information depth',
    'No public enrollment size, staff directory, or detailed program calendar',
    'No clear social media presence surfaced beyond YouTube',
    'Likely relies on manual parent communication, enrollment, scheduling, and fee collection'
  ],
  'Strong fit: small, parent-partnered hybrid campus with set weekly attendance, tuition collection, family communication, and class coordination needs.',
  4, 'Medium-High', false, 'expanded'
),

(
  'deep-waters-academy',
  'Deep Waters Academy', 'TX', 'Webster (Clear Lake), TX', 'https://www.deepwatersacademy.org',
  'University-Model® hybrid school — classical Christian, parent-partnered homeschool/private-school blend',
  'K–10 (adding a grade each year)', 'Small-to-mid; likely under 100 students',
  'Tuition not public; Mon & Wed 8:30am–3:30pm on campus; home days with parent co-teacher; $100 annual application fee',
  ARRAY[
    'Clear hybrid University-Model structure with explicit parent partnership',
    'Christian/classical identity and mission are clearly articulated',
    'Admissions process is organized and detailed',
    'Published meeting times, tours, and orientation steps help prospective families'
  ],
  ARRAY[
    'Tuition not public — requires manual inquiry',
    'Manual admissions and communication workflows: newsletter, info meetings, interviews, handbook',
    'No clearly visible modern enrollment portal, calendar system, or parent app',
    'Social presence appears limited',
    'Public third-party reviews are sparse'
  ],
  'Strong fit: parent-partnered hybrid schedule, structured admissions and orientation steps, likely manages family communication and class coordination manually.',
  4, 'Medium-High', false, 'expanded'
),

(
  'bluebonnet-home-scholars',
  'Bluebonnet Home Scholars Collaborative', 'TX', 'Sugar Land, TX', 'https://www.bluebonnetscholars.org',
  'Christian liberal arts homeschool support program — group class community, parent-partnership model, à-la-carte classes plus full-program options, drop-off style',
  'K–12 (Forms I–IV)', 'Multi-family; multiple forms and instructors',
  '31 weeks/year; primarily Tue/Fri with some Thu; class fees vary (e.g. $94 packet + $395/yr volunteer buy-out)',
  ARRAY[
    'Clear niche serving Christian homeschool families',
    'Broad K–12 academic and enrichment catalog',
    'Structured class forms, calendar, placement testing, and dual-enrollment pathway',
    'Uses professional teachers with explicit parent-support expectations'
  ],
  ARRAY[
    'Enrollment depends on placement tests, auditions, waitlists, volunteer scheduling, and parent participation rules',
    'Communication split across website, Google Classroom, and social channels',
    'Tuition not transparently centralized — some pricing is course-specific or hidden',
    'Organization explicitly says it is not a school — may have less need for full SIS features'
  ],
  'Fits software for parent communication, class schedules, enrollment, placements, waitlists, teacher coordination, calendars, and family-level updates. Operates like a multi-family learning center.',
  4, 'High model; Medium size', false, 'expanded'
),

(
  'luff-learning',
  'Luff Learning Fine Arts Academy', 'TX', 'Spring, TX', 'https://lufflearning.org',
  'Hybrid homeschool-style private school with a fine arts focus; arts-integrated instruction, tutoring options, and part-time program blocks',
  'Ages 5–18', 'Small; waitlist for Fine Arts Friday indicates limited capacity',
  'Tuition not published; Mon/Wed (CCC) 9:30am–2:30pm; Tue/Thu/Fri (AEP) 9:30am–2:30pm',
  ARRAY[
    'Clear arts-integrated identity and niche positioning',
    'Structured hybrid schedules for multiple age bands',
    'Attention to social-emotional learning and support for special needs students',
    'Appears to have enough demand to maintain a waitlist for at least one offering'
  ],
  ARRAY[
    'Tuition not posted publicly',
    'Enrollment/application process not clearly explained online',
    'Limited size/capacity may create waitlist and scheduling complexity',
    'Website light on operational details: calendar, student portal, parent workflows'
  ],
  'Strong fit: small, nontraditional private learning center with hybrid schedules, multiple program tracks, manual parent communication needs, and waitlist/enrollment coordination challenges.',
  4, 'Medium-High', false, 'expanded'
),

(
  'heart-of-christ-academy',
  'Heart of Christ Academy', 'TX', 'Cypress, TX', 'https://www.heartchristianacademy.org',
  'Hybrid homeschool / university-model school — 2 days on campus + 3 days at home; Christian learning center model',
  'PreK–12', '~43–46 students; 9:1 student-teacher ratio',
  '$4,000 (K–4) and $4,500 (5–8)/year; 2 days on campus + 3 days home',
  ARRAY[
    'Clear hybrid/university-model identity',
    'Strong parent-partnership and family support language',
    'Structured core classes plus home-day syllabi and administrative support',
    'Active Instagram with frequent posts and community events'
  ],
  ARRAY[
    'Website/domain mismatch and branding confusion',
    'Limited public information on enrollment, admissions, and day-to-day operations',
    'Likely manual family coordination for re-enrollment, open houses, transcripts, and records',
    'Small staff may be relying on multiple systems or informal processes'
  ],
  'Strong fit: small, hybrid Christian program with parent communication, enrollment, calendars, teacher support, and family workflow needs across at-home and on-campus learning.',
  4, 'Medium-High', false, 'expanded'
),

(
  'meadow-creek-academy',
  'Meadow Creek Academy (fmr. Forest Path Academy)', 'TX', 'Alvin, TX', 'https://www.meadowcreekacademy.com',
  'Homeschool-inspired hybrid school with small classes, STEAM Mondays, 3-day academic, and 4-day complete options; nature-based and hands-on learning emphasis',
  'PreK–12', 'Small; spots limited and small-class language used throughout',
  'STEAM Mondays $1,955/yr; 3-Day Academic $5,450/yr; 4-Day Complete $6,395/yr; Mon–Thu schedules + electives',
  ARRAY[
    'Flexible hybrid schedule options',
    'Small-class, personalized learning',
    'Clear tuition and program structure',
    'Hands-on STEAM and elective offerings',
    'Family-friendly homeschool positioning'
  ],
  ARRAY[
    'Brand transition from Forest Path Academy to Meadow Creek Academy may confuse families',
    'Website/content in transition and partially outdated',
    'Enrollment seems manual and capacity-limited with applications reviewed in order',
    'Needs better parent communication around schedules, electives, and transitions'
  ],
  'Strong fit: runs multiple schedule models, limits spots, manages families across K–12, and needs enrollment workflows, calendar coordination, parent updates, and class management in one place.',
  4, 'Medium-High', false, 'expanded'
),

(
  'rise-hybrid-private-academy',
  'RISE Hybrid Private Academy', 'MD', 'Beaumont, TX (admin office); Olney, MD (HQ)', 'https://www.risehybridacademy.com',
  'Hybrid private school with personalized, individualized, online-plus-in-person learning; serves students nationwide',
  'K–12', 'Small; avg class size of 6',
  '~$20,000/year online; ~$22,000/year in-person; $600 summer; rolling admissions via FACTS',
  ARRAY[
    'Strong personalization and hybrid delivery',
    'Clear K–12 offering with admissions and tuition pages',
    'Rolling admissions and FACTS-based application process',
    'College-prep positioning with advanced academics'
  ],
  ARRAY[
    'Multiple locations and administrative addresses may confuse families',
    'Enrollment relies on FACTS and likely manual coordination across online/in-person options',
    'No clear tuition details on main homepage',
    'Limited visible social media presence'
  ],
  'Strong fit: small hybrid private academy with K–12 students, rolling enrollment, multiple locations, and a personalized model that benefits from centralized parent communication, enrollment, and class management.',
  4, 'Medium-High', false, 'expanded'
),

(
  'ellemercito-academy',
  'Ellemercito Academy / Ellemercito Learning Community', 'CA', 'Downey, CA', 'https://ellemercito.org',
  'Independent microschool with hybrid homeschool model — project-based, place-based, trauma-informed, experiential, and learner-centered, with mixed-age or flexible-grade instruction',
  'K–12', '~20–50 students',
  '$100/week (1 day), $200/week (2 days), $300/week (3 days); community membership $190/month; Mon–Wed 8:15am–2:15pm core',
  ARRAY[
    'Clearly serves a microschool/hybrid homeschool audience',
    'Strong parent-facing messaging around personalization, trauma-informed support, and community',
    'Offers flexible schedules, tutoring, field trips, and enrichment workshops',
    'Compelling, mission-driven brand with testimonials and detailed program explanations'
  ],
  ARRAY[
    'Website is content-heavy and may require significant manual upkeep across many pages/program variants',
    'Enrollment, walkthroughs, intro packets, and parent communication spread across multiple pages/forms',
    'Schedule, tuition, and program structure vary by page — operational complexity',
    'Small-team operations that could benefit from centralized calendars, enrollment, and communication'
  ],
  'Strong fit: real private microschool/hybrid homeschool center with small scale, individualized learning plans, mixed schedules, enrichment programming, and parent-heavy communication needs.',
  5, 'High', false, 'expanded'
),

(
  'true-north-the-woodlands',
  'True North Parent Partnership', 'TX', 'The Woodlands, TX', 'https://truenortheducation.weebly.com',
  'Hybrid parent-partnership program with on-site classes and enrichment — Christian, biblically based; closer to a homeschool learning center / hybrid microschool than a traditional private school',
  '1–12', 'Small; multiple grade bands with a limited instructor roster',
  'Tuition not clearly posted; advertised as an affordable alternative to public/private school',
  ARRAY[
    'Christian, biblically centered parent-partnership model',
    'Covers a broad range of grades (1–12)',
    'Enrichment classes: cheerleading, volleyball, debate, cooking, sign language, keyboarding, self-defense',
    'Positions itself as an affordable option between public and private school'
  ],
  ARRAY[
    'Website is a basic Weebly site — appears outdated',
    'Key buyer information missing: tuition, calendar, enrollment flow, daily schedule',
    'Likely relies on manual communication and informal updates rather than a modern parent portal',
    'Possible brand/identity confusion with similarly named entities'
  ],
  'Strong fit: small hybrid learning program with multiple grade groups, enrichment offerings, parent-partnership communication needs, and likely manual processes around enrollment, calendars, and family updates.',
  4, 'Medium', false, 'expanded'
),

(
  'wondering-oaks-learning',
  'Wondering Oaks Learning', 'TX', 'Conroe/Willis, TX', 'https://www.wonderingoakslearning.com',
  'Homeschool-away-from-home microschool — multi-age, part-time/full-time secular program bridging homeschool and private school',
  'TK–3rd grade (ages 5–8)', '~10 students per class',
  'Tuition not published; Mon–Thu year-round in 4–6 week cycles with 1-week breaks',
  ARRAY[
    'Clear niche for early elementary homeschool families',
    'Small class sizes and individualized instruction',
    'Multi-age, flexible, secular model',
    'Strong emphasis on literacy, math, science, and nature-based projects',
    'Structured but flexible schedule with field trips and family days'
  ],
  ARRAY[
    'Website suggests manual enrollment via forms and email rather than a streamlined portal',
    'Tuition is not clearly published on pages reviewed',
    'No obvious parent-app or integrated communication system visible',
    'Limited public-facing proof of scale, testimonials, or reviews'
  ],
  'Strong fit: small but growing multi-age enrollment, part-time/full-time scheduling, frequent family communication, forms-based registration, calendar coordination, and activity management needs.',
  4, 'Medium-High', false, 'expanded'
),

(
  'one-acre-farm',
  'One Acre Farm Farm School Learning Pod', 'TX', 'Porter, TX', 'https://oneacrefarmtx.com',
  'Nonprofit educational farm with two outdoor Farm School Learning Pods — supplemental homeschool learning, not a full-day accredited school',
  'Early Childhood ages 4–6; Elementary ages 7–10', 'Small; two outdoor pods; enrollment size not stated',
  'Elementary pod: $325/month (2 days/week) or $180/month (1 day/week); Wed or Thu 8am–1pm',
  ARRAY[
    'Clear niche in outdoor, hands-on farm-based learning',
    'Serves homeschool families and children with autism/special needs',
    'Publishes concrete tuition, dates, ages, and enrollment steps',
    'Defined lead teacher/contact and recurring weekly schedule'
  ],
  ARRAY[
    'Website appears somewhat dated and duplicated across old/new pages',
    'Enrollment is manual: tour application, intro meeting, deposit, then acceptance decision',
    'After-hours-only communication via phone/text/email',
    'No obvious modern parent portal, automated billing, or centralized scheduling'
  ],
  'Strong fit: small, parent-facing learning pod with recurring schedules, limited seats, application-based enrollment, tuition collection, and parent communication needs.',
  4, 'Medium-High', false, 'expanded'
),

(
  'play-full-ground',
  'Play Full Ground', 'CA', 'Monterey, CA', 'https://www.playfullground.com',
  'Creative micro high school community — hybrid-style microschool with independent learning, project-based studio classes, and weekly reflection/community share',
  'High School', 'Very small (1 employee listed on LinkedIn)',
  'Tuition not listed; full-time and part-time options; morning independent study + afternoon creative classes + Friday community share',
  ARRAY[
    'Clear creative identity and niche positioning for high school learners',
    'Small-group, mentor-supported independent study model',
    'Hands-on project-based arts programming across multiple media',
    'Weekly reflection/share structure that supports community and communication',
    'Appears to be actively enrolling for full-time and part-time options'
  ],
  ARRAY[
    'Tuition not clearly published',
    'Multiple program tracks and schedules may be hard to manage manually',
    'Likely small team creating communication and enrollment admin bottlenecks',
    'No strong public review footprint or broad social presence'
  ],
  'Strong fit: small, enrollment-driven, hybrid/microschool model with multiple schedules, part-time/full-time participation, weekly updates, mentor check-ins, and likely manual admissions.',
  4, 'High model; Medium size', false, 'expanded'
),

(
  'home-education-partnership',
  'Home Education Partnership of Texas (HEP TX)', 'TX', 'Friendswood, TX', 'https://heptx.com',
  'Classical School + college-preparatory University Model hybrid — parent-partner program with on-campus classes once or twice weekly and at-home instruction on alternate days',
  'PreK 3 – 12th grade', 'Established and sizable for Houston homeschool market; 27+ years operating',
  'Classes 1–2x/week; $35 app + $125 reg + $150 course deposit per class',
  ARRAY[
    'Clear hybrid model with structured in-person classes and home-based continuation',
    'Strong academic and college-prep positioning',
    'Wide elective and enrichment offering: speech, STEM, Spanish, art, debate, summer camps',
    'Long operating history and visible leadership',
    'Detailed admissions and registration process'
  ],
  ARRAY[
    'Registration packets, deposits, and payment-plan instructions spread across pages — manual-heavy',
    'No published full tuition table — friction for prospects comparing options',
    'No explicit online enrollment portal or parent app visible',
    'Limited evidence of current third-party reviews outside owned testimonials'
  ],
  'Real hybrid homeschool center with multi-grade scheduling, parent communication needs, enrollment workflows, class registration, teacher coordination, calendars, and recurring family updates.',
  4, 'High model; Medium size', false, 'expanded'
),

(
  'south-oc-hybrid-homeschool',
  'South OC Hybrid Homeschool (SOCHH)', 'CA', 'Mission Viejo, CA', 'https://southochybridhomeschool.com',
  'Private nonprofit hybrid homeschool learning center — drop-off classes with 1–5 day options, parent partnership, and charter-vendor acceptance',
  '1st–8th grade; TK option available', 'Small-to-midsize nonprofit',
  '1–5 days/week; Mon Arts & Innovations; Tue–Thu CORE + extended care; Fri LEAPS; tuition not publicly posted',
  ARRAY[
    'Clear hybrid homeschool positioning for families wanting structure plus flexibility',
    'Small class sizes and individualized pacing',
    'Teacher-parent communication is explicitly emphasized',
    'Charter-vendor relationships may ease access for families',
    'Offers multiple program days and extended care options'
  ],
  ARRAY[
    'No visible formal tuition page or pricing matrix',
    'Admissions rely on email, packet, tour, and manual follow-up',
    'Campus address is not surfaced prominently',
    'No obvious integrated parent portal or modern enrollment workflow',
    'Limited public review volume makes trust-building harder'
  ],
  'Strong fit: real, small hybrid homeschool center with ongoing enrollment, multiple programs, class scheduling, parent communication, and curriculum coordination needs.',
  4, 'High model; Medium size', false, 'expanded'
),

(
  'courage-lab-academy',
  'Courage Lab Academy', 'CA', 'Whittier, CA', 'https://www.couragelab.academy',
  'Faith-integrated microschool blending homeschooling, private school, and innovative learning models — mastery-based, self-paced, multi-age, discussion/project-oriented',
  'K–5', 'Small; 12:1 student-guide ratio',
  'Tuition not publicly stated; schedule not stated; family-first flexibility emphasized',
  ARRAY[
    'Clear niche positioning as a faith-integrated microschool',
    'Strong messaging around mastery learning and individualized pacing',
    'Family-first flexibility that appeals to homeschool and hybrid families',
    'Small-class, relationship-centered model'
  ],
  ARRAY[
    'Tuition and day-to-day schedule not clearly published',
    'Limited evidence of mature enrollment infrastructure or public review footprint',
    'No obvious public-facing parent portal, class calendar, or communication tools visible',
    'If at founding-family stage, operations may still be manual and growth-constrained'
  ],
  'Strong fit: small, family-centered K–5 program with flexible scheduling, mastery-based learning, and recurring needs around parent communication, enrollment, and class management. Priority is moderate given likely early-stage operations.',
  4, 'Medium', false, 'expanded'
),

(
  'inner-fire-academy',
  'Inner Fire Academy', 'CA', 'San Francisco, CA', 'https://innerfiresf.com',
  'Teacher-owned, teacher-led microschool for gifted and neurodivergent learners',
  'K–5 (ages 5–12)', '8 students per class; 6:1 student-to-staff ratio',
  '$38,500 (K–2 full-time); $42,500 (3–5 full-time); $215/day part-time; billed monthly',
  ARRAY[
    'Highly personalized instruction with very small class sizes',
    'Clear niche serving gifted and neurodivergent learners',
    'Teacher-owned/teacher-led positioning',
    'Strong curriculum variety: individualized math, primary-source humanities, languages, science labs, coding, art, music, PE'
  ],
  ARRAY[
    'Website does not clearly publish a full street address',
    'Public reviews are sparse — limited trust signals',
    'Enrollment and availability appear tiny and likely managed manually',
    'Complex schedule mix across full-time, part-time, project time, recess, off-campus PE, and language choices'
  ],
  'Strong fit: tiny, high-touch private microschool with individualized learning, mixed scheduling, and part-time/full-time enrollment that needs structured parent communication, attendance/class management, and calendar coordination.',
  4, 'High classification; Medium location precision', false, 'expanded'
),

(
  'praxis-elite-sports-academy',
  'Praxis Elite Sports Academy Junior Prep', 'CA', 'San Diego, CA', 'https://www.praxiselite.com',
  'Hybrid-ish microschool for student-athletes — combines academics and athletics with part-time and full-time options, Friday recovery/personal development, and individualized curriculum',
  '7–8 (6th grade considered case-by-case)', 'Small; limited spots and small mixed-age groups',
  '5-day $21,500/year; 3-day $16,500/year; Enrichment Fri $750/month; Mon–Thu 9am–3:45pm',
  ARRAY[
    'Clear niche for student-athletes',
    'Strong operational clarity on schedule and admissions',
    'Visible tuition and program options',
    'Includes athletics, academics, and recovery/personal development'
  ],
  ARRAY[
    'Admissions is manual and high-touch (shadow day, essay, recommendation, interview)',
    'Heavy parent/staff coordination across schedules, curriculum choices, and enrichment options',
    'Small staff / year-to-year hiring based on enrollment suggests operational sensitivity',
    'Website and public footprint appear light for an education brand'
  ],
  'Strong fit: small private microschool with flexible schedules, individualized curriculum, and hands-on enrollment/communication needs. Aligns well with software for parent communication, class management, and calendar coordination.',
  4, 'Medium-High', false, 'expanded'
),

(
  'kings-academy-vineyard',
  'King''s Academy Vineyard — Laguna Niguel', 'CA', 'Laguna Niguel, CA', 'https://www.vineyardln.com/kings-academy',
  'Church-based homeschool ministry and hybrid drop-off program — parents are primary educators at home on non-campus days; staff teach on campus three days per week',
  'K–12', 'Small; avg class size of 16; likely under 100 students',
  'Tuition not listed; Tue–Thu 9am–3:30pm on campus; home learning Mon/Fri',
  ARRAY[
    'Small class sizes with personalized instruction',
    'Strong Christian/biblical identity',
    'Hybrid schedule that supports homeschooling families',
    'No parent participation required in core program',
    'Active with ongoing information meetings and enrollment activity'
  ],
  ARRAY[
    'Tuition not public',
    'Enrollment process appears manual and meeting-based',
    'Website is sparse on operational details',
    'No obvious modern parent communication portal or app visible',
    'Potentially ad hoc handling of calendars, updates, and home-day lesson plans'
  ],
  'Strong fit: small cohorts, recurring campus days, home-day lesson plans, parent coordination, enrollment/information-meeting workflows, and ongoing communication needs.',
  4, 'High active program; Medium size/tuition', false, 'expanded'
),

(
  'apogee-la',
  'Apogee LA Microschool', 'CA', 'Los Angeles, CA', 'https://apogeela.com',
  'Faith-based, values-driven microschool with project-based, student-led learning, mentorship, leadership development, movement/martial arts, and outdoor learning',
  'Not clearly stated', 'Small',
  'Not publicly listed; families schedule a tour for details',
  ARRAY[
    'Clear positioning as a faith-based, homeschool-friendly microschool',
    'Strong mission language around leadership, curiosity, and community',
    'Distinctive program hooks: project-based learning, martial arts, outdoor adventure, mentorship',
    'Appeals to families seeking an alternative to traditional schools'
  ],
  ARRAY[
    'Important details not public: tuition, grades served, calendar, exact schedule',
    'No clear social media presence surfaced in search results',
    'Website is mission-heavy but light on operational specifics for enrollment decisions',
    'Limited reputation evidence makes traction and trust signals hard to assess'
  ],
  'True microschool/homeschool-style alternative with a good fit for software that helps with parent communication, enrollment, class coordination, schedules, updates, and growth.',
  4, 'Medium', false, 'expanded'
),

(
  'acton-academy-placer',
  'Acton Academy Placer', 'CA', 'Roseville, CA', 'https://actonplacer.com',
  'Acton Academy learner-driven, multi-age, self-paced private school with a hybrid program option; part of the broader Acton Academy network',
  'TK–12 (Spark 4–7, Threshold 7–11, Discovery 11–14, Launchpad 14–18)', 'Small-to-medium (2–10 employees); additional campuses in Sacramento and Rocklin',
  '$11,500 TK–8; $13,500 9–12; 11-month calendar; Hybrid Program launching Fall 2025',
  ARRAY[
    'Clear niche positioning as a learner-driven Acton campus',
    'Multi-age studios and self-paced mastery',
    'Parent onboarding steps and auditions to fit families to the model',
    'Multiple campus references in Placer/Sacramento/Rocklin suggesting growth'
  ],
  ARRAY[
    'Heavy manual enrollment and onboarding with info sessions, calls, family meetups, and shadow days',
    'No published enrollment count, calendar detail, or deep operational FAQ',
    'Multi-campus structure creates coordination complexity across locations',
    'Reviews and outcomes not prominently published — trust-building harder'
  ],
  'Strong fit: parent info sessions, auditions, shadow days, multi-campus coordination, calendar flexibility, and ongoing parent communication all benefit from a centralized enrollment, scheduling, and communication hub.',
  5, 'High active private Acton campus; Medium size', false, 'expanded'
),

(
  'sonoma-earth-school',
  'Sonoma Earth School', 'CA', 'Forestville, CA', 'https://www.earthschool.org',
  'Nature-based, mixed-age, dual-language (Spanish/English), place-based experiential K–8 school with individualized academics',
  'K–8', '~29 students',
  'Tiered annual tuition by AGI: K $10,200–$15,000; 1st–8th $15,000–$21,000; monthly payment options; now enrolling 2025–26',
  ARRAY[
    'Clearly differentiated outdoor, nature-immersion program',
    'Small community with low teacher-student ratio',
    'Dual-language Spanish/English instruction',
    'Individualized academics and mixed-age learning',
    'Nonprofit scholarship/tiered tuition structure may improve accessibility'
  ],
  ARRAY[
    'Admissions flow appears manual: application, parent interview, and student visit',
    'No obvious evidence of integrated online enrollment, parent portal, or communications tooling',
    'Small team needs efficient systems for scheduling, updates, class coordination, and family communication',
    'Public social presence and recent review footprint were limited'
  ],
  'Strong fit: small private K–8 outdoor program with individualized learning, mixed-age groups, admissions steps, tiered tuition, and likely high-touch family communication needs.',
  4, 'High model; Medium social/reputation', false, 'expanded'
),

(
  'wild-hearts-adventure',
  'Wild Hearts Adventure Co.', 'CA', 'Visalia, CA', 'https://wildheartsadventure.co',
  'Self-directed, project-based, nature-based twice-weekly learning community; separate middle/high-school program called True North',
  'TK–12 (Wild Hearts TK–2nd; True North 6–12)', 'Small group; exact enrollment not stated',
  'Wild Hearts $350/month (twice weekly); True North $300/month (two days choice); charter enrichment funds accepted',
  ARRAY[
    'Clear microschool/homeschool-enrichment fit',
    'Multiple learning options and a small-group model',
    'Project-based and self-directed programming',
    'Charter enrichment funds accepted',
    'Outdoor/nature-based components and maker-space offerings'
  ],
  ARRAY[
    'Some family information is password-protected',
    'Website appears relatively simple and may rely on manual communication processes',
    'Multiple schedules/programs (Wild Hearts, True North, specialty) hard to coordinate without software',
    'No obvious public social proof or review volume on mainstream platforms'
  ],
  'Strong fit: small multi-program homeschool learning community with recurring schedules, enrollment/application fees, parent communication needs, and growth-oriented offerings.',
  4, 'High model; Medium size/social', false, 'expanded'
),

(
  'foothill-christian-academy',
  'Foothill Christian Academy', 'CA', 'Upland, CA', 'https://www.foothillchristianacademy.com',
  'Hybrid homeschool / Private School Satellite Program (PSP) with significant parent involvement; Mon/Fri at home, Tue/Wed on campus, Thu half-day on campus',
  'K–7 (TK–8 in practice)', 'Small; rolling admissions with limited class space',
  '$4,774/year + $50 application fee; Mon/Fri home, Tue/Wed campus, Thu half-day campus',
  ARRAY[
    'Clear Christian/hybrid value proposition for homeschool families',
    'Low tuition compared with many private schools',
    'Provides curriculum, teachers, and enrollment support',
    'Strong parent involvement and clear weekly structure'
  ],
  ARRAY[
    'Website and program pages appear marketing-heavy and may need stronger operational clarity',
    'Enrollment is application/tour-based rather than self-serve',
    'Social presence visible but not deeply integrated into operations',
    'Likely small school with admin workflows still handled manually'
  ],
  'Genuine hybrid Christian microschool-style program with parent-heavy operations, rolling enrollment, and multiple communication touchpoints that benefit from a centralized platform.',
  4, 'Medium-High', false, 'expanded'
),

(
  'the-lab-learning-space',
  'The Lab Learning Space', 'CA', 'Long Beach, CA', 'https://www.lablearning.org',
  'Hybrid homeschool learning center with mastery-based, project-based, personalized tutoring and enrichment — explicitly modeled on Khan Lab School concepts; serves homeschool/charter families',
  'K–8', 'Very small (2–10 employees)',
  'WOW! 2-day enrichment $2,000/semester; à la carte ~$1,000/semester; PE $200/month; 9am–3pm or 8:30am–5pm',
  ARRAY[
    'Personalized, mastery-based learning',
    'Project-based and collaborative instruction',
    'Homeschool support and charter vendor relationships',
    'Flexible scheduling with drop-in and multi-day options',
    'Small, community-oriented environment'
  ],
  ARRAY[
    'Outdated Wix-based website and some inconsistent domain/brand references',
    'Fragmented location/address signals across web listings',
    'Very small review footprint — reputation hard to assess',
    'Phone responsiveness and communication concerns mentioned in Yelp review',
    'Likely manual enrollment/scheduling workflows typical of small microschools'
  ],
  'Strong fit: serves small K–8 hybrid/homeschool population with flexible scheduling, enrollment, parent communication, class grouping, and charter-vendor coordination needs.',
  4, 'Medium-High', false, 'expanded'
),

(
  'outside-school',
  'Outside School', 'CA', 'Richmond, CA', 'https://www.teachoutside.org',
  '100% outdoor, mixed-age, tiny-group forest school for hybrid, homeschool, and independent-school families',
  'K–12 (ages 5–18)', 'Max 8 school-age children',
  'Tuition not publicly shown; Tue–Thu 9am–3pm',
  ARRAY[
    'Highly differentiated outdoor learning model',
    'Extremely small class size and mixed ages',
    'Clear fit for hybrid homeschool and flexible learners',
    'Strong nature-based, child-centered positioning'
  ],
  ARRAY[
    'Current active/closed status is inconsistent across pages on the site',
    'Likely manual operations: informal communication, private Google folder, weekly emails, no parent-teacher conferences',
    'Tiny capacity with limited room to scale',
    'Website content-heavy but operationally lightweight'
  ],
  'Fit depends on current active status — site shows some inconsistency. If active, small cohorts with informal communication, attendance records, and flexible scheduling could benefit from enrollment, parent communication, and calendar tooling.',
  3, 'Medium', false, 'expanded'
),

(
  'terra-marin-schools',
  'Terra Marin Schools / Terra Schools', 'CA', 'Mill Valley, CA', 'https://www.terraschools.org',
  'Nature-based, multilingual private school with Mandarin immersion preschool/TK, on-campus K–8, and a full-time outdoor micro-school component; Reggio Emilia-inspired',
  'Preschool – 8th grade', '~112 students',
  '~$36,975/year (Niche); rolling admissions; expanding one grade per year',
  ARRAY[
    'Strong nature-based / outdoor education identity',
    'Mandarin and Spanish immersion',
    'Small class sizes and individualized attention',
    'Multi-program offering across preschool, K–8, and camps',
    'Strong parent/community feel and enrichment offerings'
  ],
  ARRAY[
    'Public-facing information fragmented across multiple brand names and program pages',
    'Website emphasizes SF more than Mill Valley micro-school — can create confusion',
    'Enrollment spans preschool, K–8, camps, shuttles, aftercare, and outdoor excursions',
    '2024 eviction dispute suggests location instability or operational disruption'
  ],
  'Strong fit: manages multiple programs, rolling admissions, parent updates, calendars, outdoor schedules, aftercare, and significant coordination across families and staff.',
  4, 'Medium', false, 'expanded'
),

(
  'slo-classical-academy',
  'San Luis Obispo Classical Academy', 'CA', 'San Luis Obispo, CA', 'https://sloclassical.org',
  'Classical education school with full-time and two-day hybrid programs; not a pure microschool but has a homeschool-like hybrid component and parent-partner model',
  'Infant – 12th grade', '~372–406 students',
  'Five-day full-time, two-day hybrid, and Friday program options; tuition not clearly posted on homepage',
  ARRAY[
    'Strong classical curriculum and clear mission around character, wisdom, and lifelong learning',
    'Hybrid model that partners school and home',
    'Small class sizes and community feel',
    'Tech-light culture with structured, discussion-based learning',
    'Wide age range from infant care through high school'
  ],
  ARRAY[
    'Hybrid and parent-partner model creates coordination overhead for calendars, lesson plans, and updates',
    'Reviews suggest home-day workload is demanding for parents',
    'No obvious homepage tuition/pricing',
    'Multiple leased spaces and an upcoming campus move increase operational complexity'
  ],
  'Strong fit for communication, enrollment, class management, calendar, and family-update needs despite being larger than a typical microschool. Blended full/hybrid model and broad age span create the same pain points.',
  4, 'High', false, 'expanded'
),

(
  'adelphia-classical-christian',
  'Adelphia Classical Christian Academy', 'CA', 'Orange, CA', 'https://www.adelphiaclassical.com',
  '3-day on-campus, teacher-led hybrid/private school program with at-home work on two weekdays; fits a microschool/hybrid homeschool model more than a traditional school; PSP',
  'K–12', 'Small; class size normally limited to 16; some grades combined',
  'Three days on campus (Mon/Tue/Thu); at-home learning Wed and Fri; specific tuition amounts not visible in sources reviewed',
  ARRAY[
    'Clear hybrid model with defined 3-day campus schedule and home-day support',
    'Small classes (normally capped at 16) and combined grades when needed',
    'Classical Christian curriculum with accreditations (CLSA, WASC, UC a-g, NCAA)',
    'Explicit parent support structure with homework sheets and reduced parent teaching burden'
  ],
  ARRAY[
    'Website appears manual and information-dense rather than streamlined for enrollment/communications',
    'Openings/waitlists suggest enrollment management pressure',
    'Very limited public review footprint',
    'Hybrid model requires coordinated calendars, attendance, homework, and family communication across campus/home days'
  ],
  'Strong fit: runs a small, hybrid, parent-partnered program with recurring class scheduling, enrollment/waitlist management, calendar coordination, teacher updates, and home-day assignment communication.',
  4, 'High hybrid microschool-style; Medium tuition', false, 'expanded'
),

(
  'monarch-hills-education',
  'Monarch Hills Education', 'CA', 'San Luis Obispo, CA', 'https://www.monarchhills.org',
  'Nature-based outdoor enrichment and alternative education program — hybrid homeschool-style microschool serving homeschool families with full-time and part-time attendance options',
  'TK–6', 'Small; family-sized based on program format',
  '5-day $9,000/yr; 4-day $8,000/yr; 3-day $6,750/yr; 2-day $4,500/yr; 1-day $2,300/yr; Mon–Fri 8:30am–2:30pm; off-site adventure Fridays',
  ARRAY[
    'Clear niche positioning as a nature-based, outdoor, homeschool-friendly program',
    'Flexible full-time and part-time attendance options',
    'Defined school-year calendar and published tuition structure',
    'Adventure/off-site Fridays attract families seeking experiential learning'
  ],
  ARRAY[
    'No obvious public reviews or substantial reputation footprint',
    'Lightweight website may indicate limited digital ops maturity',
    'Off-site Fridays and multiple attendance plans create manual scheduling/communication complexity',
    'No clearly visible social presence found in search results'
  ],
  'Strong fit: hybrid attendance options, family enrollment flows, calendar-heavy programming, off-site adventure days, and needs for streamlined parent communication, class scheduling, attendance tracking, and growth-ready operations.',
  4, 'Medium-High', false, 'expanded'
),

(
  'blue-horizon-studio',
  'Blue Horizon Studio', 'CA', 'Lathrop, CA', 'https://www.bluehorizonstudio.org',
  'Boutique microschool with a studio/residency-style model — expert-led daytime academics, self-directed projects, and flexible attendance for homeschool/charter families',
  '3–8', 'Boutique cohort of 14',
  'Published tuition not found; flexible access 7am–6pm; soft start 7–9am; core focus 9am–12:30pm; studio time 2:30–6pm',
  ARRAY[
    'Clear niche boutique 3–8 microschool',
    'Flexible daytime coverage for working families',
    'Mastery-based learning and no homework',
    'Small cohort ensures high-touch communication and personalized support',
    'Explicitly welcomes homeschool and charter-funded families'
  ],
  ARRAY[
    'No published tuition on the website',
    'No clear physical street address found on the contact page',
    'No visible social media links on the contact page',
    'Very small cohort may create manual admin burden as they grow'
  ],
  'Strong fit: small, parent-facing, schedule-heavy program with needs around enrollment, family communication, calendars, class logistics, updates, and growth from a tiny cohort.',
  4, 'High real private microschool; Medium size/tuition', false, 'expanded'
),

(
  'integrity-christian-school',
  'Integrity Christian School PSP', 'CA', 'Anaheim, CA', 'https://www.integritychristianschool.org',
  'Hybrid homeschool community / PSP-style private school satellite program — two on-campus instruction days per week and three days at home',
  'K–12', '~137–160 students',
  'New student reg $250; returning $235; family tuition $375/yr; class-based $250–$425/class; Tue & Thu 9am–3pm/4pm on campus',
  ARRAY[
    'Clear hybrid homeschool structure with a consistent two-day in-person schedule',
    'Broad K–12 academic and enrichment offering: core subjects, STEM, art, music, choir, photography, dance, martial arts, ASB',
    'Transparent tuition/class-fee structure on the admissions page',
    'Uses Gradelink enrollment forms — some operational systems already in place'
  ],
  ARRAY[
    'Website text is somewhat fragmented — school model not described cleanly in one place',
    'Official pages do not clearly present a one-page overview of programs, ages, and daily flow',
    'Enrollment requires multiple steps and separate forms — manual coordination',
    'Communication likely split across email, forms, and class pages rather than a unified parent portal'
  ],
  'Strong fit: small private Christian hybrid learning community with part-time campus days, multi-age class scheduling, class registration, and parent coordination needs that benefit from a centralized platform.',
  4, 'High active; Medium size (third-party directories)', false, 'expanded'
)

on conflict (school_id) do nothing;
