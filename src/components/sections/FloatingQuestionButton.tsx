"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Check, X } from "lucide-react";
import ButtonLoadingLabel, {
  BUTTON_LOADING_LAYOUT_CLASS,
} from "@/components/ui/ButtonLoadingLabel";
import PublicFormHoneypotField from "@/components/public-forms/PublicFormHoneypotField";
import { PUBLIC_FORM_HONEYPOT_FIELD } from "@/lib/public-forms/honeypot";
import { GET_STARTED_PAGE_PATH } from "@/lib/marketing/book-demo";
import {
  nextQuestionIds,
  questionChatDraft,
  QUESTION_CHAT_ACTIONS,
  QUESTION_CHAT_COVERED,
  QUESTION_CHAT_GREETING,
  QUESTION_CHAT_NODES,
  TRY_FREE_PATH,
  type QuestionChatAction,
  type QuestionChatNode,
} from "@/components/sections/question-chat-tree";

const fieldClassName =
  "w-full rounded-2xl border border-black/10 bg-white px-3 py-2.5 font-secondary text-sm font-normal text-[#1d1a16] outline-none transition placeholder:text-[#1d1a16]/40 focus:border-clay focus-visible:ring-2 focus-visible:ring-clay/30";

const chipClassName =
  "font-secondary max-w-full rounded-pill border border-black/15 bg-white px-4 py-2 text-left text-[14px] font-semibold text-[#1d1a16] transition-colors hover:border-black/35";

const actionPrimaryClassName =
  "font-secondary inline-flex h-9 items-center rounded-pill bg-[#1d1a16] px-4 text-[13px] font-semibold text-white transition-colors hover:bg-clay";

const actionSecondaryClassName =
  "font-secondary inline-flex h-9 items-center rounded-pill border border-black/15 bg-white px-4 text-[13px] font-semibold text-[#1d1a16] transition-colors hover:border-black/35";

const REPLY_PAUSE_MS = 650;
const GET_STARTED_DEMO_HASH = "#get-started-demo";

function TypingBubble() {
  return (
    <div
      className="flex w-fit items-center gap-1 rounded-[20px] rounded-bl-md bg-[#F7F5F2] px-4 py-3"
      aria-hidden
    >
      {[0, 1, 2].map((dot) => (
        <motion.span
          key={dot}
          className="h-1.5 w-1.5 rounded-full bg-[#1d1a16]/45"
          animate={{ opacity: [0.25, 1, 0.25] }}
          transition={{ duration: 0.9, repeat: Infinity, delay: dot * 0.15, ease: "easeInOut" }}
        />
      ))}
    </div>
  );
}

function AnswerActions({
  actions,
  pathname,
  reduceMotion,
  animateIn,
  onDemo,
  onNavigate,
}: {
  actions: readonly QuestionChatAction[];
  pathname: string;
  reduceMotion: boolean | null;
  animateIn: boolean;
  onDemo: () => void;
  onNavigate: () => void;
}) {
  const visible = actions.filter((action) => action.id !== "try" || pathname !== TRY_FREE_PATH);
  const motionOn = animateIn && !reduceMotion;

  return (
    <motion.div
      className="mt-3 flex flex-wrap gap-2"
      initial={motionOn ? { opacity: 0, y: 6 } : false}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: motionOn ? 0.12 : 0, ease: "easeOut" }}
    >
      {visible.map((action) => {
        const isDemo = action.id === "demo";
        const href = isDemo && pathname === GET_STARTED_PAGE_PATH ? GET_STARTED_DEMO_HASH : action.href;
        return (
          <Link
            key={action.id}
            href={href}
            onClick={(event) => {
              if (isDemo && pathname === GET_STARTED_PAGE_PATH) {
                event.preventDefault();
                onDemo();
                return;
              }
              onNavigate();
            }}
            className={isDemo ? actionPrimaryClassName : actionSecondaryClassName}
          >
            {action.label}
          </Link>
        );
      })}
    </motion.div>
  );
}

function ChatBubble({
  from,
  children,
}: {
  from: "bot" | "visitor";
  children: ReactNode;
}) {
  const isVisitor = from === "visitor";
  return (
    <div
      className={`w-fit max-w-[92%] break-words rounded-[20px] px-4 py-2.5 font-secondary text-[14px] leading-relaxed ${
        isVisitor
          ? "ml-auto rounded-br-md bg-[#1d1a16] text-white"
          : "rounded-bl-md bg-[#F7F5F2] text-[#1d1a16]/80"
      }`}
    >
      {children}
    </div>
  );
}

