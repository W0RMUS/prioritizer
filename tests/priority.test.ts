import { describe, expect, it } from "vitest";
import { priorityScore, sortByPriorityScore } from "@/lib/priority";
import type { Task } from "@/lib/types";

function task(partial: Partial<Task>): Task {
  return {
    id: "t1",
    projectId: "p1",
    name: "Test task",
    urgency: 3,
    importance: 3,
    effort: 3,
    ...partial,
  };
}

describe("priorityScore", () => {
  it("computes value / sqrt(effort) for known cases", () => {
    // Critical quick fix: (5·0.7 + 5·0.3) / √2 ≈ 3.5355
    expect(priorityScore(task({ importance: 5, urgency: 5, effort: 2 }))).toBeCloseTo(5 / Math.SQRT2, 10);
    // Big strategic win: (5·0.7 + 3·0.3) / √5 = 4.4 / √5 ≈ 1.9677
    expect(priorityScore(task({ importance: 5, urgency: 3, effort: 5 }))).toBeCloseTo(4.4 / Math.sqrt(5), 10);
    // Tiny chore: 1 / √1 = 1
    expect(priorityScore(task({ importance: 1, urgency: 1, effort: 1 }))).toBe(1);
    // Large low-value job: 1 / √5 ≈ 0.4472
    expect(priorityScore(task({ importance: 1, urgency: 1, effort: 5 }))).toBeCloseTo(1 / Math.sqrt(5), 10);
  });

  it("weights importance at 0.7 and urgency at 0.3", () => {
    const importanceHeavy = priorityScore(task({ importance: 5, urgency: 1, effort: 1 }));
    const urgencyHeavy = priorityScore(task({ importance: 1, urgency: 5, effort: 1 }));
    expect(importanceHeavy).toBeCloseTo(5 * 0.7 + 1 * 0.3, 10);
    expect(urgencyHeavy).toBeCloseTo(1 * 0.7 + 5 * 0.3, 10);
    expect(importanceHeavy).toBeGreaterThan(urgencyHeavy);
  });

  it("softens the effort penalty compared to raw division", () => {
    const lowEffort = priorityScore(task({ importance: 3, urgency: 3, effort: 1 }));
    const highEffort = priorityScore(task({ importance: 3, urgency: 3, effort: 5 }));
    const rawPenalty = lowEffort / highEffort;
    expect(rawPenalty).toBeCloseTo(Math.sqrt(5), 10);
    expect(rawPenalty).toBeLessThan(5);
  });

  it("stays within the bounded score range", () => {
    expect(priorityScore(task({ importance: 5, urgency: 5, effort: 1 }))).toBeCloseTo(5, 10);
    expect(priorityScore(task({ importance: 1, urgency: 1, effort: 5 }))).toBeGreaterThan(0.4);
    expect(priorityScore(task({ importance: 1, urgency: 1, effort: 5 }))).toBeLessThan(0.5);
  });
});

describe("sortByPriorityScore", () => {
  it("orders highest score first", () => {
    const quickFix = task({ id: "quick", importance: 5, urgency: 5, effort: 2 });
    const chore = task({ id: "chore", importance: 1, urgency: 1, effort: 1 });
    const lowValueBigJob = task({ id: "big-low", importance: 1, urgency: 1, effort: 5 });
    const sorted = sortByPriorityScore([chore, lowValueBigJob, quickFix]);
    expect(sorted.map((t) => t.id)).toEqual(["quick", "chore", "big-low"]);
  });

  it("ranks a high-value high-effort task above a low-value quick task", () => {
    const strategic = task({ id: "strategic", importance: 5, urgency: 3, effort: 5 });
    const chore = task({ id: "chore", importance: 1, urgency: 1, effort: 1 });
    const sorted = sortByPriorityScore([chore, strategic]);
    expect(sorted[0].id).toBe("strategic");
  });

  it("does not mutate the input array", () => {
    const a = task({ id: "a", importance: 1, urgency: 1, effort: 1 });
    const b = task({ id: "b", importance: 5, urgency: 5, effort: 1 });
    const input = [a, b];
    const sorted = sortByPriorityScore(input);
    expect(input[0].id).toBe("a");
    expect(sorted).not.toBe(input);
  });
});
