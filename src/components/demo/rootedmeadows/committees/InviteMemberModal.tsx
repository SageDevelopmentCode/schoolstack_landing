"use client";

import { useState } from "react";
import {
  createCommitteeEntityId,
  getInviteCandidatesForCommittee,
} from "@/data/school-demos/rooted-meadows-committees";
import type { Committee, CommitteeMember } from "./types";
import CommitteeModalShell, { inputClass } from "./CommitteeModalShell";

export default function InviteMemberModal({
  committee,
  onClose,
  onSave,
}: {
  committee: Committee;
  onClose: () => void;
  onSave: (member: CommitteeMember) => void;
}) {
  const candidates = getInviteCandidatesForCommittee(committee);
  const [mode, setMode] = useState<"pick" | "manual">(candidates.length > 0 ? "pick" : "manual");
  const [selectedId, setSelectedId] = useState(candidates[0]?.id ?? "");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const handleSave = () => {
    if (mode === "pick") {
      const candidate = candidates.find((c) => c.id === selectedId);
      if (!candidate) return;
      onSave({
        id: createCommitteeEntityId("m"),
        name: candidate.name,
        email: candidate.email,
        role: "member",
      });
    } else {
      if (!name.trim() || !email.trim()) return;
      onSave({
        id: createCommitteeEntityId("m"),
        name: name.trim(),
        email: email.trim(),
        role: "member",
      });
    }
    onClose();
  };

  return (
    <CommitteeModalShell title="Invite member" onClose={onClose} onSave={handleSave} saveLabel="Send invite">
      {candidates.length > 0 && (
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setMode("pick")}
            className={`px-3 py-1.5 text-xs font-medium rounded-md cursor-pointer ${mode === "pick" ? "bg-[#827096]/10 text-[#827096]" : "text-gray-500 hover:bg-gray-50"}`}
          >
            From signup list
          </button>
          <button
            type="button"
            onClick={() => setMode("manual")}
            className={`px-3 py-1.5 text-xs font-medium rounded-md cursor-pointer ${mode === "manual" ? "bg-[#827096]/10 text-[#827096]" : "text-gray-500 hover:bg-gray-50"}`}
          >
            Enter manually
          </button>
        </div>
      )}
      {mode === "pick" && candidates.length > 0 ? (
        <div className="space-y-2">
          {candidates.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setSelectedId(c.id)}
              className={`w-full text-left p-3 rounded-md border transition-colors cursor-pointer ${
                selectedId === c.id ? "border-[#827096] bg-[#827096]/5" : "border-gray-100 hover:border-gray-200"
              }`}
            >
              <p className="text-sm font-semibold text-gray-800">{c.name}</p>
              <p className="text-xs text-gray-500">{c.familyName} · {c.email}</p>
            </button>
          ))}
        </div>
      ) : (
        <>
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} className={inputClass} placeholder="Parent name" />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} placeholder="email@example.com" />
          </div>
        </>
      )}
    </CommitteeModalShell>
  );
}
