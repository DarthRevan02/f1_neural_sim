"use strict";
// ─── Simulation state ─────────────────────────────────────────────────────────
let sim = {
  engine: null, world: null,
  track:  null, cars:  [],
  generation: 1, bestLap: Infinity, genBest: Infinity,
  history: [], frame: 0,
  cam: {x:0, y:0}, zoom: 0.72,
  speedMult: 1,
  numCars: 30, mutRate: 0.25, maxStuck: 1200,
  trackIdx: 0,  // start on Suzuka
  running: true
};

function initPhysics(){
  if(sim.engine) World.clear(sim.world);
  sim.engine = Engine.create({ gravity:{x:0,y:0}, positionIterations:4, velocityIterations:4 });
  sim.world  = sim.engine.world;
}

function startRace(idx){
  sim.trackIdx = idx;
  const name   = CALENDAR[idx];
  document.getElementById('sel-track').value = name;

  initPhysics();
  sim.track = new Track(name);
  const sp  = sim.track.startPos();
  sim.cam   = {x:sp.x, y:sp.y};

  sim.cars = Array.from({length:sim.numCars},(_,i)=>
    new Car(new NeuralNet(), i, sim.track, sim.world)
  );
  sim.generation = 1; sim.bestLap = Infinity; sim.genBest = Infinity;
  sim.history = []; sim.frame = 0;
}

// ─── Main loop ────────────────────────────────────────────────────────────────
let lastTime = 0;
const FIXED_DT = 1000/60;

function loop(ts){
  if(!sim.running){ requestAnimationFrame(loop); return; }
  const dt=Math.min(ts-lastTime,50); lastTime=ts;

  const steps=Math.max(1,Math.round(sim.speedMult));
  for(let s=0;s<steps;s++){
    const sfrac=sim.speedMult/steps;
    for(const car of sim.cars) car.update(sfrac);
    Engine.update(sim.engine, FIXED_DT);
  }

  let bestCar=null, bestScore=-1;
  let aliveCount=0, finCount=0;
  for(const car of sim.cars){
    if(car.alive&&!car.finished) aliveCount++;
    if(car.finished) finCount++;
    const sc=car.score;
    if((car.alive||car.finished)&&sc>bestScore){ bestScore=sc; bestCar=car; }
  }

  if(bestCar){
    sim.cam.x+=(bestCar.body.position.x-sim.cam.x)*0.08;
    sim.cam.y+=(bestCar.body.position.y-sim.cam.y)*0.08;
  }

  for(const car of sim.cars){
    if(car.finished){
      if(car.lapFrames<sim.genBest) sim.genBest=car.lapFrames;
      if(car.lapFrames<sim.bestLap) sim.bestLap=car.lapFrames;
    }
  }

  // ── Render ──
  ctx.clearRect(0,0,canvas.width,canvas.height);
  ctx.fillStyle='#0D111C';
  ctx.fillRect(0,0,canvas.width,canvas.height);

  // Grid bg
  ctx.save();
  ctx.strokeStyle='rgba(54,113,198,0.04)';
  ctx.lineWidth=1;
  const gs=60;
  for(let x=0;x<canvas.width;x+=gs){ ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,canvas.height);ctx.stroke(); }
  for(let y=0;y<canvas.height;y+=gs){ ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(canvas.width,y);ctx.stroke(); }
  ctx.restore();

  if(sim.track) drawTrack(sim.track, sim.cam, sim.zoom);

  const ovCanvas=document.createElement('canvas');
  ovCanvas.width=canvas.width; ovCanvas.height=canvas.height;
  const ovCtx=ovCanvas.getContext('2d');

  ctx.save(); ctx.globalAlpha=0.18;
  for(const car of sim.cars){
    if(!car.alive&&!car.finished) drawCar(car,sim.cam,sim.zoom,false,null);
  }
  ctx.restore();

  for(const car of sim.cars){
    if(car.alive||car.finished){
      const isL=car===bestCar;
      drawCar(car,sim.cam,sim.zoom,isL,isL?ovCtx:null);
    }
  }
  ctx.drawImage(ovCanvas,0,0);

  updateHUD({
    generation: sim.generation, trackName: sim.track?.name,
    alive: aliveCount, numCars: sim.numCars,
    finished: finCount, bestLap: sim.bestLap===Infinity?null:sim.bestLap,
    genBest: sim.genBest===Infinity?null:sim.genBest,
    speed: sim.speedMult
  });

  const nnCar=bestCar||sim.cars.find(c=>c.alive);
  if(nnCar) drawNeuralNet(nnCar.brain, nnCar.sensors);

  if(sim.frame%20===0) drawGraph(sim.history);

  sim.frame++;
  if(aliveCount===0){
    const avgP=sim.cars.reduce((s,c)=>s+c.totalProgress,0)/sim.cars.length;
    sim.history.push({ gen:sim.generation, lap:sim.genBest===Infinity?null:sim.genBest, avgP });
    if(sim.history.length>60) sim.history.shift();
    sim.cars=nextGeneration(sim.cars,sim.numCars,sim.mutRate,sim.track,sim.world);
    sim.generation++;
    sim.frame=0;
    sim.genBest=Infinity;
    flashGen(sim.generation);
  }

  requestAnimationFrame(loop);
}

