-- One-off: use "As the founder of Sage Field Private Microschool" (linked) in newsletter blog post.
-- Run in Supabase SQL Editor on remote after prior founder-line patches.

-- Legacy opening (no Sage Field link)
update public.website_blog_posts
set body_html = replace(
  body_html,
  '<p>As a microschool founder and co-founder of MudKitchen, I think school communication should be easier than that.',
  '<p>As the founder of <a href="https://sagefield.co/">Sage Field Private Microschool</a> and co-founder of MudKitchen, I think school communication should be easier than that.'
),
updated_at = now()
where slug = 'simplify-microschool-newsletters'
  and body_html like '%<p>As a microschool founder and co-founder of MudKitchen%';

-- Prior patch without "the"
update public.website_blog_posts
set body_html = replace(
  body_html,
  '<p>As founder of <a href="https://sagefield.co/">Sage Field Private Microschool</a> and co-founder of MudKitchen, I think school communication should be easier than that.',
  '<p>As the founder of <a href="https://sagefield.co/">Sage Field Private Microschool</a> and co-founder of MudKitchen, I think school communication should be easier than that.'
),
updated_at = now()
where slug = 'simplify-microschool-newsletters'
  and body_html like '%<p>As founder of <a href="https://sagefield.co/">Sage Field Private Microschool</a> and co-founder%';
