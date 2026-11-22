import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { marketingAdCopyWithoutOffer, resolveMarketingAdCopy, resolveMarketingAdCopyVersions } from "@/lib/marketing/marketing-ad-copy";
import type { MarketingSlide } from "@/components/admin/marketing/carousels/types";

function assertNoOfferLanguage(copy: { primaryText: string; headline: string; description?: string }) {
  assert.doesNotMatch(copy.primaryText, /\$200|gift card|Terms apply/i);
  if (copy.description) {
    assert.doesNotMatch(copy.description, /\$200|gift card/i);
  }
}

describe("marketingAdCopyWithoutOffer", () => {
  it("strips gift-card tails from new-year primary text", () => {
    const input = {
      primaryText:
        "Microschool directors: new year, same six tabs? MudKitchen puts enrollment, tuition, messages and attendance in one place. Book a demo, start a paid plan within 30 days, and get a $200 Amazon gift card. Terms apply.",
      headline: "Not this year, tabs",
      description: "One system for your microschool.",
    };
    const out = marketingAdCopyWithoutOffer(input);
    assert.equal(out.headline, input.headline);
    assert.equal(out.description, input.description);
    assert.match(out.primaryText, /Book a MudKitchen demo\.\s*$/);
    assertNoOfferLanguage(out);
  });

  it("strips MudKitchen demo variant from pain-proof primary text", () => {
    const input = {
      primaryText:
        "School owners: families see every bill in one place and set up autopay once, so tuition arrives on time without the reminder texts. Book a MudKitchen demo, start a paid plan within 30 days, and get a $200 Amazon gift card. Terms apply.",
      headline: "Tuition on autopay",
      description: "Billing and payments for microschools.",
    };
    const out = marketingAdCopyWithoutOffer(input);
    assertNoOfferLanguage(out);
    assert.equal(out.headline, input.headline);
    assert.equal(out.description, input.description);
  });

  it("handles winter-break B6 alternate tail and drops offer-only description", () => {
    const input = {
      primaryText:
        "Your winter break to-do list: sleep in, eat too many cookies, and take a look at MudKitchen. Start a paid plan within 30 days of your demo and we'll send a $200 Amazon gift card. Terms apply.",
      headline: "One small item for your break",
      description: "Sign up, get a $200 Amazon gift card.",
    };
    const out = marketingAdCopyWithoutOffer(input);
    assertNoOfferLanguage(out);
    assert.equal(out.description, undefined);
    assert.match(out.primaryText, /Book a MudKitchen demo\.\s*$/);
  });

  it("handles demo-before-the-break tail", () => {
    const input = {
      primaryText:
        "December: a demo, then we set things up with you. January: families apply, pay and get updates in one place. Book a demo before the break, start a paid plan within 30 days, and get a $200 Amazon gift card. Terms apply.",
      headline: "Open January with it running",
    };
    const out = marketingAdCopyWithoutOffer(input);
    assertNoOfferLanguage(out);
  });

  it("handles demo now tail", () => {
    const input = {
      primaryText:
        "Switching systems mid-semester is chaos. Switching over winter break is a cozy afternoon. Book a MudKitchen demo now, start a paid plan within 30 days, and get a $200 Amazon gift card. Terms apply.",
      headline: "Switch while it's quiet",
    };
    const out = marketingAdCopyWithoutOffer(input);
    assertNoOfferLanguage(out);
  });
});

describe("resolveMarketingAdCopy", () => {
  const slide = {
    id: "x",
    fileName: "a.png",
    render: () => null,
    adCopy: {
      primaryText:
        "Book a demo, start a paid plan within 30 days, and get a $200 Amazon gift card. Terms apply.",
      headline: "H",
    },
  } satisfies MarketingSlide;

  it("returns adCopy unchanged when offer is on", () => {
    assert.equal(resolveMarketingAdCopy(slide, false), slide.adCopy);
  });

  it("returns offer-free copy when offerOff", () => {
    const out = resolveMarketingAdCopy(slide, true);
    assert.notEqual(out, slide.adCopy);
    assert.ok(out);
    assertNoOfferLanguage(out);
  });

  it("returns undefined when slide has no adCopy", () => {
    const bare = { id: "y", fileName: "b.png", render: () => null } satisfies MarketingSlide;
    assert.equal(resolveMarketingAdCopy(bare, true), undefined);
  });
});
describe("resolveMarketingAdCopyVersions", () => {
  const slide = {
    id: "v",
    fileName: "v.png",
    render: () => null,
    adCopy: { label: "One", primaryText: "First version.", headline: "H1" },
    adCopyVariants: [
      {
        label: "Two",
        primaryText: "Second version. Book a demo, start a paid plan within 30 days, and get a $200 Amazon gift card. Terms apply.",
        headline: "H2",
        description: "Sign up, get a $200 Amazon gift card.",
      },
      { label: "Three", primaryText: "Third version.", headline: "H3" },
    ],
  } satisfies MarketingSlide;

  it("lists adCopy first, then the variants in order", () => {
    const out = resolveMarketingAdCopyVersions(slide, false);
    assert.deepEqual(out.map((copy) => copy.headline), ["H1", "H2", "H3"]);
    assert.equal(out[0], slide.adCopy);
  });

  it("strips the offer from every version and keeps labels", () => {
    const out = resolveMarketingAdCopyVersions(slide, true);
    assert.deepEqual(out.map((copy) => copy.label), ["One", "Two", "Three"]);
    out.forEach(assertNoOfferLanguage);
    assert.match(out[1].primaryText, /Book a MudKitchen demo\.\s*$/);
    assert.equal(out[1].description, undefined);
  });

  it("returns an empty list when the slide has no adCopy", () => {
    const bare = { id: "y", fileName: "b.png", render: () => null, adCopyVariants: [{ primaryText: "x", headline: "y" }] } satisfies MarketingSlide;
    assert.deepEqual(resolveMarketingAdCopyVersions(bare, false), []);
  });
});
