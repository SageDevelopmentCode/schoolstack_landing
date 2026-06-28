"use client";

import { useEffect, useRef, useState } from "react";
import { Send } from "lucide-react";
import type { Committee, CommitteeMessage } from "./types";

function Avatar({
  initials,
  color = "#827096",
}: {
  initials: string;
  color?: string;
}) {
  return (
    <div
      className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-semibold flex-shrink-0"
      style={{ backgroundColor: color }}
    >
      {initials}
    </div>
  );
}

export default function CommitteeMessagesSection({
  committee,
  currentUserId = "m-ss-sarah",
}: {
  committee: Committee;
  currentUserId?: string;
}) {
  const [messages, setMessages] = useState<CommitteeMessage[]>(committee.messages);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const send = () => {
    if (!input.trim()) return;
    const me = committee.members.find((m) => m.id === currentUserId);
    setMessages([
      ...messages,
      {
        id: `msg-${Date.now()}`,
        senderId: currentUserId,
        senderName: me?.name ?? "You",
        text: input.trim(),
        time: "Just now",
      },
    ]);
    setInput("");
  };

  return (
    <div className="flex flex-col h-[480px] bg-white border border-gray-100 rounded-2xl overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-100">
        <p className="text-sm font-semibold text-gray-800">Committee thread</p>
        <p className="text-xs text-gray-400">Private to {committee.name} members</p>
      </div>
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((m) => {
          const isMe = m.senderId === currentUserId;
          return (
            <div key={m.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
              {!isMe && (
                <Avatar
                  initials={m.senderName
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .slice(0, 2)}
                />
              )}
              <div className={`max-w-[75%] mx-2 ${isMe ? "order-first" : ""}`}>
                {!isMe && (
                  <p className="text-[10px] text-gray-400 mb-0.5 ml-1">{m.senderName}</p>
                )}
                <div
                  className={`px-3 py-2 rounded-2xl text-sm ${
                    isMe
                      ? "bg-[#827096] text-white rounded-br-sm"
                      : "bg-gray-100 text-gray-700 rounded-bl-sm"
                  }`}
                >
                  {m.text}
                </div>
                <p className={`text-[10px] mt-1 ${isMe ? "text-right text-gray-400" : "text-gray-400 ml-1"}`}>
                  {m.time}
                </p>
              </div>
            </div>
          );
        })}
      </div>
      <div className="p-3 border-t border-gray-100 flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder="Message the committee..."
          className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-[#827096]/50"
        />
        <button
          onClick={send}
          className="p-2 rounded-xl bg-[#827096] text-white hover:bg-[#5A4D68] transition-colors cursor-pointer"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
