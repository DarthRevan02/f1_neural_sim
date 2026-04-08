# 🏎️ F1 Neural Evolution

> **Brainless cars become lap record holders through the brutal logic of survival.**  
> Watch neural networks evolve, crash, and eventually master three iconic F1 circuits — with zero hardcoded rules, zero ML libraries, and zero mercy.

---

```
╔══════════════════════════════════════════════════════════╗
║   GEN 1  —  30 cars enter. 30 cars crash immediately.   ║
║   GEN 7  —  Someone discovers "forward" exists.          ║
║   GEN 23 —  Suzuka lap completed. History made.          ║
╚══════════════════════════════════════════════════════════╝
```

---

## What Is This?

A **neuroevolution car simulator** on 3 iconic F1 circuits. Cars have tiny neural networks for brains. They race. The worst ones die. The best ones reproduce (with mutations). Repeat until you have something that drives like it has a soul.

**No TensorFlow. No PyTorch. No fancy ML anything.** Just matrix math, `Math.tanh()`, and the terrifying patience of natural selection.

---

## The Science (simplified to the point of crime)

Each car gets **5 eyes** (ray-casted sensor distances) and a brain with exactly **42 numbers** in it:

```
[ WALL_LEFT_FAR ]                   ┐
[ WALL_LEFT    ]                    │
[ WALL_AHEAD   ]  ──►  8 neurons  ──►  STEER  (-1 to +1)
[ WALL_RIGHT   ]                    │
[ WALL_RIGHT_FAR ]                  ┘  ──►  GAS    (-1 to +1)
```

The car cannot see the track layout. It cannot see other cars. It has no memory. It is, by every measure, profoundly stupid — until about generation 15, when something clicks.

---

## The Three Arenas

### 🇯🇵 Suzuka — *The Figure of Eight*
```
Turns: 18  |  Layout: Figure-of-eight  |  Difficulty: ████████░░ EXTREME
```
The only F1 circuit with a bridge crossing over itself. Cars must learn to navigate the crossover at T08. Early generations find creative new ways to die here. The Esses section (T03–T07) is a zigzag that separates evolved cars from wall decorations.

### 🇬🇧 Silverstone — *The High-Speed Cathedral*
```
Turns: 18  |  Layout: Trapezoidal  |  Difficulty: ██████░░░░ HIGH
```
Maggotts–Becketts–Chapel. A sequence of sweeping high-speed corners that demand commitment. Cars that hesitate crash. Cars that go full throttle also crash. The correct path is a narrow blade of logic that takes ~20 generations to find.

### 🇮🇹 Monza — *The Temple of Speed*
```
Turns: 11  |  Layout: Oval-ish power circuit  |  Difficulty: ████░░░░░░ MEDIUM
```
Long straights. Fast chicanes. The Parabolica finale. This is where evolved networks show off. The easiest track to learn; the hardest to learn *well*.

---

## Project Structure

```
f1-neural/
├── index.html          ← Entry point. Open this.
├── vercel.json         ← Deploy config (static)
├── css/
│   └── hud.css         ← All HUD/UI styles (Red Bull dark theme)
└── js/
    ├── config.js       ← Constants, 10 team colours, calendar
    ├── tracks.js       ← Suzuka / Silverstone / Monza coordinate arrays
    ├── neural.js       ← NeuralNet: think(), mutate(), clone()
    ├── track.js        ← Track: physics grid, ray casting, edge building
    ├── car.js          ← Car: sensors, physics, score + nextGeneration()
    ├── renderer.js     ← Canvas: track, top-view F1 car, NN visualiser
    ├── hud.js          ← DOM HUD helpers
    └── main.js         ← Simulation loop + UI wiring
```

---

## Architecture Notes

### `neural.js` — The Brain (40 lines)
```js
think(sensors)  // forward pass: 5 → 8 → 2, all tanh
mutate(rate)    // gaussian noise on weights, 20% chance of ×3 spike
clone()         // deep copy for next generation
```

### `car.js` — The Body
Each car is a Matter.js rigid body with:
- `frictionAir: 0.045` — it slides, it doesn't grip
- `collisionFilter: { mask: 0 }` — cars pass through each other (chaos avoided)
- A `stuck` counter — if you don't make progress in 1200 frames, you're eliminated

### `track.js` — The Circuit
Tracks are normalised `[0–1]` coordinate arrays that get:
1. **Smoothed** (3 passes of Chaikin-style averaging)
2. **Densified** (12 interpolation steps between each control point)
3. **Edge-built** (perpendicular normals → inner/outer walls)
4. **Grid-indexed** (10px cell bitmap for O(1) collision detection)

