import type { SupabaseClient } from '@supabase/supabase-js';

import type { CommitteePortalApiNamespace } from '@/lib/committees/notify-committee-task-assignment';
import type { Committee, CommitteeWorkspaceSection } from '@/lib/parent/parent-committees-types';

export type ParentCommitteeSectionProps = {
  committee: Committee;
  organizationId: string;
  supabase: SupabaseClient;
  currentMemberId?: string;
  readOnly?: boolean;
  isAdmin?: boolean;
  portalApiNamespace?: CommitteePortalApiNamespace;
  schoolSlug?: string;
  onCommitteeChange: (committee: Committee) => void;
  onRefresh: (options?: { silent?: boolean }) => Promise<void>;
  onNavigate?: (section: CommitteeWorkspaceSection) => void;
  onJoinRequestsChanged?: () => void;
};
