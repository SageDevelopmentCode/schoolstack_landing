import { Suspense } from "react";
import AdminSupportInbox from "@/components/admin/support/AdminSupportInbox";
import { AdminPageState } from "@/components/admin/ui/AdminPageState";

export default function AdminSupportPage() {
  return (
    <Suspense fallback={<AdminPageState variant="loading" message="Loading support conversations…" />}>
      <AdminSupportInbox />
    </Suspense>
  );
}
