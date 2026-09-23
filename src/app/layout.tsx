import NavigationRestoreInit from "@/components/NavigationRestoreInit";
import CookieConsentBanner from "@/components/legal/CookieConsentBanner";
import ConditionalAnalytics from "@/components/legal/ConditionalAnalytics";
import {
  fragmentMono,
  geist,
  lora,
  poppins,
} from "@/lib/fonts";
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
      </body>
    </html>
  );
}
