export default function SchoolAdminLoading() {
  return (
    <div className="flex min-h-0 flex-1 flex-col p-6" aria-busy="true" aria-label="Loading admin page">
      <div className="space-y-4">
        <div className="h-6 w-40 animate-pulse rounded bg-gray-100" />
        <div className="h-32 animate-pulse rounded-xl bg-gray-100" />
        <div className="h-32 animate-pulse rounded-xl bg-gray-100" />
      </div>
    </div>
  );
}
