type StudentContactCellProps = {
  contactName: string | null;
  contactEmail: string | null;
};

export default function StudentContactCell({
  contactName,
  contactEmail,
}: StudentContactCellProps) {
  return (
    <div className="min-w-0">
      <div className="truncate text-xs font-semibold" style={{ color: "#2C3E43" }}>
        {contactName?.trim() || "—"}
      </div>
      {contactEmail ? (
        <div
          className="mt-0.5 max-w-[14rem] truncate text-[11px]"
          style={{ color: "#849095" }}
        >
          {contactEmail}
        </div>
      ) : null}
    </div>
  );
}
