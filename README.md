# F1 Neural Evolution — Suzuka · Silverstone · Monza

A neural-network car simulation on 3 iconic F1 circuits. Cars learn to drive via neuroevolution (no ML libraries needed).

## Project Structure

```
f1-neural/
├── index.html          ← entry point
├── vercel.json         ← Vercel static config
├── css/
│   └── hud.css         ← all HUD/UI styles
└── js/
    ├── config.js       ← constants, team colours, calendar
    ├── tracks.js       ← Suzuka / Silverstone / Monza layouts
    ├── neural.js       ← NeuralNet class
    ├── track.js        ← Track class (physics grid, ray casting)
    ├── car.js          ← Car class + nextGeneration()
    ├── renderer.js     ← canvas drawing (track + top-view F1 car)
    ├── hud.js          ← DOM HUD helpers
    └── main.js         ← simulation loop + UI wiring
```

## Deploy to Vercel (3 steps)

### Option A — Vercel CLI (fastest)
```bash
npm i -g vercel
cd f1-neural
vercel
```
Follow the prompts. Your site will be live at `https://f1-neural-xxxx.vercel.app`.

### Option B — GitHub + Vercel Dashboard
1. Push this folder to a GitHub repo:
   ```bash
   git init && git add . && git commit -m "init"
   git remote add origin https://github.com/YOUR_USER/f1-neural.git
   git push -u origin main
   ```
2. Go to [vercel.com/new](https://vercel.com/new) → Import your repo.
3. Framework preset: **Other** (it's a plain static site).
4. Click **Deploy**. Done.

### Option C — Drag & Drop
Zip the entire `f1-neural/` folder and drop it on [vercel.com/new](https://vercel.com/new).

## Controls
- `← →` Switch tracks
- `R` Restart current track
- `+ / -` Speed up / slow down
- Settings panel (top-right) for cars count, mutation rate, timeout

## Tracks
- **Suzuka** — figure-of-eight layout, 18 turns
- **Silverstone** — high-speed flowing circuit, 18 turns  
- **Monza** — flat-out power track, 11 turns
