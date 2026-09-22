export type AuthorizedPickupContact = {
  id: string;
  organizationId: string;
  studentId: string;
  familyId: string;
  firstName: string;
  lastName: string;
  relationship: string | null;
  phone: string | null;
  notes: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type AuthorizedPickupContactInput = {
  firstName: string;
  lastName: string;
  relationship?: string | null;
  phone?: string | null;
  notes?: string | null;
};

export type AuthorizedPickupContactRow = {
  id: string;
  organization_id: string;
  student_id: string;
  family_id: string;
  first_name: string;
  last_name: string;
  relationship: string | null;
  phone: string | null;
  notes: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};
