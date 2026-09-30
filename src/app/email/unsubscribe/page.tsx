import UnsubscribeConfirmClient from "@/components/email/UnsubscribeConfirmClient";
import {
  normalizeOutboundEmail,
  verifyUnsubscribeToken,
} from "@/lib/outbound-email-unsubscribe";
import { SITE_NAME } from "@/lib/site";

type SearchParams = Promise<{ email?: string; token?: string }>;

export default async function EmailUnsubscribePage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const email = normalizeOutboundEmail(params.email ?? "");
  const token = params.token?.trim() ?? "";
  const invalidLink = !email || !token || !verifyUnsubscribeToken(email, token);

  return (
    <div className="min-h-screen bg-[#F7F5F0] flex flex-col items-center justify-center px-4 py-16">
      <p className="text-xs uppercase tracking-wider text-stone-500 mb-8">
        {SITE_NAME}
      </p>
      <UnsubscribeConfirmClient
        email={email}
        token={token}
        invalidLink={invalidLink}
      />
    </div>
  );
}
