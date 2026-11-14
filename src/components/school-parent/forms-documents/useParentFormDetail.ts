"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { parseStoredSignerName } from "@/components/admissions/TypedSignatureField";
import type {
  ParentFormDetail,
  ParentFormListItem,
  TeacherFormField,
} from "@/lib/school-parent/forms-documents/types";
import { areBuilderFieldValuesComplete } from "@/lib/school-parent/forms-documents/utils";
import { reportPortalOperationalError } from "@/lib/portal-operational-errors";

export type ParentFormFieldValues = Record<string, string | boolean | string[]>;

export type ParentFormStatusTone = "info" | "success" | "alert" | "warning";

export type ParentFormSubmitResult =
  | { ok: true; detail: ParentFormDetail }
  | { ok: false; message: string };

/** True when a required builder field has a usable value (same rules as `areBuilderFieldValuesComplete`). */
export function isBuilderFieldFilled(
  field: TeacherFormField,
  fieldValues: ParentFormFieldValues,
): boolean {
  return areBuilderFieldValuesComplete([{ ...field, required: true }], fieldValues);
}

/**
 * Shared state + effects for a parent form detail view (the story modal used by
 * the teacher wizard's family preview, and the Garden signing dialog): loads the
 * detail, tracks answers + typed signature, decides when signing is allowed, and
 * submits. Views own their markup and toasts.
 */
