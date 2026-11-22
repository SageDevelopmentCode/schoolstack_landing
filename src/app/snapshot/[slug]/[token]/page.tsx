import type { Metadata } from "next";
import { notFound } from "next/navigation";
import GardenRoot from "@/components/garden/GardenRoot";
import SnapshotPage from "@/components/outreach-snapshot/SnapshotPage";
import { getOutreachPlan } from "@/data/outreach";
import { schoolDemoHref } from "@/data/school-demos";

type Params = { slug: string; token: string };

// Private, unlisted page: only someone with the emailed link can open it.
export const metadata: Metadata = {
  title: "Family experience snapshot",
  robots: { index: false, follow: false, nocache: true },
};

function findSnapshot({ slug, token }: Params) {
  const plan = getOutreachPlan(slug);
  if (!plan?.snapshot || plan.doNotEmail || plan.snapshot.token !== token) return null;
  return { plan, snapshot: plan.snapshot };
}

export default async function Page({ params }: { params: Promise<Params> }) {
  const found = findSnapshot(await params);
  if (!found) notFound();

  return (
    <GardenRoot className="min-h-dvh bg-[var(--sf-cream)]">
      <SnapshotPage
        slug={found.plan.slug}
        token={found.snapshot.token}
        schoolName={found.plan.schoolName}
        demoHref={schoolDemoHref(found.plan.slug)}
        snapshot={found.snapshot}
      />
    </GardenRoot>
  );
}
