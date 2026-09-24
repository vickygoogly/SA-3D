import * as T from '../frontend/vendor/three.module.js';
import {readFileSync} from 'node:fs';
import assert from 'node:assert/strict';
import {loop,onPath,cameras} from '../frontend/domain.js';
const plant=new T.ObjectLoader().parse(JSON.parse(readFileSync(new URL('../models/eps1-model.json',import.meta.url))));
plant.updateMatrixWorld(true);
const obstacles=[];
plant.traverse(o=>{if(o.isMesh){const box=new T.Box3().setFromObject(o);if(box.max.y>.35&&box.min.y<4.3)obstacles.push({box,name:o.name||o.geometry.type,position:o.position.toArray()});}});
for(const c of cameras)obstacles.push({box:new T.Box3(new T.Vector3(c.x-.4,0,c.z-.3),new T.Vector3(c.x+.4,5.7,c.z+.3)),name:c.id,position:[c.x,0,c.z]});
// Conservative vehicle envelope includes body, wheels, mirror allowance and clearance.
// Check every 0.25 m along the full loop, plus all intermediate headings at corners.
const hits=new Map();let samples=0;
function check(x,z,heading){samples++;const hx=Math.abs(Math.sin(heading))*4.7+Math.abs(Math.cos(heading))*1.65,hz=Math.abs(Math.cos(heading))*4.7+Math.abs(Math.sin(heading))*1.65;const envelope=new T.Box3(new T.Vector3(x-hx,.35,z-hz),new T.Vector3(x+hx,4.3,z+hz));for(const o of obstacles)if(envelope.intersectsBox(o.box))hits.set(o.name+o.position.join(','),{name:o.name,position:o.position,min:o.box.min.toArray(),max:o.box.max.toArray()});}
const length=loop.reduce((sum,p,i)=>sum+Math.hypot(p[0]-loop[(i+1)%loop.length][0],p[1]-loop[(i+1)%loop.length][1]),0);
for(let d=0;d<length;d+=.25){const p=onPath(loop,d);check(p.x,p.z,p.heading);}
for(const [x,z] of loop)for(let h=0;h<Math.PI*2;h+=Math.PI/90)check(x,z,h);
if(hits.size)console.error(JSON.stringify([...hits.values()],null,2));
assert.equal(hits.size,0,'Vehicle swept envelope must be clear of fixed plant objects and CCTV poles');
console.log(JSON.stringify({vehicleClearance:'passed',routeLengthMetres:length,samples,obstacles:obstacles.length,envelope:{halfWidth:1.65,halfLength:4.7,minY:.35,maxY:4.3}}));
