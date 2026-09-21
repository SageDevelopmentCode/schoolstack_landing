"use client";

import { createContext, useContext, type ReactNode } from "react";

export const DEFAULT_ATTENDANCE_API_BASE_PATH = "/api/school-admin/attendance";

type AttendanceApiContextValue = {
  apiBasePath: string;
  previewMode: boolean;
};

const AttendanceApiContext = createContext<AttendanceApiContextValue>({
  apiBasePath: DEFAULT_ATTENDANCE_API_BASE_PATH,
  previewMode: false,
});

export function AttendanceApiProvider({
  apiBasePath = DEFAULT_ATTENDANCE_API_BASE_PATH,
  previewMode = false,
  children,
}: {
  apiBasePath?: string;
  previewMode?: boolean;
  children: ReactNode;
}) {
  return (
    <AttendanceApiContext.Provider value={{ apiBasePath, previewMode }}>
      {children}
    </AttendanceApiContext.Provider>
  );
}

export function useAttendanceApiBasePath(): string {
  return useContext(AttendanceApiContext).apiBasePath;
}

export function useAttendancePreviewMode(): boolean {
  return useContext(AttendanceApiContext).previewMode;
}
