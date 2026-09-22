import {
  handleParentMobilePreviewGet,
} from "@/lib/admin/mobile-preview/parent-handlers";
import { readOnlyPreviewResponse } from "@/lib/admin/mobile-preview/access";

type RouteContext = {
  params: Promise<{ path: string[] }>;
};

export async function GET(request: Request, context: RouteContext) {
  const { path } = await context.params;
  return handleParentMobilePreviewGet(request, path);
}

export async function POST() {
  return readOnlyPreviewResponse();
}

export async function PATCH() {
  return readOnlyPreviewResponse();
}

export async function DELETE() {
  return readOnlyPreviewResponse();
}
