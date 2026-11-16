import NavigationRestoreInit from "@/components/NavigationRestoreInit";
import CookieConsentBanner from "@/components/legal/CookieConsentBanner";
import ConditionalAnalytics from "@/components/legal/ConditionalAnalytics";
import { SpeedInsights } from "@vercel/speed-insights/next";
// Import font modules directly, not the `@/lib/fonts` barrel: the barrel pulls in every demo
// brand font, and next/font would then add all of them to every page.
import { fragmentMono, geist, poppins } from "@/lib/fonts/google";
import { lora } from "@/lib/fonts/lora";
import { rootMetadata } from "@/lib/metadata";
import "./globals.css";

export const metadata = rootMetadata();

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
      <html lang="en" className={`${geist.variable} ${lora.variable} ${fragmentMono.variable} ${poppins.variable}`}>
      <body className="antialiased">
        <NavigationRestoreInit />
        {children}
        <CookieConsentBanner />
        <ConditionalAnalytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
