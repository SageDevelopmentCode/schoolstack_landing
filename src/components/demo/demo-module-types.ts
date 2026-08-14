import type { ComponentType } from "react";

export type DemoDashboardProps = Record<string, unknown>;
export type DemoModule = { default: ComponentType<DemoDashboardProps> };
