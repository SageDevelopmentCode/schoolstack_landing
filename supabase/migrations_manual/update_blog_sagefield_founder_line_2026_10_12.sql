-- One-off: update newsletter blog post founder line (Sage Field link).
-- Run in Supabase SQL Editor on remote if the post already exists with the old copy.

update public.website_blog_posts
set body_html = replace(
  body_html,
  '<p>As a microschool founder and co-founder of MudKitchen, I think school communication should be easier than that.',
  '<p>As founder of <a href="https://sagefield.co/">Sage Field Private Microschool</a> and co-founder of MudKitchen, I think school communication should be easier than that.'
),
updated_at = now()
where slug = 'simplify-microschool-newsletters'
  and body_html like '%As a microschool founder and co-founder of MudKitchen%';
