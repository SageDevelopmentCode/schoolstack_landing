import type { Committee } from '@/lib/parent/parent-committees-types';

export const SCHOOL_ADMIN_COMMITTEE_WORKSPACE_LOAD_TIMEOUT_MS = 28_000;

export const COMMITTEE_WORKSPACE_LOAD_TIMEOUT_MESSAGE =
  'Loading the committee is taking longer than expected. Check your connection and try again.';

export class CommitteeWorkspaceLoadTimeoutError extends Error {
  readonly code = 'committee_workspace_load_timeout';

  constructor(message = COMMITTEE_WORKSPACE_LOAD_TIMEOUT_MESSAGE) {
    super(message);
    this.name = 'CommitteeWorkspaceLoadTimeoutError';
  }
}

export function isCommitteeWorkspaceLoadTimeoutError(err: unknown): boolean {
  return err instanceof CommitteeWorkspaceLoadTimeoutError;
}

export function withCommitteeWorkspaceLoadTimeout<T>(
  promise: Promise<T>,
  timeoutMs = SCHOOL_ADMIN_COMMITTEE_WORKSPACE_LOAD_TIMEOUT_MS,
): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new CommitteeWorkspaceLoadTimeoutError());
    }, timeoutMs);

    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (error) => {
        clearTimeout(timer);
        reject(error);
      },
    );
  });
}

/** Coalesce overlapping non-silent workspace loads (e.g. Strict Mode double mount). */
export class CommitteeWorkspaceLoadCoalescer {
  private nonSilentInFlight: Promise<void> | null = null;

  async run(silent: boolean, loadFn: () => Promise<void>): Promise<void> {
    if (!silent && this.nonSilentInFlight) {
      await this.nonSilentInFlight;
      return;
    }

    const promise = loadFn();
    if (!silent) {
      this.nonSilentInFlight = promise;
    }

    try {
      await promise;
    } finally {
      if (!silent && this.nonSilentInFlight === promise) {
        this.nonSilentInFlight = null;
      }
    }
  }
}

export type FetchCommitteeForWorkspace = (
  organizationId: string,
  committeeId: string,
) => Promise<Committee | null>;

export async function fetchSchoolAdminCommitteeWorkspace(
  fetchCommittee: FetchCommitteeForWorkspace,
  organizationId: string,
  committeeId: string,
): Promise<Committee> {
  const loaded = await withCommitteeWorkspaceLoadTimeout(
    fetchCommittee(organizationId, committeeId),
  );
  if (!loaded) {
    throw new Error('Committee not found.');
  }
  return loaded;
}
