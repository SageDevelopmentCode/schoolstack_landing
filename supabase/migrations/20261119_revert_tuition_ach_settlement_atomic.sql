-- Atomically revert one succeeded tuition ACH payment and its charge balance.
-- Locks the payment first so a second failure webhook cannot subtract paid_cents again.
-- Run after: 20261118_add_website_marketing_carousel_posts.sql

create or replace function public.revert_tuition_ach_settlement_atomic(
  p_payment_id uuid,
  p_stripe_payment_intent_id text default null,
  p_stripe_checkout_session_id text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_payment public.application_payments;
  v_charge public.tuition_charges;
  v_applied integer;
  v_next_paid integer;
  v_reopen boolean;
  v_status text;
begin
  select *
  into v_payment
  from public.application_payments
  where id = p_payment_id
  for update;

  if not found then
    raise exception 'Payment not found.';
  end if;

  if v_payment.status is distinct from 'succeeded'
    or v_payment.payment_type is distinct from 'tuition'
    or v_payment.tuition_charge_id is null then
    return jsonb_build_object(
      'already_handled', true,
      'transitioned', false,
      'charge_reopened', false,
      'surplus', false,
      'applied_cents', null,
      'charge_id', v_payment.tuition_charge_id,
      'charge_label', null
    );
  end if;

  v_applied := coalesce(v_payment.amount_applied_cents, v_payment.amount_cents);

  -- Surplus stays on the charge for manual correction. Caller fails the payment.
  if v_payment.amount_cents > v_applied then
    return jsonb_build_object(
      'already_handled', false,
      'transitioned', false,
      'charge_reopened', false,
      'surplus', true,
      'applied_cents', v_applied,
      'charge_id', v_payment.tuition_charge_id,
      'charge_label', null
    );
  end if;

  select *
  into v_charge
  from public.tuition_charges
  where id = v_payment.tuition_charge_id
    and organization_id = v_payment.organization_id
  for update;

  if not found then
    raise exception 'Charge not found.';
  end if;

  v_next_paid := greatest(0, v_charge.paid_cents - v_applied);
  v_reopen := v_next_paid < v_charge.amount_cents;

  if v_reopen then
    v_status := case
      when v_charge.due_date < (timezone('utc', now()))::date then 'overdue'
      else 'sent'
    end;

    update public.tuition_charges
    set
      paid_cents = v_next_paid,
      status = v_status,
      paid_at = null
    where id = v_charge.id
    returning *
    into v_charge;
  else
    update public.tuition_charges
    set paid_cents = v_next_paid
    where id = v_charge.id
    returning *
    into v_charge;
  end if;

  update public.application_payments
  set
    status = 'failed',
    stripe_provider_status = 'failed',
    amount_applied_cents = 0,
    paid_at = null,
    stripe_payment_intent_id = coalesce(
      p_stripe_payment_intent_id,
      stripe_payment_intent_id
    ),
    stripe_checkout_session_id = coalesce(
      p_stripe_checkout_session_id,
      stripe_checkout_session_id
    )
  where id = v_payment.id
    and status = 'succeeded'
  returning *
  into v_payment;

  if not found then
    raise exception 'Payment could not be marked failed after charge revert.';
  end if;

  return jsonb_build_object(
    'already_handled', false,
    'transitioned', true,
    'charge_reopened', v_reopen,
    'surplus', false,
    'applied_cents', v_applied,
    'charge_id', v_charge.id,
    'charge_label', v_charge.label
  );
end;
$$;

revoke all on function public.revert_tuition_ach_settlement_atomic(uuid, text, text)
  from public, authenticated;

grant execute on function public.revert_tuition_ach_settlement_atomic(uuid, text, text)
  to service_role;
