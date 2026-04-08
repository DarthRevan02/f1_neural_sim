"use strict";
// ─── Car ──────────────────────────────────────────────────────────────────────
class Car {
  constructor(brain, teamIdx, track, world) {
    this.brain   = brain;
    this.team    = TEAMS[teamIdx % TEAMS.length];
    this.track   = track;
    this.world   = world;
    const {x,y,a} = track.startPos();
    const ox = (Math.random()-.5)*8, oy=(Math.random()-.5)*8;

    this.body = Bodies.rectangle(x+ox, y+oy, C.carW*2.2, C.carH*1.6, {
      angle: a,
      frictionAir: 0.045,
      friction:    0,
      restitution: 0,
      collisionFilter:{ mask:0 },
      label:'car'
    });
    World.add(world, this.body);

    this.alive    = true;
    this.finished = false;
    this.sensors  = new Array(C.numSensors).fill(1);
    this.score    = 0;
    this.totalProgress = 0;
    this.lapFrames= 0;
    this.stuck    = 0;
    this._n       = track.centerPts.length;
    this.lastIdx  = track.getProgress(x+ox, y+oy);
    this.maxIdx   = this.lastIdx;
  }

  update(speedMult) {
    if (!this.alive || this.finished) return;
    this.lapFrames++;

    const {x,y} = this.body.position;
    const ang    = this.body.angle;

    for(let i=0;i<C.numSensors;i++){
      this.sensors[i] = this.track.castRay(x,y,ang+SENSOR_ANGLES[i])/C.sensorLen;
    }

    const [steer,gas] = this.brain.think(this.sensors);

    const forceMag = (0.5 + (gas+1)*0.85)*0.00065*speedMult;
    Body.applyForce(this.body, this.body.position, {
      x: Math.cos(ang)*forceMag,
      y: Math.sin(ang)*forceMag
    });
    Body.setAngularVelocity(this.body, steer*0.065);

    if(!this.track.isOnTrack(x,y)){
      this.alive=false;
      Body.setVelocity(this.body,{x:0,y:0});
      return;
    }

    const idx = this.track.getProgress(x,y,this.lastIdx);
    this.lastIdx = idx;
    const diff = (idx-this.maxIdx+this._n)%this._n;
    if(diff>0 && diff<this._n/2){
      this.maxIdx=idx; this.totalProgress+=diff; this.stuck=0;
      if(this.totalProgress>=this._n){
        this.finished=true;
        this.score=this.totalProgress+80000/Math.max(this.lapFrames,1);
        return;
      }
    } else {
      if(++this.stuck>C.maxStuck){ this.alive=false; Body.setVelocity(this.body,{x:0,y:0}); }
    }
    this.score=this.totalProgress;
  }

  remove() { World.remove(this.world, this.body); }
}

// ─── Evolution ────────────────────────────────────────────────────────────────
function nextGeneration(cars, numCars, mutRate, track, world) {
  const sorted=[...cars].sort((a,b)=>b.score-a.score);
  const topN=Math.max(3,numCars>>2);
  const elites=sorted.slice(0,topN);
  cars.forEach(c=>c.remove());
  const next=[];
  for(let i=0;i<numCars;i++){
    const src=elites[i%elites.length];
    const brain=src.brain.clone();
    if(i>=elites.length) brain.mutate(mutRate);
    next.push(new Car(brain,sorted[i]?.team?TEAMS.indexOf(sorted[i].team):i, track, world));
  }
  return next;
}
