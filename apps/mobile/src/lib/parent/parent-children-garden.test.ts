import type {
  EnrollmentChecklistItem,
  EnrollmentChecklistItemInstance,
  LoadedEnrollmentChecklist,
} from '@/lib/admissions/enrollment-checklist';
import {
  buildChecklistFileStoragePath,
  buildEnrollmentStepsView,
  buildRecordTabs,
  calculateAge,
  checklistFormDraftValues,
  formatBirthDate,
  formatContactName,
  healthRequiredFieldError,
  healthValuesToPayload,
  nextChecklistSteps,
  normalizePickupForm,
  pickupFormErrors,
  statusChip,
} from '@/lib/parent/parent-children-garden';

function item(id: string, overrides: Partial<EnrollmentChecklistItem> = {}): EnrollmentChecklistItem {
  return {
    id,
    label: `Item ${id}`,
    type: 'form',
    required: true,
    sortOrder: 0,
    metadata: {},
    ...overrides,
  } as EnrollmentChecklistItem;
}

function instance(
  templateItemId: string,
  status: EnrollmentChecklistItemInstance['status'],
): EnrollmentChecklistItemInstance {
  return {
    id: `inst-${templateItemId}`,
    checklistId: 'c1',
    templateItemId,
    itemKey: templateItemId,
    status,
    responses: {},
  } as EnrollmentChecklistItemInstance;
}

function checklist(
  items: EnrollmentChecklistItem[],
  instances: EnrollmentChecklistItemInstance[],
): LoadedEnrollmentChecklist {
  return { checklistId: 'c1', title: 'Fall enrollment', status: 'active', items, instances } as unknown as LoadedEnrollmentChecklist;
}

describe('parent-children-garden', () => {
  it('formats birth dates and ages', () => {
    expect(formatBirthDate('2019-03-04')).toBe('March 4, 2019');
    expect(formatBirthDate('nope')).toBeNull();
    expect(calculateAge('2019-03-04', new Date(2026, 2, 3))).toBe(6);
    expect(calculateAge('2019-03-04', new Date(2026, 2, 4))).toBe(7);
  });

  it('builds record tabs with the Story show/hide rules', () => {
    expect(buildRecordTabs({ hasChecklist: false, hasStudent: false }).map((t) => t.id)).toEqual([
      'application',
    ]);
    expect(buildRecordTabs({ hasChecklist: true, hasStudent: true }).map((t) => t.id)).toEqual([
      'application',
      'checklist',
      'teachers',
      'health',
      'pickup',
    ]);
  });

  it('marks the first unfinished enrollment step as current', () => {
    const view = buildEnrollmentStepsView(
      checklist(
        [item('a'), item('b'), item('c', { required: false })],
        [instance('a', 'completed'), instance('b', 'in_progress')],
      ),
    );
    expect(view.steps.map((s) => s.state)).toEqual(['done', 'current', 'todo']);
    expect(view.steps[1].chip).toEqual({ label: 'In progress', tone: 'warning' });
    expect(view.steps[2].meta).toContain('Optional');
    expect(view.completed).toBe(1);
    expect(view.total).toBe(2);
    expect(view.isComplete).toBe(false);
  });

  it('lists only required items still waiting on the family', () => {
    const next = nextChecklistSteps(
      checklist(
        [item('a'), item('b'), item('c', { required: false })],
        [instance('a', 'completed'), instance('b', 'not_started')],
      ),
    );
    expect(next.map((n) => n.itemId)).toEqual(['b']);
    expect(nextChecklistSteps(null)).toEqual([]);
  });

  it('maps statuses to chips', () => {
    expect(statusChip('waived').tone).toBe('success');
    expect(statusChip('not_started')).toEqual({ label: 'Not started', tone: 'neutral' });
  });

  it('builds safe storage paths and reads form drafts', () => {
    expect(
      buildChecklistFileStoragePath({
        organizationId: 'org',
        checklistId: 'c1',
        instanceId: 'i1',
        fileName: 'a/b.pdf',
        fileId: '9',
      }),
    ).toBe('org/enrollment-checklists/c1/i1/9_a_b.pdf');
    expect(checklistFormDraftValues({ fields: { name: 'Ada', n: 3 } })).toEqual({ name: 'Ada' });
    expect(checklistFormDraftValues(null)).toEqual({});
  });

  it('builds health payloads and checks the required field', () => {
    expect(
      healthValuesToPayload({ type: 'allergy', allergen: 'Peanuts', severity: 'high', treatmentNotes: '' }),
    ).toEqual({ allergen: 'Peanuts', severity: 'high', treatmentNotes: '' });
    expect(
      healthRequiredFieldError({ type: 'update', title: ' ', details: '', startDate: '2026-11-01' }),
    ).toBe('Add a title.');
  });

  it('validates and normalises pickup contacts', () => {
    expect(pickupFormErrors({ firstName: ' ', lastName: 'Lee' })).toEqual({
      firstName: 'First name is required.',
      lastName: null,
    });
    expect(
      normalizePickupForm({ firstName: ' Dana ', lastName: 'Lee', relationship: ' ', phone: '555', notes: '' }),
    ).toEqual({ firstName: 'Dana', lastName: 'Lee', relationship: null, phone: '555', notes: null });
    expect(formatContactName({ firstName: '', lastName: '' })).toBe('Contact');
  });
});
