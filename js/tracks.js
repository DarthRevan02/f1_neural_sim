"use strict";
// ─── Track Layouts ────────────────────────────────────────────────────────────
// Precisely mapped from official F1 circuit diagrams.
// Coordinates are normalised [0–1]; multiplied by canvasW/canvasH in track.js.
//
// SUZUKA  (Image 1) : 18 turns, figure-of-eight.
//   S/F right side. Down to T01-T02 (bottom-right). Esses T03-T07 up-left.
//   Bridge/crossover T08 (figure-8). Inner hairpin loop T09-T11.
//   Outer left loop T12-T14. Underpass T15. Final complex T16-T18 → S/F.
//
// SILVERSTONE (Image 2) : 18 turns, trapezoidal.
//   S/F top-left-of-centre. T01 Abbey → T02-T03 Farm-Village → T04-T06 Luffield.
//   T07-T08 Maggotts-Becketts (top-right hairpin loop). T09 Chapel → T10 Stowe.
//   T11-T13 Luffield bottom. T14-T15 left side. T16-T18 top → S/F.
//
// MONZA   (Image 3) : 11 turns, fast oval-like.
//   S/F bottom-right. Main straight LEFT → T01-T02 Prima Variante (bottom-left).
//   Curva Grande T03. Roggia T04-T05. Left side up → T06 Lesmo 1 (far-left-top).
//   Across top → T07 Lesmo 2. Down right → T08-T10 Ascari. T11 Parabolica → S/F.

