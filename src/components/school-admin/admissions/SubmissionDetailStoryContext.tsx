"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";

export type SubmissionDetailStoryVariant = "legacy" | "story";

type SubmissionDetailStoryContextValue = {
  variant: SubmissionDetailStoryVariant;
  theme: ParentThemeTokens | null;
};

const SubmissionDetailStoryContext = createContext<SubmissionDetailStoryContextValue>({
  variant: "legacy",
  theme: null,
});

export function SubmissionDetailStoryProvider({
  variant,
  theme,
  children,
}: {
  variant: SubmissionDetailStoryVariant;
  theme: ParentThemeTokens;
  children: ReactNode;
}) {
  return (
    <SubmissionDetailStoryContext.Provider value={{ variant, theme }}>
      {children}
    </SubmissionDetailStoryContext.Provider>
  );
}

export function useSubmissionDetailStory(): SubmissionDetailStoryContextValue {
  return useContext(SubmissionDetailStoryContext);
}
