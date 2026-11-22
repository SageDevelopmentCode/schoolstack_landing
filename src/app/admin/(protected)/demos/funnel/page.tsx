import { redirect } from "next/navigation";

// The outreach funnel moved to /admin/research (one workspace for the CRM and the sequence).
export default function AdminDemosFunnelPage() {
  redirect("/admin/research");
}
