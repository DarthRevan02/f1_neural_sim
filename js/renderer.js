"use strict";
// ─── Renderer ─────────────────────────────────────────────────────────────────
const canvas = document.getElementById('sim');
const ctx    = canvas.getContext('2d');

function resize(){
  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;
}
resize();
window.addEventListener('resize', resize);

function rgb(c)  { return `rgb(${c[0]},${c[1]},${c[2]})`; }
function rgba(c,a){ return `rgba(${c[0]},${c[1]},${c[2]},${a})`; }

function worldToScreen(wx,wy,cam,zoom){
  return [
    (wx-cam.x)*zoom + canvas.width/2,
    (wy-cam.y)*zoom + canvas.height/2
  ];
}

// ─── Track ────────────────────────────────────────────────────────────────────
function drawTrack(track, cam, zoom){
  const cp=track.centerPts, n=cp.length;

  ctx.save();

  // Fill asphalt between outer/inner edges
  ctx.beginPath();
  let [ox,oy]=worldToScreen(track.outer[0][0],track.outer[0][1],cam,zoom);
  ctx.moveTo(ox,oy);
  for(let i=1;i<n;i++){
    [ox,oy]=worldToScreen(track.outer[i][0],track.outer[i][1],cam,zoom);
    ctx.lineTo(ox,oy);
  }
  ctx.closePath();
  let [ix,iy]=worldToScreen(track.inner[n-1][0],track.inner[n-1][1],cam,zoom);
  ctx.moveTo(ix,iy);
  for(let i=n-2;i>=0;i--){
    [ix,iy]=worldToScreen(track.inner[i][0],track.inner[i][1],cam,zoom);
    ctx.lineTo(ix,iy);
  }
  ctx.closePath();
  ctx.fillStyle='#1A2540';
  ctx.fill('evenodd');

  // Outer edge glow
  ctx.beginPath();
  [ox,oy]=worldToScreen(track.outer[0][0],track.outer[0][1],cam,zoom);
  ctx.moveTo(ox,oy);
  for(let i=1;i<n;i++){
    [ox,oy]=worldToScreen(track.outer[i][0],track.outer[i][1],cam,zoom);
    ctx.lineTo(ox,oy);
  }
  ctx.closePath();
  ctx.strokeStyle='rgba(54,113,198,0.7)';
  ctx.lineWidth=1.5;
  ctx.shadowBlur=8; ctx.shadowColor='rgba(54,113,198,0.5)';
  ctx.stroke();

  // Inner edge
  ctx.beginPath();
  [ix,iy]=worldToScreen(track.inner[0][0],track.inner[0][1],cam,zoom);
  ctx.moveTo(ix,iy);
  for(let i=1;i<n;i++){
    [ix,iy]=worldToScreen(track.inner[i][0],track.inner[i][1],cam,zoom);
    ctx.lineTo(ix,iy);
  }
  ctx.closePath();
  ctx.strokeStyle='rgba(54,113,198,0.7)';
  ctx.lineWidth=1.5;
  ctx.stroke();
  ctx.shadowBlur=0;

  // Centre dashed line
  ctx.setLineDash([8*zoom,16*zoom]);
  ctx.beginPath();
  let [cx0,cy0]=worldToScreen(cp[0][0],cp[0][1],cam,zoom);
  ctx.moveTo(cx0,cy0);
  for(let i=1;i<n;i++){
    let [ccx,ccy]=worldToScreen(cp[i][0],cp[i][1],cam,zoom);
    ctx.lineTo(ccx,ccy);
  }
  ctx.closePath();
  ctx.strokeStyle='rgba(255,215,0,0.18)';
  ctx.lineWidth=1;
  ctx.stroke();
  ctx.setLineDash([]);

  // Start/finish checkered line
  const s0=track.startPos();
  const [sfx,sfy]=worldToScreen(s0.x,s0.y,cam,zoom);
  ctx.save();
  ctx.translate(sfx,sfy);
  ctx.rotate(s0.a+Math.PI/2);
  const pw=track.tw*2*zoom, ph=6*zoom;
  for(let b=0;b<8;b++){
    ctx.fillStyle=b%2===0?'#fff':'#111';
    ctx.fillRect(-pw/2+b*(pw/8),-ph/2,pw/8,ph);
  }
  ctx.restore();

  ctx.restore();
}

