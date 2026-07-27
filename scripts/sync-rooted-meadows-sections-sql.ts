import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  ROOTED_MEADOWS_CONDITIONAL_SUPPORT_SECTIONS,
  ROOTED_MEADOWS_STANDARD_ENROLLMENT_SECTIONS,
} from "../src/data/school-demos/rooted-meadows-enrollment-contracts";
import { ROOTED_MEADOWS_MEDIA_TECHNOLOGY_SECTIONS } from "../src/data/school-demos/rooted-meadows-media-technology-policy";
import {
  ROOTED_MEADOWS_PHOTOGRAPHY_MEDIA_RELEASE_CONSENT_OPTIONS,
  ROOTED_MEADOWS_PHOTOGRAPHY_MEDIA_RELEASE_SECTIONS,
} from "../src/data/school-demos/rooted-meadows-photography-media-release";
import { ROOTED_MEADOWS_RELEASE_OF_LIABILITY_SECTIONS } from "../src/data/school-demos/rooted-meadows-release-of-liability";
import { ROOTED_MEADOWS_HEALTH_EMERGENCY_FORM_SCHEMA } from "../src/data/school-demos/rooted-meadows-health-emergency-form";
import { ROOTED_MEADOWS_IMMUNIZATION_RECORDS_CONFIG } from "../src/data/school-demos/rooted-meadows-immunization-records";
import { ROOTED_MEADOWS_SCHOOL_TRANSCRIPT_CONFIG } from "../src/data/school-demos/rooted-meadows-school-transcript";

type FileUploadStepMetadata = {
  fileUpload: {
    accept: string;
    maxFiles: number;
    helpText: string;
    directions?: {
      intro: string;
      options: readonly string[];
    };
  };
};

function replaceSectionsBlock(
  sql: string,
  variableName: string,
  sections: typeof ROOTED_MEADOWS_STANDARD_ENROLLMENT_SECTIONS,
): string {
  const markers = [
    `${variableName} jsonb := $sections$`,
    `${variableName} := $sections$`,
  ];
  const marker = markers.find((candidate) => sql.includes(candidate));
  if (!marker) {
    throw new Error(`Could not find sections marker for ${variableName}`);
  }

  const start = sql.indexOf(marker);
  const jsonStart = start + marker.length;
  const end = sql.indexOf("$sections$::jsonb;", jsonStart);
  if (end === -1) {
    throw new Error(`Could not find closing $sections$::jsonb for ${variableName}`);
  }

  const json = JSON.stringify(sections, null, 2);
  return `${sql.slice(0, jsonStart)}${json}${sql.slice(end)}`;
}

function replaceFormSchemaBlock(
  sql: string,
  variableName: string,
  formSchema: typeof ROOTED_MEADOWS_HEALTH_EMERGENCY_FORM_SCHEMA,
): string {
  const marker = `${variableName} jsonb := $form$`;
  const start = sql.indexOf(marker);
  if (start === -1) {
    throw new Error(`Could not find form schema marker for ${variableName}`);
  }

  const jsonStart = start + marker.length;
  const end = sql.indexOf("$form$::jsonb;", jsonStart);
  if (end === -1) {
    throw new Error(`Could not find closing $form$::jsonb for ${variableName}`);
  }

  const json = JSON.stringify(formSchema, null, 2);
  return `${sql.slice(0, jsonStart)}${json}${sql.slice(end)}`;
}

function replaceMetadataBlock(
  sql: string,
  variableName: string,
  metadata: FileUploadStepMetadata,
): string {
  const marker = `${variableName} jsonb := $metadata$`;
  const start = sql.indexOf(marker);
  if (start === -1) {
    throw new Error(`Could not find metadata marker for ${variableName}`);
  }

  const jsonStart = start + marker.length;
  const end = sql.indexOf("$metadata$::jsonb;", jsonStart);
  if (end === -1) {
    throw new Error(`Could not find closing $metadata$::jsonb for ${variableName}`);
  }

  const json = JSON.stringify(metadata, null, 2);
  return `${sql.slice(0, jsonStart)}${json}${sql.slice(end)}`;
}

function replaceConsentOptionsBlock(
  sql: string,
  variableName: string,
  consentOptions: typeof ROOTED_MEADOWS_PHOTOGRAPHY_MEDIA_RELEASE_CONSENT_OPTIONS,
): string {
  const marker = `${variableName} jsonb := $consent$`;
  const start = sql.indexOf(marker);
  if (start === -1) {
    throw new Error(`Could not find consent marker for ${variableName}`);
  }

  const jsonStart = start + marker.length;
  const end = sql.indexOf("$consent$::jsonb;", jsonStart);
  if (end === -1) {
    throw new Error(`Could not find closing $consent$::jsonb for ${variableName}`);
  }

  const json = JSON.stringify(consentOptions, null, 2);
  return `${sql.slice(0, jsonStart)}${json}${sql.slice(end)}`;
}

