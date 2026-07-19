type AdminPageStateProps = {
  variant: "loading" | "error";
  message?: string;
};

export function AdminPageState({ variant, message }: AdminPageStateProps) {
  if (variant === "loading") {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-3rem)] text-sm text-admin-faint">
        Loading…
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center h-[calc(100vh-3rem)] text-sm text-admin-error">
      {message ?? "Something went wrong"}
    </div>
  );
}
