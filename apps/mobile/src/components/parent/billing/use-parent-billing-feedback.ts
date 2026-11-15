import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import type { ParentBillingEvent } from '@/components/parent/billing/use-parent-billing-screen-controller';
import { useGardenToast } from '@/components/parent/garden/toast';
import { haptic } from '@/lib/haptics';
import { usePortalPreview } from '@/lib/portal-preview-gating';

/** Toasts render behind native modals, so wait for a closing sheet before showing one. */
const AFTER_SHEET_MS = 260;
const TOAST_ID = 'billing-checkout';

/**
 * Turns Billing controller events into Garden toasts, haptics and the payment
 * celebration. Never changes behaviour: every action still runs in the controller.
 */
export function useParentBillingFeedback() {
  const toast = useGardenToast();
  const { readOnly, isPreview } = usePortalPreview();
  const [celebrationKey, setCelebrationKey] = useState<string | null>(null);
  const [justPaid, setJustPaid] = useState(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    const pending = timers.current;
    return () => pending.forEach(clearTimeout);
  }, []);

  const later = useCallback((fn: () => void) => {
    timers.current.push(setTimeout(fn, AFTER_SHEET_MS));
  }, []);

  const handleEvent = useCallback(
    (event: ParentBillingEvent) => {
      switch (event.type) {
        case 'checkout_opening':
          toast.info(
            event.kind === 'payment' ? 'Opening secure checkout…' : 'Opening secure card setup…',
            {
              id: TOAST_ID,
              description:
                event.kind === 'payment'
                  ? "You'll finish on Stripe's secure page, then come right back here."
                  : "Save your card on Stripe's secure page, then come right back here.",
              durationMs: 2600,
            },
          );
          return;

        case 'checkout_confirming':
          toast.info(event.outcome === 'paid' ? 'Confirming your payment…' : 'Saving your card…', {
            id: TOAST_ID,
            description: 'Hang tight while we update your billing.',
            durationMs: 12000,
          });
          return;

        case 'checkout_finished': {
          const { outcome, settled, method } = event;
          if (outcome === 'paid') {
            if (method === 'us_bank_account') {
              toast.success('Bank payment submitted', {
                id: TOAST_ID,
                description: 'Processing usually takes 3–5 business days.',
              });
              return;
            }
            toast.success('Payment received. Thank you!', {
              id: TOAST_ID,
              description: settled
                ? 'Your payment has been recorded.'
                : 'Your payment is processing and will appear here shortly.',
            });
            setJustPaid(settled);
            setCelebrationKey(`parent-billing-paid-${Date.now()}`);
            return;
          }
          if (outcome === 'card_saved') {
            toast.success('Payment method saved', {
              id: TOAST_ID,
              description: settled
                ? 'Your card is saved for future payments.'
                : 'Your card is being saved and will appear here shortly.',
            });
            return;
          }
          if (outcome === 'cancelled') {
            toast.info('Payment not completed', {
              id: TOAST_ID,
              description: 'No charge was made. You can try again anytime.',
            });
            return;
          }
          if (outcome === 'card_cancelled') {
            toast.info('Card not saved', {
              id: TOAST_ID,
              description: 'Nothing changed. You can add a card anytime.',
            });
            return;
          }
          toast.info('Checkout closed', {
            id: TOAST_ID,
            description:
              method === null
                ? 'If you saved a card, it will show up here shortly.'
                : 'If you finished paying, it will show up here shortly.',
          });
          return;
        }

        case 'checkout_failed':
          later(() =>
            toast.error(event.kind === 'payment' ? 'Payment failed' : "Couldn't open card setup", {
              id: TOAST_ID,
              description: event.message,
              action: { label: 'Try again', onPress: event.retry },
            }),
          );
          return;

        case 'autopay_updated':
          later(() =>
            toast.success(event.enabled ? 'Autopay is on' : 'Autopay is off', {
              id: 'billing-autopay',
              description: event.enabled
                ? event.methodLabel
                  ? `We'll charge ${event.methodLabel} on each due date.`
                  : 'Add a card so it can run on each due date.'
                : "You'll pay each charge yourself.",
            }),
          );
          return;

        case 'autopay_failed':
          // The autopay sheet stays open and shows the message inline.
          haptic.error();
          return;
      }
    },
    [later, toast],
  );

  const notifyReadOnly = useCallback(() => {
    toast.info('Read-only preview', {
      id: 'billing-read-only',
      description: 'Actions are turned off while previewing.',
    });
  }, [toast]);

  /** Wraps a write action that was disabled in preview before the Garden migration. */
  const guarded = useCallback(
    (action: () => void) => () => {
      if (readOnly) {
        notifyReadOnly();
        return;
      }
      action();
    },
    [notifyReadOnly, readOnly],
  );

  const scheduleConfirmed = useCallback(
    (firstName: string, next: { firstName: string; onOpen: () => void } | null) => {
      toast.success(`${firstName}'s payment schedule is confirmed.`, {
        id: 'billing-schedule',
        description: next
          ? `Next up: choose ${next.firstName}'s plan.`
          : "Your charges will show up here once they're generated.",
        action: next ? { label: `Open ${next.firstName}`, onPress: next.onOpen } : undefined,
      });
    },
    [toast],
  );

  return useMemo(
    () => ({
      toast,
      readOnly,
      isPreview,
      celebrationKey,
      justPaid,
      handleEvent,
      notifyReadOnly,
      guarded,
      scheduleConfirmed,
    }),
    [celebrationKey, guarded, handleEvent, isPreview, justPaid, notifyReadOnly, readOnly, scheduleConfirmed, toast],
  );
}

export type ParentBillingFeedback = ReturnType<typeof useParentBillingFeedback>;

/** Pull-to-refresh: select haptic on pull, then "up to date" or "couldn't refresh". */
export function useParentBillingRefreshFeedback(
  isRefreshing: boolean,
  error: string | null,
  refresh: () => void,
) {
  const toast = useGardenToast();
  const pendingRefresh = useRef(false);
  const wasRefreshing = useRef(isRefreshing);

  const refreshWithFeedback = useCallback(() => {
    haptic.select();
    pendingRefresh.current = true;
    refresh();
  }, [refresh]);

  // Load errors are already reported by the billing data context; this only tells the parent.
  useEffect(() => {
    const finished = wasRefreshing.current && !isRefreshing;
    wasRefreshing.current = isRefreshing;
    if (!finished || !pendingRefresh.current) return;
    pendingRefresh.current = false;
    if (error) {
      toast.error("Couldn't refresh billing", {
        id: 'billing-refresh',
        description: 'Check your connection, then try again.',
        action: { label: 'Try again', onPress: refreshWithFeedback },
      });
    } else {
      toast.info('Billing is up to date', { id: 'billing-refresh', durationMs: 2600 });
    }
  }, [error, isRefreshing, refreshWithFeedback, toast]);

  return refreshWithFeedback;
}
