-- 2026-08-14: Import Tennessee microschools from tennessee_microschools.csv (34 new rows)
-- Skips 1 school already in public.schools:
--   Hilton Horizons Academy (hilton-horizons-academy)
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

  ('magnolia-concepts', 'Magnolia Concepts', 'TN', 'Knoxville', 'https://www.magnoliaconcepts.com', 'Project-Based', 'Not specified', 'Small', 'Not published', ARRAY['Established Knoxville project-based program, nurturing/meaningful alternative to traditional classrooms']::text[], ARRAY['Small single-site likely manual admin']::text[], 'Low-friction SaaS adoption candidate — established local reputation', 3, 'Medium', false, 'tennessee', 'not_contacted', '', '', ''),
  ('the-lion-mountain-academy', 'The Lion Mountain Academy', 'TN', 'Knoxville', '', 'Microschool', '6th grade', 'Small', 'Not published', ARRAY['Focused single-grade (6th) academy model']::text[], ARRAY['Narrow single-grade focus likely has limited admin complexity but still manual']::text[], 'Single-grade niche school benefits from streamlined enrollment/tuition tools', 3, 'Low', false, 'tennessee', 'not_contacted', '', '', ''),
  ('sailaway-learning-and-academy', 'SailAway Learning and Academy', 'TN', 'Knoxville', 'https://www.sailawaylearning.com', 'Microschool (alternative/re-engagement)', 'Not specified', 'Small', 'Not published', ARRAY['Mission-driven, serves students who lost hope/underachieved in traditional settings, renewal-focused']::text[], ARRAY['Alternative/re-engagement model likely needs individualized progress tracking, not standard SIS']::text[], 'Alternative re-engagement model needs flexible, individualized progress & billing tracking', 4, 'Medium', false, 'tennessee', 'not_contacted', '', '', ''),
  ('amma-mountain-academy', 'Amma Mountain Academy', 'TN', 'Johnson City', '', 'Microschool', 'Not specified', 'Small', 'Not published', ARRAY['Nature-adjacent branding (mountain) — possible philosophical overlap with Sage Field']::text[], ARRAY['Small single-site likely manual admin']::text[], 'Mountain/nature-themed branding may overlap with Sage Field''s outdoor philosophy', 4, 'Low', false, 'tennessee', 'not_contacted', '', '', ''),
  ('arbor-learning-lab', 'Arbor Learning Lab', 'TN', 'Johnson City', '', 'Microschool', 'Not specified', 'Small', 'Not published', ARRAY['Nature-themed branding (arbor) — possible philosophical overlap with Sage Field']::text[], ARRAY['Small single-site likely manual admin']::text[], 'Nature-themed branding may overlap with Sage Field''s outdoor philosophy', 3, 'Low', false, 'tennessee', 'not_contacted', '', '', ''),
  ('change-makers-academy', 'Change Makers Academy', 'TN', 'Nashville', 'https://microschool.directory/microschools/tennessee/nashville/change-makers-academy/', 'Microschool', 'Not specified', 'Small', 'Not published', ARRAY['Mission-driven branding, established Nashville presence']::text[], ARRAY['Small single-site likely manual admin']::text[], 'Low-friction SaaS adoption candidate', 3, 'Low', false, 'tennessee', 'not_contacted', '', '', ''),
  ('sage-montessori-school-of-nashville', 'Sage Montessori School of Nashville', 'TN', 'Nashville', '', 'Montessori', 'Not specified', 'Small', 'Not published', ARRAY['Montessori credibility, name overlap (''Sage'') with Sage Field''s own brand — notable for relationship-building']::text[], ARRAY['Small single-site likely manual admin']::text[], 'Shared ''Sage'' branding could be a natural conversation starter for outreach', 4, 'Low', false, 'tennessee', 'not_contacted', '', '', ''),
  ('dream-builders-learning-center', 'Dream Builders Learning Center', 'TN', 'Nashville', '', 'Microschool', 'Not specified', 'Small', 'Not published', ARRAY['Established Nashville presence, aspirational branding']::text[], ARRAY['Small single-site likely manual admin']::text[], 'Low-friction SaaS adoption candidate', 3, 'Low', false, 'tennessee', 'not_contacted', '', '', ''),
  ('alma-learning-lab', 'Alma Learning Lab', 'TN', 'Williamson County', '', 'Microschool', 'Not specified', 'Small', 'Not published', ARRAY['Established Williamson County (affluent Nashville suburb) presence']::text[], ARRAY['Small single-site likely manual admin']::text[], 'Affluent suburban market with tech-savvy families is a strong early-adopter candidate', 3, 'Low', false, 'tennessee', 'not_contacted', '', '', ''),
  ('waypoint-academy-an-acton-academy', 'Waypoint Academy: An Acton Academy', 'TN', 'Franklin', '', 'Learner-Driven (Acton)', 'Not specified', 'Small', 'Not published', ARRAY['Acton network credibility, affluent Franklin/Williamson County market']::text[], ARRAY['Unclaimed listing, manual ops typical of Acton studios']::text[], 'Affluent market Acton studio is a strong expansion target', 3, 'Low', false, 'tennessee', 'not_contacted', '', '', ''),
  ('friendship-academy', 'Friendship Academy', 'TN', 'Columbia', '', 'Microschool', 'Not specified', 'Small', 'Not published', ARRAY['Established Maury County presence']::text[], ARRAY['Rural/exurban market likely lean staff, manual admin']::text[], 'Rural lean-team school is a strong candidate for affordable all-in-one SaaS', 3, 'Low', false, 'tennessee', 'not_contacted', '', '', ''),
  ('acton-tristar-academy', 'Acton Tristar Academy', 'TN', 'Spring Hill', 'https://microschool.directory/microschools/tennessee/spring-hill/acton-tristar-academy/', 'Learner-Driven (Acton)', 'Not specified', 'Small', 'Not published', ARRAY['Acton network credibility, unclaimed but publicly listed']::text[], ARRAY['Unclaimed listing, manual ops typical of Acton studios']::text[], 'Growing Spring Hill suburb is a good expansion target for Acton-model schools', 3, 'Low', false, 'tennessee', 'not_contacted', '', '', ''),
  ('the-focus-academy', 'The FOCUS Academy', 'TN', 'Memphis', '', 'Microschool (twice-exceptional/gifted)', '6-8 (boys)', 'Small', 'Not published', ARRAY['Specializes in twice-exceptional (gifted + learning difference) boys, single-gender niche']::text[], ARRAY['Highly specialized needs tracking likely manual/paper-based, no standard SIS fits well']::text[], 'Twice-exceptional specialized niche needs individualized progress/IEP-style tracking tools', 5, 'Medium', false, 'tennessee', 'not_contacted', '', '', ''),
  ('me-institute', 'ME Institute', 'TN', 'Memphis', '', 'Microschool (career-driven)', 'K-7', 'Small', 'Not published', ARRAY['Career-driven, student-centered programming across a wide K-7 span']::text[], ARRAY['Wide K-7 span with career-focus electives likely complex to schedule manually']::text[], 'Career-driven wide-span program needs flexible course & tuition tracking', 4, 'Low', false, 'tennessee', 'not_contacted', '', '', ''),
  ('the-lab-school-of-memphis', 'The Lab School of Memphis', 'TN', 'Memphis', 'https://thelabschoolofmemphis.com', 'Microschool (multi-age studios)', 'JK3-8 (ages 3-13)', 'Small', 'Not published', ARRAY['Innovative multi-age studio model fostering leadership/empathy, established address (1738 Galloway Ave)']::text[], ARRAY['Wide JK3-8 span with multi-age studios likely strains manual admin/billing']::text[], 'Wide-span multi-age studio model needs FieldBook''s flexible grade/tuition management', 4, 'Medium', false, 'tennessee', 'not_contacted', '', '', ''),
  ('memphis-microschool-4th-listing', 'Memphis Microschool (4th listing)', 'TN', 'Memphis', '', 'Microschool', 'Not specified', 'Small', 'Not published', ARRAY['Part of Memphis''s growing microschool cluster (4 total per directory)']::text[], ARRAY['Limited public detail available for this specific listing']::text[], 'Needs direct verification and foundational website/enrollment tooling', 2, 'Low', false, 'tennessee', 'not_contacted', '', '', ''),
  ('bartlett-discovery-academy', 'Bartlett Discovery Academy', 'TN', 'Bartlett', '', 'Microschool', 'Not specified', 'Small', 'Not published', ARRAY['Established single-site Memphis-suburb presence']::text[], ARRAY['Small single-site likely manual admin']::text[], 'Low-friction SaaS adoption candidate', 3, 'Low', false, 'tennessee', 'not_contacted', '', '', ''),
  ('collierville-community-microschool', 'Collierville Community Microschool', 'TN', 'Collierville', '', 'Microschool', 'Not specified', 'Small', 'Not published', ARRAY['Established single-site Memphis-suburb presence, affluent market']::text[], ARRAY['Small single-site likely manual admin']::text[], 'Affluent suburban market is a strong early-adopter candidate', 3, 'Low', false, 'tennessee', 'not_contacted', '', '', ''),
  ('murfreesboro-microschool-1-of-2', 'Murfreesboro Microschool (1 of 2)', 'TN', 'Murfreesboro', '', 'Microschool', 'Not specified', 'Small', 'Not published', ARRAY['Established presence in growing Nashville-adjacent suburb']::text[], ARRAY['Small single-site likely manual admin']::text[], 'Growing suburban market is a good expansion target', 3, 'Low', false, 'tennessee', 'not_contacted', '', '', ''),
  ('murfreesboro-microschool-2-of-2', 'Murfreesboro Microschool (2 of 2)', 'TN', 'Murfreesboro', '', 'Microschool', 'Not specified', 'Small', 'Not published', ARRAY['Established presence in growing Nashville-adjacent suburb']::text[], ARRAY['Small single-site likely manual admin']::text[], 'Growing suburban market is a good expansion target', 3, 'Low', false, 'tennessee', 'not_contacted', '', '', ''),
  ('athens-community-microschool', 'Athens Community Microschool', 'TN', 'Athens', '', 'Microschool', 'Not specified', 'Small', 'Not published', ARRAY['Established single-site East Tennessee presence, underserved market']::text[], ARRAY['Rural market likely lean staff, manual admin']::text[], 'Rural lean-team school is a strong candidate for affordable all-in-one SaaS', 3, 'Low', false, 'tennessee', 'not_contacted', '', '', ''),
  ('chattanooga-discovery-school', 'Chattanooga Discovery School', 'TN', 'Chattanooga', '', 'Microschool', 'Not specified', 'Small', 'Not published', ARRAY['Established single-site presence in growing Chattanooga market']::text[], ARRAY['Small single-site likely manual admin']::text[], 'Low-friction SaaS adoption candidate', 3, 'Low', false, 'tennessee', 'not_contacted', '', '', ''),
  ('clarksville-community-academy', 'Clarksville Community Academy', 'TN', 'Clarksville', '', 'Microschool', 'Not specified', 'Small', 'Not published', ARRAY['Established single-site Fort Campbell-adjacent (military family) market']::text[], ARRAY['Military-family transient population likely needs flexible enrollment/withdrawal tracking']::text[], 'Military-adjacent market with transient families needs flexible enrollment/withdrawal tools', 4, 'Low', false, 'tennessee', 'not_contacted', '', '', ''),
  ('cleveland-heritage-microschool', 'Cleveland Heritage Microschool', 'TN', 'Cleveland', '', 'Microschool', 'Not specified', 'Small', 'Not published', ARRAY['Established single-site East Tennessee presence']::text[], ARRAY['Small single-site likely manual admin']::text[], 'Low-friction SaaS adoption candidate', 3, 'Low', false, 'tennessee', 'not_contacted', '', '', ''),
  ('crossville-highlands-academy', 'Crossville Highlands Academy', 'TN', 'Crossville', '', 'Microschool', 'Not specified', 'Small', 'Not published', ARRAY['Established single-site rural Cumberland Plateau presence']::text[], ARRAY['Rural market likely lean staff, manual admin']::text[], 'Rural lean-team school is a strong candidate for affordable all-in-one SaaS', 3, 'Low', false, 'tennessee', 'not_contacted', '', '', ''),
  ('gallatin-sumner-county-microschool', 'Gallatin Sumner County Microschool', 'TN', 'Gallatin', '', 'Microschool', 'Not specified', 'Small', 'Not published', ARRAY['Established single-site Nashville-adjacent presence']::text[], ARRAY['Small single-site likely manual admin']::text[], 'Growing Nashville-suburb market is a good expansion target', 3, 'Low', false, 'tennessee', 'not_contacted', '', '', ''),
  ('gatlinburg-smoky-mountain-academy', 'Gatlinburg Smoky Mountain Academy', 'TN', 'Gatlinburg', '', 'Forest/Nature', 'Not specified', 'Small', 'Not published', ARRAY['Mountain/nature setting — direct philosophical overlap with Sage Field']::text[], ARRAY['Tourist-town small program likely runs informally, no digital enrollment']::text[], 'Direct outdoor/mountain-nature philosophical match — ideal MudKitchen prospect', 5, 'Low', false, 'tennessee', 'not_contacted', '', '', ''),
  ('hixson-community-microschool', 'Hixson Community Microschool', 'TN', 'Hixson', '', 'Microschool', 'Not specified', 'Small', 'Not published', ARRAY['Established single-site Chattanooga-suburb presence']::text[], ARRAY['Small single-site likely manual admin']::text[], 'Low-friction SaaS adoption candidate', 3, 'Low', false, 'tennessee', 'not_contacted', '', '', ''),
  ('kingsport-tri-cities-academy', 'Kingsport Tri-Cities Academy', 'TN', 'Kingsport', '', 'Microschool', 'Not specified', 'Small', 'Not published', ARRAY['Established single-site Tri-Cities region presence']::text[], ARRAY['Small single-site likely manual admin']::text[], 'Low-friction SaaS adoption candidate', 3, 'Low', false, 'tennessee', 'not_contacted', '', '', ''),
  ('kingston-lakeside-learning', 'Kingston Lakeside Learning', 'TN', 'Kingston', '', 'Microschool', 'Not specified', 'Small', 'Not published', ARRAY['Established single-site rural East Tennessee presence']::text[], ARRAY['Rural market likely lean staff, manual admin']::text[], 'Rural lean-team school is a strong candidate for affordable all-in-one SaaS', 3, 'Low', false, 'tennessee', 'not_contacted', '', '', ''),
  ('loudon-county-microschool', 'Loudon County Microschool', 'TN', 'Loudon', '', 'Microschool', 'Not specified', 'Small', 'Not published', ARRAY['Established single-site rural East Tennessee presence']::text[], ARRAY['Rural market likely lean staff, manual admin']::text[], 'Rural lean-team school is a strong candidate for affordable all-in-one SaaS', 3, 'Low', false, 'tennessee', 'not_contacted', '', '', ''),
  ('new-market-community-academy', 'New Market Community Academy', 'TN', 'New Market', '', 'Microschool', 'Not specified', 'Small', 'Not published', ARRAY['Established single-site rural East Tennessee presence']::text[], ARRAY['Rural market likely lean staff, manual admin']::text[], 'Rural lean-team school is a strong candidate for affordable all-in-one SaaS', 3, 'Low', false, 'tennessee', 'not_contacted', '', '', ''),
  ('seymour-foothills-academy', 'Seymour Foothills Academy', 'TN', 'Seymour', '', 'Microschool', 'Not specified', 'Small', 'Not published', ARRAY['Established single-site Smoky Mountain-foothills presence']::text[], ARRAY['Rural/foothills market likely lean staff, manual admin']::text[], 'Foothills location may overlap with outdoor-education branding opportunities', 3, 'Low', false, 'tennessee', 'not_contacted', '', '', ''),
  ('spring-hill-innovators-academy', 'Spring Hill Innovators Academy', 'TN', 'Spring Hill', '', 'Microschool', 'Not specified', 'Small', 'Not published', ARRAY['Established presence in fast-growing Williamson/Maury County suburb']::text[], ARRAY['Small single-site likely manual admin']::text[], 'Fast-growing suburban market is a strong expansion target', 3, 'Low', false, 'tennessee', 'not_contacted', '', '', '')