// ─── Car — top-view F1 silhouette (like image 4) ──────────────────────────────
function drawCar(car, cam, zoom, isLeader, sensorOverlay){
  const {x,y}=car.body.position;
  const ang=car.body.angle;
  const [sx,sy]=worldToScreen(x,y,cam,zoom);
  const mc=car.team.main, ac=car.team.accent;
  const dead=!car.alive&&!car.finished;

  // Sensor rays (leader only)
  if(isLeader && sensorOverlay){
    for(let i=0;i<C.numSensors;i++){
      const sa=SENSOR_ANGLES[i];
      const d=car.sensors[i]*C.sensorLen*zoom;
      const ex=sx+Math.cos(ang+sa)*d, ey=sy+Math.sin(ang+sa)*d;
      sensorOverlay.beginPath();
      sensorOverlay.moveTo(sx,sy);
      sensorOverlay.lineTo(ex,ey);
      sensorOverlay.strokeStyle=rgba(mc,0.45);
      sensorOverlay.lineWidth=1;
      sensorOverlay.stroke();
      sensorOverlay.beginPath();
      sensorOverlay.arc(ex,ey,Math.max(2,3*zoom),0,Math.PI*2);
      sensorOverlay.fillStyle=rgba(mc,0.8);
      sensorOverlay.fill();
    }
  }

  ctx.save();
  if(dead) ctx.globalAlpha=0.22;
  ctx.translate(sx,sy);
  ctx.rotate(ang);

  const z=zoom;
  const w=C.carW, h=C.carH;

  // Speed glow under car
  if(!dead){
    const spd=Math.hypot(car.body.velocity.x,car.body.velocity.y);
    const gAlpha=Math.min(0.3, spd*0.04);
    if(gAlpha>0.01){
      const g=ctx.createRadialGradient(0,0,0,0,0,w*z*1.8);
      g.addColorStop(0,rgba(mc,gAlpha));
      g.addColorStop(1,rgba(mc,0));
      ctx.fillStyle=g;
      ctx.beginPath();
      ctx.ellipse(0,0,w*z*1.8,h*z*1.6,0,0,Math.PI*2);
      ctx.fill();
    }
  }

  // ── TOP-VIEW F1 CAR BODY (inspired by image 4) ──
  // Front wing (nose cone leading edge)
  ctx.beginPath();
  ctx.moveTo( w*2.0*z, -h*.55*z);
  ctx.lineTo( w*2.4*z, -h*.55*z);
  ctx.lineTo( w*2.4*z,  h*.55*z);
  ctx.lineTo( w*2.0*z,  h*.55*z);
  ctx.closePath();
  ctx.fillStyle=rgb(ac);
  ctx.fill();

  // Front wing endplates
  ctx.beginPath();
  ctx.moveTo( w*1.6*z, -h*.60*z);
  ctx.lineTo( w*2.4*z, -h*.60*z);
  ctx.lineTo( w*2.4*z, -h*.50*z);
  ctx.lineTo( w*1.6*z, -h*.50*z);
  ctx.closePath();
  ctx.fillStyle=rgb(mc);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo( w*1.6*z, h*.60*z);
  ctx.lineTo( w*2.4*z, h*.60*z);
  ctx.lineTo( w*2.4*z, h*.50*z);
  ctx.lineTo( w*1.6*z, h*.50*z);
  ctx.closePath();
  ctx.fillStyle=rgb(mc);
  ctx.fill();

  // Nose cone (tapered)
  ctx.beginPath();
  ctx.moveTo( w*0.4*z, -h*.28*z);
  ctx.lineTo( w*2.0*z, -h*.18*z);
  ctx.lineTo( w*2.0*z,  h*.18*z);
  ctx.lineTo( w*0.4*z,  h*.28*z);
  ctx.closePath();
  ctx.fillStyle=rgb(mc);
  ctx.fill();

  // Main chassis body (wider pod section)
  ctx.beginPath();
  // rounded trapezoid — wide rear, narrow front
  ctx.moveTo(-w*.90*z, -h*.5*z);   // rear-left
  ctx.lineTo( w*.40*z, -h*.5*z);   // front-left shoulder
  ctx.lineTo( w*.40*z, -h*.28*z);  // nose join left
  ctx.lineTo( w*.40*z,  h*.28*z);  // nose join right
  ctx.lineTo( w*.40*z,  h*.5*z);   // front-right shoulder
  ctx.lineTo(-w*.90*z,  h*.5*z);   // rear-right
  ctx.closePath();
  ctx.fillStyle=rgb(mc);
  ctx.fill();

  // Cockpit tub (centre stripe)
  ctx.beginPath();
  ctx.moveTo(-w*.05*z, -h*.32*z);
  ctx.lineTo( w*.36*z, -h*.28*z);
  ctx.lineTo( w*.36*z,  h*.28*z);
  ctx.lineTo(-w*.05*z,  h*.32*z);
  ctx.closePath();
  ctx.fillStyle=rgb(ac);
  ctx.fill();

  // Helmet (circle in cockpit)
  ctx.beginPath();
  ctx.arc(w*.08*z, 0, h*.22*z, 0, Math.PI*2);
  ctx.fillStyle='#111';
  ctx.fill();
  ctx.beginPath();
  ctx.arc(w*.10*z, -h*.06*z, h*.12*z, 0, Math.PI*2);
  ctx.fillStyle=rgba(mc,0.7);
  ctx.fill();

  // Sidepods (bulge either side of cockpit)
  ctx.beginPath();
  ctx.ellipse(-w*.15*z, -h*.60*z, w*.40*z, h*.18*z, -0.15, 0, Math.PI*2);
  ctx.fillStyle=rgba(mc,0.85);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(-w*.15*z,  h*.60*z, w*.40*z, h*.18*z, 0.15, 0, Math.PI*2);
  ctx.fillStyle=rgba(mc,0.85);
  ctx.fill();

  // Rear wing (back of car)
  ctx.beginPath();
  ctx.rect(-w*1.0*z, -h*.75*z, w*.18*z, h*1.5*z);
  ctx.fillStyle=rgb(ac);
  ctx.fill();
  // Rear wing endplates
  ctx.beginPath();
  ctx.rect(-w*1.0*z, -h*.80*z, w*.35*z, h*.08*z);
  ctx.fillStyle=rgb(mc);
  ctx.fill();
  ctx.beginPath();
  ctx.rect(-w*1.0*z,  h*.72*z, w*.35*z, h*.08*z);
  ctx.fillStyle=rgb(mc);
  ctx.fill();

  // Exhaust (small circle rear-centre)
  ctx.beginPath();
  ctx.arc(-w*.95*z, 0, h*.10*z, 0, Math.PI*2);
  ctx.fillStyle='#FF6B00';
  ctx.fill();

  // ── TYRES (top-view ovals) ──
  // Front-left, Front-right, Rear-left, Rear-right
  const tyres=[
    [w*.55*z, -h*.88*z, h*.30*z, h*.16*z],
    [w*.55*z,  h*.88*z, h*.30*z, h*.16*z],
    [-w*.55*z,-h*.88*z, h*.35*z, h*.18*z],
    [-w*.55*z, h*.88*z, h*.35*z, h*.18*z],
  ];
  for(const [tx,ty,rw,rh] of tyres){
    ctx.save();
    ctx.translate(tx,ty);
    // tyre black
    ctx.beginPath();
    ctx.ellipse(0,0,rw,rh,0,0,Math.PI*2);
    ctx.fillStyle='#1A1A1A';
    ctx.fill();
    // tyre inner
    ctx.beginPath();
    ctx.ellipse(0,0,rw*.65,rh*.65,0,0,Math.PI*2);
    ctx.fillStyle='#3A3A3A';
    ctx.fill();
    ctx.restore();
  }

  // Leader crown
  if(isLeader && !dead){
    ctx.fillStyle='rgba(255,215,0,0.9)';
    ctx.font=`bold ${Math.max(8,10*z)}px Titillium Web`;
    ctx.textAlign='center';
    ctx.fillText('▲',0,-h*1.4*z);
  }

  ctx.restore();
}

