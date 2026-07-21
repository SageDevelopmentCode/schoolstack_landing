import { Inbox } from "lucide-react";

type AdminEmptyStateProps = {
  message: string;
};

export function AdminEmptyState({ message }: AdminEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <Inbox className="w-8 h-8 text-admin-faint mb-2" strokeWidth={1.5} aria-hidden />
      <p className="text-sm text-admin-faint">{message}</p>
    </div>
  );
}
