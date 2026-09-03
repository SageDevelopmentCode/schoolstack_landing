import { getRequestUser } from "@/lib/auth/session";
import { loadParentBillingStreamedData } from "@/lib/tuition/load-parent-billing-data";
import ParentBillingData from "./ParentBillingData";

type ParentBillingDataLoaderProps = {
  organizationId: string;
  familyId: string;
  slug: string;
};

export default async function ParentBillingDataLoader({
  organizationId,
  familyId,
  slug,
}: ParentBillingDataLoaderProps) {
  const user = await getRequestUser();
  if (!user) return null;

  const billingData = await loadParentBillingStreamedData({
    organizationId,
    familyId,
    slug,
    userId: user.id,
  });

  return <ParentBillingData billingData={billingData} />;
}
