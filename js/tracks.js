"use strict";
// ─── Track Layouts ────────────────────────────────────────────────────────────
// Mapped from official F1 circuit diagrams (sector colours: red=S1, blue=S2, yellow=S3)
//
// SUZUKA (Image 1): 18 turns, figure-of-eight with overpass
//   S/F on right straight. Turn 1-2 at top-right. Esses through middle.
//   Hairpin (T11) at top-left. Degner, Spoon, 130R, Chicane.
//
// SILVERSTONE (Image 2): 18 turns, roughly rectangular
//   S/F at top. Abbey-Village-Loop complex. Maggotts-Becketts. Hangar straight.
//   Stowe, Vale, Club. Then Loop back.
//
// MONZA (Image 3): 11 turns, very fast oval-like
//   S/F on long main straight (right side). Turns 1-2 chicane. Curva Grande.
//   Lesmo 1&2. Ascari chicane. Parabolica.

const LAYOUTS = {
  // ── SUZUKA ── figure-of-eight (read circuit image: S/F top-right, anti-clockwise top, then loops under)
  // Corners numbered 1-18 matching image. Track goes: T1→T2 (top-right), Esses (T3-T7 centre),
  // T8 (crossover), T9-T10 (loop bottom), T11 hairpin (top-left outer loop),
  // T12-T14 (Degner/back), T15-T16 (Spoon), T17 (130R), T18 chicane, S/F
  "Suzuka": [
    // Start/Finish → T1 (right side, top-right entry)
    [.82,.32],[.80,.26],[.74,.20],[.68,.20],[.62,.22],
    // T2 → Esses T3-T7 (dropping toward centre)
    [.58,.26],[.56,.32],[.52,.36],[.50,.32],[.48,.28],
    // T8 crossover point (bottom-centre)
    [.44,.30],[.42,.36],[.44,.42],[.48,.46],
    // T9-T10 (underpass bottom loop - goes south then west)
    [.50,.50],[.48,.56],[.44,.60],[.38,.62],[.32,.60],
    // T11 hairpin (far left)
    [.22,.58],[.16,.56],[.14,.50],[.16,.44],[.22,.42],
    // T12-T13 Degner (heading back east)
    [.28,.40],[.34,.38],[.38,.34],[.40,.28],[.38,.22],
    // T14-T15 Spoon (bottom right of outer loop)
    [.36,.18],[.34,.22],[.36,.28],[.40,.32],[.44,.36],
    // Cross back over (the figure-8 bridge)
    [.48,.38],[.50,.42],[.52,.46],[.54,.42],[.56,.38],
    // T16-T17 (130R - fast left)
    [.60,.34],[.64,.30],[.68,.26],[.74,.26],[.80,.28],
    // T18 chicane → S/F
    [.84,.30],[.86,.32],[.84,.34],[.82,.34]
  ],

  // ── SILVERSTONE ── roughly clockwise, 18 turns
  // Image 2: S/F at top-centre. T1-T3 (Abbey-Farm-Village), T4-T7 (Loop),
  // T8-T12 (Maggotts-Becketts-Chapel), Hangar straight, T13-T15 (Stowe-Vale-Club), back up.
  "Silverstone": [
    // S/F line (top centre) → T1 Abbey (top-right descent)
    [.50,.10],[.60,.10],[.68,.12],[.74,.18],[.76,.26],
    // T2 Farm → T3 Village (right sweep)
    [.74,.34],[.72,.40],[.68,.44],[.62,.46],
    // T4-T7 Loop complex (right side, going south)
    [.70,.50],[.74,.56],[.76,.64],[.74,.72],
    // T8-T9 Luffield (bottom-right corner)
    [.68,.78],[.60,.82],[.50,.84],
    // T10-T12 Woodcote / Becketts section (bottom left)
    [.40,.84],[.30,.82],[.22,.78],[.16,.70],
    // T13 Maggotts-Chapel (left side heading north)
    [.14,.60],[.14,.50],[.16,.40],[.20,.32],
    // T14-T15 Stowe (top-left area)
    [.24,.24],[.30,.16],[.38,.10],[.46,.10]
  ],

  // ── MONZA ── Very fast track, 11 turns (Image 3)
  // S/F on long main straight (left side going south→north).
  // T1-T2 Prima variante chicane, Curva Grande, Lesmo 1, Lesmo 2, Ascari, Parabolica.
  "Monza": [
    // S/F → T1-T2 Prima Variante chicane (top-left)
    [.30,.80],[.30,.72],[.32,.64],[.28,.60],[.30,.56],
    // Back on track after chicane, Curva Grande (sweeping right)
    [.34,.52],[.38,.48],[.44,.44],[.52,.42],[.58,.44],
    // T4 Roggia chicane  
    [.64,.46],[.68,.44],[.72,.46],
    // Lesmo 1 (right side, middle)
    [.76,.50],[.78,.56],[.76,.62],
    // Lesmo 2
    [.72,.66],[.70,.72],[.72,.78],
    // Ascari chicane (bottom)
    [.68,.82],[.64,.80],[.62,.84],[.66,.86],[.70,.84],
    // Parabolica (bottom-right, sweeping back to main straight)
    [.74,.82],[.80,.78],[.84,.70],[.84,.62],[.80,.54],
    // Back down main straight to S/F
    [.76,.46],[.70,.38],[.60,.28],[.50,.20],[.40,.16],
    // Top of banking / lesmo entry
    [.34,.20],[.30,.26],[.28,.34],[.28,.44],[.28,.54],
    [.28,.64],[.28,.72]
  ],
};