const agreementFiles = [
  resolve(
    "supabase/migrations/rooted-meadows/seed_rooted_meadows_enrollment_agreement_variants.sql",
  ),
  resolve(
    "supabase/migrations_manual/update_rooted_meadows_enrollment_agreements_2026_07_26.sql",
  ),
];

for (const file of agreementFiles) {
  let sql = readFileSync(file, "utf8");
  sql = replaceSectionsBlock(sql, "v_standard_sections", ROOTED_MEADOWS_STANDARD_ENROLLMENT_SECTIONS);
  sql = replaceSectionsBlock(sql, "v_conditional_sections", ROOTED_MEADOWS_CONDITIONAL_SUPPORT_SECTIONS);
  writeFileSync(file, sql, "utf8");
  console.log(`Updated ${file}`);
}

const mediaTechnologyFile = resolve(
  "supabase/migrations/rooted-meadows/seed_rooted_meadows_media_technology_step.sql",
);
let mediaTechnologySql = readFileSync(mediaTechnologyFile, "utf8");
mediaTechnologySql = replaceSectionsBlock(
  mediaTechnologySql,
  "v_sections",
  ROOTED_MEADOWS_MEDIA_TECHNOLOGY_SECTIONS,
);
writeFileSync(mediaTechnologyFile, mediaTechnologySql, "utf8");
console.log(`Updated ${mediaTechnologyFile}`);

const photographyMediaReleaseFile = resolve(
  "supabase/migrations/rooted-meadows/seed_rooted_meadows_photography_media_release_step.sql",
);
let photographyMediaReleaseSql = readFileSync(photographyMediaReleaseFile, "utf8");
photographyMediaReleaseSql = replaceSectionsBlock(
  photographyMediaReleaseSql,
  "v_sections",
  ROOTED_MEADOWS_PHOTOGRAPHY_MEDIA_RELEASE_SECTIONS,
);
photographyMediaReleaseSql = replaceConsentOptionsBlock(
  photographyMediaReleaseSql,
  "v_consent_options",
  ROOTED_MEADOWS_PHOTOGRAPHY_MEDIA_RELEASE_CONSENT_OPTIONS,
);
writeFileSync(photographyMediaReleaseFile, photographyMediaReleaseSql, "utf8");
console.log(`Updated ${photographyMediaReleaseFile}`);

const releaseOfLiabilityFile = resolve(
  "supabase/migrations/rooted-meadows/seed_rooted_meadows_release_of_liability_step.sql",
);
let releaseOfLiabilitySql = readFileSync(releaseOfLiabilityFile, "utf8");
releaseOfLiabilitySql = replaceSectionsBlock(
  releaseOfLiabilitySql,
  "v_sections",
  ROOTED_MEADOWS_RELEASE_OF_LIABILITY_SECTIONS,
);
writeFileSync(releaseOfLiabilityFile, releaseOfLiabilitySql, "utf8");
console.log(`Updated ${releaseOfLiabilityFile}`);

const healthEmergencyFile = resolve(
  "supabase/migrations/rooted-meadows/seed_rooted_meadows_health_emergency_step.sql",
);
let healthEmergencySql = readFileSync(healthEmergencyFile, "utf8");
healthEmergencySql = replaceFormSchemaBlock(
  healthEmergencySql,
  "v_form_schema",
  ROOTED_MEADOWS_HEALTH_EMERGENCY_FORM_SCHEMA,
);
writeFileSync(healthEmergencyFile, healthEmergencySql, "utf8");
console.log(`Updated ${healthEmergencyFile}`);

const immunizationRecordsFile = resolve(
  "supabase/migrations/rooted-meadows/seed_rooted_meadows_immunization_records_step.sql",
);
let immunizationRecordsSql = readFileSync(immunizationRecordsFile, "utf8");
immunizationRecordsSql = replaceMetadataBlock(
  immunizationRecordsSql,
  "v_metadata",
  ROOTED_MEADOWS_IMMUNIZATION_RECORDS_CONFIG,
);
writeFileSync(immunizationRecordsFile, immunizationRecordsSql, "utf8");
console.log(`Updated ${immunizationRecordsFile}`);

const schoolTranscriptFile = resolve(
  "supabase/migrations/rooted-meadows/seed_rooted_meadows_school_transcript_step.sql",
);
let schoolTranscriptSql = readFileSync(schoolTranscriptFile, "utf8");
schoolTranscriptSql = replaceMetadataBlock(
  schoolTranscriptSql,
  "v_metadata",
  ROOTED_MEADOWS_SCHOOL_TRANSCRIPT_CONFIG,
);
writeFileSync(schoolTranscriptFile, schoolTranscriptSql, "utf8");
console.log(`Updated ${schoolTranscriptFile}`);
