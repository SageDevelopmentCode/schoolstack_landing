"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { Archive, Plus, Users } from "lucide-react";
import {
  DEMO_COMMITTEES,
  getCommitteeById,
  getDemoCommitteeIdForTemplate,
} from "@/data/school-demos/rooted-meadows-committees";
import type { Committee, CommitteeWorkspaceSection } from "./types";
import CommitteeWorkspaceShell from "./CommitteeWorkspaceShell";
import CreateCommitteeModal from "./CreateCommitteeModal";
import SendAugustSignupModal from "./SendAugustSignupModal";
import AugustSignupPanel from "./AugustSignupPanel";
import ArchiveCommitteeModal from "./ArchiveCommitteeModal";

export type CommitteeAdminView = "list" | "detail" | "signup" | "archive";

export default function CommitteesAdminPage({
  initialCommitteeId,
  initialView = "list",
  initialCommitteeSection = "home",
  openCreateModal = false,
  openCreateModalDelayMs,
  openSendAugustSignupModal = false,
  openSendAugustSignupModalDelayMs,
  openArchiveModal = false,
}: {
  initialCommitteeId?: string;
  initialView?: CommitteeAdminView;
  initialCommitteeSection?: CommitteeWorkspaceSection;
  openCreateModal?: boolean;
  openCreateModalDelayMs?: number;
  openSendAugustSignupModal?: boolean;
  openSendAugustSignupModalDelayMs?: number;
  openArchiveModal?: boolean;
}) {
  const [view, setView] = useState<CommitteeAdminView>(initialView);
  const [selectedId, setSelectedId] = useState<string | null>(
    initialCommitteeId ?? null,
  );
  const [section, setSection] = useState<CommitteeWorkspaceSection>(
    initialCommitteeSection,
  );
  const [showCreate, setShowCreate] = useState(false);
  const [showSendAugustSignup, setShowSendAugustSignup] = useState(false);
  const [showArchive, setShowArchive] = useState(openArchiveModal);
  const [committees, setCommittees] = useState(DEMO_COMMITTEES);
  const createModalOpenedRef = useRef(false);
  const sendAugustSignupModalOpenedRef = useRef(false);

  useEffect(() => {
    setView(initialView);
  }, [initialView]);

  useEffect(() => {
    if (initialCommitteeId) setSelectedId(initialCommitteeId);
  }, [initialCommitteeId]);

  useEffect(() => {
    setSection(initialCommitteeSection);
  }, [initialCommitteeSection]);

  useEffect(() => {
    if (!openCreateModal || createModalOpenedRef.current) return;
    const delayMs = openCreateModalDelayMs ?? 1500;
    const t = setTimeout(() => {
      createModalOpenedRef.current = true;
      setShowCreate(true);
    }, delayMs);
    return () => clearTimeout(t);
  }, [openCreateModal, openCreateModalDelayMs]);

  useEffect(() => {
    if (!openSendAugustSignupModal || sendAugustSignupModalOpenedRef.current) return;
    const delayMs = openSendAugustSignupModalDelayMs ?? 1500;
    const t = setTimeout(() => {
      sendAugustSignupModalOpenedRef.current = true;
      setShowSendAugustSignup(true);
    }, delayMs);
    return () => clearTimeout(t);
  }, [openSendAugustSignupModal, openSendAugustSignupModalDelayMs]);

  useEffect(() => {
    if (openArchiveModal) setShowArchive(true);
  }, [openArchiveModal]);

  const updateCommittee = (updated: Committee) => {
    setCommittees((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
  };

  const handleCreateWorkspace = (templateId: string) => {
    const committeeId = getDemoCommitteeIdForTemplate(templateId);
    setShowCreate(false);
    if (committeeId) {
      setSelectedId(committeeId);
      setView("detail");
      setSection("home");
    }
  };

  const handleSendAugustSignup = () => {
    setShowSendAugustSignup(false);
    setView("signup");
  };

  const selected = selectedId ? getCommitteeById(selectedId) : undefined;
  const activeCommittee = selected
    ? committees.find((c) => c.id === selected.id) ?? selected
    : undefined;

  if (view === "signup") {
    return (
      <div className="h-full overflow-y-auto p-6">
        <AugustSignupPanel />
      </div>
    );
  }

  if (view === "detail" && activeCommittee) {
    return (
      <>
        <CommitteeWorkspaceShell
          committee={activeCommittee}
          activeSection={section}
          onSectionChange={setSection}
          onBack={() => {
            setView("list");
            setSelectedId(null);
          }}
          showSettings
          isAdminView
          onCommitteeUpdate={updateCommittee}
          onArchive={() => setShowArchive(true)}
        />
        <AnimatePresence>
          {showArchive && (
            <ArchiveCommitteeModal
              committee={activeCommittee}
              onClose={() => setShowArchive(false)}
              onConfirm={() => {
                setCommittees((prev) =>
                  prev.map((c) =>
                    c.id === activeCommittee.id ? { ...c, status: "archived" } : c,
                  ),
                );
              }}
            />
          )}
        </AnimatePresence>
      </>
    );
  }

  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl font-heading font-semibold text-gray-800">Committees</h1>
          <p className="text-sm text-gray-500 mt-1">
            Structured parent workspaces for volunteer groups, coordinators, and festival teams.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setView("signup")}
            className="px-4 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 cursor-pointer"
          >
            August signup
          </button>
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[#827096] rounded-xl hover:bg-[#5A4D68] cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Create committee
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {committees.map((c) => (
          <button
            key={c.id}
            onClick={() => {
              setSelectedId(c.id);
              setView("detail");
              setSection("home");
            }}
            className="text-left p-5 bg-white border border-gray-100 rounded-2xl hover:border-[#827096]/30 hover:shadow-sm transition-all cursor-pointer"
          >
            <div className="flex items-center gap-2 flex-wrap mb-2">
              <h3 className="text-sm font-semibold text-gray-800">{c.name}</h3>
              <span
                className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full ${
                  c.status === "active"
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-gray-100 text-gray-500"
                }`}
              >
                {c.status}
              </span>
            </div>
            <p className="text-xs text-gray-500 line-clamp-2">{c.description}</p>
            <div className="flex items-center gap-3 mt-3 text-xs text-gray-400">
              <span className="flex items-center gap-1">
                <Users className="w-3.5 h-3.5" />
                {c.members.length} members
              </span>
              <span>{c.termLabel}</span>
            </div>
            {c.status === "archived" && (
              <span className="inline-flex items-center gap-1 mt-2 text-[10px] font-medium text-gray-400">
                <Archive className="w-3 h-3" />
                History preserved
              </span>
            )}
          </button>
        ))}
      </div>

      <AnimatePresence>
        {showCreate && (
          <CreateCommitteeModal
            onClose={() => setShowCreate(false)}
            onCreate={handleCreateWorkspace}
          />
        )}
        {showSendAugustSignup && (
          <SendAugustSignupModal
            onClose={() => setShowSendAugustSignup(false)}
            onSend={handleSendAugustSignup}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
