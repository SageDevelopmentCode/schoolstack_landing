import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';

import { useParentClassroomSignups } from '@/contexts/parent-classroom-signups-context';
import type {
  ClassroomSignup,
  ClassroomSignupResponse,
  ParentClassroomSignupStudentOption,
} from '@/lib/parent/parent-classroom-signups-types';
import { goBackOrReplace } from '@/lib/navigation';
import { parentClassroomSignupsRoute } from '@/lib/parent/parent-nav';
import { fetchParentClassroomSignupDetail } from '@/lib/parent/parent-portal-api';
import { useMobileErrorReporter } from '@/lib/use-mobile-error-reporter';

export type ParentClassroomSignupDetailController = {
  organizationId: string;
  signupId: string;
  signup: ClassroomSignup | null;
  responses: ClassroomSignupResponse[];
  familyResponse: ClassroomSignupResponse | null;
  studentOptions: ParentClassroomSignupStudentOption[];
  isLoading: boolean;
  error: string | null;
  retry: () => void;
  onBack: () => void;
  onSubmitted: (response: ClassroomSignupResponse, allResponses: ClassroomSignupResponse[]) => void;
  onWithdrawn: (familyId: string, allResponses: ClassroomSignupResponse[]) => void;
};

/** Data for one signup (same fetch, reporting and context updates as before; no UI). */
export function useParentClassroomSignupDetailController({
  slug,
  organizationId,
  signupId,
}: {
  slug: string;
  organizationId: string;
  signupId: string;
}): ParentClassroomSignupDetailController {
  const router = useRouter();
  const { applySubmittedResponse, applyWithdrawnResponse } = useParentClassroomSignups();
  const { reportError } = useMobileErrorReporter(organizationId);

  const [signup, setSignup] = useState<ClassroomSignup | null>(null);
  const [responses, setResponses] = useState<ClassroomSignupResponse[]>([]);
  const [familyResponse, setFamilyResponse] = useState<ClassroomSignupResponse | null>(null);
  const [studentOptions, setStudentOptions] = useState<ParentClassroomSignupStudentOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadDetail = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const detail = await fetchParentClassroomSignupDetail(organizationId, signupId);
      setSignup(detail.signup);
      setResponses(detail.responses);
      setFamilyResponse(detail.familyResponse);
      setStudentOptions(detail.studentOptions);
    } catch (loadError) {
      reportError('classroom_signups.detail', loadError);
      setError(loadError instanceof Error ? loadError.message : 'Failed to load signup.');
    } finally {
      setIsLoading(false);
    }
  }, [organizationId, reportError, signupId]);

  useEffect(() => {
    void loadDetail();
  }, [loadDetail]);

  const onSubmitted = useCallback(
    (response: ClassroomSignupResponse, allResponses: ClassroomSignupResponse[]) => {
      setFamilyResponse(response);
      setResponses(allResponses);
      applySubmittedResponse(signupId, response);
    },
    [applySubmittedResponse, signupId],
  );

  const onWithdrawn = useCallback(
    (_familyId: string, allResponses: ClassroomSignupResponse[]) => {
      setFamilyResponse(null);
      setResponses(allResponses);
      applyWithdrawnResponse(signupId);
    },
    [applyWithdrawnResponse, signupId],
  );

  const retry = useCallback(() => void loadDetail(), [loadDetail]);
  // Opened from a deep link there is nothing to pop; fall back to the signups list.
  const onBack = useCallback(
    () => goBackOrReplace(router, parentClassroomSignupsRoute(slug)),
    [router, slug],
  );

  return {
    organizationId,
    signupId,
    signup,
    responses,
    familyResponse,
    studentOptions,
    isLoading,
    error,
    retry,
    onBack,
    onSubmitted,
    onWithdrawn,
  };
}
