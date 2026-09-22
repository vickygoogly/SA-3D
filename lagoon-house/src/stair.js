import * as T from 'three';
import {STAIR as S,SITE} from './layout.js';
export function createStair(parent,b,m,floor){
 const {box,tube,mesh}=b;const g=new T.Group();g.position.y=floor*SITE.floorHeight;parent.add(g);
 // Ten rises to a full 1.20 m square landing, then ten rises to the next floor.
 // The rectangular treads never rotate about a central axis.
 for(let i=0;i<9;i++){
  const y=(i+1)*S.rise,z=S.startZ+(i+.5)*S.going;
  const flare=floor===0?Math.max(0,3-i)*.075:0;
  box(g,S.lowerX-flare/2,y-.047,z,S.width+flare,.094,S.going+.016,'stone',.033);
  box(g,S.lowerX-flare/2,y-.073,z-S.going/2+.018,S.width+flare-.055,.012,.018,'led',.004);
 }
 box(g,3.45,1.65-.065,4.67,1.20,.13,1.20,'stone',.04);
 for(let i=0;i<9;i++){
  const y=(11+i)*S.rise,x=2.85-(i+.5)*S.going;
  box(g,x,y-.047,4.67,S.going+.016,.094,1.20,'stone',.033);
  box(g,x+S.going/2-.018,y-.073,4.67,.018,.012,1.145,'led',.004);
 }
 // Upper landing is in the gallery, clear of the floor opening.
 box(g,-.36,3.3-.065,4.67,1.20,.13,1.20,'floor',.035);
 // Broad sculpted ribbon stringers under each flight. No central spiral post.
 function ribbon(points){tube(g,points,.115,'walnut',64);tube(g,points.map(p=>[p[0]+.06,p[1]-.065,p[2]]),.065,'metal',64);}
 ribbon([[3.45,-.05,1.48],[3.45,.15,1.80],[3.45,.68,2.78],[3.45,1.45,4.10],[3.45,1.51,4.67]]);
 ribbon([[3.45,1.51,4.67],[2.85,1.56,4.67],[2.15,2.0,4.67],[.75,2.89,4.67],[.21,3.15,4.67]]);
 function glassRail(points){const verts=[],idx=[];points.forEach((p,i)=>{verts.push(p[0],p[1]+.05,p[2],p[0],p[1]+1.1,p[2]);if(i<points.length-1){const k=2*i;idx.push(k,k+1,k+2,k+1,k+3,k+2);}});const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(verts,3));geo.setIndex(idx);geo.computeVertexNormals();mesh(g,geo,m.glass);tube(g,points.map(p=>[p[0],p[1]+1.12,p[2]]),.016,'metal',48);}
 const zs=Array.from({length:12},(_,i)=>1.46+2.61*i/11);
 glassRail(zs.map(z=>[4.035,.165+(z-1.46)*1.485/2.61,z]));
 glassRail(zs.map(z=>[2.865-(floor===0?Math.max(0,2.05-z)*.18:0),.165+(z-1.46)*1.485/2.61,z]));
 const xs=Array.from({length:12},(_,i)=>2.85-2.61*i/11);
 glassRail(xs.map(x=>[x,1.815+(2.85-x)*1.485/2.61,5.255]));
 glassRail(xs.map(x=>[x,1.815+(2.85-x)*1.485/2.61,4.085]));
 glassRail([[4.035,1.65,4.07],[4.035,1.65,5.255],[2.85,1.65,5.255]]);
 // A textured feature wall beyond the outer handrail, skylight above the shared atrium.
 return g;
}
