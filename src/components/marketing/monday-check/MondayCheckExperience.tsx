"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ChevronRight } from "lucide-react";
import MondayCheckStoryShell from "@/components/marketing/monday-check/MondayCheckStoryShell";
import ParentButton from "@/components/school-parent/ui/ParentButton";
import MondayCheckIntro from "@/components/marketing/monday-check/MondayCheckIntro";
import MondayCheckProgress from "@/components/marketing/monday-check/MondayCheckProgress";
import MondayCheckQuestion from "@/components/marketing/monday-check/MondayCheckQuestion";
import MondayCheckResults from "@/components/marketing/monday-check/MondayCheckResults";
import { DEFAULT_BRANDING } from "@/lib/organization-settings/catalog";
import { buildParentThemeTokens } from "@/lib/organization-settings/parent-theme";
import {
  MONDAY_CHECK_QUESTIONS,
  type MondayCheckAnswers,
  computeMondayCheckResults,
} from "@/lib/marketing/microschool-monday-check";

type Phase = "intro" | "question" | "results";

const ease = [0.16, 1, 0.3, 1] as const;
const exitEase = [0.4, 0, 1, 1] as const;

const slideIn = {
  initial: { opacity: 0, x: 48 },
  animate: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.45, ease },
  },
  exit: {
    opacity: 0,
    x: -48,
    transition: { duration: 0.28, ease: exitEase },
  },
};

export default function MondayCheckExperience() {
  const theme = useMemo(() => buildParentThemeTokens(DEFAULT_BRANDING), []);
  const [phase, setPhase] = useState<Phase>("intro");
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<MondayCheckAnswers>({});
  const questionHeadingRef = useRef<HTMLDivElement>(null);

  const currentQuestion = MONDAY_CHECK_QUESTIONS[questionIndex];
  const selectedOptionId = currentQuestion ? answers[currentQuestion.id] ?? null : null;

  const results = useMemo(
    () => (phase === "results" ? computeMondayCheckResults(answers) : null),
    [phase, answers],
  );

  const focusQuestion = useCallback(() => {
    requestAnimationFrame(() => {
      questionHeadingRef.current?.focus();
    });
  }, []);

  const handleStart = () => {
    setPhase("question");
    setQuestionIndex(0);
    window.scrollTo({ top: 0, behavior: "smooth" });
    focusQuestion();
  };

  const handleSelect = (optionId: string) => {
    if (!currentQuestion) return;
    setAnswers((prev) => ({ ...prev, [currentQuestion.id]: optionId }));
  };

  const handleBack = () => {
    if (phase === "question" && questionIndex > 0) {
      setQuestionIndex((i) => i - 1);
      focusQuestion();
      return;
    }
    if (phase === "question" && questionIndex === 0) {
      setPhase("intro");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    if (phase === "results") {
      setPhase("question");
      setQuestionIndex(MONDAY_CHECK_QUESTIONS.length - 1);
      focusQuestion();
    }
  };

  const handleNext = () => {
    if (!currentQuestion || !selectedOptionId) return;

    if (questionIndex < MONDAY_CHECK_QUESTIONS.length - 1) {
      setQuestionIndex((i) => i + 1);
      focusQuestion();
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    setPhase("results");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleRetake = () => {
    setAnswers({});
    setQuestionIndex(0);
    setPhase("intro");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const wide = phase === "results";

  return (
    <MondayCheckStoryShell theme={theme} wide={wide}>
      <AnimatePresence mode="wait">
        {phase === "intro" && (
          <motion.div key="intro" {...slideIn}>
            <MondayCheckIntro theme={theme} onStart={handleStart} />
          </motion.div>
        )}

        {phase === "question" && currentQuestion && (
          <motion.div key={`q-${questionIndex}`} {...slideIn}>
            <MondayCheckProgress
              theme={theme}
              currentIndex={questionIndex}
              total={MONDAY_CHECK_QUESTIONS.length}
            />
            <div ref={questionHeadingRef} tabIndex={-1} className="outline-none">
              <MondayCheckQuestion
                theme={theme}
                question={currentQuestion}
                selectedOptionId={selectedOptionId}
                onSelect={handleSelect}
              />
            </div>
            <div className="mt-8 flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-3">
              <button
                type="button"
                onClick={handleBack}
                className="inline-flex items-center gap-1.5 text-[14px] font-semibold transition-colors px-2 py-2"
                style={{
                  fontFamily: theme.fontBody,
                  color: theme.muted,
                }}
              >
                <ArrowLeft className="h-4 w-4" aria-hidden />
                Back
              </button>
              <ParentButton
                theme={theme}
                type="button"
                onClick={handleNext}
                disabled={!selectedOptionId}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-1"
              >
                {questionIndex < MONDAY_CHECK_QUESTIONS.length - 1 ? (
                  <>
                    Next
                    <ChevronRight className="h-4 w-4" aria-hidden />
                  </>
                ) : (
                  "See my results"
                )}
              </ParentButton>
            </div>
          </motion.div>
        )}

        {phase === "results" && results && (
          <motion.div key="results" {...slideIn}>
            <MondayCheckResults theme={theme} results={results} onRetake={handleRetake} />
          </motion.div>
        )}
      </AnimatePresence>
    </MondayCheckStoryShell>
  );
}