export function useParentFormDetail({
  open,
  organizationId,
  formId,
  initialItem,
  readOnly = false,
  staffPreviewDetail = null,
  onSubmitted,
}: {
  open: boolean;
  organizationId: string;
  formId: string | null;
  initialItem: ParentFormListItem | null;
  readOnly?: boolean;
  staffPreviewDetail?: ParentFormDetail | null;
  onSubmitted: (detail: ParentFormDetail) => void;
}) {
  const isStaffPreview = staffPreviewDetail != null;
  const [detail, setDetail] = useState<ParentFormDetail | null>(
    initialItem ? { form: initialItem.form, response: initialItem.response } : null,
  );
  const [fieldValues, setFieldValues] = useState<ParentFormFieldValues>({});
  const [signerName, setSignerName] = useState("");
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);
  const [isSignSectionInView, setIsSignSectionInView] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const scrollBodyRef = useRef<HTMLDivElement>(null);
  const signSectionRef = useRef<HTMLDivElement>(null);
  // Keyed by id: a fresh list object for the same form (e.g. after signing
  // updates the list) must not refetch and flash the loading state.
  const initialItemRef = useRef(initialItem);
  const initialItemId = initialItem?.form.id ?? null;
  useEffect(() => {
    initialItemRef.current = initialItem;
  }, [initialItem]);

  useEffect(() => {
    if (!open) return;
    const initialItem = initialItemRef.current;

    if (staffPreviewDetail) {
      queueMicrotask(() => {
        setDetail(staffPreviewDetail);
        setSignerName("");
        setFieldValues({});
        setDetailError(null);
        setIsLoadingDetail(false);
      });
      return;
    }

    if (readOnly && initialItem && formId && initialItem.form.id === formId) {
      queueMicrotask(() => {
        setDetail({ form: initialItem.form, response: initialItem.response });
        setSignerName(parseStoredSignerName(initialItem.response.responses));
        setFieldValues({});
        setDetailError(null);
        setIsLoadingDetail(false);
      });
      return;
    }

    if (!formId) return;

    const activeFormId = formId;
    let cancelled = false;

    async function loadDetail() {
      setIsLoadingDetail(true);
      setDetailError(null);
      setDetail(
        initialItem?.form.id === activeFormId
          ? { form: initialItem.form, response: initialItem.response }
          : null,
      );
      setSignerName(
        initialItem?.form.id === activeFormId
          ? parseStoredSignerName(initialItem.response.responses)
          : "",
      );
      setFieldValues({});

      let fetchResponse: Response | undefined;
      try {
        const query = new URLSearchParams({ organizationId }).toString();
        fetchResponse = await fetch(
          `/api/parent-portal/forms-documents/${encodeURIComponent(activeFormId)}?${query}`,
        );
        const payload = (await fetchResponse.json()) as ParentFormDetail & {
          error?: string;
        };

        if (!fetchResponse.ok) {
          throw new Error(payload.error ?? "Failed to load form.");
        }

        if (cancelled) return;

        setDetail(payload);
        setSignerName(parseStoredSignerName(payload.response.responses));
      } catch (error) {
        if (cancelled) return;
        setDetailError(error instanceof Error ? error.message : "Failed to load form.");
        void reportPortalOperationalError(
          "parent_portal",
          {
            organizationId,
            operation: "forms_documents.load_detail",
            error: "",
          },
          error,
          fetchResponse?.status,
        );
      } finally {
        if (!cancelled) {
          setIsLoadingDetail(false);
        }
      }
    }

    queueMicrotask(() => {
      void loadDetail();
    });

    return () => {
      cancelled = true;
    };
  }, [formId, initialItemId, open, organizationId, readOnly, staffPreviewDetail, reloadKey]);

  const reload = useCallback(() => setReloadKey((key) => key + 1), []);

  const isSigned = detail?.response.status === "signed";
  const formReadOnly = readOnly || isSigned || isStaffPreview;

  const builderFields = useMemo(() => detail?.form.fields ?? [], [detail?.form.fields]);
  const { bodyBuilderFields, bodySignatureFields } = useMemo(() => {
    if (detail?.form.formType !== "builder") {
      return { bodyBuilderFields: [], bodySignatureFields: [] };
    }
    return {
      bodyBuilderFields: builderFields.filter((field) => field.type !== "signature"),
      bodySignatureFields: builderFields.filter((field) => field.type === "signature"),
    };
  }, [builderFields, detail?.form.formType]);

  const bodySignatureField = bodySignatureFields[0] ?? null;
  const builderSignatureValue = (() => {
    if (!bodySignatureField) return "";
    const raw = fieldValues[bodySignatureField.id];
    return typeof raw === "string" ? raw : "";
  })();

  const setBuilderSignature = useCallback(
    (value: string) => {
      if (!bodySignatureField) return;
      setFieldValues((current) => ({ ...current, [bodySignatureField.id]: value }));
    },
    [bodySignatureField],
  );

  const setFieldValue = useCallback((fieldId: string, value: string | boolean | string[]) => {
    setFieldValues((current) => ({ ...current, [fieldId]: value }));
  }, []);

  const storedSignerName = detail ? parseStoredSignerName(detail.response.responses) : "";

  const canSign = useMemo(() => {
    if (!detail || formReadOnly || isSubmitting) return false;

    if (detail.form.formType === "upload") {
      if (!detail.form.requireSignature) return true;
      return signerName.trim().length > 0;
    }

    if (detail.form.formType === "builder") {
      return areBuilderFieldValuesComplete(builderFields, fieldValues);
    }

    return false;
  }, [builderFields, detail, fieldValues, formReadOnly, isSubmitting, signerName]);

  /** Required non-signature questions, and which of them are still empty. */
  const requiredQuestions = useMemo(
    () => bodyBuilderFields.filter((field) => field.required),
    [bodyBuilderFields],
  );
  const missingRequiredFields = useMemo(
    () => requiredQuestions.filter((field) => !isBuilderFieldFilled(field, fieldValues)),
    [fieldValues, requiredQuestions],
  );

  /** Whether the typed signature (upload or builder) is filled in. */
  const signatureNeeded = Boolean(
    detail &&
      ((detail.form.formType === "upload" && detail.form.requireSignature) ||
        (detail.form.formType === "builder" && bodySignatureField?.required)),
  );
  const signatureValue =
    detail?.form.formType === "builder" ? builderSignatureValue : signerName;
  const signatureFilled = signatureValue.trim().length > 0;

  const submitActionLabel = useMemo(() => {
    if (!detail) return "Sign now";
    if (detail.form.formType === "upload" && !detail.form.requireSignature) {
      return "Acknowledge";
    }
    return "Sign now";
  }, [detail]);

  const submit = useCallback(async (): Promise<ParentFormSubmitResult | null> => {
    if (!detail || formReadOnly || !canSign) return null;

    setIsSubmitting(true);
    let fetchResponse: Response | undefined;
    try {
      fetchResponse = await fetch(
        `/api/parent-portal/forms-documents/${encodeURIComponent(detail.form.id)}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            organizationId,
            signerName,
            fieldValues,
          }),
        },
      );
      const payload = (await fetchResponse.json()) as ParentFormDetail & {
        error?: string;
      };

      if (!fetchResponse.ok) {
        throw new Error(payload.error ?? "Failed to submit form.");
      }

      setDetail(payload);
      onSubmitted(payload);
      return { ok: true, detail: payload };
    } catch (error) {
      void reportPortalOperationalError(
        "parent_portal",
        {
          organizationId,
          operation: "forms_documents.submit",
          error: "",
        },
        error,
        fetchResponse?.status,
      );
      return {
        ok: false,
        message: error instanceof Error ? error.message : "Failed to submit form.",
      };
    } finally {
      setIsSubmitting(false);
    }
  }, [canSign, detail, fieldValues, formReadOnly, onSubmitted, organizationId, signerName]);

  const statusTone: ParentFormStatusTone = isStaffPreview
    ? "info"
    : detail?.response.status === "signed"
      ? "success"
      : detail?.response.status === "overdue"
        ? "alert"
        : "warning";

  const statusLabel = isStaffPreview
    ? "Preview"
    : detail?.response.status === "signed"
      ? "Signed"
      : detail?.response.status === "overdue"
        ? "Overdue"
        : "Needs your signature";

  const showSignSection = Boolean(
    detail &&
      !isLoadingDetail &&
      !detailError &&
      (isStaffPreview
        ? detail.form.formType === "upload" ||
          (detail.form.formType === "builder" && bodySignatureField != null)
        : formReadOnly
          ? isSigned
          : detail.form.formType === "upload" ||
            (detail.form.formType === "builder" && bodySignatureField != null)),
  );

  const scrollToSignSection = useCallback(() => {
    signSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  useEffect(() => {
    if (!showSignSection) {
      queueMicrotask(() => setIsSignSectionInView(false));
      return;
    }

    const root = scrollBodyRef.current;
    const target = signSectionRef.current;
    if (!root || !target) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsSignSectionInView(entry.isIntersecting);
      },
      { root, threshold: 0.3 },
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [showSignSection, isLoadingDetail, open, formId, detail]);

  return {
    detail,
    isStaffPreview,
    isSigned,
    formReadOnly,
    isLoadingDetail,
    isSubmitting,
    detailError,
    reload,
    fieldValues,
    setFieldValue,
    signerName,
    setSignerName,
    builderFields,
    bodyBuilderFields,
    bodySignatureField,
    builderSignatureValue,
    setBuilderSignature,
    storedSignerName,
    canSign,
    requiredQuestions,
    missingRequiredFields,
    signatureNeeded,
    signatureFilled,
    submitActionLabel,
    submit,
    statusTone,
    statusLabel,
    showSignSection,
    isSignSectionInView,
    scrollToSignSection,
    scrollBodyRef,
    signSectionRef,
  };
}

export type ParentFormDetailState = ReturnType<typeof useParentFormDetail>;
