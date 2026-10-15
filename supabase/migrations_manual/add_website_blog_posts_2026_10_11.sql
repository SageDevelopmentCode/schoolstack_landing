-- Promoted to supabase/migrations/20261116_add_website_blog_posts.sql for local/CI.
-- Run this file in Supabase SQL Editor on remote if that migration has not been applied.

-- MudKitchen marketing blog posts (public /blog)
-- Run after: 20261115_add_website_marketing_storage.sql

create table if not exists public.website_blog_posts (
  id                  uuid primary key default gen_random_uuid(),
  slug                text not null,
  title               text not null,
  seo_title           text not null,
  meta_description    text not null,
  primary_keyword     text not null default '',
  secondary_keywords  text[] not null default '{}',
  excerpt             text not null default '',
  body_html           text not null default '',
  published           boolean not null default false,
  published_at        timestamptz,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),
  constraint website_blog_posts_slug_format_check
    check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$')
);

create unique index if not exists website_blog_posts_slug_key
  on public.website_blog_posts (slug);

create index if not exists website_blog_posts_published_at_idx
  on public.website_blog_posts (published, published_at desc nulls last);

drop trigger if exists on_website_blog_posts_updated on public.website_blog_posts;
create trigger on_website_blog_posts_updated
  before update on public.website_blog_posts
  for each row execute procedure public.handle_updated_at();

alter table public.website_blog_posts enable row level security;

drop policy if exists "Read published website blog posts" on public.website_blog_posts;
create policy "Read published website blog posts"
  on public.website_blog_posts
  for select
  to anon, authenticated
  using (published = true);

drop policy if exists "Platform admins manage website blog posts" on public.website_blog_posts;
create policy "Platform admins manage website blog posts"
  on public.website_blog_posts
  for all
  to authenticated
  using (public.is_platform_admin())
  with check (public.is_platform_admin());

insert into public.website_blog_posts (
  slug,
  title,
  seo_title,
  meta_description,
  primary_keyword,
  secondary_keywords,
  excerpt,
  body_html,
  published,
  published_at
) values (
  'simplify-microschool-newsletters',
  'Your Microschool Has Plenty to Share. Getting It Into Parents'' Hands Shouldn''t Be So Hard.',
  'How to Simplify Newsletters for Your Microschool',
  'Discover how microschool newsletters can help you share classroom updates, photos, and school news with parents while reducing administrative work.',
  'Microschool newsletters',
  array[
    'Parent communication for microschools',
    'Microschool management software',
    'School newsletter ideas',
    'Teacher-to-parent communication',
    'School communication tools'
  ],
  'Running a microschool means there''s almost always something worth sharing with families — turning those moments into a newsletter shouldn''t be another full-time task.',
  $body$<p>Running a microschool means there&rsquo;s almost always something worth sharing with families. A classroom project, a new discovery, a fun activity, or a moment that reminds you why you started your school in the first place.</p>
<p>But turning those moments into a newsletter? That can become another task on an already full to-do list.</p>
<p>As the founder of <a href="https://sagefield.co/">Sage Field Private Microschool</a> and co-founder of MudKitchen, I think school communication should be easier than that. Parents want to know what&rsquo;s happening in their children&rsquo;s lives, and teachers want to share those experiences. The challenge is finding a simple way to bring it all together.</p>
<h2>The Little Things Are Often Worth Sharing</h2>
<p>Think about everything that happens in a typical school week.</p>
<p>Teachers capture photos of classroom activities. Students work on projects, explore new ideas, and reach milestones. Important announcements and updates come up along the way.</p>
<p>Individually, these moments might seem small. But together, they help parents feel connected to their child&rsquo;s learning experience.</p>
<p>The problem is that these pieces of information can end up scattered across different places. Gathering everything, writing an update, finding the right photos, and getting it in front of families can take more effort than it should.</p>
<p>And when you&rsquo;re also managing enrollment, billing, scheduling, and the countless other responsibilities of running a microschool, it&rsquo;s easy for communication to become one more thing you have to squeeze into your day.</p>
<p><strong>The goal isn&rsquo;t to create more things to share. It&rsquo;s to make sharing what already happens at your school easier.</strong></p>
<h2>Make Newsletters Part of Your Existing Workflow</h2>
<p>I&rsquo;ve always believed that the tools a microschool uses should work together rather than create more disconnected tasks.</p>
<p>That&rsquo;s part of the thinking behind MudKitchen&rsquo;s newsletter feature.</p>
<p>School administrators and teachers can create, reuse, and publish newsletters in one convenient place. And because the feature connects with MudKitchen&rsquo;s Photos and Teacher Updates features, it fits into a broader system for capturing and sharing what&rsquo;s happening at school.</p>
<p>Instead of treating a newsletter as an entirely separate project, schools can bring together the information and moments they want families to see.</p>
<p>That creates a few meaningful opportunities:</p>
<ul>
<li><strong>Spend less time starting from scratch.</strong> Reuse newsletter content where it makes sense instead of rebuilding everything for each edition.</li>
<li><strong>Share more of the school experience.</strong> Bring photos, classroom highlights, and teacher updates into the communication you send to families.</li>
<li><strong>Make publishing simpler.</strong> Create and publish newsletters through MudKitchen, making it easier to get school updates in front of parents.</li>
<li><strong>Help families feel more connected.</strong> Give parents a clearer picture of the activities, experiences, and learning happening throughout the school week.</li>
</ul>
<p>These aren&rsquo;t about adding another communication obligation. They&rsquo;re about making an existing responsibility easier to manage.</p>
<h2>You Don&rsquo;t Need a Perfect Newsletter Every Week</h2>
<p>One thing I&rsquo;d encourage microschool founders to remember is that parents don&rsquo;t necessarily need a beautifully produced publication filled with lengthy updates.</p>
<p>Often, they just want to know what their children have been doing, what the school has coming up, and what makes their learning experience special.</p>
<p>A simple, consistent newsletter can help accomplish that.</p>
<p>You might share a few classroom highlights, include some photos from the week, mention an upcoming event, and add a short note from a teacher. The exact format matters less than making the information useful and easy for families to follow.</p>
<p>Start with a format that works for your school, reuse it when appropriate, and build a routine your team can realistically maintain.</p>
<p>The easier the process is, the more manageable it becomes to keep families informed.</p>
<h2>Less Administrative Friction, More Connection</h2>
<p>Microschools are special because of the relationships they build between students, teachers, and families. Communication helps strengthen those relationships.</p>
<p>At MudKitchen, we&rsquo;re building tools to help microschools manage their everyday responsibilities without losing sight of what makes their communities special.</p>
<p>Our newsletter feature is one small part of that bigger picture: helping school teams bring their updates together and share them with the people who care most.</p>
<p>If you&rsquo;re spending too much time putting school communications together, take a look at how your current process could be simplified. And if you&rsquo;d like your school operations and family communication to work together more naturally, explore what we&rsquo;re building at <a href="https://trymudkitchen.com/">MudKitchen</a>.</p>
<p>You already have meaningful things happening at your school. Sharing them with families shouldn&rsquo;t have to be the hard part.</p>$body$,
  true,
  '2026-10-11T00:00:00+00'::timestamptz
)
on conflict (slug) do update set
  title = excluded.title,
  seo_title = excluded.seo_title,
  meta_description = excluded.meta_description,
  primary_keyword = excluded.primary_keyword,
  secondary_keywords = excluded.secondary_keywords,
  excerpt = excluded.excerpt,
  body_html = excluded.body_html,
  published = excluded.published,
  published_at = excluded.published_at,
  updated_at = now();
