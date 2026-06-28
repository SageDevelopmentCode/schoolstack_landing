"use client";

import { useState } from "react";
import { Check, UserPlus } from "lucide-react";
import {
  AUGUST_SIGNUP_RESPONSES,
  DEMO_COMMITTEES,
} from "@/data/school-demos/rooted-meadows-committees";
import type { AugustSignupResponse } from "./types";

const STATUS_STYLES = {
  pending: "bg-amber-100 text-amber-700",
  placed: "bg-blue-100 text-blue-700",
  invited: "bg-emerald-100 text-emerald-700",
};

export default function AugustSignupPanel({
  onPlace,
}: {
  onPlace?: (signupId: string, committeeId: string) => void;
}) {
  const [responses, setResponses] = useState(AUGUST_SIGNUP_RESPONSES);

  const handlePlace = (signup: AugustSignupResponse) => {
    setResponses((prev) =>
      prev.map((r) =>
        r.id === signup.id
          ? { ...r, status: "placed" as const, placedCommitteeId: "service-sunshine-2025" }
          : r,
      ),
    );
    onPlace?.(signup.id, "service-sunshine-2025");
  };

  const handleInvite = (signup: AugustSignupResponse) => {
    setResponses((prev) =>
      prev.map((r) =>
        r.id === signup.id ? { ...r, status: "invited" as const } : r,
      ),
    );
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-base font-semibold text-gray-800">August volunteer signup</h3>
        <p className="text-sm text-gray-500 mt-1">
          Review family responses and place members into committee workspaces.
        </p>
      </div>
      <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/80">
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Family</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Preferences</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Status</th>
              <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {responses.map((r) => (
              <tr
                key={r.id}
                className={r.highlight ? "bg-[#b3b462]/8" : undefined}
              >
                <td className="px-4 py-3">
                  <p className="font-medium text-gray-800">{r.familyName}</p>
                  <p className="text-xs text-gray-400">{r.parentName}</p>
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1">
                    {r.preferences.map((p) => (
                      <span
                        key={p}
                        className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-gray-100 text-gray-600"
                      >
                        {p}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full ${STATUS_STYLES[r.status]}`}>
                    {r.status}
                  </span>
                  {r.placedCommitteeId && (
                    <p className="text-[10px] text-gray-400 mt-1">
                      {DEMO_COMMITTEES.find((c) => c.id === r.placedCommitteeId)?.name}
                    </p>
                  )}
                </td>
                <td className="px-4 py-3 text-right">
                  {r.status === "pending" && (
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handlePlace(r)}
                        className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-[#827096] border border-[#827096]/30 rounded-lg hover:bg-[#827096]/5 cursor-pointer"
                      >
                        <Check className="w-3 h-3" />
                        Place in Service & Sunshine
                      </button>
                    </div>
                  )}
                  {r.status === "placed" && (
                    <button
                      onClick={() => handleInvite(r)}
                      className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-white bg-[#827096] rounded-lg hover:bg-[#5A4D68] cursor-pointer ml-auto"
                    >
                      <UserPlus className="w-3 h-3" />
                      Send invite
                    </button>
                  )}
                  {r.status === "invited" && (
                    <span className="text-xs text-emerald-600 font-medium">Invited</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
