"use client";

import { useMemo, useState } from "react";
import { Check, UserPlus } from "lucide-react";
import {
  AUGUST_SIGNUP_RESPONSES,
  DEMO_COMMITTEES,
} from "@/data/school-demos/rooted-meadows-committees";
import AugustSignupDetailModal from "./AugustSignupDetailModal";
import type { AugustSignupResponse } from "./types";

const STATUS_STYLES = {
  pending: "bg-amber-100 text-amber-700",
  placed: "bg-blue-100 text-blue-700",
  invited: "bg-emerald-100 text-emerald-700",
};

const STATUS_LABELS = {
  pending: "Pending",
  placed: "Placed",
  invited: "Invite sent",
};

export default function AugustSignupPanel({
  onPlace,
}: {
  onPlace?: (signupId: string, committeeId: string) => void;
}) {
  const [responses, setResponses] = useState(AUGUST_SIGNUP_RESPONSES);
  const [selectedSignup, setSelectedSignup] = useState<AugustSignupResponse | null>(null);

  const stats = useMemo(() => {
    const invitesSent = responses.filter((r) => r.status === "invited").length;
    return { total: responses.length, invitesSent };
  }, [responses]);

  const updateResponse = (id: string, patch: Partial<AugustSignupResponse>) => {
    setResponses((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));
    setSelectedSignup((prev) => (prev?.id === id ? { ...prev, ...patch } : prev));
  };

  const handlePlace = (signup: AugustSignupResponse, e: React.MouseEvent) => {
    e.stopPropagation();
    const patch: Partial<AugustSignupResponse> = {
      status: "placed",
      placedCommitteeId: "service-sunshine-2025",
      assignedRole: "Member",
      participationSummary:
        "Volunteering for service projects and family support activities throughout the school year.",
    };
    updateResponse(signup.id, patch);
    onPlace?.(signup.id, "service-sunshine-2025");
  };

  const handleInvite = (signup: AugustSignupResponse, e: React.MouseEvent) => {
    e.stopPropagation();
    updateResponse(signup.id, {
      status: "invited",
      inviteSentAt: "Aug 28, 2025",
    });
  };

  return (
    <div className="h-full flex flex-col min-h-0">
      <div className="shrink-0 pb-4">
        <h3 className="text-base font-semibold text-gray-800">August volunteer signup</h3>
        <p className="text-sm text-gray-500 mt-1">
          Review family responses and place members into committee workspaces.
        </p>
        <p className="text-xs text-gray-400 mt-1">
          {stats.total} families · {stats.invitesSent} invites sent
        </p>
      </div>
      <div className="-mx-6 flex-1 min-h-0 overflow-y-auto border-t border-gray-100">
        <table className="w-full text-sm">
            <thead className="sticky top-0 z-10">
              <tr className="border-b border-gray-100 bg-gray-50/95 backdrop-blur-sm">
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">
                  Family
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">
                  Preferences
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">
                  Status
                </th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {responses.map((r) => (
                <tr
                  key={r.id}
                  onClick={() => setSelectedSignup(r)}
                  className={`cursor-pointer transition-colors hover:bg-gray-50/80 ${
                    r.highlight ? "bg-[#b3b462]/8" : undefined
                  }`}
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
                    <span
                      className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full ${STATUS_STYLES[r.status]}`}
                    >
                      {STATUS_LABELS[r.status]}
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
                          onClick={(e) => handlePlace(r, e)}
                          className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-[#827096] border border-[#827096]/30 rounded-lg hover:bg-[#827096]/5 cursor-pointer"
                        >
                          <Check className="w-3 h-3" />
                          Place in Service & Sunshine
                        </button>
                      </div>
                    )}
                    {r.status === "placed" && (
                      <button
                        onClick={(e) => handleInvite(r, e)}
                        className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-white bg-[#827096] rounded-lg hover:bg-[#5A4D68] cursor-pointer ml-auto"
                      >
                        <UserPlus className="w-3 h-3" />
                        Send invite
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
      </div>

      <AugustSignupDetailModal
        signup={selectedSignup}
        onClose={() => setSelectedSignup(null)}
      />
    </div>
  );
}
