"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AlertCircle, PenLine, X } from "lucide-react";
import ButtonLoadingLabel, {
  BUTTON_LOADING_LAYOUT_CLASS,
} from "@/components/ui/ButtonLoadingLabel";
import PublicFormHoneypotField from "@/components/public-forms/PublicFormHoneypotField";
import { Tape, Tick } from "@/components/garden/ui";
import { PUBLIC_FORM_HONEYPOT_FIELD } from "@/lib/public-forms/honeypot";
import { GET_STARTED_PAGE_PATH } from "@/lib/marketing/book-demo";
import {
  questionChatGroups,
  questionChatDraft,
  QUESTION_CHAT_ACTIONS,
  QUESTION_CHAT_COVERED,
  QUESTION_CHAT_GREETING,
  QUESTION_CHAT_NODES,
  TRY_FREE_PATH,
  type QuestionChatAction,
  type QuestionChatNode,
} from "@/components/sections/question-chat-tree";

/* MudKitchen Garden styling. This widget only mounts inside HomeGardenShell
   (under GardenRoot), so the --sf-* tokens and sf-* classes are in scope.
   Skill: .claude/skills/mudkitchen-garden-design */

const fieldClassName =
  "w-full rounded-2xl border-2 border-[var(--sf-ink)]/15 bg-white px-3 py-2.5 text-[15px] font-semibold text-[var(--sf-ink)] outline-none transition placeholder:font-normal placeholder:text-[var(--sf-ink)]/40 focus:border-[var(--sf-clay)] focus-visible:ring-4 focus-visible:ring-[var(--sf-clay)]/20";

const labelClassName =
  "flex flex-col gap-1.5 text-[13px] font-extrabold text-[var(--sf-ink)]";

const chipBase =
  "max-w-full cursor-pointer rounded-full border-2 border-[var(--sf-ink)] px-4 py-2 text-left text-[14px] font-extrabold leading-snug text-[var(--sf-ink)] shadow-[0_3px_0_0_var(--sf-ink)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_4px_0_0_var(--sf-ink)] focus-visible:-translate-y-0.5 focus-visible:shadow-[0_4px_0_0_var(--sf-ink)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--sf-ink)]/20 active:translate-y-0.5 active:shadow-[0_1px_0_0_var(--sf-ink)]";

const chipClassName = `${chipBase} bg-white`;

const followUpChipClassName = `${chipBase} bg-[var(--sf-mint)]`;

const sendQuestionClassName =
  "inline-flex cursor-pointer items-center gap-2 rounded-full border-2 border-dashed border-[var(--sf-clay-deep)] bg-[var(--sf-peach)] px-4 py-2 text-left text-[14px] font-extrabold text-[var(--sf-clay-deep)] transition-all duration-200 hover:-translate-y-0.5 hover:border-solid focus-visible:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--sf-clay)]/30";

const actionPrimaryClassName =
  "inline-flex h-9 cursor-pointer items-center rounded-full bg-[var(--sf-clay)] px-4 text-[13px] font-extrabold text-white shadow-[0_3px_0_0_var(--sf-clay-deep)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_4px_0_0_var(--sf-clay-deep)] focus-visible:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--sf-clay)]/40 active:translate-y-0.5 active:shadow-[0_1px_0_0_var(--sf-clay-deep)]";

const actionSecondaryClassName =
  "inline-flex h-9 cursor-pointer items-center rounded-full border-2 border-[var(--sf-ink)] bg-white px-4 text-[13px] font-extrabold text-[var(--sf-ink)] shadow-[0_3px_0_0_var(--sf-ink)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_4px_0_0_var(--sf-ink)] focus-visible:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--sf-ink)]/20 active:translate-y-0.5 active:shadow-[0_1px_0_0_var(--sf-ink)]";

const submitClassName = `inline-flex h-11 w-full cursor-pointer items-center justify-center rounded-full bg-[var(--sf-clay)] text-[15px] font-extrabold text-white shadow-[0_5px_0_0_var(--sf-clay-deep)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_6px_0_0_var(--sf-clay-deep)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--sf-clay)]/40 active:translate-y-1 active:shadow-[0_1px_0_0_var(--sf-clay-deep)] disabled:pointer-events-none disabled:opacity-50 ${BUTTON_LOADING_LAYOUT_CLASS}`;

const launcherClassName =
  "flex cursor-pointer items-center gap-2 rounded-full bg-[var(--sf-forest)] py-2 pl-2 pr-5 text-[15px] font-extrabold text-white shadow-[0_5px_0_0_var(--sf-forest-deep)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_7px_0_0_var(--sf-forest-deep)] focus-visible:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--sf-forest)]/40 active:translate-y-1 active:shadow-[0_2px_0_0_var(--sf-forest-deep)]";

const TYPING_DOTS = ["var(--sf-clay)", "var(--sf-forest)", "var(--sf-moss)"] as const;

const REPLY_PAUSE_MS = 650;
const GET_STARTED_DEMO_HASH = "#get-started-demo";

