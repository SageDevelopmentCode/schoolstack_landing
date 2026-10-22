-- MudKitchen Support participant and sender kinds.
-- Enum values must be added in their own migration before they are used.
-- Run after: 20261130_enforce_organization_school_profile_photo_limit.sql

alter type public.message_participant_kind add value if not exists 'platform_support';

alter type public.portal_message_sender_kind add value if not exists 'platform_support';
