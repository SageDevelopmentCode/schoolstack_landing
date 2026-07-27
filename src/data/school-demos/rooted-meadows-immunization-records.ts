export const ROOTED_MEADOWS_IMMUNIZATION_RECORDS_CONFIG = {
  fileUpload: {
    accept: ".pdf,.jpg,.jpeg,.png",
    maxFiles: 3,
    directions: {
      intro: "Please upload one of the following for your child:",
      options: [
        "Current immunization / vaccine records from your healthcare provider",
        "A completed Idaho Certificate of Immunization Exemption form",
      ],
    },
    helpText: "PDF, JPG, or PNG files only.",
  },
} as const;
