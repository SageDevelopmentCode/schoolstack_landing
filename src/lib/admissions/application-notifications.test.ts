import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { ScheduledVisitRecord } from "@/lib/admissions/admissions-booking";
import {
  buildPostSubmitVisitNotificationTasks,
  type ApplicantContact,
} from "@/lib/admissions/application-notifications";
import {
  buildApplicationAcceptedEnrollmentHtml,
  buildPostSubmitVisitConfirmationHtml,
  buildPostSubmitVisitOwnerNotificationHtml,
} from "@/lib/emails";

const booking: ScheduledVisitRecord = {
  id: "visit-1",
  organizationId: "org-1",
  applicationId: "app-1",
  postSubmitActionId: "action-1",
  actionType: "schedule_observation_day",
  schedulingMode: "whole_day",
  scheduledDate: "2026-08-26",
  startTimeSlot: "ALL_DAY",
  durationMinutes: 1440,
  visitDayCount: 1,
  endDate: "2026-08-26",
  visitDates: ["2026-08-26"],
  status: "scheduled",
};

const contact: ApplicantContact = {
  email: "parent@example.com",
  emails: ["parent@example.com"],
  firstName: "Holly",
  lastName: "Evensen",
  displayName: "Holly Evensen",
};

describe("buildPostSubmitVisitNotificationTasks", () => {
  it("includes discord, owner, and parent notification tasks", () => {
    const tasks = buildPostSubmitVisitNotificationTasks({
      booking,
      contact,
      notifyEmails: ["admin@school.org", "julius@trymudkitchen.com"],
      schoolName: "Rooted Meadows Waldorf School",
      schoolSlug: "rooted-meadows",
      stepTitle: "Schedule shadow / observation days",
      timezoneLabel: "Central Time",
      applicationId: "app-1",
      studentName: "Student Evensen",
    });

    assert.equal(tasks.length, 4);
  });

  it("still notifies admins and discord when parent contact is missing", () => {
    const tasks = buildPostSubmitVisitNotificationTasks({
      booking,
      contact: null,
      notifyEmails: ["admin@school.org"],
      schoolName: "Rooted Meadows Waldorf School",
      schoolSlug: "rooted-meadows",
      stepTitle: "Schedule shadow / observation days",
      timezoneLabel: "Central Time",
      applicationId: "app-1",
    });

    assert.equal(tasks.length, 2);
  });
});

describe("visit notification email templates", () => {
  it("renders parent confirmation details", () => {
    const html = buildPostSubmitVisitConfirmationHtml({
      name: "Holly Evensen",
      schoolName: "Rooted Meadows Waldorf School",
      stepTitle: "Schedule shadow / observation days",
      scheduledDate: "2026-08-26",
      endDate: "2026-08-26",
      startTimeSlot: "ALL_DAY",
      schedulingMode: "whole_day",
      visitDayCount: 1,
      timezoneLabel: "Central Time",
      whenLabel: "Wed, August 26 (1 school day)",
      durationLabel: "1 school day",
      applyDashboardUrl: "https://example.com/school/rooted-meadows/apply",
    });

    assert.match(html, /Visit Confirmed/);
    assert.match(html, /Wed, August 26 \(1 school day\)/);
    assert.match(html, /1 school day/);
    assert.match(html, /View apply dashboard/);
  });

  it("renders owner notification details", () => {
    const html = buildPostSubmitVisitOwnerNotificationHtml({
      schoolName: "Rooted Meadows Waldorf School",
      stepTitle: "Schedule shadow / observation days",
      whenLabel: "Wed, August 26 (1 school day)",
      timezoneLabel: "Central Time",
      durationLabel: "1 school day",
      studentName: "Student Evensen",
      contactName: "Holly Evensen",
      contactEmail: "parent@example.com",
      submissionAdminUrl:
        "https://example.com/admin/school/rooted-meadows/admissions/submissions?application=app-1",
    });

    assert.match(html, /Visit Scheduled/);
    assert.match(html, /Holly Evensen/);
    assert.match(html, /parent@example.com/);
    assert.match(html, /Student Evensen/);
    assert.match(html, /View submission/);
  });
});

describe("application accepted enrollment email template", () => {
  it("renders acceptance details and enrollment checklist CTA", () => {
    const html = buildApplicationAcceptedEnrollmentHtml({
      name: "Holly Evensen",
      schoolName: "Rooted Meadows Waldorf School",
      formTitle: "Rooted Meadows 2026 Application",
      studentName: "Autumn Evensen",
      enrollmentChecklistUrl:
        "https://example.com/school/rooted-meadows/apply/app-1/enrollment",
    });

    assert.match(html, /Application Accepted/);
    assert.match(html, /Rooted Meadows Waldorf School/);
    assert.match(html, /Autumn Evensen/);
    assert.match(html, /Continue enrollment checklist/);
    assert.match(
      html,
      /https:\/\/example\.com\/school\/rooted-meadows\/apply\/app-1\/enrollment/,
    );
  });
});
