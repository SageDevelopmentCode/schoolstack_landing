"use client";

import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "mudkitchen-ops-check-plan-v1";

export type OpsCheckLocalPlan = {
  taskIds: string[];
  doneIds: string[];
};

function loadPlan(fallbackTaskIds: string[], validQuestionIds: string[]): OpsCheckLocalPlan {
  if (typeof window === "undefined") {
    return { taskIds: fallbackTaskIds, doneIds: [] };
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { taskIds: fallbackTaskIds, doneIds: [] };
    const parsed = JSON.parse(raw) as Partial<OpsCheckLocalPlan>;
    const valid = new Set(validQuestionIds);
    const taskIds = (
      Array.isArray(parsed.taskIds) ? parsed.taskIds.filter((id) => valid.has(id)) : []
    );
    const resolvedTasks = taskIds.length > 0 ? taskIds : fallbackTaskIds;
    const doneIds = Array.isArray(parsed.doneIds)
      ? parsed.doneIds.filter((id) => valid.has(id))
      : [];
    return { taskIds: resolvedTasks, doneIds };
  } catch {
    return { taskIds: fallbackTaskIds, doneIds: [] };
  }
}

export function useOpsCheckLocalPlan(defaultTaskIds: string[], validQuestionIds: string[]) {
  const defaultKey = defaultTaskIds.join("\0");
  const validKey = validQuestionIds.join("\0");

  const [plan, setPlan] = useState<OpsCheckLocalPlan>(() =>
    loadPlan(defaultTaskIds, validQuestionIds),
  );

  useEffect(() => {
    queueMicrotask(() => {
      setPlan(loadPlan(defaultTaskIds, validQuestionIds));
    });
  }, [defaultKey, defaultTaskIds, validKey, validQuestionIds]);

  const persist = useCallback((next: OpsCheckLocalPlan) => {
    setPlan(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      /* ignore quota errors */
    }
  }, []);

  const toggleDone = useCallback(
    (taskId: string) => {
      const doneIds = plan.doneIds.includes(taskId)
        ? plan.doneIds.filter((id) => id !== taskId)
        : [...plan.doneIds, taskId];
      persist({ ...plan, doneIds });
    },
    [plan, persist],
  );

  const addTask = useCallback(
    (taskId: string) => {
      if (plan.taskIds.includes(taskId)) return false;
      persist({ ...plan, taskIds: [...plan.taskIds, taskId] });
      return true;
    },
    [plan, persist],
  );

  const removeTask = useCallback(
    (taskId: string) => {
      persist({
        taskIds: plan.taskIds.filter((id) => id !== taskId),
        doneIds: plan.doneIds.filter((id) => id !== taskId),
      });
    },
    [plan, persist],
  );

  const resetPlan = useCallback(() => {
    persist({ taskIds: defaultTaskIds, doneIds: [] });
  }, [defaultTaskIds, persist]);

  return {
    plan,
    toggleDone,
    addTask,
    removeTask,
    resetPlan,
  };
}

export function clearOpsCheckLocalPlanStorage() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}
