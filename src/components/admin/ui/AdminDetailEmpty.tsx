type AdminDetailEmptyProps = {
  message: string;
};

export function AdminDetailEmpty({ message }: AdminDetailEmptyProps) {
  return (
    <div className="h-full flex items-center justify-center text-sm text-admin-faint">
      {message}
    </div>
  );
}
