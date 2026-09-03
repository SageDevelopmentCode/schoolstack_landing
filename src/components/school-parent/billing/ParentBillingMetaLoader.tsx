import { cookies } from "next/headers";
import { fetchParentBillingPageMetaFromRpc } from "@/lib/tuition/parent-billing-page-meta";
import { createClient } from "@/utils/supabase/server";
import ParentBillingMetaData from "./ParentBillingMetaData";

type ParentBillingMetaLoaderProps = {
  organizationId: string;
  familyId: string;
};

export default async function ParentBillingMetaLoader({
  organizationId,
  familyId,
}: ParentBillingMetaLoaderProps) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const meta = await fetchParentBillingPageMetaFromRpc(
    supabase,
    organizationId,
    familyId,
  );

  if (!meta) return null;

  return <ParentBillingMetaData meta={meta} />;
}
