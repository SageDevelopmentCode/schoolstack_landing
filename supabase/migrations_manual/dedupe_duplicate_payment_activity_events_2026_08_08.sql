-- 2026-08-08: Remove duplicate application.payment_completed activity events
-- caused by ACH checkout firing both checkout.session.completed and
-- checkout.session.async_payment_succeeded. Keeps the earliest event per paymentId.

delete from activity_events
where id in (
  select id
  from (
    select
      id,
      row_number() over (
        partition by metadata->>'paymentId'
        order by created_at asc, id asc
      ) as row_num
    from activity_events
    where action = 'application.payment_completed'
      and metadata ? 'paymentId'
      and nullif(metadata->>'paymentId', '') is not null
  ) ranked
  where row_num > 1
);