function TypingBubble() {
  return (
    <div
      className="flex w-fit items-center gap-1.5 rounded-[20px] rounded-bl-md border-2 border-[var(--sf-ink)] bg-white px-4 py-3.5 shadow-[0_3px_0_0_var(--sf-ink)]"
      aria-hidden
    >
      {TYPING_DOTS.map((color, dot) => (
        <motion.span
          key={color}
          className="h-2 w-2 rounded-full"
          style={{ background: color }}
          animate={{ y: [0, -4, 0] }}
          transition={{ duration: 0.7, repeat: Infinity, delay: dot * 0.12, ease: "easeInOut" }}
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
      className="mt-3 flex flex-wrap gap-2.5 pb-0.5"
      initial={motionOn ? { opacity: 0, y: 6 } : false}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: motionOn ? 0.12 : 0, ease: "easeOut" }}
    >
      {visible.map((action, index) => {
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
            className={index === 0 ? actionPrimaryClassName : actionSecondaryClassName}
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
      className={`w-fit max-w-[90%] break-words rounded-[20px] border-2 border-[var(--sf-ink)] px-4 py-2.5 text-[15px] leading-relaxed ${
        isVisitor
          ? "ml-auto rounded-br-md bg-[var(--sf-butter)] font-extrabold text-[var(--sf-ink)] shadow-[0_3px_0_0_var(--sf-ink)]"
          : "rounded-bl-md bg-white text-[var(--sf-ink)]/85 shadow-[0_3px_0_0_var(--sf-ink)]"
      }`}
      style={isVisitor ? { rotate: "0.6deg" } : undefined}
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

  const groups = questionChatGroups(turns);
  const toNodes = (ids: readonly string[]) =>
    ids
      .map((id) => QUESTION_CHAT_NODES[id])
      .filter((node): node is QuestionChatNode => Boolean(node));
  const followUps = toNodes(groups.followUps);
  const otherQuestions = toNodes(groups.others);
  const hasSuggestions = followUps.length > 0 || otherQuestions.length > 0;
  const covered = turns.length > 0 && !hasSuggestions;
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
            initial={reduceMotion ? false : { opacity: 0, y: 20, scale: 0.96, rotate: -1.5 }}
            animate={{ opacity: 1, y: 0, scale: 1, rotate: 0 }}
            exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 16, scale: 0.97, rotate: -1 }}
            transition={
              reduceMotion
                ? { duration: 0.15 }
                : { type: "spring", stiffness: 400, damping: 28, opacity: { duration: 0.18 } }
            }
            style={{ transformOrigin: "bottom right" }}
            className="relative mb-4 h-[min(760px,calc(100dvh-11rem))] w-[min(420px,calc(100vw-2rem))]"
          >
            <Tape
              color="var(--sf-butter)"
              className="-top-3 left-1/2 -translate-x-1/2 -rotate-3"
            />
            <div className="flex h-full flex-col overflow-hidden rounded-[28px] border-2 border-[var(--sf-ink)] bg-[var(--sf-paper)] shadow-[0_8px_0_0_var(--sf-ink)]">
              <div className="flex shrink-0 items-center justify-between gap-3 border-b-2 border-dashed border-[var(--sf-ink)]/20 bg-[var(--sf-mint)]/60 px-4 pb-3 pt-4">
                <div className="flex min-w-0 items-center gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white ring-2 ring-[var(--sf-ink)]">
                    <Image
                      src="/images/Logo.webp"
                      alt=""
                      width={24}
                      height={24}
                      className="object-contain"
                    />
                  </span>
                  <div className="min-w-0">
                    <p className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-[var(--sf-clay-deep)]">
                      MudKitchen
                    </p>
                    <div className="flex items-baseline gap-2">
                      <p
                        id="questions-chat-title"
                        className="sf-display text-2xl leading-none text-[var(--sf-ink)]"
                      >
                        Questions
                      </p>
                      <span
                        aria-hidden
                        className="sf-hand hidden -rotate-3 text-lg leading-none text-[var(--sf-forest)] min-[380px]:inline"
                      >
                        pick one ↓
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  data-questions-close
                  onClick={closePanel}
                  className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full bg-white text-[var(--sf-ink)] ring-2 ring-[var(--sf-ink)]/15 transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:rotate-90 hover:ring-[var(--sf-ink)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--sf-ink)]/30"
                  aria-label="Close"
                >
                  <X className="h-4 w-4" strokeWidth={2.6} aria-hidden />
                </button>
              </div>

              <div
                ref={scrollerRef}
                data-lenis-prevent
                className="sf-grid min-h-0 flex-1 overflow-y-auto overscroll-contain bg-[var(--sf-cream)]"
              >
                <div className="flex min-h-full flex-col justify-end gap-3.5 px-4 py-5">
                  <ChatBubble from="bot">{QUESTION_CHAT_GREETING}</ChatBubble>

                  {turns.map((turn) => {
                    const waiting = turn.id === pendingReplyId;
                    const isLatest = turn.id === turns[turns.length - 1]?.id;
                    return (
                      <div key={turn.id} className="flex flex-col gap-3">
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
                              {turn.actions.length > 0 ? (
                                <AnswerActions
                                  actions={turn.actions}
                                  pathname={pathname}
                                  reduceMotion={reduceMotion}
                                  animateIn={isLatest}
                                  onDemo={goToGetStartedDemo}
                                  onNavigate={closeForNavigation}
                                />
                              ) : null}
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
                      className="sf-paper relative flex flex-col gap-3.5 rounded-[22px] border-2 border-[var(--sf-ink)]/15 p-4"
                      onSubmit={(event) => {
                        event.preventDefault();
                        void handleSubmit();
                      }}
                    >
                      <PublicFormHoneypotField
                        value={companyWebsite}
                        onChange={setCompanyWebsite}
                      />
                      <label htmlFor={messageId} className={labelClassName}>
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
                      <label htmlFor={nameId} className={labelClassName}>
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
                      <label htmlFor={emailId} className={labelClassName}>
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
                        <p
                          role="alert"
                          className="flex items-start gap-1.5 text-sm font-bold text-[var(--sf-clay-deep)]"
                        >
                          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={2.4} aria-hidden />
                          {submitError}
                        </p>
                      ) : null}
                      <button
                        type="submit"
                        disabled={!canSubmit || isSubmitting}
                        className={`mt-1 ${submitClassName}`}
                      >
                        <ButtonLoadingLabel loading={isSubmitting} loadingLabel="Sending...">
                          Send Question
                        </ButtonLoadingLabel>
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowForm(false)}
                        className="mx-auto cursor-pointer rounded-full px-2 text-[13px] font-extrabold text-[var(--sf-soft)] underline decoration-[var(--sf-moss)] decoration-2 underline-offset-4 transition-colors hover:text-[var(--sf-ink)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--sf-ink)]/20"
                      >
                        Back to questions
                      </button>
                    </form>
                  ) : null}

                  {submitted ? (
                    <div className="rounded-[22px] border-2 border-[var(--sf-ink)] bg-[var(--sf-mint)] px-4 py-5 text-center shadow-[0_3px_0_0_var(--sf-ink)]">
                      <span className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-white ring-2 ring-[var(--sf-ink)]">
                        <Tick className="h-8 w-8" fill="#fff" />
                      </span>
                      <p className="sf-display text-xl text-[var(--sf-ink)]">Question received</p>
                      <p className="mt-1.5 text-[14px] leading-relaxed text-[var(--sf-soft)]">
                        Thanks! We&apos;ll get back to you at the email you provided.
                      </p>
                    </div>
                  ) : null}
                </div>
              </div>

              {!showForm && !submitted ? (
                <div
                  ref={footerRef}
                  data-lenis-prevent
                  className="max-h-[46%] shrink-0 overflow-y-auto border-t-2 border-dashed border-[var(--sf-ink)]/20 bg-[var(--sf-paper)] px-4 pb-4 pt-3.5"
                >
                  {!pendingReplyId && hasSuggestions ? (
                    <motion.div
                      initial={reduceMotion ? false : { opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: reduceMotion ? 0 : 0.12, ease: "easeOut" }}
                    >
                      {followUps.length > 0 ? (
                        <div role="group" aria-label="Follow-up questions" className="flex flex-wrap gap-2.5">
                          {followUps.map((node) => (
                            <button
                              key={node.id}
                              type="button"
                              onClick={() => pickQuestion(node)}
                              className={followUpChipClassName}
                            >
                              {node.question}
                            </button>
                          ))}
                        </div>
                      ) : null}
                      {followUps.length > 0 && otherQuestions.length > 0 ? (
                        <div
                          className="my-3.5 border-t-2 border-dashed border-[var(--sf-ink)]/15"
                          role="separator"
                        />
                      ) : null}
                      {otherQuestions.length > 0 ? (
                        <div role="group" aria-label="Other questions" className="flex flex-wrap gap-2.5">
                          {otherQuestions.map((node) => (
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
                      ) : null}
                      <button
                        type="button"
                        onClick={openDirectQuestion}
                        className={`${sendQuestionClassName} mt-3.5`}
                      >
                        <PenLine className="h-4 w-4" strokeWidth={2.4} aria-hidden />
                        Send us a question
                      </button>
                    </motion.div>
                  ) : (
                    <button
                      type="button"
                      onClick={openDirectQuestion}
                      className={sendQuestionClassName}
                    >
                      <PenLine className="h-4 w-4" strokeWidth={2.4} aria-hidden />
                      Send us a question
                    </button>
                  )}
                </div>
              ) : null}

              {submitted ? (
                <div className="shrink-0 border-t-2 border-dashed border-[var(--sf-ink)]/20 bg-[var(--sf-paper)] px-4 pb-4 pt-1">
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
            </div>
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
        className={launcherClassName}
        aria-label="Questions?"
        aria-expanded={open}
      >
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--sf-cream)]">
          <Image
            src="/images/Logo.webp"
            alt=""
            width={18}
            height={18}
            className="object-contain"
            aria-hidden
          />
        </span>
        <span>Questions?</span>
      </button>
    </div>
  );
}
