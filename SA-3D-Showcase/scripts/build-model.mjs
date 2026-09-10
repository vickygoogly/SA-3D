import {exportGLB} from './export-glb.mjs';
import * as T from '../frontend/vendor/three.module.js';
import {writeFileSync} from 'node:fs';
const scene=new T.Scene();const plant=new T.Group();scene.add(plant);
const mats={deck:new T.MeshStandardMaterial({color:0x253d4c,roughness:.86}),edge:new T.MeshStandardMaterial({color:0x416475,metalness:.6,roughness:.48}),steel:new T.MeshStandardMaterial({color:0x8da8b2,metalness:.55,roughness:.43}),dark:new T.MeshStandardMaterial({color:0x365366,metalness:.6,roughness:.5}),pipe:new T.MeshStandardMaterial({color:0x64a7b5,metalness:.7,roughness:.33}),yellow:new T.MeshStandardMaterial({color:0xe0b361,metalness:.3,roughness:.5}),building:new T.MeshStandardMaterial({color:0x415b6a,roughness:.7}),glass:new T.MeshStandardMaterial({color:0x214d65,metalness:.45,roughness:.2}),red:new T.MeshBasicMaterial({color:0xff5975}),green:new T.MeshStandardMaterial({color:0x57f2bb,emissive:0x125b42,emissiveIntensity:.4}),blue:new T.MeshBasicMaterial({color:0x66b5ff})};
function mesh(geo,mat,x,y,z,parent=plant){const m=new T.Mesh(geo,typeof mat==='string'?mats[mat]:mat);m.position.set(x,y,z);parent.add(m);return m;}
function box(x,y,z,w,h,d,mat='steel',parent=plant){return mesh(new T.BoxGeometry(w,h,d),mat,x,y,z,parent)}
function cyl(x,y,z,r,h,mat='steel',parent=plant,rt=r){return mesh(new T.CylinderGeometry(rt,r,h,20),mat,x,y,z,parent)}
function pipe(a,b,r=.3,mat='pipe',parent=plant){const start=new T.Vector3(...a),end=new T.Vector3(...b),v=end.clone().sub(start);const m=mesh(new T.CylinderGeometry(r,r,v.length(),8),mat,...start.clone().add(end).multiplyScalar(.5).toArray(),parent);m.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),v.normalize());return m;}
const centers=[[-57,-34],[0,-34],[57,-34],[-57,29],[0,29],[68,35]];
// Model coordinates are metres in this illustrative scene; Y is elevation.
const grid=new T.GridHelper(440,88,0x2d5265,0x182f40);grid.position.y=-5;scene.add(grid);
box(-1,-2,-2,185,3,123,'deck');box(-1,-.35,-2,186,.5,124,'edge');
for(let x=-87;x<=87;x+=29)for(let z of [-57,53]){cyl(x,-10,z,1.4,18,'dark');box(x,-2,z,4,1,4,'edge')}
// Main service roads and marked pedestrian routes.
box(-1,.04,-2,177,.12,11,'dark');box(-28,.05,-2,9,.13,113,'dark');box(29,.05,-2,9,.13,113,'dark');
for(let x=-82;x<88;x+=10)box(x,.13,-2,4,.05,.25,'yellow');
for(const x of [-28,29])for(let z=-53;z<53;z+=9)box(x,.13,z,.25,.05,3.5,'yellow');
function rail(x,z,w,d,y=.8){for(const h of [y,y+1]){pipe([x-w/2,h,z-d/2],[x+w/2,h,z-d/2],.08,'yellow');pipe([x-w/2,h,z+d/2],[x+w/2,h,z+d/2],.08,'yellow');pipe([x-w/2,h,z-d/2],[x-w/2,h,z+d/2],.08,'yellow');pipe([x+w/2,h,z-d/2],[x+w/2,h,z+d/2],.08,'yellow');}for(let xx=x-w/2;xx<=x+w/2;xx+=6){pipe([xx,y-1,z-d/2],[xx,y+1,z-d/2],.08,'yellow');pipe([xx,y-1,z+d/2],[xx,y+1,z+d/2],.08,'yellow')}}
rail(-1,-2,184,121);
for(const [i,[x,z]] of centers.entries()){box(x,.25,z,45,.5,43,'deck');rail(x,z,45,43,.65);}
function vessel(x,z,r,h){cyl(x,h/2+1,z,r,h);mesh(new T.SphereGeometry(r,16,8,0,Math.PI*2,0,Math.PI/2),'steel',x,h+1,z).scale.y=.32;for(let y=3;y<h;y+=5){const ring=mesh(new T.TorusGeometry(r+.12,.12,6,24),'edge',x,y,z);ring.rotation.x=Math.PI/2;}pipe([x+r,1,z],[x+r,h+1,z],.18,'yellow');}
// Inlet manifold, parallel piping and isolation valve stations.
for(let i=0;i<5;i++){let z=-47+i*6;pipe([-75,2,z],[-43,2,z],.55);for(const x of [-69,-57,-46]){box(x,1,z,1.3,2,1.5,'dark');const wheel=mesh(new T.TorusGeometry(.7,.11,6,12),'yellow',x,3,z);wheel.rotation.y=Math.PI/2;}pipe([-75,2,z],[-75,4,z],.42);}pipe([-75,4,-47],[-75,4,-23],.42);
vessel(-43,-45,2.6,11);vessel(-43,-30,2.6,11);
// Gas compression trains beneath steel gantries.
for(const z of [-45,-29]){box(0,1,z,32,2,9,'edge');for(let x=-10;x<=10;x+=10){const m=cyl(x,4,z,2.9,7,'steel');m.rotation.z=Math.PI/2;box(x,2,z,5,3,6,'dark');}for(const x of [-17,17]){pipe([x,0,z-5],[x,14,z-5],.4,'edge');pipe([x,14,z-5],[x,14,z+5],.4,'edge');pipe([x,0,z+5],[x,14,z+5],.4,'edge');}pipe([-17,14,z-5],[17,14,z-5],.4,'edge');}
vessel(17,-42,2,21);
// Production separators with upper service decks, ladders and process columns.
for(const z of [-46,-32,-18]){const m=cyl(54,5,z,3.4,25,'steel');m.rotation.z=Math.PI/2;for(const x of [46,62])box(x,2,z,2,4,6,'dark');for(const x of [41,67])mesh(new T.SphereGeometry(3.4,16,12),'steel',x,5,z).scale.x=.3;pipe([40,5,z],[36,5,z],.5);pipe([36,5,z],[36,2,-10],.5);box(54,9,z+4.3,29,.45,2,'edge');rail(54,z+4.3,29,2,9.7);}
vessel(76,-44,2.1,27);vessel(76,-28,2.1,23);
// Utilities buildings, transformer yard and rooftop equipment.
box(-66,6,24,23,12,20,'building');box(-66,12.2,24,25,.5,22,'edge');for(let i=0;i<5;i++)box(-76+i*4,7,34.1,2.6,3,.12,'glass');for(const x of [-73,-63]){box(x,14,24,6,3.5,6,'dark');for(let z=22;z<27;z++)box(x,16,z,6,.2,.12,'steel');}for(const z of [15,28,41]){box(-43,2,z,9,4,7,'steel');for(let x=-46;x<-39;x+=2)cyl(x,5,z,.25,3,'dark');}
// Export tank farm and metering skid.
for(const x of [-12,11])for(const z of [19,40])vessel(x,z,7,11);for(let x=-19;x<=18;x+=7){pipe([x,2,7],[x,2,13],.4);box(x,1,9,3,2,2,'dark')}
// Two wellhead modules and a lattice service tower.
for(const x of [55,79]){box(x,1,35,19,2,31,'edge');for(const z of [24,34,44]){cyl(x,4,z,.7,5,'yellow');for(const yy of [3,5])pipe([x-2,yy,z],[x+2,yy,z],.25,'yellow');}}
// Five distinct wellhead trees for the EPS-1 phase, linked into two manifold headers.
function wellheadTree(x,z,heading=1){box(x,.7,z,5.2,.55,5.2,'dark');box(x,.98,z,3.5,.22,3.5,'edge');cyl(x,2.1,z,.72,2.15,'steel');cyl(x,3.55,z,.48,.9,'dark');for(const [y,rot] of [[2.35,0],[3.1,Math.PI/2]]){const valve=mesh(new T.TorusGeometry(.62,.1,6,14),'yellow',x,y,z);valve.rotation.y=rot;}const outlet=[x+heading*3.2,2.6,z];pipe([x,2.6,z],outlet,.34,'pipe');pipe([outlet[0],2.6,z],[outlet[0],2.6,z+3.5],.3,'pipe');box(x-heading*1.7,1.8,z,1.05,2.1,1.05,'building');ladder(x-2.65,z-2.5,1,3.2);}
for(const [x,z,dir] of [[55,23,1],[67,23,1],[79,24,-1],[60,42,1],[75,42,-1]])wellheadTree(x,z,dir);
pipe([52,2.6,18],[52,2.6,47],.44,'pipe');pipe([83,2.6,18],[83,2.6,47],.44,'pipe');for(const z of [23,42])pipe([52,2.6,z],[83,2.6,z],.34,'pipe');
function tower(x,z,h){for(const sx of [-1,1])for(const sz of [-1,1])pipe([x+sx*3.8,1,z+sz*3.8],[x+sx*1.25,h,z+sz*1.25],.24,'yellow');for(let y=3;y<h;y+=5){const w=3.8-2.5*y/h;for(const sz of [-1,1]){pipe([x-w,y,z+sz*w],[x+w,y+4,z+sz*(w-.35)],.11,'edge');pipe([x+w,y,z+sz*w],[x-w,y+4,z+sz*(w-.35)],.11,'edge');}box(x,y,z,w*2,.18,w*2,'dark')}}tower(80,44,29);
// Elevated process pipe rack connecting the operating units.
for(let x=-82;x<=83;x+=15){for(const z of [-9,5])pipe([x,0,z],[x,8,z],.23,'edge');pipe([x,8,-9],[x,8,5],.23,'edge')}
for(let k=0;k<5;k++)pipe([-85,8.7,-7+k*2.4],[85,8.7,-7+k*2.4],.22,k%2?'steel':'pipe');
// Flare boom extending beyond the deck.
pipe([89,1,41],[119,2,72],.6,'edge');pipe([89,1,46],[114,2,77],.6,'edge');pipe([117,2,75],[117,31,75],.65,'steel');cyl(117,31,75,1,1.5,'yellow');

