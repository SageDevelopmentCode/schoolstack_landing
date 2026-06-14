import { Geist, Lora, Fragment_Mono, Delicious_Handrawn, Poppins } from "next/font/google";
import NavigationRestoreInit from "@/components/NavigationRestoreInit";
import { rootMetadata } from "@/lib/metadata";
import "./globals.css";

const geist = Geist({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-geist",
});

const lora = Lora({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  display: "swap",
  variable: "--font-lora",
});

const fragmentMono = Fragment_Mono({
  subsets: ["latin"],
  weight: ["400"],
  display: "swap",
  variable: "--font-fragment-mono",
});

const deliciousHandrawn = Delicious_Handrawn({
  subsets: ["latin"],
  weight: ["400"],
  display: "swap",
  variable: "--font-delicious",
});

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  display: "swap",
  variable: "--font-poppins",
});

export const metadata = rootMetadata();

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
      <html lang="en" className={`${geist.variable} ${lora.variable} ${fragmentMono.variable} ${deliciousHandrawn.variable} ${poppins.variable}`}>
      <body className="antialiased">
        <NavigationRestoreInit />
        {children}
      </body>
    </html>
  );
}