// ─── Neural Net Visualiser ────────────────────────────────────────────────────
const nnC   = document.getElementById('nn-canvas');
const nnCtx = nnC.getContext('2d');
const IN_LABELS=['L2','L1','C','R1','R2'];

function drawNeuralNet(brain, sensors){
  const W=nnC.width, H=nnC.height;
  nnCtx.clearRect(0,0,W,H);

  const layers=[C.numSensors, C.hiddenSize, 2];
  const nodePos=[];
  const px=[30,W/2,W-30];

  for(let l=0;l<3;l++){
    nodePos.push([]);
    const n=layers[l];
    for(let i=0;i<n;i++){
      const y=H*0.12 + (H*0.76/(n-1||1))*i;
      nodePos[l].push([px[l],y]);
    }
  }

  for(let i=0;i<C.numSensors;i++){
    for(let j=0;j<C.hiddenSize;j++){
      const w=brain.w1[i*C.hiddenSize+j];
      const [x0,y0]=nodePos[0][i],[x1,y1]=nodePos[1][j];
      const alpha=Math.min(0.85,Math.abs(w)*0.55);
      nnCtx.beginPath();
      nnCtx.moveTo(x0,y0); nnCtx.lineTo(x1,y1);
      nnCtx.strokeStyle=w>0?`rgba(54,113,198,${alpha})`:`rgba(232,0,45,${alpha})`;
      nnCtx.lineWidth=Math.min(2.5,Math.abs(w)*1.2);
      nnCtx.stroke();
    }
  }
  for(let j=0;j<C.hiddenSize;j++){
    for(let k=0;k<2;k++){
      const w=brain.w2[j*2+k];
      const [x0,y0]=nodePos[1][j],[x1,y1]=nodePos[2][k];
      const alpha=Math.min(0.85,Math.abs(w)*0.55);
      nnCtx.beginPath();
      nnCtx.moveTo(x0,y0); nnCtx.lineTo(x1,y1);
      nnCtx.strokeStyle=w>0?`rgba(54,113,198,${alpha})`:`rgba(232,0,45,${alpha})`;
      nnCtx.lineWidth=Math.min(2.5,Math.abs(w)*1.2);
      nnCtx.stroke();
    }
  }

  const drawNode=(x,y,act,r=7)=>{
    const v=Math.max(0,Math.min(1,(act+1)/2));
    nnCtx.beginPath(); nnCtx.arc(x,y,r,0,Math.PI*2);
    const g=nnCtx.createRadialGradient(x,y,0,x,y,r);
    g.addColorStop(0,`rgba(${54+v*200},${113+v*100},${198-v*150},1)`);
    g.addColorStop(1,`rgba(${54+v*200},${113+v*100},${198-v*150},0.4)`);
    nnCtx.fillStyle=g;
    nnCtx.fill();
    nnCtx.strokeStyle='rgba(255,255,255,0.2)';
    nnCtx.lineWidth=0.8;
    nnCtx.stroke();
  };

  for(let i=0;i<C.numSensors;i++){
    const [x,y]=nodePos[0][i];
    drawNode(x,y,sensors[i]*2-1,6);
    nnCtx.fillStyle='rgba(107,122,153,0.9)';
    nnCtx.font='9px Share Tech Mono';
    nnCtx.textAlign='right';
    nnCtx.fillText(IN_LABELS[i],x-10,y+3);
  }
  for(let j=0;j<C.hiddenSize;j++){
    const [x,y]=nodePos[1][j];
    drawNode(x,y,brain.lastH[j],5);
  }
  const outLabels=['Steer','Gas'];
  for(let k=0;k<2;k++){
    const [x,y]=nodePos[2][k];
    drawNode(x,y,brain.lastO[k],7);
    nnCtx.fillStyle='#e8e8e8';
    nnCtx.font='bold 10px Titillium Web';
    nnCtx.textAlign='left';
    nnCtx.fillText(outLabels[k],x+10,y-3);
    nnCtx.fillStyle='rgba(255,215,0,0.9)';
    nnCtx.font='9px Share Tech Mono';
    nnCtx.fillText(`${brain.lastO[k]>=0?'+':''}${brain.lastO[k].toFixed(2)}`,x+10,y+9);
  }
}