// Refinery-grade detail pass inspired by the supplied CCTV and aerial footage:
// multi-level steelwork, access systems, insulated pipe runs and dense process trains.
const hotPipe=new T.MeshStandardMaterial({color:0xa8483d,metalness:.55,roughness:.42});
const galvanized=new T.MeshStandardMaterial({color:0xaebec2,metalness:.75,roughness:.3});
function ladder(x,z,bottom,height){for(const sx of [-.42,.42])pipe([x+sx,bottom,z],[x+sx,bottom+height,z],.075,'yellow');for(let y=bottom+.35;y<bottom+height;y+=.42)pipe([x-.42,y,z],[x+.42,y,z],.055,'yellow')}
function processFrame(x,z,w,d,levels=3){for(const sx of [-1,1])for(const sz of [-1,1])pipe([x+sx*w/2,1,z+sz*d/2],[x+sx*w/2,levels*4+1,z+sz*d/2],.22,'edge');for(let level=1;level<=levels;level++){const y=level*4;for(const zz of [-1,1])pipe([x-w/2,y,z+zz*d/2],[x+w/2,y,z+zz*d/2],.18,'edge');for(const xx of [-1,1])pipe([x+xx*w/2,y,z-d/2],[x+xx*w/2,y,z+d/2],.18,'edge');box(x,y,z,w,.16,d,'dark');rail(x,z,w,d,y+.35);}ladder(x-w/2-.7,z-d/2,1,levels*4)}
function insulatedRun(a,b,r=.42){const start=new T.Vector3(...a),end=new T.Vector3(...b),v=end.clone().sub(start);const m=mesh(new T.CylinderGeometry(r,r,v.length(),12),galvanized,...start.clone().add(end).multiplyScalar(.5).toArray());m.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),v.normalize());for(let p=.7;p<v.length();p+=1.6){const ring=mesh(new T.TorusGeometry(r+.045,.045,6,16),'edge',...start.clone().lerp(end,p/v.length()).toArray());ring.quaternion.copy(m.quaternion);}}
// Tall fractionation/absorption towers, complete with side platforms and ladders.
for(const [x,z,h,r] of [[-3,-13,35,2.6],[10,-13,29,2.15],[20,-14,25,1.8],[4,47,31,2.35]]){vessel(x,z,r,h);for(let y=6;y<h;y+=6){box(x+r+1.6,y,z,3.2,.22,4,'edge');rail(x+r+1.6,z,3.2,4,y+.3)}ladder(x-r-1.1,z,1,h)}
// Dense multi-level pipe bridge and equipment bay as seen in refinery footage.
processFrame(-3,-4,44,14,3);processFrame(52,13,35,14,3);processFrame(-61,-10,27,12,3);
for(const [z,y] of [[-10,14],[-7.4,14.5],[-4.8,15],[-2.2,15.5],[.4,16]]){pipe([-84,y,z],[85,y,z],.28,'pipe');for(let x=-78;x<82;x+=17)box(x,y-.3,z,1.3,.35,.9,'edge')}
for(const z of [-17,-13,-9,-5,-1])insulatedRun([-20,10,z],[31,10,z],.36);
for(const z of [13,17,21])insulatedRun([34,9,z],[84,9,z],.46);
for(const z of [-48,-42,-36]){pipe([-38,8,z],[36,8,z],.22,hotPipe);pipe([-38,7.2,z],[36,7.2,z],.18,'steel');}
// Pumps, valve clusters and local control cabinets create the tighter plant-floor texture in the CCTV scenes.
for(const [x,z] of [[-70,-18],[-64,-18],[-58,-18],[-12,-24],[-4,-24],[7,-24],[42,-4],[49,-4],[56,-4],[65,8]]){box(x,1,z,3.6,1.2,2.2,'dark');cyl(x-1.05,2,z,.6,1.8,'steel');cyl(x+1.05,2,z,.6,1.8,'steel');pipe([x-3,1.8,z],[x+3,1.8,z],.22,'pipe');const wheel=mesh(new T.TorusGeometry(.48,.08,6,12),'yellow',x,2.7,z);wheel.rotation.y=Math.PI/2;}
for(const [x,z] of [[-48,-9],[-40,-9],[33,-10],[39,-10],[45,15],[71,15],[-22,35],[-26,35]]){box(x,1.1,z,1.2,2.2,1,'building');box(x,2.35,z,1.5,.12,1.3,'yellow')}
// Diagonal bracing and stair flights make the access steelwork legible from the aerial angles.
for(const [x,z,w] of [[-3,-4,44],[52,13,35],[-61,-10,27]])for(let level=1;level<=3;level++){const y=(level-1)*4+1;pipe([x-w/2,y,z-7],[x-w/2+5,y+4,z-7],.1,'yellow');pipe([x-w/2+5,y+4,z-7],[x-w/2+10,y+4,z-7],.1,'yellow');}
for(let x=-82;x<=82;x+=11){pipe([x,1,50],[x+4,7,50],.1,'edge');pipe([x+4,7,50],[x+8,1,50],.1,'edge')}

plant.name='EPS-1 Representative Plant';
plant.userData={units:'metres',upAxis:'Y',representative:true};
// Bake position, rotation and scale into local matrices before serialization.
plant.updateMatrixWorld(true);
writeFileSync(new URL('../models/plant-model.json',import.meta.url),JSON.stringify(plant.toJSON()));
console.log('Exported separate plant model');

exportGLB(plant,new URL('../models/plant-model.glb',import.meta.url));
console.log('Exported GLB interchange copy');
