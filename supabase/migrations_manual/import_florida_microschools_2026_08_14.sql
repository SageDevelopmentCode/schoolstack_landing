-- 2026-08-14: Import Florida microschools from florida_microschools.csv (47 new rows)
-- Skips 2 rows:
--   Spring River School (spring-river-school already in DB)
--   Cadence Academy at Beacon of Hope (Duplicate Check) — CSV-marked stub
-- Idempotent: ON CONFLICT (school_id) DO NOTHING

insert into public.schools (
  school_id,
  name,
  state,
  location,
  website,
  school_model,
  grades,
  estimated_size,
  tuition_schedule,
  strengths,
  pain_points,
  software_fit_reason,
  priority_score,
  confidence,
  is_closing,
  source_file,
  crm_status,
  contact_name,
  contact_email,
  contact_phone
) values

  ('acton-academy-palm-harbor', 'Acton Academy Palm Harbor', 'FL', 'Palm Harbor', 'https://palmharbor.actonacademy.org', 'Learner-Driven (Acton)', 'K-12', '~40-60', '$12,000/yr (2026-27)', ARRAY['Editor-pick standout, established Acton network, learner-driven self-paced model']::text[], ARRAY['Wide K-12 span likely strains manual admin/billing']::text[], 'Wide K-12 span in a self-directed model needs FieldBook''s flexible tuition/grade tools', 4, 'Medium', false, 'florida', 'not_contacted', '', '', ''),
  ('river-oak-academy', 'River Oak Academy', 'FL', 'St. Johns', '', 'Montessori/Acton blend', 'Toddler-12', '~40-60', 'Not published', ARRAY['Editor-pick standout, hybrid Montessori-Acton model, broad age span from toddler up']::text[], ARRAY['Toddler-12 span with blended pedagogy likely needs custom multi-age tracking']::text[], 'Blended-model, wide-age school needs flexible multi-age tuition/scheduling tools', 4, 'Low', false, 'florida', 'not_contacted', '', '', ''),
  ('colossal-academy', 'Colossal Academy', 'FL', 'Fort Lauderdale', 'https://colossal-academy.com', 'Project-Based', '6-10', 'Small', 'Not published', ARRAY['Editor-pick standout, real-world skills (surf/skate/cook), progressive project-based model']::text[], ARRAY['Non-traditional activity-based curriculum likely hard to schedule/bill manually']::text[], 'Activity-based curriculum needs flexible scheduling for surf/skate/cook electives', 4, 'Medium', false, 'florida', 'not_contacted', '', 'admin@colossal-academy.com', '754-444-9929'),
  ('tapestry-academy', 'Tapestry Academy', 'FL', 'Boca Raton', 'https://www.tapestryacademy.com', 'Microschool (Prenda-powered)', '3-12', 'Small', 'Not published', ARRAY['First Prenda microschool in Florida, established since 2021, homeschool/dayschool hybrid']::text[], ARRAY['Prenda-powered but full guide-network scaling likely needs dedicated site-level ops tools']::text[], 'Established Prenda pioneer needs dedicated tuition/enrollment beyond Prenda''s core network tools', 4, 'Medium', false, 'florida', 'not_contacted', '', 'hello@tapestryacademy.com', '561-287-6201'),
  ('bready-academy', 'BReady Academy', 'FL', 'Boca Raton', '', 'Microschool', 'Not specified', 'Small', 'Not published', ARRAY['Established Boca Raton microschool cluster presence']::text[], ARRAY['Small single-site likely manual admin']::text[], 'Low-friction SaaS adoption candidate with active phone/email contact', 3, 'Medium', false, 'florida', 'not_contacted', '', 'Breadylearning@gmail.com', '(954) 999-6204'),
  ('breadylearning', 'BReadyLearning', 'FL', 'Boca Raton', '', 'Microschool', 'Not specified', 'Small', 'Not published', ARRAY['Member of National Microschooling Center']::text[], ARRAY['Minimal public detail beyond directory listing']::text[], 'Needs foundational website + enrollment system', 3, 'Low', false, 'florida', 'not_contacted', '', '', ''),
  ('nova-leadership-academy', 'Nova Leadership Academy', 'FL', 'Boca Raton', '', 'Microschool', 'Not specified', 'Small', 'Not published', ARRAY['Leadership-focused branding differentiates from generic microschools']::text[], ARRAY['Small single-site likely manual admin']::text[], 'Leadership niche school needs tailored branding + enrollment tooling', 3, 'Low', false, 'florida', 'not_contacted', '', '', ''),
  ('salt-academy', 'SALT Academy', 'FL', 'Boca Raton', '', 'Microschool (faith-based)', 'Not specified', 'Small', 'Not published', ARRAY['Faith-integrated positioning (''salt and light'')']::text[], ARRAY['Small faith program likely manual admin']::text[], 'Faith-based niche school is a good vertical fit for FieldBook', 3, 'Low', false, 'florida', 'not_contacted', '', '', ''),
  ('down-to-earth-homeschool', 'Down to Earth Homeschool', 'FL', 'Boca Raton', '', 'Homeschool Co-op (nature)', 'Not specified', 'Small', 'Not published', ARRAY['Nature-based co-op — philosophical overlap with Sage Field']::text[], ARRAY['Co-op structure with shared teaching likely lacks central software']::text[], 'Nature-based co-op needs shared scheduling/billing across multiple teaching families', 4, 'Low', false, 'florida', 'not_contacted', '', '', ''),
  ('oakridge-academy', 'Oakridge Academy', 'FL', 'Boca Raton', '', 'Microschool', 'Not specified', 'Small', 'Not published', ARRAY['Established Boca Raton cluster presence']::text[], ARRAY['Small single-site likely manual admin']::text[], 'Low-friction SaaS adoption candidate', 3, 'Low', false, 'florida', 'not_contacted', '', '', ''),
  ('astrolabe-academy', 'Astrolabe Academy', 'FL', 'Statewide (online + Boca Raton hub)', '', 'Microschool (online programs)', 'Not specified', 'Small', 'Not published', ARRAY['Online program option, established contact info']::text[], ARRAY['Online delivery needs digital-first enrollment/records']::text[], 'Online model needs strong digital enrollment/records backbone', 3, 'Medium', false, 'florida', 'not_contacted', 'T. Travers', 'ttravers@astrolabeacademy.com', '505-926-4666'),
  ('brave-generation-academy-south-florida', 'Brave Generation Academy (South Florida)', 'FL', 'Boca Raton', '', 'Microschool (hybrid/online network)', 'Not specified', 'Small-Medium', 'Not published', ARRAY['Multi-format (homeschool, hybrid, online) network presence']::text[], ARRAY['Multi-format delivery likely needs flexible cross-format scheduling']::text[], 'Multi-format delivery model needs flexible scheduling across homeschool/hybrid/online tracks', 4, 'Medium', false, 'florida', 'not_contacted', '', 'bear@bravegenerationacademy.com', '561-271-9783'),
  ('compass-outreach-and-education-center', 'Compass Outreach and Education Center', 'FL', 'South Florida', '', 'Microschool', 'Not specified', 'Small', 'Not published', ARRAY['Established contact and outreach-focused positioning']::text[], ARRAY['Small single-site likely manual admin']::text[], 'Low-friction SaaS adoption candidate with active phone/email contact', 3, 'Medium', false, 'florida', 'not_contacted', 'Laurel Suarez', 'laurel.suarez@mycompassoutreach.org', '954-309-0109'),
  ('flex-learning-academy', 'Flex Learning Academy', 'FL', 'Southwest Ranches', '', 'Microschool', 'Not specified', 'Small', 'Not published', ARRAY['Established single-site program with public contact']::text[], ARRAY['Small single-site likely manual admin']::text[], 'Low-friction SaaS adoption candidate with active phone/email contact', 3, 'Medium', false, 'florida', 'not_contacted', 'Susan', 'susan@educationalpursuit.net', '954-652-0220'),
  ('florida-citizens-alliance-microschool-network', 'Florida Citizens Alliance Microschool Network', 'FL', 'Statewide', '', 'Microschool network/advocacy', 'Not specified', 'Multiple sites', 'Not published', ARRAY['Statewide advocacy + network reach for ESA-funded microschools']::text[], ARRAY['Network model likely lacks unified cross-site software']::text[], 'Statewide network needs centralized enrollment/tuition backbone across affiliated schools', 3, 'Medium', false, 'florida', 'not_contacted', 'Christy', 'christy@goflca.org', '239-671-5694'),
  ('peninsular-prep-formerly-south-tampa-microschool', 'Peninsular Prep (formerly South Tampa Microschool)', 'FL', 'Tampa', '', 'Microschool', 'K-8', 'Small', 'Not published', ARRAY['Established brand, rebrand shows growth trajectory, clear phone contact']::text[], ARRAY['Rebranding/growth phase likely needs scalable ops software']::text[], 'Growth-phase rebrand is a good time to introduce scalable enrollment/tuition SaaS', 4, 'Medium', false, 'florida', 'not_contacted', '', '', '813-512-2924'),
  ('the-homeschool-village-at-little-sprigs-of-tampa', 'The Homeschool Village at Little Sprigs of Tampa', 'FL', 'Tampa', '', 'Homeschool Co-op (nature/outdoor)', 'Not specified', 'Small', 'Not published', ARRAY['Outdoor/nature meetup-based model — strong philosophical overlap with Sage Field']::text[], ARRAY['Outdoor meetup format with variable locations likely hard to manage manually']::text[], 'Direct outdoor-education philosophical match — ideal MudKitchen prospect', 5, 'Low', false, 'florida', 'not_contacted', '', '', ''),
  ('apogee-strong-orlando', 'Apogee Strong - Orlando', 'FL', 'Orlando', 'https://apogeeschools.com', 'Microschool (leadership/hybrid)', 'K-8', 'Small', 'Not published', ARRAY['Full-time, half-day, and ''Homeschool Friday'' flexible options, leadership/character focus']::text[], ARRAY['Multiple schedule tiers (full/half/Friday-only) likely complex to manage manually']::text[], 'Multi-tier flexible schedule (full/half/Friday) needs FieldBook''s flexible scheduling engine', 4, 'Medium', false, 'florida', 'not_contacted', '', '', '407-799-9442'),
  ('kaipod-learning-winter-garden', 'KaiPod Learning - Winter Garden', 'FL', 'Winter Garden', 'https://kaipodlearning.com', 'Hybrid Academy', '3-12', 'Small', 'Not published', ARRAY['In-person hybrid pod, flexible part/full-time, personalized coaching']::text[], ARRAY['Hybrid part/full-time scheduling is operationally complex']::text[], 'Hybrid flexible schedule complexity is a strong fit for FieldBook''s scheduling tools', 4, 'Medium', false, 'florida', 'not_contacted', '', '', '781-730-7683'),
  ('kind-academy', 'Kind Academy', 'FL', 'Coral Springs', '', 'Microschool', 'Not specified', 'Small', 'Not published', ARRAY['Established single-site program with public contact']::text[], ARRAY['Small single-site likely manual admin']::text[], 'Low-friction SaaS adoption candidate with active phone/email contact', 3, 'Medium', false, 'florida', 'not_contacted', '', '', '754-204-8310'),
  ('camp-lingua-lingua-academy-microschool', 'Camp Lingua – Lingua Academy Microschool', 'FL', 'Southwest Ranches', '', 'Microschool (mixed-age, language immersion)', 'Not specified', 'Small', 'Not published', ARRAY['Language immersion niche, mixed-age grouping']::text[], ARRAY['Mixed-age + immersion curriculum likely needs custom progress tracking']::text[], 'Language-immersion niche needs specialized curriculum/progress tracking beyond standard SIS', 3, 'Medium', false, 'florida', 'not_contacted', '', '', '954-642-2267'),
  ('learning-cove-academy', 'Learning Cove Academy', 'FL', 'Miami', '', 'Microschool (Christian)', 'PreK-7', 'Small', 'Not published', ARRAY['Faith-based, multi-age, traditional calendar, clear phone contact']::text[], ARRAY['Small faith program likely manual admin']::text[], 'Early-elementary faith school is a strong onboarding-friendly customer', 3, 'Medium', false, 'florida', 'not_contacted', '', '', '786-321-5683'),
  ('primer-microschools-kendall', 'Primer Microschools - Kendall', 'FL', 'Miami', 'https://primer.com', 'Microschool (Primer network)', 'K-8', 'Small', 'Not published', ARRAY['Mastery-based academics, project-based ''quests'', backed by Primer''s national platform']::text[], ARRAY['Network already provides guide-level tools; harder sell at school level']::text[], 'Primer network schools may already have proprietary tools — lower priority, but site-level gaps may remain', 2, 'Medium', false, 'florida', 'not_contacted', '', '', '786-791-4769'),
  ('primer-microschools-coconut-grove', 'Primer Microschools - Coconut Grove', 'FL', 'Coral Gables', 'https://primer.com', 'Microschool (Primer network)', 'K-8', 'Small', 'Not published', ARRAY['Mastery-based, multi-campus Miami-Dade presence']::text[], ARRAY['Multi-campus network likely already has centralized Primer tools']::text[], 'Multi-campus Primer network - lower priority given existing network software', 2, 'Medium', false, 'florida', 'not_contacted', '', '', '786-791-4769'),
  ('primer-microschools-liberty-city', 'Primer Microschools - Liberty City', 'FL', 'Miami', 'https://primer.com', 'Microschool (Primer network)', 'K-8', 'Small', 'Not published', ARRAY['Mastery-based, community-focused Miami-Dade campus']::text[], ARRAY['Multi-campus network likely already has centralized Primer tools']::text[], 'Multi-campus Primer network - lower priority given existing network software', 2, 'Medium', false, 'florida', 'not_contacted', '', '', '786-791-4769'),
  ('primer-microschools-miami-health-district', 'Primer Microschools - Miami Health District', 'FL', 'Miami', 'https://primer.com', 'Microschool (Primer network)', 'K-8', 'Small', 'Not published', ARRAY['Mastery-based, urban Miami campus']::text[], ARRAY['Multi-campus network likely already has centralized Primer tools']::text[], 'Multi-campus Primer network - lower priority given existing network software', 2, 'Medium', false, 'florida', 'not_contacted', '', '', '786-791-4769'),
  ('primer-microschools-miami-shores', 'Primer Microschools - Miami Shores', 'FL', 'Miami Shores', 'https://primer.com', 'Microschool (Primer network)', 'K-8', 'Small', 'Not published', ARRAY['Mastery-based, growing Miami-Dade footprint (5 campuses)']::text[], ARRAY['5-campus network likely already has centralized Primer tools']::text[], '5-campus Primer network - lower priority given existing network software, but could be a large logo if switched', 2, 'Medium', false, 'florida', 'not_contacted', '', '', '786-791-4769'),
  ('naples-microschools-selah-s-farmhouse', 'Naples MicroSchools (Selah''s Farmhouse)', 'FL', 'Naples (Golden Gate Estates)', '', 'Microschool (nature/farm)', 'Not specified', 'Small', 'Not published', ARRAY['Farm-based, nature-immersive programs (NatureQuest, CoreQuest) — direct philosophical overlap with Sage Field']::text[], ARRAY['Multiple program tiers on a working farm likely complex to schedule/bill manually']::text[], 'Direct outdoor/farm-based philosophical match — ideal MudKitchen prospect, multi-tier scheduling need', 5, 'Medium', false, 'florida', 'not_contacted', '', '', '888-658-4763'),
  ('mangrove-academy', 'Mangrove Academy', 'FL', 'Naples (Golden Gate Estates)', '', 'Microschool (KaiPod partner)', 'K-5', 'Small', 'Not published', ARRAY['Flexible plans, KaiPod partner network credibility']::text[], ARRAY['Small single-site likely manual admin']::text[], 'Low-friction SaaS adoption candidate, KaiPod-partner referral potential', 3, 'Low', false, 'florida', 'not_contacted', '', '', ''),
  ('community-leadership-academy-cla-hybrid', 'Community Leadership Academy (CLA) - Hybrid', 'FL', 'Tallahassee', '', 'Hybrid Academy', 'Elementary-Middle', 'Small', 'Not published', ARRAY['Formal hybrid model combining classroom + at-home days']::text[], ARRAY['Hybrid schedule complexity likely managed manually']::text[], 'Hybrid classroom+at-home model is a strong fit for FieldBook''s flexible scheduling', 3, 'Medium', false, 'florida', 'not_contacted', '', '', '850-851-1779'),
  ('our-homeroom-jax-inc', 'Our Homeroom Jax, Inc.', 'FL', 'Jacksonville', '', 'Microschool', 'K-5', 'Small', 'Not published', ARRAY['Daily drop-off structure with standard school-day hours (9-2), multi-age small groups']::text[], ARRAY['Small single-site likely manual admin despite structured hours']::text[], 'Structured-hours drop-off model needs streamlined daily attendance/billing tools', 3, 'Medium', false, 'florida', 'not_contacted', '', '', ''),
  ('steps-learning-center', 'Steps Learning Center', 'FL', 'Orlando', '', 'Microschool (neurodiverse focus)', 'K-8', 'Small', 'Not published', ARRAY['Neuro-affirming model for moderate-to-significant support needs']::text[], ARRAY['Specialized needs tracking likely manual/paper-based']::text[], 'Neurodiverse-focused school needs individualized progress/IEP-style tracking', 4, 'Low', false, 'florida', 'not_contacted', '', '', ''),
  ('purpose-prep-academy', 'Purpose Prep Academy', 'FL', 'Orlando', '', 'Microschool (STEAM)', 'K-8', 'Small', 'Not published', ARRAY['Personalized STEAM education, purpose-driven framing']::text[], ARRAY['Small single-site likely manual admin']::text[], 'STEAM-focused school is strong candidate for progress/portfolio tracking tools', 3, 'Low', false, 'florida', 'not_contacted', '', '', ''),
  ('star-lab', 'Star Lab', 'FL', 'Orlando', '', 'Microschool', 'Elementary', 'Small', 'Not published', ARRAY['Personalized pace instruction for elementary students']::text[], ARRAY['Small single-site likely manual admin']::text[], 'Elementary personalized-pace program benefits from FieldBook''s tuition/schedule tools', 3, 'Low', false, 'florida', 'not_contacted', '', '', ''),
  ('ocala-s-first-microschool', 'Ocala''s First Microschool', 'FL', 'Ocala', '', 'Microschool', '1-9', 'Small', 'Not published', ARRAY['Part/full-time programs, one-on-one instruction, first-mover in local market']::text[], ARRAY['Wide 1-9 span with part/full-time options likely complex to schedule manually']::text[], 'First-mover market position + flexible scheduling need is a strong FieldBook fit', 4, 'Low', false, 'florida', 'not_contacted', '', '', ''),
  ('beacon-of-hope-academy', 'Beacon of Hope Academy', 'FL', 'Florida (KaiPod partner)', '', 'Microschool (faith-based, special needs)', 'K-5', 'Small', 'Not published', ARRAY['Faith-based, specialized education for students with additional needs']::text[], ARRAY['Specialized needs tracking likely manual/paper-based']::text[], 'Faith-based special-needs program needs individualized progress tracking', 4, 'Low', false, 'florida', 'not_contacted', '', '', ''),
  ('rise-learning-studio', 'RISE Learning Studio', 'FL', 'Florida (KaiPod partner)', '', 'Microschool', 'K-12', 'Small', 'Not published', ARRAY['Personalized, hands-on approach across a wide K-12 span']::text[], ARRAY['Wide K-12 span in one small program strains manual admin']::text[], 'Wide K-12 span in a small program is ideal for FieldBook''s grade/tuition management', 4, 'Low', false, 'florida', 'not_contacted', '', '', ''),
  ('uncharted-academy', 'Uncharted Academy', 'FL', 'Florida (KaiPod partner)', '', 'Microschool/Tutoring Center (nonprofit)', 'K-12', 'Small', 'Not published', ARRAY['Nonprofit hub combining microschool, tutoring, and home education resources']::text[], ARRAY['Multi-service nonprofit hub likely needs multi-program tracking']::text[], 'Multi-service nonprofit hub needs unified tracking across microschool + tutoring + resource programs', 3, 'Low', false, 'florida', 'not_contacted', '', '', ''),
  ('south-tampa-microschool', 'South Tampa Microschool', 'FL', 'Tampa', '', 'Microschool', 'Not specified', 'Small', 'Not published', ARRAY['Community-partnership mission, engaging approach to learning']::text[], ARRAY['Small single-site likely manual admin']::text[], 'Community-focused school is a strong onboarding-friendly customer', 3, 'Low', false, 'florida', 'not_contacted', '', '', ''),
  ('wisdom-warehouse', 'Wisdom Warehouse', 'FL', 'Florida (KaiPod partner)', '', 'Microschool', 'Not specified', 'Small', 'Not published', ARRAY['Part/full-time individualized programs, skills-and-standards focus']::text[], ARRAY['Small single-site likely manual admin']::text[], 'Individualized-program school benefits from flexible tuition/schedule tools', 3, 'Low', false, 'florida', 'not_contacted', '', '', ''),
  ('claypool-creek', 'Claypool Creek', 'FL', 'Florida (Partner Microschool)', '', 'Microschool', 'Not specified', 'Small', 'Not published', ARRAY['KaiPod partner network credibility']::text[], ARRAY['Minimal public detail beyond directory listing']::text[], 'Needs foundational website + enrollment system', 3, 'Low', false, 'florida', 'not_contacted', '', '', ''),
  ('ember-academy', 'Ember Academy', 'FL', 'Florida (Partner Microschool)', '', 'Microschool', 'Not specified', 'Small', 'Not published', ARRAY['KaiPod partner network credibility']::text[], ARRAY['Minimal public detail beyond directory listing']::text[], 'Needs foundational website + enrollment system', 3, 'Low', false, 'florida', 'not_contacted', '', '', ''),
  ('everroot-academy', 'EverRoot Academy', 'FL', 'Florida (Partner Microschool)', '', 'Microschool', 'Not specified', 'Small', 'Not published', ARRAY['KaiPod partner network credibility, nature-themed name suggests outdoor overlap']::text[], ARRAY['Minimal public detail beyond directory listing']::text[], 'Nature-themed branding overlaps with Sage Field''s outdoor philosophy', 4, 'Low', false, 'florida', 'not_contacted', '', '', ''),
  ('1251-learning-essentials-academy', '1251 Learning Essentials Academy', 'FL', 'Florida (KaiPod partner)', '', 'Microschool', 'Not specified', 'Small', 'Not published', ARRAY['KaiPod partner network credibility']::text[], ARRAY['Minimal public detail beyond directory listing']::text[], 'Needs foundational website + enrollment system', 3, 'Low', false, 'florida', 'not_contacted', '', '', ''),
  ('explora', 'Explora', 'FL', 'Florida (KaiPod partner)', '', 'Microschool', 'Not specified', 'Small', 'Not published', ARRAY['KaiPod partner network credibility']::text[], ARRAY['Minimal public detail beyond directory listing']::text[], 'Needs foundational website + enrollment system', 3, 'Low', false, 'florida', 'not_contacted', '', '', ''),
  ('challenger-learning-center-homeschool-days', 'Challenger Learning Center - Homeschool Days', 'FL', 'Tallahassee', '', 'Enrichment Program (STEM)', 'Elementary-Middle', 'Small', 'Not published', ARRAY['Half-day, inquiry-based STEM/engineering enrichment for homeschoolers']::text[], ARRAY['Enrichment-only model, likely add-on scheduling needs']::text[], 'STEM enrichment add-on program could integrate with FieldBook''s scheduling for hybrid families', 2, 'Low', false, 'florida', 'not_contacted', '', '', ''),
  ('ignite-academy-microschool', 'Ignite Academy Microschool', 'FL', 'Florida (Prenda network)', 'https://microschools.prenda.com/ms/Igniteacademyfl', 'Microschool (Prenda network)', 'K-8', 'Small', 'Not published', ARRAY['Prenda-network backed, active for 2026-27 school year']::text[], ARRAY['Prenda tools may not cover full school-level ops (tuition, site, apps)']::text[], 'Prenda-affiliated school could still need dedicated site/tuition/app management', 3, 'Low', false, 'florida', 'not_contacted', '', '', '')

