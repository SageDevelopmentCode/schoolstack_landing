import { redirect } from "next/navigation";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export default async function SchoolApplyRedirectPage({ params }: PageProps) {
  const { slug } = await params;
  redirect(`/school/${slug}/forms/apply`);
}
