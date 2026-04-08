"use strict";
// ─── Neural Network ───────────────────────────────────────────────────────────
class NeuralNet {
  constructor(w1, w2) {
    const r = (r,c) => Array.from({length:r*c},()=>(Math.random()*2-1)*0.8);
    this.w1 = w1 ?? r(C.numSensors, C.hiddenSize);
    this.w2 = w2 ?? r(C.hiddenSize, 2);
    this.lastH = new Array(C.hiddenSize).fill(0);
    this.lastO = [0,0];
  }
  think(s) {
    const h = new Array(C.hiddenSize).fill(0);
    for(let j=0;j<C.hiddenSize;j++){
      for(let i=0;i<C.numSensors;i++) h[j]+=s[i]*this.w1[i*C.hiddenSize+j];
      h[j]=Math.tanh(h[j]);
    }
    const o=[0,0];
    for(let k=0;k<2;k++){
      for(let j=0;j<C.hiddenSize;j++) o[k]+=h[j]*this.w2[j*2+k];
      o[k]=Math.tanh(o[k]);
    }
    this.lastH=h; this.lastO=o;
    return o;
  }
  mutate(rate) {
    this.w1=this.w1.map(v=>v+((Math.random()*2-1)*rate*(Math.random()<0.2?3:1)));
    this.w2=this.w2.map(v=>v+((Math.random()*2-1)*rate*(Math.random()<0.2?3:1)));
  }
  clone() { return new NeuralNet([...this.w1],[...this.w2]); }
}
