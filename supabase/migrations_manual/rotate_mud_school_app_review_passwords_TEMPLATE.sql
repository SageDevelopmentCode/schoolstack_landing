-- Rotate Mud School App Review demo passwords (production Supabase SQL Editor only).
-- Paste, replace the three REVIEW_*_PWD_PLACEHOLDER values, run once, then update App Store Connect.
-- Do not commit real passwords to git.

update auth.users
set
  encrypted_password = extensions.crypt($pwd$REVIEW_PARENT_PWD_PLACEHOLDER$pwd$, extensions.gen_salt('bf')),
  updated_at = now()
where lower(email) = 'testparent@gmail.com';

update auth.users
set
  encrypted_password = extensions.crypt($pwd$REVIEW_TEACHER_PWD_PLACEHOLDER$pwd$, extensions.gen_salt('bf')),
  updated_at = now()
where lower(email) = 'testteacher@gmail.com';

update auth.users
set
  encrypted_password = extensions.crypt($pwd$REVIEW_ADMIN_PWD_PLACEHOLDER$pwd$, extensions.gen_salt('bf')),
  updated_at = now()
where lower(email) = 'testadmin@gmail.com';
