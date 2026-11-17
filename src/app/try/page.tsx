import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import GardenRoot from "@/components/garden/GardenRoot";
import TryGardenPage from "@/components/try/TryGardenPage";
import { resolveAuthenticatedLogin } from "@/lib/auth/login-destination";
import { createClient } from "@/utils/supabase/server";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Try MudKitchen for free",
  description:
    "Create a free MudKitchen school dashboard. Confirm your email with a code on this page.",
};

export default async function TryPage() {
  const supabase = createClient(await cookies());
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    let destination: string | null = null;
    try {
      const result = await resolveAuthenticatedLogin(supabase, user.id);
      if (result.ok && "needsSchoolSelection" in result) {
        destination = "/login";
      } else if (result.ok && "href" in result && result.href) {
        destination = result.href;
      }
    } catch {
      destination = null;
    }

    if (destination) {
      redirect(destination);
    }
  }

  return (
    <GardenRoot>
      <TryGardenPage />
    </GardenRoot>
  );
}
