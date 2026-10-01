import type { SupabaseClient } from '@supabase/supabase-js';

import { ACTIVITY_ACTIONS } from '@/lib/activity-log';
import { recordCommitteeWorkspaceCreate } from '@/lib/committees/record-committee-workspace-create';
import { logCommitteeActivityEvent } from '@/lib/committees/committee-activity-log';
import {
  createCommitteeTask,
  deleteCommitteeTask,
  updateCommitteeTask,
} from '@/lib/parent/committees/mutations';

jest.mock('@/lib/committees/committee-activity-log', () => ({
  logCommitteeActivityEvent: jest.fn(),
}));

jest.mock('@/lib/committees/record-committee-workspace-create', () => ({
  recordCommitteeWorkspaceCreate: jest.fn(async () => undefined),
}));

function createTaskInsertClient(row: Record<string, unknown>): SupabaseClient {
  return {
    from: jest.fn(() => ({
      insert: jest.fn(() => ({
        select: jest.fn(() => ({
          single: jest.fn(async () => ({ data: row, error: null })),
        })),
      })),
    })),
  } as unknown as SupabaseClient;
}

function createTaskUpdateClient(
  existing: Record<string, unknown> | null,
): SupabaseClient {
  return {
    from: jest.fn((table: string) => {
      if (table === 'committee_tasks') {
        return {
          select: jest.fn(() => ({
            eq: jest.fn(() => ({
              maybeSingle: jest.fn(async () => ({ data: existing, error: null })),
            })),
          })),
          update: jest.fn(() => ({
            eq: jest.fn(async () => ({ error: null })),
          })),
          delete: jest.fn(() => ({
            eq: jest.fn(async () => ({ error: null })),
          })),
        };
      }
      return {};
    }),
  } as unknown as SupabaseClient;
}

describe('committee task mutations activity logging', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('records workspace create via API when context is provided', async () => {
    const supabase = createTaskInsertClient({
      id: 'task-1',
      title: 'Bring snacks',
      description: null,
      group_key: 'general',
      status: 'open',
      assignee_member_id: null,
      due_date: null,
      attachment_label: null,
    });

    await createCommitteeTask(supabase, 'committee-1', {
      title: 'Bring snacks',
      createdByMemberId: 'member-1',
      workspaceRecord: {
        organizationId: 'org-1',
        portalApiNamespace: 'parent-portal',
      },
    });

    expect(recordCommitteeWorkspaceCreate).toHaveBeenCalledWith({
      portalApiNamespace: 'parent-portal',
      committeeId: 'committee-1',
      organizationId: 'org-1',
      action: ACTIVITY_ACTIONS.COMMITTEE_TASK_CREATED,
      entityId: 'task-1',
    });
    expect(logCommitteeActivityEvent).not.toHaveBeenCalled();
  });

  it('logs activity when updating a task', async () => {
    const supabase = createTaskUpdateClient({
      committee_id: 'committee-1',
      title: 'Bring snacks',
    });

    await updateCommitteeTask(supabase, 'task-1', { status: 'done' });

    expect(logCommitteeActivityEvent).toHaveBeenCalledWith(supabase, {
      committeeId: 'committee-1',
      action: ACTIVITY_ACTIONS.COMMITTEE_TASK_UPDATED,
      entityType: 'committee_task',
      entityId: 'task-1',
      summary: 'Task "Bring snacks" was updated',
      metadata: {
        taskTitle: 'Bring snacks',
        changes: { status: 'done' },
      },
    });
  });

  it('logs activity when deleting a task', async () => {
    const supabase = createTaskUpdateClient({
      committee_id: 'committee-1',
      title: 'Bring snacks',
    });

    await deleteCommitteeTask(supabase, 'task-1');

    expect(logCommitteeActivityEvent).toHaveBeenCalledWith(supabase, {
      committeeId: 'committee-1',
      action: ACTIVITY_ACTIONS.COMMITTEE_TASK_DELETED,
      entityType: 'committee_task',
      entityId: 'task-1',
      summary: 'Task "Bring snacks" was deleted',
      metadata: { taskTitle: 'Bring snacks' },
    });
  });
});
