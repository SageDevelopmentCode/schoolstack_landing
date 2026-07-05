import type { SupabaseClient } from "@supabase/supabase-js";

export type ProgramStatus = "draft" | "open" | "waitlist" | "full" | "closed";

export type ProgramType =
  | "school_year"
  | "summer"
  | "camp"
  | "after_school"
  | string;

export type ProgramOption = {
  id: string;
  name: string;
};

export type Program = {
  id: string;
  organization_id: string;
  name: string;
  type: ProgramType;
  status: ProgramStatus;
  start_date: string | null;
  end_date: string | null;
  capacity: number | null;
  created_at: string;
  updated_at: string;
};

export type CreateProgramInput = {
  name: string;
  type: ProgramType;
  status?: ProgramStatus;
  start_date?: string | null;
  end_date?: string | null;
  capacity?: number | null;
};

export type UpdateProgramInput = Partial<CreateProgramInput>;

export const PROGRAM_TYPE_OPTIONS: {
  value: ProgramType;
  label: string;
}[] = [
  { value: "school_year", label: "School year" },
  { value: "summer", label: "Summer" },
  { value: "camp", label: "Camp" },
  { value: "after_school", label: "After school" },
];

export const PROGRAM_STATUS_OPTIONS: {
  value: ProgramStatus;
  label: string;
}[] = [
  { value: "draft", label: "Draft" },
  { value: "open", label: "Open" },
  { value: "waitlist", label: "Waitlist" },
  { value: "full", label: "Full" },
  { value: "closed", label: "Closed" },
];

function programFromRow(row: Record<string, unknown>): Program {
  return {
    id: String(row.id),
    organization_id: String(row.organization_id),
    name: String(row.name),
    type: String(row.type),
    status: row.status as ProgramStatus,
    start_date: row.start_date ? String(row.start_date) : null,
    end_date: row.end_date ? String(row.end_date) : null,
    capacity:
      row.capacity === null || row.capacity === undefined
        ? null
        : Number(row.capacity),
    created_at: String(row.created_at),
    updated_at: String(row.updated_at),
  };
}

function isForeignKeyViolation(error: { code?: string; message?: string }): boolean {
  return (
    error.code === "23503" ||
    Boolean(error.message?.includes("violates foreign key constraint"))
  );
}

export async function listPrograms(
  supabase: SupabaseClient,
  organizationId: string,
): Promise<ProgramOption[]> {
  const { data, error } = await supabase
    .from("programs")
    .select("id, name")
    .eq("organization_id", organizationId)
    .order("name", { ascending: true });

  if (error) throw error;
  return (data ?? []) as ProgramOption[];
}

export async function listProgramsDetailed(
  supabase: SupabaseClient,
  organizationId: string,
): Promise<Program[]> {
  const { data, error } = await supabase
    .from("programs")
    .select("*")
    .eq("organization_id", organizationId)
    .order("name", { ascending: true });

  if (error) throw error;
  return (data ?? []).map((row) =>
    programFromRow(row as Record<string, unknown>),
  );
}

export async function createProgram(
  supabase: SupabaseClient,
  organizationId: string,
  input: CreateProgramInput,
): Promise<Program> {
  const name = input.name.trim();
  if (!name) {
    throw new Error("Program name is required.");
  }

  const { data, error } = await supabase
    .from("programs")
    .insert({
      organization_id: organizationId,
      name,
      type: input.type.trim() || "school_year",
      status: input.status ?? "open",
      start_date: input.start_date || null,
      end_date: input.end_date || null,
      capacity: input.capacity ?? null,
    })
    .select("*")
    .single();

  if (error) throw error;
  return programFromRow(data as Record<string, unknown>);
}

export async function updateProgram(
  supabase: SupabaseClient,
  programId: string,
  organizationId: string,
  input: UpdateProgramInput,
): Promise<Program> {
  const patch: Record<string, unknown> = {};

  if (input.name !== undefined) {
    const name = input.name.trim();
    if (!name) throw new Error("Program name is required.");
    patch.name = name;
  }
  if (input.type !== undefined) patch.type = input.type.trim() || "school_year";
  if (input.status !== undefined) patch.status = input.status;
  if (input.start_date !== undefined) patch.start_date = input.start_date || null;
  if (input.end_date !== undefined) patch.end_date = input.end_date || null;
  if (input.capacity !== undefined) patch.capacity = input.capacity;

  const { data, error } = await supabase
    .from("programs")
    .update(patch)
    .eq("id", programId)
    .eq("organization_id", organizationId)
    .select("*")
    .single();

  if (error) throw error;
  return programFromRow(data as Record<string, unknown>);
}

export async function deleteProgram(
  supabase: SupabaseClient,
  programId: string,
  organizationId: string,
): Promise<void> {
  const { error } = await supabase
    .from("programs")
    .delete()
    .eq("id", programId)
    .eq("organization_id", organizationId);

  if (error) {
    if (isForeignKeyViolation(error)) {
      throw new Error(
        "This program is linked to applications or other records and cannot be deleted.",
      );
    }
    throw error;
  }
}

export function programTypeLabel(type: ProgramType): string {
  const match = PROGRAM_TYPE_OPTIONS.find((option) => option.value === type);
  return match?.label ?? type
    .split("_")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function programStatusLabel(status: ProgramStatus): string {
  return (
    PROGRAM_STATUS_OPTIONS.find((option) => option.value === status)?.label ??
    status
  );
}
