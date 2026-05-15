import Link from "next/link";

const PRODUCT_LINKS = [
  "School Website",
  "Enrollment",
  "Admin Portal",
  "Parent Portal",
  "Teacher Portal",
  "Payments",
  "Leads CRM",
];

const COMPANY_LINKS = [
  { label: "About", href: "#about" },
  { label: "Contact", href: "#" },
  { label: "Book a Demo", href: "/get-started" },
];

const LEGAL_LINKS = [
  { label: "Privacy Policy", href: "#" },
  { label: "Terms of Service", href: "#" },
];

export default function Footer() {
  return (
    <footer className="bg-accent py-16">
      <div className="max-w-[1200px] mx-auto px-6 lg:px-16">
        {/* Main grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 lg:gap-16">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="font-display text-[17px] text-white/90">
              MudKitchen
            </Link>
            <p className="text-sm text-white/50 mt-2 max-w-[200px] leading-relaxed">
              Software built to run a real microschool.
            </p>
          </div>

          {/* Product */}
          <div>
            <h4 className="text-[11px] font-medium uppercase tracking-widest text-white/35 mb-4">
              Product
            </h4>
            <ul className="space-y-2">
              {PRODUCT_LINKS.map((link) => (
                <li key={link}>
                  <a
                    href="#"
                    className="text-sm text-white/55 hover:text-white/90 transition-colors duration-150 block"
                  >
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-[11px] font-medium uppercase tracking-widest text-white/35 mb-4">
              Company
            </h4>
            <ul className="space-y-2">
              {COMPANY_LINKS.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-sm text-white/55 hover:text-white/90 transition-colors duration-150 block"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-[11px] font-medium uppercase tracking-widest text-white/35 mb-4">
              Legal
            </h4>
            <ul className="space-y-2">
              {LEGAL_LINKS.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-sm text-white/55 hover:text-white/90 transition-colors duration-150 block"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/10 mt-12 pt-6 flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="text-xs text-white/35">
            © 2026 MudKitchen. All rights reserved.
          </p>
          <p className="text-xs text-white/35">
            Built by the team at{" "}
            <a
              href="#"
              className="text-accent-soft hover:text-white/80 transition-colors"
            >
              Sage Field
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
