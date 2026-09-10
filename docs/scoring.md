# Scoring

The single ranking uses a WSJF-style (Weighted Shortest Job First) formula:

```
Score = (Importance × 0.7 + Urgency × 0.3) ÷ Effort
```

## Components

| Factor      | Role                                        | Scale |
| ----------- | ------------------------------------------- | ----- |
| Importance  | 70% of the value term — lasting impact       | 1–5   |
| Urgency     | 30% of the value term — time sensitivity     | 1–5   |
| Effort      | Cost divisor — priority points per unit work | 1–5   |

## Rationale

- **Value first**: importance and urgency form a weighted value (1–5 range).
  Importance outweighs urgency so that critical-but-not-urgent work still wins
  over shouting-but-trivial work.
- **Effort as divisor**: the score reads as "priority points per unit of
  effort". Fast, low-effort tasks with good value rise to the top — this is the
  classic value-per-cost pattern (WSJF, RICE).
- **Bounded range**: 0.4 (1/1/5) to 5.0 (5/5/1), so scores stay easy to compare.

## Examples

| Task                | Importance | Urgency | Effort | Score                       |
| ------------------- | ---------- | ------- | ------ | --------------------------- |
| Critical quick fix  | 5          | 5       | 2      | 5.00 ÷ 2 = **2.50**         |
| Big strategic win   | 5          | 3       | 5      | 3.80 ÷ 5 = **0.76**         |
| Tiny chore          | 1          | 1       | 1      | 1.00 ÷ 1 = **1.00**         |
| Large low-value job | 1          | 1       | 5      | 1.00 ÷ 5 = **0.20**         |

## Alternatives considered

- **Linear blend** (`0.4·I + 0.25·U + 0.35·(6−E)`): bounded 1–5, no divisor
  blowups, but high-effort critical tasks still rank high — effort is only a
  subtractive term.
- **Multiplicative** (`(I × U) ÷ E`): tasks must be both important *and*
  urgent; biggest spread, but less intuitive scores.
- **Tie-break only**: sort by the weighted value, effort breaks ties — wastes
  the effort signal.