on conflict (school_id) do nothing;

-- Verification (run after import)
-- Expect 34 rows for the imported Tennessee batch.
select count(*) as tennessee_import_count
from public.schools
where source_file = 'tennessee'
  and school_id in (
    'magnolia-concepts',
    'the-lion-mountain-academy',
    'sailaway-learning-and-academy',
    'amma-mountain-academy',
    'arbor-learning-lab',
    'change-makers-academy',
    'sage-montessori-school-of-nashville',
    'dream-builders-learning-center',
    'alma-learning-lab',
    'waypoint-academy-an-acton-academy',
    'friendship-academy',
    'acton-tristar-academy',
    'the-focus-academy',
    'me-institute',
    'the-lab-school-of-memphis',
    'memphis-microschool-4th-listing',
    'bartlett-discovery-academy',
    'collierville-community-microschool',
    'murfreesboro-microschool-1-of-2',
    'murfreesboro-microschool-2-of-2',
    'athens-community-microschool',
    'chattanooga-discovery-school',
    'clarksville-community-academy',
    'cleveland-heritage-microschool',
    'crossville-highlands-academy',
    'gallatin-sumner-county-microschool',
    'gatlinburg-smoky-mountain-academy',
    'hixson-community-microschool',
    'kingsport-tri-cities-academy',
    'kingston-lakeside-learning',
    'loudon-county-microschool',
    'new-market-community-academy',
    'seymour-foothills-academy',
    'spring-hill-innovators-academy'
  );

-- Confirm skipped duplicate still exists (should return 1 row)
select school_id, name
from public.schools
where school_id = 'hilton-horizons-academy';

