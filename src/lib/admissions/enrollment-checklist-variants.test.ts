import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  buildChecklistPreviewSidebarItems,
  getAlternateVariantItems,
  isVariantItemSelected,
  resolveVisibleTemplateItems,
} from "./enrollment-checklist-variants";
import type { EnrollmentChecklistItem } from "./enrollment-checklist-schema";
import { setItemVariantConfig } from "./enrollment-checklist-schema";

function agreementItem(id: string, label: string): EnrollmentChecklistItem {
  return {
    id,
    itemKey: id,
    label,
    type: "document_sign",
    required: true,
    metadata: {},
    document: {
      kind: "inline_sections",
      sections: [{ id: `${id}-section`, title: label, body: "Body" }],
    },
  };
}

describe("getAlternateVariantItems", () => {
  const groupId = "group-enrollment";

  const standard = setItemVariantConfig(agreementItem("standard", "Standard Enrollment Agreement"), {
    groupId,
    groupLabel: "Enrollment Agreement",
    variantKey: "standard",
    isDefault: true,
  });

  const conditional = setItemVariantConfig(
    agreementItem("conditional", "Conditional Support Agreement"),
    {
      groupId,
      groupLabel: "Enrollment Agreement",
      variantKey: "conditional",
    },
  );

  const payment = agreementItem("payment", "Payment");

  it("returns sibling variants excluding the selected item", () => {
    const items = [standard, conditional, payment];
    assert.deepEqual(
      getAlternateVariantItems(items, standard).map((item) => item.id),
      ["conditional"],
    );
    assert.deepEqual(
      getAlternateVariantItems(items, conditional).map((item) => item.id),
      ["standard"],
    );
  });

  it("returns an empty list when the item is not in a variant group", () => {
    assert.deepEqual(getAlternateVariantItems([standard, conditional], payment), []);
  });
});

describe("isVariantItemSelected stacked conditional_support", () => {
  const groupId = "group-enrollment";

  const standard = setItemVariantConfig(agreementItem("standard", "Standard Enrollment Agreement"), {
    groupId,
    groupLabel: "Enrollment Agreement",
    variantKey: "standard",
    isDefault: true,
  });

  const conditional = setItemVariantConfig(
    agreementItem("conditional", "Conditional Support Agreement"),
    {
      groupId,
      groupLabel: "Enrollment Agreement",
      variantKey: "conditional_support",
    },
  );

  const form = agreementItem("form", "Health Form");
  const allItems = [standard, conditional, form];

  const standardResolution = {
    [groupId]: {
      templateItemId: "standard",
      variantKey: "standard",
      resolvedBy: "admin" as const,
      resolvedAt: "2026-01-01T00:00:00.000Z",
    },
  };

  const conditionalResolution = {
    [groupId]: {
      templateItemId: "conditional",
      variantKey: "conditional_support",
      resolvedBy: "admin" as const,
      resolvedAt: "2026-01-01T00:00:00.000Z",
    },
  };

  it("shows only standard when standard is selected", () => {
    assert.equal(
      isVariantItemSelected(standard, standardResolution, allItems),
      true,
    );
    assert.equal(
      isVariantItemSelected(conditional, standardResolution, allItems),
      false,
    );
    assert.deepEqual(
      resolveVisibleTemplateItems(allItems, standardResolution).map((item) => item.id),
      ["standard", "form"],
    );
  });

  it("shows standard and conditional when conditional_support is selected", () => {
    assert.equal(
      isVariantItemSelected(standard, conditionalResolution, allItems),
      true,
    );
    assert.equal(
      isVariantItemSelected(conditional, conditionalResolution, allItems),
      true,
    );
    assert.deepEqual(
      resolveVisibleTemplateItems(allItems, conditionalResolution).map((item) => item.id),
      ["standard", "conditional", "form"],
    );
  });

  it("keeps unrelated variant keys mutually exclusive", () => {
    const mudGroupId = "vg_mud";
    const kobe = setItemVariantConfig(agreementItem("kobe", "Kobe"), {
      groupId: mudGroupId,
      groupLabel: "Assumption of Risk",
      variantKey: "kobe_144dafbf",
      isDefault: true,
    });
    const lebron = setItemVariantConfig(agreementItem("lebron", "Lebron"), {
      groupId: mudGroupId,
      groupLabel: "Assumption of Risk",
      variantKey: "lebron_7df6bea2",
    });
    const mudItems = [kobe, lebron];
    const lebronResolution = {
      [mudGroupId]: {
        templateItemId: "lebron",
        variantKey: "lebron_7df6bea2",
        resolvedBy: "admin" as const,
        resolvedAt: "2026-01-01T00:00:00.000Z",
      },
    };

    assert.equal(isVariantItemSelected(kobe, lebronResolution, mudItems), false);
    assert.equal(isVariantItemSelected(lebron, lebronResolution, mudItems), true);
  });
});

describe("buildChecklistPreviewSidebarItems", () => {
  const groupId = "group-enrollment";

  const standard = setItemVariantConfig(agreementItem("standard", "Standard Enrollment Agreement"), {
    groupId,
    groupLabel: "Enrollment Agreement",
    variantKey: "standard",
    isDefault: true,
  });

  const conditional = setItemVariantConfig(
    agreementItem("conditional", "Conditional Support Agreement"),
    {
      groupId,
      groupLabel: "Enrollment Agreement",
      variantKey: "conditional",
    },
  );

  const form = agreementItem("form", "Idaho Parent Choice Tax Credit");
  const payment = agreementItem("payment", "Payment");

  const allItems = [standard, conditional, form, payment];

  it("orders sidebar items as primary variant, alternates, then remaining items", () => {
    const result = buildChecklistPreviewSidebarItems(allItems);
    assert.deepEqual(
      result.sidebarItems.map((item) => item.id),
      ["standard", "conditional", "form", "payment"],
    );
    assert.deepEqual(
      result.primaryItems.map((item) => item.id),
      ["standard", "form", "payment"],
    );
    assert.deepEqual(
      result.alternateItems.map((item) => item.id),
      ["conditional"],
    );
  });

  it("uses the clicked variant as primary when preview starts from an alternate", () => {
    const result = buildChecklistPreviewSidebarItems(allItems, "conditional");
    assert.deepEqual(
      result.sidebarItems.map((item) => item.id),
      ["conditional", "standard", "form", "payment"],
    );
    assert.deepEqual(
      result.primaryItems.map((item) => item.id),
      ["conditional", "form", "payment"],
    );
    assert.deepEqual(
      result.alternateItems.map((item) => item.id),
      ["standard"],
    );
  });
});
