export default function SchoolTeacherLoading() {
  return (
    <div className="flex min-h-0 flex-1 flex-col px-6 py-8">
      <div className="mx-auto w-full max-w-6xl space-y-8">
        <div className="space-y-3">
          <div className="h-4 w-28 animate-pulse rounded bg-gray-100" />
          <div className="h-10 w-48 animate-pulse rounded bg-gray-100" />
        </div>
        <div className="h-64 animate-pulse rounded-2xl bg-gray-100" />
      </div>
    </div>
  );
}