const LAYOUTS = {

  // ── SUZUKA ─────────────────────────────────────────────────────────────────
  // Clockwise. S/F on the right side of the figure-8.
  // The two crossing points of the figure-8 are:
  //   T08 bridge  → esses section passes OVER  (~x 0.69, y 0.43)
  //   T15 underpass → outer-loop return passes UNDER (~x 0.58, y 0.46)
  "Suzuka": [
    // ── S/F straight → T01 (big right-hander, bottom-right) ──────────────
    [0.78, 0.36], [0.83, 0.37], [0.87, 0.41], [0.91, 0.47],
    [0.93, 0.55], [0.93, 0.64],
    // T01 → T02
    [0.91, 0.72], [0.88, 0.79], [0.84, 0.83],
    [0.80, 0.83], [0.77, 0.78], [0.79, 0.71],
    // ── Esses T03-T07 (zigzag up-left) ───────────────────────────────────
    [0.81, 0.65], [0.78, 0.59],
    [0.80, 0.53], [0.77, 0.47],
    [0.79, 0.41], [0.76, 0.38],
    // ── T08 – Bridge OVER (esses to inner section, going left) ───────────
    [0.72, 0.40], [0.68, 0.43],
    // ── T09 inner-section bottom (dip down, then rise) ───────────────────
    [0.64, 0.47], [0.62, 0.54],
    [0.61, 0.47], [0.61, 0.40], [0.60, 0.32],
    // ── T11 hairpin (top of inner loop) ──────────────────────────────────
    [0.59, 0.25], [0.56, 0.21], [0.52, 0.21],
    // ── Exit T11 → outer loop entry T12 ──────────────────────────────────
    [0.47, 0.25], [0.41, 0.30], [0.34, 0.33],
    // ── T13 sweeper (top-far-left) ────────────────────────────────────────
    [0.26, 0.32], [0.19, 0.27], [0.12, 0.22],
    // ── T14 apex (far left) ───────────────────────────────────────────────
    [0.07, 0.22], [0.07, 0.31], [0.09, 0.40],
    // ── Bottom of outer loop ──────────────────────────────────────────────
    [0.15, 0.46], [0.24, 0.50], [0.33, 0.52],
    // ── T15 – Underpass UNDER (outer loop returns, going right) ──────────
    [0.40, 0.52], [0.47, 0.50], [0.54, 0.48],
    [0.60, 0.46], [0.65, 0.43],
    // ── T16-T18 → S/F ────────────────────────────────────────────────────
    [0.70, 0.40], [0.74, 0.38], [0.78, 0.36],
  ],

  // ── SILVERSTONE ────────────────────────────────────────────────────────────
  // Clockwise. S/F at the top (slightly left of centre, just before T18/T01).
  "Silverstone": [
    // ── S/F straight ─────────────────────────────────────────────────────
    [0.37, 0.09], [0.44, 0.09],
    // ── T01 Abbey (sweeping right, descending) ────────────────────────────
    [0.50, 0.12], [0.54, 0.19], [0.55, 0.27],
    // ── T02 Farm → T03 Village ────────────────────────────────────────────
    [0.53, 0.35], [0.51, 0.42], [0.49, 0.48],
    // ── T04-T05 Luffield entry ────────────────────────────────────────────
    [0.47, 0.54], [0.47, 0.60], [0.49, 0.62],
    // ── T06 Copse → heading right toward Becketts ────────────────────────
    [0.54, 0.61], [0.60, 0.59], [0.64, 0.56],
    // ── Maggotts-Becketts complex T07-T08 (sweeping up-right, then hairpin)
    [0.66, 0.50], [0.67, 0.41], [0.67, 0.32],
    [0.68, 0.22], [0.68, 0.14], [0.68, 0.09],
    // ── T08 apex hairpin (top-right) ─────────────────────────────────────
    [0.72, 0.11], [0.75, 0.17],
    // ── Hangar straight descent T09 Chapel ───────────────────────────────
    [0.78, 0.25], [0.80, 0.34], [0.82, 0.43],
    [0.82, 0.53], [0.80, 0.61], [0.76, 0.64],
    // ── T10 Stowe → right side bottom ────────────────────────────────────
    [0.70, 0.64], [0.63, 0.63], [0.57, 0.66],
    // ── T11-T13 Luffield / Vale / Club (bottom complex) ───────────────────
    [0.52, 0.71], [0.49, 0.76], [0.46, 0.79],
    [0.43, 0.80], // T13 apex
    // ── T14 → heading left ────────────────────────────────────────────────
    [0.39, 0.77], [0.34, 0.71], [0.28, 0.66],
    [0.21, 0.64], [0.15, 0.62],
    // ── T15 Woodcote / Club (far left, DRS zone) ─────────────────────────
    [0.11, 0.58], [0.11, 0.52], [0.12, 0.45],
    // ── Ascending back toward S/F: T16-T17-T18 ───────────────────────────
    [0.13, 0.37], [0.14, 0.28], [0.15, 0.20],
    [0.17, 0.13], [0.21, 0.09], [0.26, 0.08],
    [0.31, 0.07], [0.35, 0.08],
  ],

  // ── MONZA ──────────────────────────────────────────────────────────────────
  // Clockwise. S/F at the bottom-right end of the long main straight.
  "Monza": [
    // ── S/F ───────────────────────────────────────────────────────────────
    [0.78, 0.65],
    // ── Main straight going LEFT ──────────────────────────────────────────
    [0.70, 0.67], [0.60, 0.68], [0.50, 0.68], [0.41, 0.68],
    // ── T01-T02 Prima Variante chicane (bottom-left) ──────────────────────
    [0.36, 0.73], [0.31, 0.69], [0.33, 0.63],
    // ── Curva Grande T03 (sweeping right as track rises left side) ────────
    [0.29, 0.58], [0.26, 0.52], [0.26, 0.45],
    // ── T04-T05 Roggia chicane ────────────────────────────────────────────
    [0.26, 0.39], [0.22, 0.35], [0.25, 0.30],
    // ── Left side climbing toward Lesmo 1 ────────────────────────────────
    [0.21, 0.26], [0.15, 0.19], [0.09, 0.13],
    // ── T06 Lesmo 1 (far top-left apex) ──────────────────────────────────
    [0.08, 0.09],
    // ── Across top → T07 Lesmo 2 ─────────────────────────────────────────
    [0.14, 0.07], [0.26, 0.07], [0.39, 0.07], [0.47, 0.07],
    // ── Descending right side after Lesmo 2 ──────────────────────────────
    [0.52, 0.12], [0.54, 0.20], [0.53, 0.29],
    // ── T08-T09-T10 Ascari chicane ────────────────────────────────────────
    [0.51, 0.35], [0.47, 0.40], [0.47, 0.47],
    [0.49, 0.53], [0.53, 0.57],
    // ── Heading right toward Parabolica ──────────────────────────────────
    [0.60, 0.58], [0.68, 0.58], [0.76, 0.57],
    // ── T11 Parabolica (far right) – long sweeping right-hander ──────────
    [0.84, 0.55], [0.91, 0.52],
    [0.93, 0.57], [0.91, 0.64], [0.88, 0.68],
    // ── Return to main straight / S/F ─────────────────────────────────────
    [0.84, 0.68], [0.80, 0.67], [0.78, 0.65],
  ],
};
