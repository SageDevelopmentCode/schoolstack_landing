"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import AdminHeader from "@/components/admin/AdminHeader";

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-bg flex flex-col pt-12">
      <AdminHeader variant="full" onSignOut={handleSignOut} />
      <main className="flex-1 min-h-0">{children}</main>
    </div>
  );
}
