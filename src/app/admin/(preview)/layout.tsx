import { requireAdmin } from "@/lib/auth";

export default async function AdminPreviewRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdmin();
  return children;
}
