import type { Metadata } from "next";
import { notFound } from "next/navigation";
import FreeSchoolHomeIntro from "@/components/school-admin/FreeSchoolHomeIntro";
import { getRequestUser } from "@/lib/auth/session";
import { fetchOrganizationWithSettings } from "@/lib/organization-settings/fetch";

function savedFirstName(
  metadata: Record<string, unknown> | undefined,
): string | null {
  const first =
    typeof metadata?.first_name === "string" ? metadata.first_name.trim() : "";
  if (first) return first;
  const full =
    typeof metadata?.full_name === "string" ? metadata.full_name.trim() : "";
  if (!full) return null;
  return full.split(/\s+/)[0] ?? null;
}

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const org = await fetchOrganizationWithSettings(slug);
  if (!org || org.plan !== "free") {
    return { title: "School Not Found" };
  }
  return { title: `Home · ${org.name} Admin` };
}

export default async function FreeSchoolHomePage({ params }: PageProps) {
  const [{ slug }, user] = await Promise.all([params, getRequestUser()]);
  const org = await fetchOrganizationWithSettings(slug);

  if (!org || org.plan !== "free") {
    notFound();
  }

  const initialName = savedFirstName(
    user?.user_metadata as Record<string, unknown> | undefined,
  );

  return (
    <div className="mx-auto max-w-[1350px] px-[clamp(25px,4vw,56px)] py-[30px] pb-14">
      <FreeSchoolHomeIntro schoolName={org.name} initialName={initialName} />
    </div>
  );
}
