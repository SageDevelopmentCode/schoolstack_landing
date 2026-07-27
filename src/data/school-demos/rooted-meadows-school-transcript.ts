export const ROOTED_MEADOWS_SCHOOL_TRANSCRIPT_CONFIG = {
  fileUpload: {
    accept: ".pdf,.jpg,.jpeg,.png",
    maxFiles: 3,
    directions: {
      intro: "Please upload one of the following for your child:",
      options: [
        "An official school transcript from your child's previous school",
        "If homeschooled: a document stating which curricula were used and what your child has learned in mathematics and language arts",
        "If the previous school does not provide transcripts: a document from your child's last teacher stating which curricula were used and what your child has learned in mathematics and language arts",
      ],
    },
    helpText: "PDF, JPG, or PNG files only.",
  },
} as const;