on conflict (school_id) do nothing;

-- Verification (run after import)
-- Expect 47 rows for the imported Florida batch.
select count(*) as florida_import_count
from public.schools
where source_file = 'florida'
  and school_id in (
    'acton-academy-palm-harbor',
    'river-oak-academy',
    'colossal-academy',
    'tapestry-academy',
    'bready-academy',
    'breadylearning',
    'nova-leadership-academy',
    'salt-academy',
    'down-to-earth-homeschool',
    'oakridge-academy',
    'astrolabe-academy',
    'brave-generation-academy-south-florida',
    'compass-outreach-and-education-center',
    'flex-learning-academy',
    'florida-citizens-alliance-microschool-network',
    'peninsular-prep-formerly-south-tampa-microschool',
    'the-homeschool-village-at-little-sprigs-of-tampa',
    'apogee-strong-orlando',
    'kaipod-learning-winter-garden',
    'kind-academy',
    'camp-lingua-lingua-academy-microschool',
    'learning-cove-academy',
    'primer-microschools-kendall',
    'primer-microschools-coconut-grove',
    'primer-microschools-liberty-city',
    'primer-microschools-miami-health-district',
    'primer-microschools-miami-shores',
    'naples-microschools-selah-s-farmhouse',
    'mangrove-academy',
    'community-leadership-academy-cla-hybrid',
    'our-homeroom-jax-inc',
    'steps-learning-center',
    'purpose-prep-academy',
    'star-lab',
    'ocala-s-first-microschool',
    'beacon-of-hope-academy',
    'rise-learning-studio',
    'uncharted-academy',
    'south-tampa-microschool',
    'wisdom-warehouse',
    'claypool-creek',
    'ember-academy',
    'everroot-academy',
    '1251-learning-essentials-academy',
    'explora',
    'challenger-learning-center-homeschool-days',
    'ignite-academy-microschool'
  );

-- Confirm skipped duplicate still exists (should return 1 row)
select school_id, name
from public.schools
where school_id = 'spring-river-school';