// ─── Lap Graph ────────────────────────────────────────────────────────────────
const gC   = document.getElementById('graph-canvas');
const gCtx = gC.getContext('2d');

function drawGraph(history){
  const W=gC.width, H=gC.height;
  gCtx.clearRect(0,0,W,H);

  const valid=history.filter(h=>h.lap!=null);
  if(valid.length<2){
    gCtx.fillStyle='rgba(107,122,153,0.6)';
    gCtx.font='11px Share Tech Mono';
    gCtx.textAlign='center';
    gCtx.fillText('Waiting for lap data…',W/2,H/2+4);
    return;
  }

  const pad={t:10,r:10,b:24,l:32};
  const iW=W-pad.l-pad.r, iH=H-pad.t-pad.b;
  const laps=valid.map(h=>h.lap);
  const minL=Math.min(...laps), maxL=Math.max(...laps);
  const range=maxL-minL||1;

  gCtx.strokeStyle='rgba(54,113,198,0.12)';
  gCtx.lineWidth=1;
  for(let g=0;g<=4;g++){
    const y=pad.t+iH*(g/4);
    gCtx.beginPath(); gCtx.moveTo(pad.l,y); gCtx.lineTo(pad.l+iW,y); gCtx.stroke();
  }

  gCtx.beginPath();
  valid.forEach((h,i)=>{
    const x=pad.l+iW*i/(valid.length-1);
    const y=pad.t+iH*(1-(h.lap-minL)/range);
    i===0?gCtx.moveTo(x,y):gCtx.lineTo(x,y);
  });
  gCtx.lineTo(pad.l+iW,pad.t+iH);
  gCtx.lineTo(pad.l,pad.t+iH);
  gCtx.closePath();
  const fillG=gCtx.createLinearGradient(0,pad.t,0,pad.t+iH);
  fillG.addColorStop(0,'rgba(54,113,198,0.25)');
  fillG.addColorStop(1,'rgba(54,113,198,0)');
  gCtx.fillStyle=fillG;
  gCtx.fill();

  gCtx.beginPath();
  valid.forEach((h,i)=>{
    const x=pad.l+iW*i/(valid.length-1);
    const y=pad.t+iH*(1-(h.lap-minL)/range);
    i===0?gCtx.moveTo(x,y):gCtx.lineTo(x,y);
  });
  gCtx.strokeStyle='#3671C6';
  gCtx.lineWidth=2;
  gCtx.shadowBlur=6; gCtx.shadowColor='rgba(54,113,198,0.6)';
  gCtx.stroke();
  gCtx.shadowBlur=0;

  valid.forEach((h,i)=>{
    const x=pad.l+iW*i/(valid.length-1);
    const y=pad.t+iH*(1-(h.lap-minL)/range);
    gCtx.beginPath(); gCtx.arc(x,y,3,0,Math.PI*2);
    gCtx.fillStyle='#FFD700'; gCtx.fill();
    if(i===valid.length-1||i===0){
      gCtx.fillStyle='rgba(107,122,153,0.8)';
      gCtx.font='9px Share Tech Mono';
      gCtx.textAlign='center';
      gCtx.fillText(`G${h.gen}`,x,H-8);
    }
  });

  gCtx.save(); gCtx.rotate(-Math.PI/2);
  gCtx.fillStyle='rgba(107,122,153,0.6)';
  gCtx.font='9px Share Tech Mono';
  gCtx.textAlign='center';
  gCtx.fillText('FRAMES',-(pad.t+iH/2),10);
  gCtx.restore();

  const bestH=valid.reduce((a,b)=>a.lap<b.lap?a:b);
  gCtx.fillStyle='rgba(255,215,0,0.85)';
  gCtx.font='bold 9px Share Tech Mono';
  gCtx.textAlign='center';
  gCtx.fillText(`BEST: ${bestH.lap}f`,pad.l+iW*0.5,pad.t+8);
}
