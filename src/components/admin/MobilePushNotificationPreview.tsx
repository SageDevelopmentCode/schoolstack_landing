"use client";

import Image from "next/image";
import { formatRelativeTime } from "@/lib/school-admin/activity-notifications";

const APP_NAME = "MudKitchen";
const APP_ICON_SRC = "/images/Logo.png";

export type PushNotificationPreviewMode = "ios" | "android" | "both";

type MobilePushNotificationPreviewProps = {
  variant: "ios" | "android";
  title: string;
  body: string;
  createdAt: string;
};

function AppIcon({ size }: { size: number }) {
  return (
    <Image
      src={APP_ICON_SRC}
      alt=""
      width={size}
      height={size}
      className="rounded-[22%] object-contain bg-white"
      aria-hidden
    />
  );
}

function IosPreview({
  title,
  body,
  createdAt,
}: Omit<MobilePushNotificationPreviewProps, "variant">) {
  const timeLabel = formatRelativeTime(createdAt);

  return (
    <div
      className="rounded-xl bg-gradient-to-b from-slate-800 to-slate-900 px-2.5 py-2.5"
      aria-hidden
    >
      <div
        className="rounded-2xl border border-white/20 bg-white/90 px-3 py-2.5 shadow-lg backdrop-blur-md"
      >
        <div className="flex items-center gap-2">
          <AppIcon size={18} />
          <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
            {APP_NAME}
          </span>
          <span className="ml-auto text-[10px] text-slate-400">{timeLabel}</span>
        </div>
        <p className="mt-1.5 text-[13px] font-semibold leading-snug text-slate-900 line-clamp-2">
          {title}
        </p>
        <p className="mt-0.5 text-[12px] leading-snug text-slate-600 line-clamp-2">
          {body}
        </p>
      </div>
    </div>
  );
}

function AndroidPreview({
  title,
  body,
  createdAt,
}: Omit<MobilePushNotificationPreviewProps, "variant">) {
  const timeLabel = formatRelativeTime(createdAt);

  return (
    <div className="rounded-xl bg-slate-100 px-2 py-2" aria-hidden>
      <div className="rounded-xl bg-white px-3 py-2.5 shadow-md ring-1 ring-black/5">
        <div className="flex items-start gap-2.5">
          <AppIcon size={22} />
          <div className="min-w-0 flex-1">
            <div className="flex items-baseline justify-between gap-2">
              <span className="text-[11px] font-medium text-slate-800">
                {APP_NAME}
              </span>
              <span className="shrink-0 text-[10px] text-slate-400">
                {timeLabel}
              </span>
            </div>
            <p className="mt-0.5 text-[13px] font-medium leading-snug text-slate-900 line-clamp-2">
              {title}
            </p>
            <p className="mt-0.5 text-[12px] leading-snug text-slate-600 line-clamp-2">
              {body}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function MobilePushNotificationPreview({
  variant,
  title,
  body,
  createdAt,
}: MobilePushNotificationPreviewProps) {
  if (variant === "android") {
    return (
      <AndroidPreview title={title} body={body} createdAt={createdAt} />
    );
  }

  return <IosPreview title={title} body={body} createdAt={createdAt} />;
}

type MobilePushNotificationPreviewStackProps = {
  mode: PushNotificationPreviewMode;
  title: string;
  body: string;
  createdAt: string;
};

function PreviewPlatformLabel({ label }: { label: string }) {
  return (
    <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-admin-faint">
      {label}
    </p>
  );
}

export function MobilePushNotificationPreviewStack({
  mode,
  title,
  body,
  createdAt,
}: MobilePushNotificationPreviewStackProps) {
  if (mode === "both") {
    return (
      <div className="space-y-2.5">
        <div>
          <PreviewPlatformLabel label="iOS" />
          <MobilePushNotificationPreview
            variant="ios"
            title={title}
            body={body}
            createdAt={createdAt}
          />
        </div>
        <div>
          <PreviewPlatformLabel label="Android" />
          <MobilePushNotificationPreview
            variant="android"
            title={title}
            body={body}
            createdAt={createdAt}
          />
        </div>
      </div>
    );
  }

  return (
    <MobilePushNotificationPreview
      variant={mode}
      title={title}
      body={body}
      createdAt={createdAt}
    />
  );
}
