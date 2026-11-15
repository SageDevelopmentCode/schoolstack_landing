import { useCallback, useEffect, useRef, useState } from 'react';
import type { ScrollView } from 'react-native';

import type { ParentBillingView } from '@/components/parent/billing/use-parent-billing-screen-controller';
import { PARENT_BILLING_AGREEMENTS_TAB } from '@/lib/tuition/billing-helpers';

/** Let a native sheet finish closing before navigating, toasting or opening another. */
export function closeThen(close: () => void, action: () => void) {
  close();
  setTimeout(action, 220);
}

/** Sheet state and scroll helpers for the Billing screen. Derived data stays in the controller. */
export function useParentBillingModel(view: ParentBillingView) {
  const scrollRef = useRef<ScrollView>(null);
  const [chargesOpen, setChargesOpen] = useState(false);
  const [paymentsOpen, setPaymentsOpen] = useState(false);
  const [autopayOpen, setAutopayOpen] = useState(false);
  const [autopaySaving, setAutopaySaving] = useState(false);
  const [autopayError, setAutopayError] = useState<string | null>(null);
  /** The value autopay will be set to if the parent confirms. */
  const [autopayTarget, setAutopayTarget] = useState(false);

  const panelY = useRef(0);
  const scheduleY = useRef<number | null>(null);
  const scrollToScheduleOnLayout = useRef(false);

  // Same as before: a tab change closes the "full schedule" list.
  useEffect(() => {
    setChargesOpen(false);
    setPaymentsOpen(false);
  }, [view.activeTabKey]);

  const scrollToSchedule = useCallback(() => {
    if (scheduleY.current == null) {
      scrollToScheduleOnLayout.current = true;
      return;
    }
    scrollRef.current?.scrollTo({ y: Math.max(0, panelY.current + scheduleY.current - 12), animated: true });
  }, []);

  const onPanelLayout = useCallback((y: number) => {
    panelY.current = y;
  }, []);

  const onScheduleLayout = useCallback((y: number) => {
    scheduleY.current = y;
    if (scrollToScheduleOnLayout.current) {
      scrollToScheduleOnLayout.current = false;
      // Wait a frame so the panel offset is current after a tab switch.
      requestAnimationFrame(() => {
        scrollRef.current?.scrollTo({ y: Math.max(0, panelY.current + y - 12), animated: true });
      });
    }
  }, []);

  /** "Choose a plan": jump to the child who needs one, then to the schedule picker. */
  const goToPlan = useCallback(
    (childKey: string | null) => {
      if (childKey && view.hasMultipleChildren && view.activeTabKey !== childKey) {
        scheduleY.current = null;
        scrollToScheduleOnLayout.current = true;
        view.selectTab(childKey);
        return;
      }
      scrollToSchedule();
    },
    [scrollToSchedule, view],
  );

  const goToAgreements = useCallback(() => {
    view.selectTab(PARENT_BILLING_AGREEMENTS_TAB);
    scrollRef.current?.scrollTo({ y: 0, animated: true });
  }, [view]);

  const openAutopay = useCallback(() => {
    setAutopayTarget(!view.data.autopayEnabled);
    setAutopayError(null);
    setAutopayOpen(true);
  }, [view.data.autopayEnabled]);

  const closeAutopay = useCallback(() => {
    if (autopaySaving) return;
    setAutopayOpen(false);
  }, [autopaySaving]);

  const confirmAutopay = useCallback(async () => {
    setAutopaySaving(true);
    setAutopayError(null);
    const ok = await view.setAutopay(autopayTarget);
    setAutopaySaving(false);
    if (ok) {
      setAutopayOpen(false);
    } else {
      setAutopayError("We couldn't update autopay. Check your connection, then try again.");
    }
  }, [autopayTarget, view]);

  return {
    scrollRef,
    onPanelLayout,
    onScheduleLayout,
    goToPlan,
    goToAgreements,
    chargesOpen,
    setChargesOpen,
    paymentsOpen,
    setPaymentsOpen,
    autopay: {
      open: autopayOpen,
      target: autopayTarget,
      saving: autopaySaving,
      error: autopayError,
      openSheet: openAutopay,
      close: closeAutopay,
      confirm: () => void confirmAutopay(),
    },
  };
}

export type ParentBillingModel = ReturnType<typeof useParentBillingModel>;
