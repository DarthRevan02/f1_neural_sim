"use strict";
// ─── Aliases ──────────────────────────────────────────────────────────────────
const { Engine, World, Bodies, Body, Events } = Matter;

// ─── Simulation config ────────────────────────────────────────────────────────
const C = {
  numSensors: 5,
  hiddenSize: 8,
  sensorLen:  150,
  trackW:     40,
  carW:       24,
  carH:       11,
  mutRate:    0.25,
  numCars:    30,
  maxStuck:   1200,
  stepsPerFrame: 1,
  canvasW:    1400,
  canvasH:    900,
};
const SENSOR_ANGLES = [-Math.PI/2.1, -Math.PI/4.5, 0, Math.PI/4.5, Math.PI/2.1];

// ─── F1 Teams ─────────────────────────────────────────────────────────────────
const TEAMS = [
  { name:"Red Bull",     main:[54,113,198],  accent:[255,205,0]   },
  { name:"Ferrari",      main:[232,0,45],    accent:[255,255,255] },
  { name:"McLaren",      main:[255,135,0],   accent:[0,0,0]       },
  { name:"Mercedes",     main:[39,210,178],  accent:[20,20,20]    },
  { name:"Aston Martin", main:[0,111,98],    accent:[206,220,0]   },
  { name:"Alpine",       main:[0,147,204],   accent:[255,87,164]  },
  { name:"Williams",     main:[100,196,255], accent:[0,55,120]    },
  { name:"RB",           main:[102,146,255], accent:[220,0,0]     },
  { name:"Kick Sauber",  main:[80,210,80],   accent:[10,10,10]    },
  { name:"Haas",         main:[185,188,190], accent:[220,0,45]    },
];

// Only 3 tracks
const CALENDAR = ["Suzuka", "Silverstone", "Monza"];
