import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { sendGalleryPhotosUploadedParentEmails } from "./gallery-notifications";

const enabledOrg = async () => ({
  schoolName: "Rooted Meadows",
  schoolSlug: "rooted-meadows",
  galleryEnabled: true,
});

const disabledGalleryOrg = async () => ({
  schoolName: "Rooted Meadows",
  schoolSlug: "rooted-meadows",
  galleryEnabled: false,
});

const adminStub = {} as never;

describe("sendGalleryPhotosUploadedParentEmails", () => {
  it("skips when gallery feature is disabled", async () => {
    let sendCalls = 0;

    const result = await sendGalleryPhotosUploadedParentEmails(
      adminStub,
      {
        organizationId: "org-1",
        uploadBatchId: "batch-1",
        photoCount: 3,
        photoDate: "2026-10-18",
        uploaderName: "Jordan Taylor",
        activityEventId: "event-1",
      },
      {
        loadOrganizationContext: disabledGalleryOrg,
        tryClaimSent: async () => true,
        sendEmail: async () => {
          sendCalls += 1;
          return { ok: true };
        },
        logSettledNotificationFailures: async () => {},
      },
    );

    assert.equal(result.emailsAttempted, 0);
    assert.equal(sendCalls, 0);
  });

  it("skips when another worker already claimed the send", async () => {
    let sendCalls = 0;
    let claimCalls = 0;

    const result = await sendGalleryPhotosUploadedParentEmails(
      adminStub,
      {
        organizationId: "org-1",
        uploadBatchId: "batch-1",
        photoCount: 1,
        photoDate: "2026-10-18",
        uploaderName: "Ada",
        activityEventId: "event-1",
      },
      {
        loadOrganizationContext: enabledOrg,
        listEnrolledFamilyIds: async () => ["family-1"],
        loadFamilyNotificationEmails: async () => ["parent@test.com"],
        tryClaimSent: async () => {
          claimCalls += 1;
          return false;
        },
        sendEmail: async () => {
          sendCalls += 1;
          return { ok: true };
        },
        logSettledNotificationFailures: async () => {},
      },
    );

    assert.equal(claimCalls, 1);
    assert.equal(result.emailsAttempted, 0);
    assert.equal(sendCalls, 0);
  });

  it("sends to enrolled family notification emails and keeps claim on success", async () => {
    const sentTo: string[] = [];
    let clearCalls = 0;

    const result = await sendGalleryPhotosUploadedParentEmails(
      adminStub,
      {
        organizationId: "org-1",
        uploadBatchId: "batch-1",
        photoCount: 2,
        photoDate: "2026-10-18",
        uploaderName: "Jordan Taylor",
        activityEventId: "event-1",
      },
      {
        loadOrganizationContext: enabledOrg,
        listEnrolledFamilyIds: async () => ["family-1", "family-2"],
        loadFamilyNotificationEmails: async (_admin, familyId) =>
          familyId === "family-1"
            ? ["parent@test.com", "parent@test.com"]
            : ["other@test.com"],
        tryClaimSent: async () => true,
        clearSent: async () => {
          clearCalls += 1;
        },
        sendEmail: async ({ to }) => {
          sentTo.push(to);
          return { ok: true };
        },
        logSettledNotificationFailures: async () => {},
      },
    );

    assert.deepEqual(sentTo.sort(), ["other@test.com", "parent@test.com"]);
    assert.equal(result.emailsAttempted, 2);
    assert.equal(result.emailsSucceeded, 2);
    assert.equal(clearCalls, 0);
  });

  it("clears claim when every email fails", async () => {
    let clearCalls = 0;

    const result = await sendGalleryPhotosUploadedParentEmails(
      adminStub,
      {
        organizationId: "org-1",
        uploadBatchId: "batch-1",
        photoCount: 1,
        photoDate: "2026-10-18",
        uploaderName: "Ada",
        activityEventId: "event-1",
      },
      {
        loadOrganizationContext: enabledOrg,
        listEnrolledFamilyIds: async () => ["family-1"],
        loadFamilyNotificationEmails: async () => ["parent@test.com"],
        tryClaimSent: async () => true,
        clearSent: async () => {
          clearCalls += 1;
        },
        sendEmail: async () => ({ ok: false }),
        logSettledNotificationFailures: async () => {},
      },
    );

    assert.equal(result.emailsAttempted, 1);
    assert.equal(result.emailsSucceeded, 0);
    assert.equal(clearCalls, 1);
  });

  it("skips when activity event id is missing", async () => {
    let claimCalls = 0;

    const result = await sendGalleryPhotosUploadedParentEmails(
      adminStub,
      {
        organizationId: "org-1",
        uploadBatchId: "batch-1",
        photoCount: 1,
        photoDate: "2026-10-18",
        uploaderName: "Ada",
        activityEventId: null,
      },
      {
        loadOrganizationContext: enabledOrg,
        tryClaimSent: async () => {
          claimCalls += 1;
          return true;
        },
        logSettledNotificationFailures: async () => {},
      },
    );

    assert.equal(claimCalls, 0);
    assert.equal(result.emailsAttempted, 0);
  });
});
