import type { FridayBranchBlock } from "./friday-branch-types";

export function collectFridayBranchFlyerPaths(blocks: FridayBranchBlock[]): Set<string> {
  const paths = new Set<string>();
  for (const block of blocks) {
    for (const slot of block.slots) {
      for (const classEntry of slot.classes) {
        if (classEntry.flyerStoragePath) {
          paths.add(classEntry.flyerStoragePath);
        }
      }
    }
  }
  return paths;
}

export function diffRemovedFridayBranchFlyerPaths(
  beforeBlocks: FridayBranchBlock[],
  afterBlocks: FridayBranchBlock[],
): string[] {
  const before = collectFridayBranchFlyerPaths(beforeBlocks);
  const after = collectFridayBranchFlyerPaths(afterBlocks);
  return [...before].filter((path) => !after.has(path));
}
