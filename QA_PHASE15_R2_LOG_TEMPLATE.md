# Phase 15 R2 QA Log Template

Use this sheet to track remaining R2 validation for **Senya / Iktha / Mivara** interactions.

---

## Session Info

- **Date:**
- **Branch:** `veteran-buffs`
- **Build/Commit:**
- **Tester:**
- **Environment:** (browser + OS)

---

## Status Legend

- **PASS** = behavior matches expected result
- **FAIL** = behavior differs
- **BLOCKED** = could not execute scenario

---

## A) Vorpal vs Non-Vorpal True Strike

### A1 — Vorpal ignores defender veterancy
- **Setup:** Attack Senya, Iktha, and Mivara with Vorpal-enabled packet.
- **Expected:** Defender passives do not trigger.
- **Result:** PASS
- **Evidence (logs/notes):** Senya, Mivara, Iktha OK

### A2 — True-Strike Lens does not ignore defender veterancy
- **Setup:** Shooter/Caster with `True-Strike Lens` attacks Senya, Iktha, Mivara.
- **Expected:** Defender passives still trigger normally.
- **Result:** PASS
- **Evidence (logs/notes):** Mivara, Senya, Iktha OK

### A3 — Sharpshooter's Scope does not ignore defender veterancy
- **Setup:** Shooter with `Sharpshooter's Scope` attacks Senya, Iktha, Mivara.
- **Expected:** Defender passives still trigger normally.
- **Result:** PASS / FAIL / BLOCKED
- **Evidence (logs/notes):**

---

## B) Wardstone Ordering

### B1 — Wardstone Use preempts defender veterancy
- **Setup:** Target wears `Wardstone Bracelet` and is one of Senya/Iktha/Mivara.
- **Action:** Choose **Use Wardstone**.
- **Expected:** Packet is negated; no defender-passive trigger for that packet.
- **Result:** PASS / FAIL / BLOCKED
- **Evidence (logs/notes):**

### B2 — Wardstone No allows normal defender-passive flow
- **Setup:** Same as B1.
- **Action:** Choose **No**.
- **Expected:** Packet resolves and Senya/Iktha/Mivara logic can trigger.
- **Result:** PASS / FAIL / BLOCKED
- **Evidence (logs/notes):**

---

## C) Archmage Multi-Target Packets

### C1 — Per-packet defender-passive evaluation
- **Setup:** Archmage hit includes at least one Senya/Iktha/Mivara among affected columns.
- **Expected:** Each packet independently applies defender passive rules.
- **Result:** PASS / FAIL / BLOCKED
- **Evidence (logs/notes):**

### C2 — Mivara no-front branch in Archmage sequence
- **Setup:** Mivara is hit by an Archmage packet with no enemy in Mivara front column.
- **Expected:** That packet is voided (no damage to Mivara, no redirected damage), sequence continues for other packets.
- **Result:** PASS / FAIL / BLOCKED
- **Evidence (logs/notes):**

### C3 — Explicit log coverage
- **Expected logs to observe across runs:**
  - coin heads/tails outcomes
  - trigger and no-trigger branches
  - redirect target or no-front void branch
- **Result:** PASS / FAIL / BLOCKED
- **Evidence (logs/notes):**

---

## D) Quick Regression Sweep (Ordering Safety)

### D1 — Counter branch still ordered correctly
- **Setup:** Scenario with Lancer counter candidate.
- **Expected:** Existing counter ordering remains intact; R2 passives do not bypass that ordering.
- **Result:** PASS / FAIL / BLOCKED
- **Evidence (logs/notes):**

### D2 — Defender terrain branch still ordered correctly
- **Setup:** Elevated/Reinforced block scenario.
- **Expected:** Existing terrain gate ordering remains intact; R2 passives do not bypass that ordering.
- **Result:** PASS / FAIL / BLOCKED
- **Evidence (logs/notes):**

---

## E) Optional Spot Checks (if time)

### E1 — Senya cooldown continuity
- **Expected:** Heads trigger disables Hex Haze on next own turn, then re-enables afterwards.
- **Result:** PASS / FAIL / BLOCKED
- **Evidence (logs/notes):**

### E2 — Tival retry on defender-passive miss
- **Expected:** Retry prompt appears when intended target was negated/redirected by Senya or Mivara.
- **Result:** PASS / FAIL / BLOCKED
- **Evidence (logs/notes):**

---

## Final Signoff

- **R2 Overall:** PASS / FAIL / PARTIAL
- **Open Issues:**
  - 1.
  - 2.
- **Recommended next action:** (ready to commit / fix needed / needs extra QA)
