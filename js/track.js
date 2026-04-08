"use strict";
// ─── Track ────────────────────────────────────────────────────────────────────
class Track {
  constructor(name) {
    this.name = name;
    const raw = LAYOUTS[name];
    const pts = raw.map(([x,y])=>[x*C.canvasW, y*C.canvasH]);
    this.centerPts = this._densify(this._smooth(pts,3),12);
    this.tw = C.trackW;
    this._buildEdges();
    this._buildGrid();
  }
  _smooth(pts,n) {
    for(let _=0;_<n;_++){
      const s=[];
      for(let i=0;i<pts.length;i++){
        const p=pts[i], pr=pts[(i-1+pts.length)%pts.length], nx=pts[(i+1)%pts.length];
        s.push([(pr[0]+p[0]*2+nx[0])/4,(pr[1]+p[1]*2+nx[1])/4]);
      }
      pts=s;
    }
    return pts;
  }
  _densify(pts,steps) {
    const d=[];
    for(let i=0;i<pts.length;i++){
      const a=pts[i],b=pts[(i+1)%pts.length];
      for(let t=0;t<steps;t++){
        const s=t/steps;
        d.push([a[0]+(b[0]-a[0])*s, a[1]+(b[1]-a[1])*s]);
      }
    }
    return d;
  }
  _buildEdges() {
    const n=this.centerPts.length;
    this.inner=[]; this.outer=[];
    for(let i=0;i<n;i++){
      const pr=this.centerPts[(i-1+n)%n], nx=this.centerPts[(i+1)%n];
      const dx=nx[0]-pr[0], dy=nx[1]-pr[1];
      const len=Math.hypot(dx,dy)||1;
      const nx2=-dy/len, ny2=dx/len;
      const [cx,cy]=this.centerPts[i];
      this.inner.push([cx-nx2*this.tw, cy-ny2*this.tw]);
      this.outer.push([cx+nx2*this.tw, cy+ny2*this.tw]);
    }
  }
  _buildGrid() {
    const cell=10;
    this._cell=cell;
    const xs=this.centerPts.map(p=>p[0]), ys=this.centerPts.map(p=>p[1]);
    this._gx0=Math.min(...xs)-this.tw-cell;
    this._gy0=Math.min(...ys)-this.tw-cell;
    const cols=Math.ceil((Math.max(...xs)-this._gx0+this.tw+cell)/cell)+2;
    const rows=Math.ceil((Math.max(...ys)-this._gy0+this.tw+cell)/cell)+2;
    this._cols=cols; this._rows=rows;
    this._grid=new Uint8Array(rows*cols);
    const tw2=this.tw*this.tw;
    const pts=this.centerPts, pn=pts.length;
    for(let row=0;row<rows;row++){
      const py=this._gy0+row*cell;
      for(let col=0;col<cols;col++){
        const px=this._gx0+col*cell;
        for(let i=0;i<pn;i++){
          const j=(i+1)%pn;
          if(this._sd2(px,py,pts[i][0],pts[i][1],pts[j][0],pts[j][1])<tw2){
            this._grid[row*cols+col]=1; break;
          }
        }
      }
    }
  }
  _sd2(px,py,ax,ay,bx,by) {
    const dx=bx-ax,dy=by-ay,lsq=dx*dx+dy*dy;
    if(!lsq) return (px-ax)**2+(py-ay)**2;
    const t=Math.max(0,Math.min(1,((px-ax)*dx+(py-ay)*dy)/lsq));
    return (ax+t*dx-px)**2+(ay+t*dy-py)**2;
  }
  isOnTrack(x,y) {
    const col=((x-this._gx0)/this._cell)|0, row=((y-this._gy0)/this._cell)|0;
    if(col<0||col>=this._cols||row<0||row>=this._rows) return false;
    return this._grid[row*this._cols+col]===1;
  }
  castRay(x,y,ang) {
    const ca=Math.cos(ang),sa=Math.sin(ang);
    for(let d=0;d<C.sensorLen;d+=8){
      if(!this.isOnTrack(x+ca*d,y+sa*d)) return d;
    }
    return C.sensorLen;
  }
  getProgress(x,y,last) {
    const pts=this.centerPts, n=pts.length;
    if(last==null){
      let bi=0,bd=Infinity;
      for(let i=0;i<n;i++){const d=(pts[i][0]-x)**2+(pts[i][1]-y)**2;if(d<bd){bd=d;bi=i;}}
      return bi;
    }
    const s=n>>3;
    let bi=last,bd=Infinity;
    for(let off=-s;off<=s;off++){
      const i=(last+off+n)%n;
      const d=(pts[i][0]-x)**2+(pts[i][1]-y)**2;
      if(d<bd){bd=d;bi=i;}
    }
    return bi;
  }
  startPos() {
    const p=this.centerPts[0], q=this.centerPts[1];
    return {x:p[0],y:p[1],a:Math.atan2(q[1]-p[1],q[0]-p[0])};
  }
}
