-- One Expo push token row per physical device; multiple devices per user.
-- Run after: 20261019_add_friday_branch_class_price_and_flyer.sql

-- Keep the newest row when the same device token was stored under multiple accounts.
delete from public.expo_push_tokens
where user_id in (
  select user_id
  from (
    select
      user_id,
      row_number() over (
        partition by push_token
        order by updated_at desc, user_id
      ) as row_num
    from public.expo_push_tokens
  ) ranked
  where row_num > 1
);

alter table public.expo_push_tokens
  drop constraint if exists expo_push_tokens_pkey;

alter table public.expo_push_tokens
  add primary key (push_token);

drop index if exists public.expo_push_tokens_push_token_idx;

create index if not exists expo_push_tokens_user_id_idx
  on public.expo_push_tokens (user_id);

update public.expo_push_tokens
set organization_id = null
where organization_id is not null;
