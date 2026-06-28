"use client";

import { useState } from "react";
import { createCommitteeEntityId } from "@/data/school-demos/rooted-meadows-committees";
import type { CommitteeEvent } from "./types";
import CommitteeModalShell, { inputClass } from "./CommitteeModalShell";

export default function AddEventModal({
  onClose,
  onSave,
}: {
  onClose: () => void;
  onSave: (event: CommitteeEvent) => void;
}) {
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [type, setType] = useState<CommitteeEvent["type"]>("meeting");
  const [location, setLocation] = useState("");

  const handleSave = () => {
    if (!title.trim() || !date) return;
    onSave({
      id: createCommitteeEntityId("e"),
      title: title.trim(),
      date,
      time: time.trim() || undefined,
      type,
      location: location.trim() || undefined,
    });
    onClose();
  };

  return (
    <CommitteeModalShell title="Add calendar event" onClose={onClose} onSave={handleSave} saveLabel="Add event">
      <div>
        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Title</label>
        <input value={title} onChange={(e) => setTitle(e.target.value)} className={inputClass} placeholder="Event title" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Date</label>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={inputClass} />
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Time</label>
          <input value={time} onChange={(e) => setTime(e.target.value)} className={inputClass} placeholder="7:00 PM" />
        </div>
      </div>
      <div>
        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Type</label>
        <select value={type} onChange={(e) => setType(e.target.value as CommitteeEvent["type"])} className={inputClass}>
          <option value="meeting">Meeting</option>
          <option value="deadline">Deadline</option>
          <option value="service">Service</option>
          <option value="event">Event</option>
        </select>
      </div>
      <div>
        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Location</label>
        <input value={location} onChange={(e) => setLocation(e.target.value)} className={inputClass} placeholder="Optional location" />
      </div>
    </CommitteeModalShell>
  );
}
