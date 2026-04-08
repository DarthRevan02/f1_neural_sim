"use strict";
// ─── HUD helpers ──────────────────────────────────────────────────────────────
function fmt(f){ return f===Infinity||f==null?'--':`${f}f`; }

function updateHUD(state){
  document.getElementById('gn').textContent  = state.generation;
  document.getElementById('tn').textContent  = state.trackName;
  document.getElementById('al').textContent  = state.alive;
  document.getElementById('tot').textContent = state.numCars;
  document.getElementById('fi').textContent  = state.finished;
  document.getElementById('bl').textContent  = fmt(state.bestLap);
  document.getElementById('gl').textContent  = fmt(state.genBest);
  document.getElementById('spd-val').textContent = state.speed.toFixed(1)+'×';
}

function flashGen(n){
  const el=document.getElementById('gen-flash');
  el.textContent=`GEN ${n}`;
  el.style.opacity='1';
  setTimeout(()=>el.style.opacity='0',900);
}
