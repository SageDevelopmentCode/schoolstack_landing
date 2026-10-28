import { describe, expect, it, jest } from '@jest/globals';

import {
  CommitteeWorkspaceLoadCoalescer,
  CommitteeWorkspaceLoadTimeoutError,
  COMMITTEE_WORKSPACE_LOAD_TIMEOUT_MESSAGE,
  fetchSchoolAdminCommitteeWorkspace,
  isCommitteeWorkspaceLoadTimeoutError,
  withCommitteeWorkspaceLoadTimeout,
} from '@/lib/school-admin/committees/committee-workspace-load';
import type { Committee } from '@/lib/parent/parent-committees-types';

const stubCommittee = { id: 'c1' } as Committee;

describe('withCommitteeWorkspaceLoadTimeout', () => {
  it('resolves when the underlying promise completes first', async () => {
    await expect(withCommitteeWorkspaceLoadTimeout(Promise.resolve('ok'), 50)).resolves.toBe('ok');
  });

  it('rejects with CommitteeWorkspaceLoadTimeoutError when the promise hangs', async () => {
    await expect(
      withCommitteeWorkspaceLoadTimeout(new Promise(() => undefined), 20),
    ).rejects.toThrow(COMMITTEE_WORKSPACE_LOAD_TIMEOUT_MESSAGE);
  });

  it('isCommitteeWorkspaceLoadTimeoutError identifies timeout errors', () => {
    expect(isCommitteeWorkspaceLoadTimeoutError(new CommitteeWorkspaceLoadTimeoutError())).toBe(
      true,
    );
    expect(isCommitteeWorkspaceLoadTimeoutError(new Error('other'))).toBe(false);
  });
});

describe('fetchSchoolAdminCommitteeWorkspace', () => {
  it('throws when the committee is missing', async () => {
    await expect(
      fetchSchoolAdminCommitteeWorkspace(async () => null, 'org', 'c1'),
    ).rejects.toThrow('Committee not found.');
  });

  it('returns the committee when found', async () => {
    await expect(
      fetchSchoolAdminCommitteeWorkspace(async () => stubCommittee, 'org', 'c1'),
    ).resolves.toBe(stubCommittee);
  });
});

describe('CommitteeWorkspaceLoadCoalescer', () => {
  it('runs a single non-silent load when invoked twice while in flight', async () => {
    const coalescer = new CommitteeWorkspaceLoadCoalescer();
    const loadFn = jest.fn(async () => {
      await new Promise((resolve) => setTimeout(resolve, 10));
    });

    await Promise.all([
      coalescer.run(false, () => loadFn()),
      coalescer.run(false, () => loadFn()),
    ]);

    expect(loadFn).toHaveBeenCalledTimes(1);
  });

  it('does not coalesce silent loads with a non-silent load', async () => {
    const coalescer = new CommitteeWorkspaceLoadCoalescer();
    const loadFn = jest.fn(async () => undefined);

    await Promise.all([
      coalescer.run(false, () => loadFn()),
      coalescer.run(true, () => loadFn()),
    ]);

    expect(loadFn).toHaveBeenCalledTimes(2);
  });
});
