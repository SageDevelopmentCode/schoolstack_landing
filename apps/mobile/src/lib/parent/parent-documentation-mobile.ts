import type { ParentDocGuide } from '@/lib/parent/parent-portal-api';

const APPLY_GUIDE_IDS_TO_DROP = new Set(['open-apply-dashboard']);

function isApplyHref(href: string): boolean {
  return /\/apply(?:\/|$|\?)/.test(href);
}

function stripApplyStepActions(guide: ParentDocGuide): ParentDocGuide {
  return {
    ...guide,
    steps: guide.steps.map((step) => {
      if (!step.action?.href || !isApplyHref(step.action.href)) {
        return step;
      }
      const { action: _action, ...rest } = step;
      return rest;
    }),
  };
}

function mobileSignEnrollmentAgreementGuide(slug: string): ParentDocGuide {
  const parentHomeHref = `/school/${slug}/parent`;
  const childrenHref = `/school/${slug}/parent/children`;

  return {
    id: 'sign-enrollment-agreement',
    title: 'Sign your enrollment agreement',
    category: 'Getting started',
    summary:
      'Review and sign enrollment agreements when your school sends them for your child.',
    keywords: ['enrollment', 'agreement', 'sign', 'contract', 'e-sign'],
    steps: [
      {
        title: 'Check Start here on Home',
        description:
          'Open the Home tab and look at Start here for urgent enrollment agreement alerts for your child.',
        action: {
          label: 'Go to Home',
          href: parentHomeHref,
        },
      },
      {
        title: 'Open your child in Your children',
        description:
          'Open Your children, select your child, and go to their enrollment section to review the agreement.',
        action: {
          label: 'Open Your children',
          href: childrenHref,
        },
      },
      {
        title: 'Review, sign, and submit',
        description:
          'Read the agreement terms, complete any required fields, and submit the signed agreement so enrollment can continue.',
      },
    ],
  };
}

function mobileCompleteEnrollmentChecklistGuide(slug: string): ParentDocGuide {
  const parentHomeHref = `/school/${slug}/parent`;
  const childrenHref = `/school/${slug}/parent/children`;

  return {
    id: 'complete-enrollment-checklist',
    title: 'Complete your enrollment checklist',
    category: 'Applications',
    summary:
      'Work through required enrollment forms and documents for each child after acceptance.',
    keywords: ['enrollment', 'checklist', 'forms', 'documents', 'tasks'],
    steps: [
      {
        title: 'Check Start here on Home',
        description:
          'Enrollment tasks and reminders often appear on the Home tab under Start here.',
        action: {
          label: 'Go to Home',
          href: parentHomeHref,
        },
      },
      {
        title: 'Open enrollment for your child',
        description:
          'In Your children, select your child and open their enrollment checklist to continue required items.',
        action: {
          label: 'Open Your children',
          href: childrenHref,
        },
      },
      {
        title: 'Complete each checklist item',
        description:
          'Work through forms, uploads, and any required agreement on the enrollment page.',
      },
    ],
  };
}

/**
 * Adapts parent portal documentation guides for the mobile app (no web-only apply dashboard).
 */
export function adaptParentDocumentationGuidesForMobile(
  guides: ParentDocGuide[],
  slug: string,
): ParentDocGuide[] {
  return guides
    .filter((guide) => !APPLY_GUIDE_IDS_TO_DROP.has(guide.id))
    .map((guide) => {
      if (guide.id === 'sign-enrollment-agreement') {
        return mobileSignEnrollmentAgreementGuide(slug);
      }
      if (guide.id === 'complete-enrollment-checklist') {
        return mobileCompleteEnrollmentChecklistGuide(slug);
      }
      return stripApplyStepActions(guide);
    });
}