// ─── UI wiring ────────────────────────────────────────────────────────────────
const sel=document.getElementById('sel-track');
CALENDAR.forEach((name,i)=>{
  const opt=document.createElement('option');
  opt.value=name; opt.textContent=name;
  if(i===sim.trackIdx) opt.selected=true;
  sel.appendChild(opt);
});

document.getElementById('inp-speed').addEventListener('input',function(){
  document.getElementById('spd-r').textContent=parseFloat(this.value).toFixed(1)+'×';
});
document.getElementById('inp-mut').addEventListener('input',function(){
  document.getElementById('mut-r').textContent=parseFloat(this.value).toFixed(2);
});

document.getElementById('btn-apply').addEventListener('click',()=>{
  const tname=document.getElementById('sel-track').value;
  sim.trackIdx=CALENDAR.indexOf(tname);
  sim.numCars=parseInt(document.getElementById('inp-cars').value)||30;
  sim.speedMult=parseFloat(document.getElementById('inp-speed').value)||1;
  sim.mutRate=parseFloat(document.getElementById('inp-mut').value)||0.25;
  C.maxStuck=parseInt(document.getElementById('inp-timeout').value)||1200;
  startRace(sim.trackIdx);
});

document.getElementById('btn-hide').addEventListener('click',()=>{
  document.getElementById('settings').style.display='none';
  document.getElementById('show-settings').style.display='block';
});
document.getElementById('show-settings').addEventListener('click',()=>{
  document.getElementById('settings').style.display='block';
  document.getElementById('show-settings').style.display='none';
});

window.addEventListener('keydown',e=>{
  if(e.key==='ArrowRight'){ sim.trackIdx=(sim.trackIdx+1)%CALENDAR.length; startRace(sim.trackIdx); }
  if(e.key==='ArrowLeft'){  sim.trackIdx=(sim.trackIdx-1+CALENDAR.length)%CALENDAR.length; startRace(sim.trackIdx); }
  if(e.key==='r'||e.key==='R') startRace(sim.trackIdx);
  if(e.key==='='||e.key==='+'){
    sim.speedMult=Math.min(8,sim.speedMult+0.5);
    document.getElementById('inp-speed').value=sim.speedMult;
    document.getElementById('spd-r').textContent=sim.speedMult.toFixed(1)+'×';
  }
  if(e.key==='-'){
    sim.speedMult=Math.max(0.5,sim.speedMult-0.5);
    document.getElementById('inp-speed').value=sim.speedMult;
    document.getElementById('spd-r').textContent=sim.speedMult.toFixed(1)+'×';
  }
});

// ─── Boot ─────────────────────────────────────────────────────────────────────
startRace(sim.trackIdx);
requestAnimationFrame(loop);
