/*
 * Emergency contacts for the marketing parent demo (the Mitchells: Sarah, with
 * Emma, Jake and Liam). Demo-only: there is no backend for this page, so the
 * demo reads these fixtures and keeps any changes in local state.
 *
 * Phone numbers use the reserved 555-01xx fictional range.
 */

export type DemoParentChildName = "Emma" | "Jake" | "Liam";

export type DemoParentEmergencyContact = {
  id: string;
  name: string;
  relationship: string;
  phone: string;
  canPickUp: boolean;
  /** Children this contact covers, in family order. */
  children: DemoParentChildName[];
};

export type DemoParentAuthorizedPickup = {
  id: string;
  name: string;
  relationship: string;
  children: DemoParentChildName[];
};

export type DemoParentMedicalEntry = {
  id: string;
  title: string;
  meta: string;
};

export type DemoParentEmergencyContacts = {
  familyName: string;
  contacts: DemoParentEmergencyContact[];
  authorizedPickup: DemoParentAuthorizedPickup[];
  medical: DemoParentMedicalEntry[];
  lastReviewedLabel: string;
};

const ALL_CHILDREN: DemoParentChildName[] = ["Emma", "Jake", "Liam"];

export function buildDemoParentEmergencyContacts(): DemoParentEmergencyContacts {
  return {
    familyName: "Mitchell",
    contacts: [
      {
        id: "contact-michael",
        name: "Michael Mitchell",
        relationship: "Dad",
        phone: "(555) 010-4821",
        canPickUp: true,
        children: ALL_CHILDREN,
      },
      {
        id: "contact-linda",
        name: "Linda Hayes",
        relationship: "Grandma",
        phone: "(555) 013-7720",
        canPickUp: true,
        children: ALL_CHILDREN,
      },
      {
        id: "contact-priya",
        name: "Priya Shah",
        relationship: "Neighbor & family friend",
        phone: "(555) 016-3094",
        canPickUp: true,
        children: ["Emma", "Jake"],
      },
    ],
    authorizedPickup: [
      { id: "pickup-sarah", name: "Sarah Mitchell", relationship: "Mom", children: ALL_CHILDREN },
      { id: "pickup-michael", name: "Michael Mitchell", relationship: "Dad", children: ALL_CHILDREN },
      { id: "pickup-linda", name: "Linda Hayes", relationship: "Grandma", children: ALL_CHILDREN },
      { id: "pickup-priya", name: "Priya Shah", relationship: "Neighbor", children: ["Emma", "Jake"] },
    ],
    medical: [
      {
        id: "medical-allergy",
        title: "Allergy action plan",
        meta: "Liam · peanuts · EpiPen kept in the front office",
      },
      {
        id: "medical-physician",
        title: "Physician",
        meta: "Dr. Anita Rao, Maple Pediatrics · (555) 014-2280",
      },
      {
        id: "medical-insurance",
        title: "Insurance",
        meta: "Blue Cross PPO · card copy on file",
      },
    ],
    lastReviewedLabel: "Sep 12, 2026",
  };
}
