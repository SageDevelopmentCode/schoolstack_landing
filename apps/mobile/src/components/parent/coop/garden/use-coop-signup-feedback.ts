import { useCallback } from 'react';

import { useGardenToast } from '@/components/parent/garden/toast';

/** Result of a sign-up toggle from a co-op controller (no UI in the controller). */
export type CoopToggleResult =
  | { ok: true; signedUp: boolean }
  | { ok: false; wasSignedUp: boolean; error: string }
  /** Ignored: another request is running, or the screen is a read-only preview. */
  | { ok: null };

/**
 * Toasts for co-op sign-ups, using the web portal's copy. Errors are already
 * reported by the controller; this only tells the parent what happened.
 */
export function useCoopSignupFeedback() {
  const toast = useGardenToast();

  return useCallback(
    (
      result: CoopToggleResult,
      {
        itemName,
        signedUpDescription = "Thanks! It's on your family's list for the co-op.",
        removedTitle = `Removed you from ${itemName}`,
        removedDescription = 'The spot is open for another family.',
        retry,
      }: {
        itemName: string;
        signedUpDescription?: string;
        removedTitle?: string;
        removedDescription?: string;
        retry?: () => void;
      },
    ) => {
      if (result.ok === null) return;
      if (result.ok) {
        if (result.signedUp) {
          toast.success(`Signed up for ${itemName}`, { description: signedUpDescription });
        } else {
          toast.success(removedTitle, { description: removedDescription });
        }
        return;
      }
      toast.error(result.wasSignedUp ? "Couldn't remove your sign-up" : "Couldn't sign you up", {
        description: `${result.error} We've refreshed the list, so check it and try again.`,
        action: retry ? { label: 'Try again', onPress: retry } : undefined,
      });
    },
    [toast],
  );
}
