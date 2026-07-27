import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  buildChecklistPreviewSidebarItems,
  getAlternateVariantItems,
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