export default function FloatingQuestionButton() {
  const pathname = usePathname();
  const reduceMotion = useReducedMotion();
  const nameId = useId();
  const emailId = useId();
  const messageId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const footerRef = useRef<HTMLDivElement>(null);
  const launcherRef = useRef<HTMLButtonElement>(null);
  const draftRef = useRef("");

  const [open, setOpen] = useState(false);
  const [turns, setTurns] = useState<QuestionChatNode[]>([]);
  const [pendingReplyId, setPendingReplyId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [question, setQuestion] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [companyWebsite, setCompanyWebsite] = useState("");

  const chips = nextQuestionIds(turns)
    .map((id) => QUESTION_CHAT_NODES[id])
    .filter((node): node is QuestionChatNode => Boolean(node));
  const covered = turns.length > 0 && chips.length === 0;
  const canSubmit =
    question.trim().length > 0 && name.trim().length > 0 && email.trim().length > 0;

  const resetConversation = () => {
    setTurns([]);
    setPendingReplyId(null);
    setShowForm(false);
    setQuestion("");
    setName("");
    setEmail("");
    setSubmitted(false);
    setSubmitError(null);
    setCompanyWebsite("");
    draftRef.current = "";
  };

  const closePanel = () => {
    setOpen(false);
    if (submitted) resetConversation();
    launcherRef.current?.focus();
  };

  const openDirectQuestion = () => {
    const draft = questionChatDraft(turns.map((turn) => turn.question));
    setQuestion((current) =>
      current.trim().length === 0 || current === draftRef.current ? draft : current,
    );
    draftRef.current = draft;
    setShowForm(true);
    setSubmitError(null);
  };

  const pickQuestion = (node: QuestionChatNode) => {
    setTurns((current) =>
      current.some((turn) => turn.id === node.id) ? current : [...current, node],
    );
    if (!reduceMotion) setPendingReplyId(node.id);
  };

  const closeForNavigation = () => {
    setOpen(false);
  };

  const goToGetStartedDemo = () => {
    setOpen(false);
    window.setTimeout(() => {
      const section = document.getElementById(GET_STARTED_DEMO_HASH.slice(1));
      if (!section) return;
      const top = section.getBoundingClientRect().top + window.scrollY - 100;
      window.scrollTo({ top, behavior: reduceMotion ? "auto" : "smooth" });
    }, 50);
  };

  const handleSubmit = async () => {
    if (!canSubmit || isSubmitting) return;

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const res = await fetch("/api/homepage-questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          message: question.trim(),
          [PUBLIC_FORM_HONEYPOT_FIELD]: companyWebsite,
        }),
      });

      const data = (await res.json()) as { ok?: boolean; error?: string };

      if (!res.ok) {
        setSubmitError(data.error ?? "Something went wrong");
        return;
      }

      setSubmitted(true);
      setShowForm(false);
      setCompanyWebsite("");
    } catch {
      setSubmitError("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (!pendingReplyId) return;
    const timer = window.setTimeout(() => setPendingReplyId(null), REPLY_PAUSE_MS);
    return () => window.clearTimeout(timer);
  }, [pendingReplyId]);

  useEffect(() => {
    if (!open) return;
    const panel = panelRef.current;
    const closeButton = panel?.querySelector<HTMLButtonElement>("[data-questions-close]");
    closeButton?.focus();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const scroller = scrollerRef.current;
    if (!scroller) return;

    const scrollToEnd = () => {
      scroller.scrollTo({
        top: scroller.scrollHeight,
        behavior: reduceMotion || showForm ? "auto" : "smooth",
      });
    };

    scrollToEnd();
    if (!showForm) return;

    document.getElementById(messageId)?.focus({ preventScroll: true });
    const frame = window.requestAnimationFrame(scrollToEnd);
    return () => window.cancelAnimationFrame(frame);
  }, [open, turns, pendingReplyId, showForm, submitted, covered, reduceMotion, messageId]);

  useEffect(() => {
    if (!open || turns.length === 0 || showForm || pendingReplyId) return;
    footerRef.current?.querySelector<HTMLElement>("button, a[href]")?.focus();
  }, [open, turns, showForm, covered, pendingReplyId]);

  useEffect(() => {
    if (!open) return;

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setOpen(false);
        if (submitted) resetConversation();
        launcherRef.current?.focus();
        return;
      }

      if (event.key !== "Tab") return;
      const panel = panelRef.current;
      if (!panel) return;

      const focusable = [
        ...panel.querySelectorAll<HTMLElement>(
          'button:not([disabled]), a[href], textarea:not([disabled]), input:not([disabled]):not([tabindex="-1"])',
        ),
      ];
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, submitted]);

  const revealedAnswer =
    turns.length === 0
      ? QUESTION_CHAT_GREETING
      : pendingReplyId
        ? (turns[turns.length - 2]?.answer ?? QUESTION_CHAT_GREETING)
        : turns[turns.length - 1].answer;
  const liveMessage = !open
    ? ""
    : submitted
      ? "Question received. Thanks! We'll get back to you at the email you provided."
      : revealedAnswer;

  return (
    <div className="fixed bottom-4 right-4 z-[150] flex flex-col items-end sm:bottom-6 sm:right-6">
      <div className="sr-only" aria-live="polite">
        {liveMessage}
      </div>
      <AnimatePresence>
        {open && (
          <motion.div
            key="sheet"
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="questions-chat-title"
            initial={reduceMotion ? false : { opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 16, scale: 0.98 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="mb-3 flex h-[min(760px,calc(100dvh-10.5rem))] w-[min(420px,calc(100vw-2rem))] flex-col overflow-hidden rounded-[28px] border border-black/10 bg-white shadow-[0_8px_40px_rgba(29,26,22,0.16)]"
          >
            <div className="flex shrink-0 items-center justify-between gap-3 border-b border-black/10 px-4 py-3">
              <div className="flex items-center gap-2.5">
                <Image
                  src="/images/Logo.webp"
                  alt=""
                  width={28}
                  height={28}
                  className="object-contain"
                />
                <div>
                  <p className="font-secondary text-[11px] font-semibold uppercase tracking-widest text-clay">
                    MudKitchen
                  </p>
                  <p
                    id="questions-chat-title"
                    className="font-secondary text-[15px] font-semibold text-[#1d1a16]"
                  >
                    Questions
                  </p>
                </div>
              </div>
              <button
                type="button"
                data-questions-close
                onClick={closePanel}
                className="flex h-8 w-8 items-center justify-center rounded-full text-[#1d1a16]/60 transition-colors hover:bg-[#F4F1EC] hover:text-[#1d1a16]"
                aria-label="Close"
              >
                <X className="h-4 w-4" aria-hidden />
              </button>
            </div>

            <div ref={scrollerRef} className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
              <div className="flex min-h-full flex-col justify-end gap-3 px-4 py-4">
                <ChatBubble from="bot">{QUESTION_CHAT_GREETING}</ChatBubble>

                {turns.map((turn) => {
                  const waiting = turn.id === pendingReplyId;
                  const isLatest = turn.id === turns[turns.length - 1]?.id;
                  return (
                    <div key={turn.id} className="flex flex-col gap-2">
                      <ChatBubble from="visitor">{turn.question}</ChatBubble>
                      {waiting ? (
                        <TypingBubble />
                      ) : (
                        <motion.div
                          initial={reduceMotion || !isLatest ? false : { opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.35, ease: "easeOut" }}
                        >
                          <ChatBubble from="bot">
                            {turn.answer}
                            <AnswerActions
                              actions={turn.actions}
                              pathname={pathname}
                              reduceMotion={reduceMotion}
                              animateIn={isLatest}
                              onDemo={goToGetStartedDemo}
                              onNavigate={closeForNavigation}
                            />
                          </ChatBubble>
                        </motion.div>
                      )}
                    </div>
                  );
                })}

                {covered && !submitted && !pendingReplyId ? (
                  <motion.div
                    initial={reduceMotion ? false : { opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, ease: "easeOut" }}
                  >
                    <ChatBubble from="bot">
                      {QUESTION_CHAT_COVERED}
                      <AnswerActions
                        actions={QUESTION_CHAT_ACTIONS}
                        pathname={pathname}
                        reduceMotion={reduceMotion}
                        animateIn
                        onDemo={goToGetStartedDemo}
                        onNavigate={closeForNavigation}
                      />
                    </ChatBubble>
                  </motion.div>
                ) : null}

                {showForm && !submitted ? (
                  <form
                    className="relative flex flex-col gap-3 rounded-[20px] bg-[#F7F5F2] p-3"
                    onSubmit={(event) => {
                      event.preventDefault();
                      void handleSubmit();
                    }}
                  >
                    <PublicFormHoneypotField
                      value={companyWebsite}
                      onChange={setCompanyWebsite}
                    />
                    <label
                      htmlFor={messageId}
                      className="flex flex-col gap-1.5 font-secondary text-[13px] font-semibold text-[#1d1a16]"
                    >
                      Your question
                      <textarea
                        id={messageId}
                        rows={4}
                        value={question}
                        onChange={(event) => setQuestion(event.target.value)}
                        placeholder="What's your question?"
                        className={`${fieldClassName} resize-none`}
                      />
                    </label>
                    <label
                      htmlFor={nameId}
                      className="flex flex-col gap-1.5 font-secondary text-[13px] font-semibold text-[#1d1a16]"
                    >
                      Your name
                      <input
                        id={nameId}
                        type="text"
                        autoComplete="name"
                        value={name}
                        onChange={(event) => setName(event.target.value)}
                        className={fieldClassName}
                      />
                    </label>
                    <label
                      htmlFor={emailId}
                      className="flex flex-col gap-1.5 font-secondary text-[13px] font-semibold text-[#1d1a16]"
                    >
                      Your email
                      <input
                        id={emailId}
                        type="email"
                        autoComplete="email"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        className={fieldClassName}
                      />
                    </label>
                    {submitError ? (
                      <p className="font-secondary text-sm text-red-600">{submitError}</p>
                    ) : null}
                    <button
                      type="submit"
                      disabled={!canSubmit || isSubmitting}
                      className={`font-secondary h-11 w-full rounded-pill bg-[#1d1a16] text-[15px] font-semibold text-white transition-colors hover:bg-clay disabled:cursor-not-allowed disabled:opacity-50 ${BUTTON_LOADING_LAYOUT_CLASS}`}
                    >
                      <ButtonLoadingLabel loading={isSubmitting} loadingLabel="Sending...">
                        Send Question
                      </ButtonLoadingLabel>
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowForm(false)}
                      className="font-secondary text-[13px] font-semibold text-[#1d1a16]/70 hover:text-[#1d1a16]"
                    >
                      Back to questions
                    </button>
                  </form>
                ) : null}

                {submitted ? (
                  <div className="rounded-[20px] bg-[#F7F5F2] px-4 py-5 text-center">
                    <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-[#1d1a16] text-white">
                      <Check className="h-5 w-5" aria-hidden />
                    </div>
                    <p className="font-secondary text-sm font-semibold text-[#1d1a16]">
                      Question received
                    </p>
                    <p className="mt-1 font-secondary text-[13px] leading-relaxed text-[#1d1a16]/70">
                      Thanks! We&apos;ll get back to you at the email you provided.
                    </p>
                  </div>
                ) : null}
              </div>
            </div>

            {!showForm && !submitted ? (
              <div
                ref={footerRef}
                className="max-h-[46%] shrink-0 overflow-y-auto border-t border-black/10 px-4 py-3"
              >
                {!pendingReplyId && chips.length > 0 ? (
                  <motion.div
                    initial={reduceMotion ? false : { opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: reduceMotion ? 0 : 0.12, ease: "easeOut" }}
                  >
                    <div role="group" aria-label="Suggested questions" className="flex flex-wrap gap-2">
                      {chips.map((node) => (
                        <button
                          key={node.id}
                          type="button"
                          onClick={() => pickQuestion(node)}
                          className={chipClassName}
                        >
                          {node.question}
                        </button>
                      ))}
                    </div>
                    <button
                      type="button"
                      onClick={openDirectQuestion}
                      className="font-secondary mt-3 text-[13px] font-semibold text-clay"
                    >
                      Send us a question
                    </button>
                  </motion.div>
                ) : (
                  <button
                    type="button"
                    onClick={openDirectQuestion}
                    className="font-secondary text-[13px] font-semibold text-clay"
                  >
                    Send us a question
                  </button>
                )}
              </div>
            ) : null}

            {submitted ? (
              <div className="shrink-0 border-t border-black/10 px-4 py-3">
                <AnswerActions
                  actions={QUESTION_CHAT_ACTIONS}
                  pathname={pathname}
                  reduceMotion
                  animateIn={false}
                  onDemo={goToGetStartedDemo}
                  onNavigate={closeForNavigation}
                />
              </div>
            ) : null}
          </motion.div>
        )}
      </AnimatePresence>

      <button
        ref={launcherRef}
        type="button"
        onClick={() => {
          if (open) closePanel();
          else setOpen(true);
        }}
        className="font-secondary flex items-center gap-2 rounded-pill bg-[#1d1a16] px-4 py-2.5 text-sm font-semibold text-white shadow-lg transition-colors hover:bg-clay"
        aria-label="Questions?"
        aria-expanded={open}
      >
        <Image
          src="/images/Logo.webp"
          alt=""
          width={20}
          height={20}
          className="object-contain brightness-0 invert"
          aria-hidden
        />
        <span className="pr-0.5">Questions?</span>
      </button>
    </div>
  );
}