### `car.js` — Evolution (`nextGeneration()`)
```
Top 25% survive as elites (at least 3)
Elites are cloned and fill the next generation
All non-elite clones get mutated
The best car from gen N can become the worst car in gen N+1 if luck goes badly
```

---

## Controls

| Key | Action |
|-----|--------|
| `← →` | Switch tracks (resets evolution) |
| `R` | Restart current track |
| `+` / `=` | Speed up (max 8×) |
| `-` | Slow down (min 0.5×) |
| Settings panel | Cars count, mutation rate, timeout, track select |

---

## Settings Reference

| Setting | Range | Default | Effect |
|---------|-------|---------|--------|
| Cars | 5–80 | 30 | Population size. More = slower but better evolution. |
| Speed | 0.5–8× | 1× | Simulation time multiplier. 8× to skip bad gens. |
| Mutation | 0.05–1.5 | 0.25 | Weight noise magnitude. Higher = more chaos, faster escape from local minima. |
| Timeout | 300–6000f | 1200f | Frames before a stuck car is eliminated. |

**Recommended settings for watching:**  
Cars: 30 · Speed: 2× · Mutation: 0.25 · Timeout: 1200

**Recommended settings for fast evolution:**  
Cars: 50 · Speed: 8× · Mutation: 0.35 · Timeout: 800

---

## Deploy

### Option A — Vercel CLI (fastest)
```bash
npm i -g vercel
cd f1-neural
vercel
# Live at https://f1-neural-xxxx.vercel.app in ~30 seconds
```

### Option B — GitHub + Vercel Dashboard
```bash
git init && git add . && git commit -m "init"
git remote add origin https://github.com/YOUR_USER/f1-neural.git
git push -u origin main
# Then: vercel.com/new → Import repo → Framework: Other → Deploy
```

### Option C — Drag & Drop
Zip the entire `f1-neural/` folder → drop it on [vercel.com/new](https://vercel.com/new). Done.

### Local (no server needed)
```bash
# Just open index.html in a browser. No build step. No npm install.
# It's a static site. It runs anywhere.
open index.html
```

---

## The Ten Teams

Cars are assigned liveries from the 2024 F1 grid:

| # | Team | Primary | Accent |
|---|------|---------|--------|
| 1 | Red Bull | `#3671C6` | `#FFD700` |
| 2 | Ferrari | `#E8002D` | `#FFFFFF` |
| 3 | McLaren | `#FF8700` | `#000000` |
| 4 | Mercedes | `#27D2B2` | `#141414` |
| 5 | Aston Martin | `#006F62` | `#CEDC00` |
| 6 | Alpine | `#0093CC` | `#FF57A4` |
| 7 | Williams | `#64C4FF` | `#003778` |
| 8 | RB | `#6692FF` | `#DC0000` |
| 9 | Kick Sauber | `#50D250` | `#0A0A0A` |
| 10 | Haas | `#B9BCbe` | `#DC002D` |

---

## What You'll See

```
Generation 1:   Everyone crashes into the first wall. Immediately.
Generation 3:   One car drives forward for 2 seconds before dying.
Generation 8:   Someone makes it through the first corner.
Generation 15:  A car completes a half-lap. The crowd goes wild (internally).
Generation 25:  Lap completed. Lap times start appearing in the graph.
Generation 40+: Cars are actually racing. Smooth lines. Real speed.
               The neural net display shows coordinated activation.
               You've built a racing driver from nothing.
```

---

## FAQ

**Q: Why does gen 1 always crash immediately?**  
A: Random weights. The first generation is pure noise. Give it time.

**Q: Why does evolution sometimes go backwards?**  
A: Mutation is random. A great gen-N brain might produce mediocre gen-N+1 children. It recovers.

**Q: Can I add more tracks?**  
A: Yes. Add a normalised coordinate array to `LAYOUTS` in `tracks.js` and a name to `CALENDAR` in `config.js`. Done.

**Q: Why Matter.js?**  
A: Rigid body physics for free. The friction model makes cars feel like they're actually sliding on asphalt.

**Q: The cars look too good for a neural net project.**  
A: That's not a question. But yes, the top-view F1 silhouette renderer (`renderer.js`) is unreasonably detailed for something that crashes into walls 90% of the time.

---

## License

Do whatever you want with it. Just don't tell the FIA.

---

*Built with canvas 2D, Matter.js, and an unhealthy interest in both Formula 1 and machine learning.*
