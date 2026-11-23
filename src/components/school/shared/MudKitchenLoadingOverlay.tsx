"use client";

import { useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import GardenLoadingSplash from "@/components/school/shared/GardenLoadingSplash";

type MudKitchenLoadingOverlayProps = {
  visible: boolean;
  label?: string;
};

const subscribeNoop = () => () => {};

/** True after hydration, so the portal never renders on the server. */
function useIsClient() {
  return useSyncExternalStore(
    subscribeNoop,
    () => true,
    () => false,
  );
}

export default function MudKitchenLoadingOverlay({
  visible,
  label = "Loading",
}: MudKitchenLoadingOverlayProps) {
  const isClient = useIsClient();
  const reduceMotion = useReducedMotion();

  if (!isClient) {
    return null;
  }

  return createPortal(
    <AnimatePresence>
      {visible ? (
        <motion.div
          key="mk-loading-overlay"
          className="fixed inset-0 z-[300]"
          initial={false}
          exit={
            reduceMotion
              ? undefined
              : { opacity: 0, transition: { duration: 0.18, ease: [0.16, 1, 0.3, 1] } }
          }
        >
          <GardenLoadingSplash variant="overlay" label={label} />
        </motion.div>
      ) : null}
    </AnimatePresence>,
    document.body,
  );
}
