"use client";

import { useState } from "react";
import {
  formatActivityEventNarrative,
  resolveActorDisplayLabel,
  type EnrichedActivityEvent,
} from "@/lib/activity-event-display";
import { formatActivityActionLabel, ACTIVITY_ACTIONS } from "@/lib/activity-log";

type ActivityLogDetailProps = {
  event: EnrichedActivityEvent;
};

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function copyToClipboard(value: string) {
  void navigator.clipboard.writeText(value);
}

function DetailField({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div>
      <dt className="text-admin-faint text-xs">{label}</dt>
      <dd
        className={`text-admin-text break-all ${mono ? "font-mono text-xs" : ""}`}
      >
        {value}
      </dd>
    </div>
  );
}

function isOperationalErrorAction(action: string): boolean {
  return (
    action === ACTIVITY_ACTIONS.API_ERROR ||
    action === ACTIVITY_ACTIONS.ADMIN_OPERATION_FAILED ||
    action === ACTIVITY_ACTIONS.NOTIFICATION_FAILED
  );
}

function readMetadataString(
  metadata: Record<string, unknown>,
  key: string,
): string | null {
  const value = metadata[key];
  if (value === null || value === undefined) return null;
  return String(value);
}

export default function ActivityLogDetail({ event }: ActivityLogDetailProps) {
  const [showTechnicalDetails, setShowTechnicalDetails] = useState(false);
  const actorLabel = resolveActorDisplayLabel(event, event);
  const narrative = formatActivityEventNarrative(event, event);
  const actorName = event.resolvedActorName ?? event.actor_name?.trim() ?? "—";
  const actorEmail = event.displayActorEmail ?? event.actor_email ?? "—";
  const isOperationalError = isOperationalErrorAction(event.action);
  const errorRoute = readMetadataString(event.metadata, "route");
  const errorMethod = readMetadataString(event.metadata, "method");
  const errorStatus = readMetadataString(event.metadata, "status");
  const errorMessage = readMetadataString(event.metadata, "error");
  const errorStack =
    typeof event.metadata.stack === "string" ? event.metadata.stack : null;

  return (
    <div className="p-4 space-y-6">
      <div>
        <h1 className="text-lg font-medium text-admin-text leading-snug">
          {narrative.startsWith(actorLabel) ? (
            <>
              <span className="font-semibold">{actorLabel}</span>
              {narrative.slice(actorLabel.length)}
            </>
          ) : (
            narrative
          )}
        </h1>
        <p className="text-sm text-admin-muted mt-1">
          {formatDateTime(event.created_at)}
        </p>
      </div>

      <section className="bg-admin-surface border border-admin-border rounded-admin-md p-4 space-y-4">
        <h2 className="text-xs font-semibold text-admin-faint uppercase tracking-wide">
          Event
        </h2>
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
          <DetailField
            label="Organization"
            value={event.organizations?.name ?? "—"}
          />
          <DetailField
            label="Action"
            value={formatActivityActionLabel(event.action)}
          />
          <DetailField label="Actor name" value={actorName} />
          <DetailField label="Actor email" value={actorEmail} />
          <DetailField label="Actor type" value={event.actor_type} />
          <DetailField label="Surface" value={event.surface} />
          <DetailField
            label="Severity"
            value={event.severity.charAt(0).toUpperCase() + event.severity.slice(1)}
          />
          <DetailField
            label="Raw action"
            value={event.action}
            mono
          />
        </dl>
      </section>

      {isOperationalError ? (
        <section className="bg-red-50 border border-red-200 rounded-admin-md p-4 space-y-3">
          <h2 className="text-xs font-semibold text-red-800 uppercase tracking-wide">
            Error details
          </h2>
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            {errorRoute ? <DetailField label="Route" value={errorRoute} mono /> : null}
            {errorMethod ? <DetailField label="Method" value={errorMethod} /> : null}
            {errorStatus ? <DetailField label="Status" value={errorStatus} /> : null}
            {errorMessage ? (
              <div className="sm:col-span-2">
                <DetailField label="Message" value={errorMessage} />
              </div>
            ) : null}
          </dl>
          {errorStack ? (
            <div>
              <p className="text-red-800 text-xs mb-2">Stack / cause</p>
              <pre className="text-xs bg-white border border-red-200 rounded-admin-md p-3 overflow-x-auto text-red-900">
                {errorStack}
              </pre>
            </div>
          ) : null}
        </section>
      ) : null}

      {(event.entity_type || event.entity_id) && (
        <section className="bg-admin-surface border border-admin-border rounded-admin-md p-4 space-y-3">
          <h2 className="text-xs font-semibold text-admin-faint uppercase tracking-wide">
            Entity
          </h2>
          <dl className="grid grid-cols-1 gap-3 text-sm">
            {event.entity_type ? (
              <DetailField label="Type" value={event.entity_type} />
            ) : null}
            {event.entity_id ? (
              <div>
                <dt className="text-admin-faint text-xs">ID</dt>
                <dd className="flex items-center gap-2">
                  <code className="text-xs bg-admin-bg border border-admin-border rounded px-2 py-1 break-all">
                    {event.entity_id}
                  </code>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(event.entity_id!)}
                    className="text-xs text-admin-accent hover:underline shrink-0"
                  >
                    Copy
                  </button>
                </dd>
              </div>
            ) : null}
          </dl>
        </section>
      )}

      {Array.isArray(event.metadata.changes) &&
      event.metadata.changes.length > 0 ? (
        <section className="bg-admin-surface border border-admin-border rounded-admin-md p-4 space-y-3">
          <h2 className="text-xs font-semibold text-admin-faint uppercase tracking-wide">
            Changes
          </h2>
          <ul className="list-disc pl-5 space-y-1 text-sm text-admin-text">
            {event.metadata.changes.map((change, index) => (
              <li key={`${index}-${String(change)}`}>{String(change)}</li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="bg-admin-surface border border-admin-border rounded-admin-md p-4 space-y-3">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-xs font-semibold text-admin-faint uppercase tracking-wide">
            Technical details
          </h2>
          <button
            type="button"
            onClick={() => setShowTechnicalDetails((current) => !current)}
            className="text-xs text-admin-accent hover:underline"
          >
            {showTechnicalDetails ? "Hide" : "Show"}
          </button>
        </div>

        {showTechnicalDetails ? (
          <div className="space-y-3">
            <DetailField label="Summary" value={event.summary} />
            <div>
              <p className="text-admin-faint text-xs mb-2">Metadata</p>
              <pre className="text-xs bg-admin-bg border border-admin-border rounded-admin-md p-3 overflow-x-auto text-admin-muted">
                {JSON.stringify(event.metadata, null, 2)}
              </pre>
            </div>
          </div>
        ) : (
          <p className="text-sm text-admin-muted">
            Stored summary and metadata JSON for debugging.
          </p>
        )}
      </section>
    </div>
  );
}
