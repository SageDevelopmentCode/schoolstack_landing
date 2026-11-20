"use client";

import { Check, Copy, Download, FileText } from "lucide-react";
import { useEffect, useState } from "react";
import { GConfirmDialog, GDialog } from "@/components/school-parent/garden/GDialog";
import { gBtnOutlineSm, gBtnPopSm } from "@/components/school-parent/garden/ui";
import NewsletterSectionsSheet from "./NewsletterSectionsSheet";
import type { NewsletterEditorModel } from "./useNewsletterEditorModel";

/** Edit sections sheet, export dialog and the builder's confirms (Garden). */
export default function NewsletterModals({ model }: { model: NewsletterEditorModel }) {
  const { modal, setModal, theme } = model;
  const close = () => setModal(null);

  return (
    <>
      {modal?.type === "sections" ? (
        <NewsletterSectionsSheet
          open
          workspace={model.workspace}
          activeEdition={model.activeEdition}
          onClose={close}
          onWorkspaceChange={model.onWorkspaceChange}
          onToast={model.showToast}
        />
      ) : null}

      <GDialog
        theme={theme}
        open={modal?.type === "export"}
        onClose={close}
        title="Download or copy"
        description="HTML is a standalone page, not an email-delivery template. Nothing is sent."
        data-testid="newsletter-export-dialog"
      >
        <ExportBody model={model} />
      </GDialog>

      <GConfirmDialog
        theme={theme}
        open={modal?.type === "returnToDraft"}
        title="Return to draft?"
        description="Reopen this edition for editing. Nothing is sent to families. When you save, it comes down from the parent portal until you publish again."
        confirmLabel="Return to draft"
        onConfirm={model.returnToDraft}
        onClose={close}
        confirmTestId="newsletter-return-to-draft-confirm"
      />

      <GConfirmDialog
        theme={theme}
        open={modal?.type === "resetSample"}
        title="Reset to sample content?"
        description="This replaces the current edition in this browser with sample text. Saving will write it to MudKitchen."
        confirmLabel="Reset sample"
        destructive
        onConfirm={() => {
          close();
          model.onResetSample();
        }}
        onClose={close}
      />
    </>
  );
}

function ExportBody({ model }: { model: NewsletterEditorModel }) {
  const [copied, setCopied] = useState(false);
  const [copying, setCopying] = useState(false);

  useEffect(() => {
    if (!copied) return undefined;
    const timer = window.setTimeout(() => setCopied(false), 2000);
    return () => window.clearTimeout(timer);
  }, [copied]);

  return (
    <div className="flex flex-wrap gap-2">
      <button type="button" className={gBtnPopSm} onClick={model.exportHtml}>
        <Download className="h-4 w-4" aria-hidden />
        Download HTML
      </button>
      <button type="button" className={gBtnOutlineSm} onClick={() => void model.exportText()}>
        <FileText className="h-4 w-4" aria-hidden />
        Download text
      </button>
      <button
        type="button"
        className={gBtnOutlineSm}
        disabled={copying}
        aria-live="polite"
        onClick={() => {
          setCopying(true);
          void model
            .copyText()
            .then((ok) => setCopied(ok))
            .finally(() => setCopying(false));
        }}
      >
        {copied ? (
          <>
            <Check className="h-4 w-4 text-[var(--sf-forest)]" aria-hidden />
            Copied
          </>
        ) : (
          <>
            <Copy className="h-4 w-4" aria-hidden />
            Copy text
          </>
        )}
      </button>
    </div>
  );
}
