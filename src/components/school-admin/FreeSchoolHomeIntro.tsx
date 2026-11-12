"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

type FreeSchoolHomeIntroProps = {
  schoolName: string;
  initialName: string | null;
};

export default function FreeSchoolHomeIntro({
  schoolName,
  initialName,
}: FreeSchoolHomeIntroProps) {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const [name, setName] = useState(initialName ?? "");
  const [savedName, setSavedName] = useState(initialName);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function saveName() {
    const trimmed = name.trim();
    if (!trimmed || saving) return;
    setSaving(true);
    setError(null);
    const { error: updateError } = await supabase.auth.updateUser({
      data: { first_name: trimmed, full_name: trimmed },
    });
    setSaving(false);
    if (updateError) {
      setError("Could not save your name. Please try again.");
      return;
    }
    setSavedName(trimmed);
    router.refresh();
  }

  if (savedName) {
    return (
      <>
        <h1 className="font-secondary text-[clamp(1.8rem,3vw,2.4rem)] font-bold tracking-[-0.04em] text-[#1d1a16]">
          Welcome, {savedName}
        </h1>
        <p className="mt-3 max-w-xl font-secondary text-[15px] leading-relaxed text-[#1d1a16]/70">
          This is the home for {schoolName}.
        </p>
      </>
    );
  }

  return (
    <>
      <h1 className="font-secondary text-[clamp(1.8rem,3vw,2.4rem)] font-bold tracking-[-0.04em] text-[#1d1a16]">
        What&rsquo;s your name?
      </h1>
      <p className="mt-3 max-w-xl font-secondary text-[15px] leading-relaxed text-[#1d1a16]/70">
        We&rsquo;ll use it to welcome you to {schoolName}.
      </p>
      <form
        className="mt-6 flex max-w-md flex-col gap-3 sm:flex-row sm:items-center"
        onSubmit={(event) => {
          event.preventDefault();
          void saveName();
        }}
      >
        <label className="sr-only" htmlFor="free-school-name">
          Your name
        </label>
        <input
          id="free-school-name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          autoComplete="name"
          placeholder="Your name"
          className="h-12 flex-1 rounded-full border border-black/15 bg-white px-5 font-secondary text-[15px] text-[#1d1a16] outline-none focus:border-[#1d1a16]"
        />
        <button
          type="submit"
          disabled={saving || !name.trim()}
          className="h-12 rounded-full bg-[#1d1a16] px-6 font-secondary text-[15px] font-semibold text-white disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save"}
        </button>
      </form>
      {error ? (
        <p className="mt-3 font-secondary text-sm text-clay">{error}</p>
      ) : null}
    </>
  );
}
