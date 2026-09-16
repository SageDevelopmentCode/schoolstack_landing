import { PortalSupportRequestSheet } from '@/components/portal/portal-support-request-sheet';
import { submitAdminSupportRequest } from '@/lib/school-admin/support-request';

type AdminSupportRequestSheetProps = {
  visible: boolean;
  onClose: () => void;
  organizationId: string;
  slug: string;
  userEmail?: string | null;
  sourcePagePath?: string;
};

export function AdminSupportRequestSheet({
  visible,
  onClose,
  organizationId,
  slug,
  userEmail,
  sourcePagePath,
}: AdminSupportRequestSheetProps) {
  return (
    <PortalSupportRequestSheet
      visible={visible}
      onClose={onClose}
      organizationId={organizationId}
      userEmail={userEmail}
      sourcePagePath={sourcePagePath ?? `/school-admin/${slug}/dashboard`}
      errorOperation="school_admin_support_request_submit"
      onSubmit={submitAdminSupportRequest}
    />
  );
}
