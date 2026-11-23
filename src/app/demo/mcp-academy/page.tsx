"use client";

import SchoolDemoShell from "@/components/demo/SchoolDemoShell";
import { mcpAcademyConfig } from "@/data/school-demos/mcp-academy";
import { mcpAcademyWalkthroughPlaceholder } from "@/data/school-demos/walkthroughs/mcp-academy";

export default function McpAcademyDemoPage() {
  return (
    <SchoolDemoShell
      config={mcpAcademyConfig}
      schoolName="MCP Academy"
      steps={mcpAcademyWalkthroughPlaceholder}
    />
  );
}
