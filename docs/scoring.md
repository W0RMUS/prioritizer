# Scoring

The single ranking uses a WSJF-style (Weighted Shortest Job First) formula with
a softened effort divisor:

```
Score = (Importance × 0.7 + Urgency × 0.3) ÷ √Effort
```

## Components

| Factor      | Role                                              | Scale |
| ----------- | ------------------------------------------------- | ----- |
| Importance  | 70% of the value term — lasting impact            | 1–5   |
| Urgency     | 30% of the value term — time sensitivity          | 1–5   |
| Effort      | Softened cost divisor (√) — points per unit work  | 1–5   |

## Rationale

- **Value first**: importance and urgency form a weighted value (1–5 range).
  Importance outweighs urgency so that critical-but-not-urgent work still wins
  over shouting-but-trivial work.
- **Softened effort divisor**: dividing by raw effort (WSJF, RICE) buries
  long-running strategic work beneath tiny chores — big tasks would never
  surface until they became urgent, which is too late to start them. Taking the
  square root of effort keeps a meaningful penalty (~2.2× from effort 1 to 5,
  versus 5× raw) while letting high-value, high-effort tasks compete. The
  exponent (α = 0.5 in `lib/priority.ts`) is a single constant to tune.
- **Bounded range**: ≈0.45 (1/1/5) to 5.0 (5/5/1), so scores stay easy to
  compare.

## Examples

| Task                | Importance | Urgency | Effort | Score                             |
| ------------------- | ---------- | ------- | ------ | --------------------------------- |
| Critical quick fix  | 5          | 5       | 2      | 5.00 ÷ √2 ≈ **3.54**              |
| Big strategic win   | 5          | 3       | 5      | 4.40 ÷ √5 ≈ **1.97**              |
| Tiny chore          | 1          | 1       | 1      | 1.00 ÷ 1 = **1.00**               |
| Large low-value job | 1          | 1       | 5      | 1.00 ÷ √5 ≈ **0.45**              |

Note how "Big strategic win" now outranks "Tiny chore", which the raw-effort
formula (0.88 vs 1.00) got backwards.

## Alternatives considered

- **Raw effort divisor** (`value ÷ E`): classic WSJF, but systematically
  down-prioritizes large tasks regardless of value — the reason for the
  softened divisor.
- **Linear blend** (`0.4·I + 0.25·U + 0.35·(6−E)`): bounded 1–5, no divisor
  blowups, but effort is nearly inert mid-range.
- **Multiplicative** (`(I × U) ÷ E`): tasks must be both important *and*
  urgent; biggest spread, but less intuitive scores.
- **Tie-break only**: sort by the weighted value, effort breaks ties — wastes
  the effort signal.
