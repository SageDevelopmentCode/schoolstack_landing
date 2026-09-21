import type { AdminDashboardSummary } from '@/lib/school-admin/dashboard-summary-types';
import {
  filterMobileDashboardSummary,
  filterNativeActivityNotifications,
} from '@/lib/school-admin/filter-mobile-dashboard-summary';

const slug = 'rooted-meadows';

function baseSummary(overrides: Partial<AdminDashboardSummary> = {}): AdminDashboardSummary {
  return {
    setupStatus: {
      steps: [],
      completedCount: 5,
      totalCount: 5,
      firstIncompleteStepId: null,
      applyFormPublicPath: '/school/rooted-meadows/apply',
    },
    focusItems: [],
    signal: null,
    metrics: [],
    recentActivity: [],
    quickActions: [],
    featureAnnouncements: [],
    messagesUnreadCount: 0,
    setupComplete: true,
    ...overrides,
  };
}

describe('filterMobileDashboardSummary', () => {
  it('removes setup focus items and web-only quick actions', () => {
    const filtered = filterMobileDashboardSummary(
      slug,
      baseSummary({
        focusItems: [
          {
            id: 'setup-programs',
            icon: 'setup',
            title: 'Set up programs',
            subtitle: 'Add programs',
            href: `/school/${slug}/admin/admissions/programs`,
            ctaLabel: 'Continue →',
          },
          {
            id: 'unread-messages',
            icon: 'message',
            title: 'Reply to 1 unread message',
            subtitle: 'Families are waiting',
            href: `/school/${slug}/admin/messages`,
            ctaLabel: 'Reply →',
          },
        ],
        quickActions: [
          {
            id: 'edit-apply-form',
            title: 'Edit application form',
            subtitle: 'Update questions',
            kind: 'link',
            href: `/school/${slug}/admin/admissions/flows?flow=apply`,
          },
          {
            id: 'copy-apply-link',
            title: 'Copy application link',
            subtitle: 'Share with families',
            kind: 'copy-apply-link',
            applyFormPublicPath: '/school/rooted-meadows/apply',
          },
        ],
      }),
    );

    expect(filtered.focusItems).toHaveLength(1);
    expect(filtered.focusItems[0]?.id).toBe('unread-messages');
    expect(filtered.quickActions).toHaveLength(1);
    expect(filtered.quickActions[0]?.id).toBe('copy-apply-link');
  });

  it('keeps signal only when native route exists', () => {
    const withNative = filterMobileDashboardSummary(
      slug,
      baseSummary({
        signal: {
          headline: 'Enrollment is on track.',
          body: '5 learners enrolled.',
          href: `/school/${slug}/admin/admissions/submissions`,
          ctaLabel: 'Open admissions →',
        },
      }),
    );
    expect(withNative.signal?.href).toBe(`/school-admin/${slug}/admissions/submissions`);

    const withoutNative = filterMobileDashboardSummary(
      slug,
      baseSummary({
        signal: {
          headline: 'Needs setup',
          body: 'Connect Stripe',
          href: `/school/${slug}/admin/admissions/payments`,
          ctaLabel: 'Connect →',
        },
      }),
    );
    expect(withoutNative.signal).toBeNull();
  });

  it('filters activity notifications to native routes only', () => {
    const filtered = filterNativeActivityNotifications(slug, [
      {
        id: 'activity-1',
        action: 'messages.received',
        title: 'New message from Jane Doe',
        summary: 'Hello',
        subjectLabel: null,
        guardianLabel: null,
        programName: null,
        detail: 'Hello',
        createdAt: '2026-09-20T12:00:00.000Z',
        href: `/school/${slug}/admin/messages`,
        ctaLabel: 'View',
        category: 'messages',
      },
      {
        id: 'activity-2',
        action: 'payments.stripe_connected',
        title: 'Payments ready',
        summary: 'Stripe connected',
        subjectLabel: null,
        guardianLabel: null,
        programName: null,
        detail: 'Stripe connected',
        createdAt: '2026-09-20T11:00:00.000Z',
        href: `/school/${slug}/admin/admissions/payments`,
        ctaLabel: 'View payments',
        category: 'payments',
      },
    ]);

    expect(filtered).toHaveLength(1);
    expect(filtered[0]?.id).toBe('activity-1');
  });

  it('passes feature announcements through unchanged', () => {
    const announcements = [
      {
        id: 'waive-tuition-charges',
        title: 'Waive tuition charges',
        description: "Remove a charge from a family's schedule when they should not be billed.",
        ctaLabel: 'Open',
        feature: 'my_school',
        href: `/school/${slug}/admin/my_school/tuition`,
        publishedAt: '2026-09-10',
      },
    ];

    const filtered = filterMobileDashboardSummary(
      slug,
      baseSummary({ featureAnnouncements: announcements }),
    );

    expect(filtered.featureAnnouncements).toEqual(announcements);
  });
});
