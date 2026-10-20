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

  const updatePlan = useCallback((updater: (prev: OpsCheckLocalPlan) => OpsCheckLocalPlan) => {
    setPlan((prev) => {
      const next = updater(prev);
      if (next === prev) return prev;
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        /* ignore quota errors */
      }
      return next;
    });
  }, []);

  const toggleDone = useCallback(
    (taskId: string) => {
      updatePlan((prev) => {
        const doneIds = prev.doneIds.includes(taskId)
          ? prev.doneIds.filter((id) => id !== taskId)
          : [...prev.doneIds, taskId];
        return { ...prev, doneIds };
      });
    },
    [updatePlan],
  );

  const addTask = useCallback(
    (taskId: string) => {
      let added = false;
      updatePlan((prev) => {
        if (prev.taskIds.includes(taskId)) return prev;
        added = true;
        return { ...prev, taskIds: [...prev.taskIds, taskId] };
      });
      return added;
    },
    [updatePlan],
  );

  const removeTask = useCallback(
    (taskId: string) => {
      updatePlan((prev) => ({
        taskIds: prev.taskIds.filter((id) => id !== taskId),
        doneIds: prev.doneIds.filter((id) => id !== taskId),
      }));
    },
    [updatePlan],
  );

  const resetPlan = useCallback(() => {
    updatePlan(() => ({ taskIds: defaultTaskIds, doneIds: [] }));
  }, [defaultTaskIds, updatePlan]);

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
