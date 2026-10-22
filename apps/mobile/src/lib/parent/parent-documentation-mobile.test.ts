import { adaptParentDocumentationGuidesForMobile } from '@/lib/parent/parent-documentation-mobile';
import type { ParentDocGuide } from '@/lib/parent/parent-portal-api';

function sampleGuide(overrides: Partial<ParentDocGuide> & Pick<ParentDocGuide, 'id'>): ParentDocGuide {
  return {
    title: 'Test',
    category: 'Test',
    summary: 'Summary',
    keywords: [],
    steps: [],
    ...overrides,
  };
}

describe('adaptParentDocumentationGuidesForMobile', () => {
  const slug = 'rooted-meadows';

  it('removes the open apply dashboard guide', () => {
    const guides = adaptParentDocumentationGuidesForMobile(
      [
        sampleGuide({ id: 'open-apply-dashboard', title: 'Open your apply dashboard' }),
        sampleGuide({ id: 'view-pay-invoices', title: 'Billing' }),
      ],
      slug,
    );
    expect(guides.map((g) => g.id)).toEqual(['view-pay-invoices']);
  });

  it('rewrites enrollment guides with mobile routes and no apply hrefs', () => {
    const guides = adaptParentDocumentationGuidesForMobile(
      [
        sampleGuide({ id: 'sign-enrollment-agreement' }),
        sampleGuide({ id: 'complete-enrollment-checklist' }),
      ],
      slug,
    );

    const hrefs = guides.flatMap((g) =>
      g.steps.filter((s) => s.action?.href).map((s) => s.action!.href),
    );
    expect(hrefs).toEqual([
      `/school/${slug}/parent`,
      `/school/${slug}/parent/children`,
      `/school/${slug}/parent`,
      `/school/${slug}/parent/children`,
    ]);
    expect(hrefs.some((h) => h.includes('/apply'))).toBe(false);
  });

  it('strips apply step actions from other guides', () => {
    const guides = adaptParentDocumentationGuidesForMobile(
      [
        sampleGuide({
          id: 'other-guide',
          steps: [
            {
              title: 'Step',
              description: 'Desc',
              action: { label: 'Apply', href: `/school/${slug}/apply` },
            },
          ],
        }),
      ],
      slug,
    );
    expect(guides[0].steps[0].action).toBeUndefined();
  });
});
