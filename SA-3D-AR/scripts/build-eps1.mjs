import {exportGLB} from './export-glb.mjs';
import {batchStaticModel} from './batch-model.mjs';
import * as T from '../frontend/vendor/three.module.js';
import {writeFileSync} from 'node:fs';
const scene=new T.Scene();const plant=new T.Group();scene.add(plant);
const mats={deck:new T.MeshStandardMaterial({color:0x253d4c,roughness:.86}),edge:new T.MeshStandardMaterial({color:0x416475,metalness:.6,roughness:.48}),steel:new T.MeshStandardMaterial({color:0x8da8b2,metalness:.55,roughness:.43}),dark:new T.MeshStandardMaterial({color:0x365366,metalness:.6,roughness:.5}),pipe:new T.MeshStandardMaterial({color:0x64a7b5,metalness:.7,roughness:.33}),yellow:new T.MeshStandardMaterial({color:0xe0b361,metalness:.3,roughness:.5}),building:new T.MeshStandardMaterial({color:0x415b6a,roughness:.7}),glass:new T.MeshStandardMaterial({color:0x214d65,metalness:.45,roughness:.2}),red:new T.MeshBasicMaterial({color:0xff5975}),green:new T.MeshStandardMaterial({color:0x57f2bb,emissive:0x125b42,emissiveIntensity:.4}),blue:new T.MeshBasicMaterial({color:0x66b5ff})};
Object.assign(mats,{
 concrete:new T.MeshStandardMaterial({color:0x92978e,roughness:.94}),
 asphalt:new T.MeshStandardMaterial({color:0x282f32,roughness:.94}),
 insulation:new T.MeshStandardMaterial({color:0xbfc6c6,metalness:.78,roughness:.36}),
 tank:new T.MeshStandardMaterial({color:0xc5cecc,metalness:.45,roughness:.37}),
 zinc:new T.MeshStandardMaterial({color:0x949f9d,metalness:.72,roughness:.47}),
 paint:new T.MeshStandardMaterial({color:0x9c4439,metalness:.15,roughness:.69}),
 white:new T.MeshStandardMaterial({color:0xd5d8cf,roughness:.8}),
 rubber:new T.MeshStandardMaterial({color:0x242928,roughness:.97}),
 lamp:new T.MeshStandardMaterial({color:0xffe6c0,emissive:0xffd397,emissiveIntensity:2.6})
});
for(const [name,m] of Object.entries(mats)){m.name=name;m.userData.finish=name;}
function mesh(geo,mat,x,y,z,parent=plant){const m=new T.Mesh(geo,typeof mat==='string'?mats[mat]:mat);m.position.set(x,y,z);parent.add(m);return m;}
function box(x,y,z,w,h,d,mat='steel',parent=plant){return mesh(new T.BoxGeometry(w,h,d),mat,x,y,z,parent)}
function cyl(x,y,z,r,h,mat='steel',parent=plant,rt=r){return mesh(new T.CylinderGeometry(rt,r,h,r>5?64:r>1.5?40:16),mat,x,y,z,parent)}
function pipe(a,b,r=.3,mat='pipe',parent=plant){const start=new T.Vector3(...a),end=new T.Vector3(...b),v=end.clone().sub(start);const m=mesh(new T.CylinderGeometry(r,r,v.length(),8),mat,...start.clone().add(end).multiplyScalar(.5).toArray(),parent);m.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),v.normalize());return m;}
const centers=[[-57,-34],[0,-34],[57,-34],[-57,29],[0,29],[68,35]];
// Model coordinates are metres in this illustrative scene; Y is elevation.
const grid=new T.GridHelper(440,88,0x2d5265,0x182f40);grid.position.y=-5;scene.add(grid);
box(-1,-2,-2,185,3,140,'deck');box(-1,-.35,-2,186,.5,141,'edge');
for(let x=-87;x<=87;x+=29)for(let z of [-57,53]){cyl(x,-10,z,1.4,18,'dark');box(x,-2,z,4,1,4,'edge')}
// Main service roads and marked pedestrian routes.
box(-1,.04,-2,177,.12,11,'asphalt');box(-28,.05,-2,9,.13,113,'asphalt');box(29,.05,-2,9,.13,113,'asphalt');
for(let x=-82;x<88;x+=10)box(x,.13,-2,4,.05,.25,'yellow');
for(const x of [-28,29])for(let z=-53;z<53;z+=9)box(x,.13,z,.25,.05,3.5,'yellow');
function rail(x,z,w,d,y=.8){for(const h of [y,y+1]){pipe([x-w/2,h,z-d/2],[x+w/2,h,z-d/2],.08,'yellow');pipe([x-w/2,h,z+d/2],[x+w/2,h,z+d/2],.08,'yellow');pipe([x-w/2,h,z-d/2],[x-w/2,h,z+d/2],.08,'yellow');pipe([x+w/2,h,z-d/2],[x+w/2,h,z+d/2],.08,'yellow');}for(let xx=x-w/2;xx<=x+w/2;xx+=6){pipe([xx,y-1,z-d/2],[xx,y+1,z-d/2],.08,'yellow');pipe([xx,y-1,z+d/2],[xx,y+1,z+d/2],.08,'yellow')}}
rail(-1,-2,184,138);
for(const [i,[x,z]] of centers.entries()){box(x,.25,z,45,.5,43,'deck');rail(x,z,45,43,.65);}
function vessel(x,z,r,h){
 const tank=r>5,finish=tank?'tank':'insulation';
 cyl(x,.5,z,r+.55,1,'concrete');cyl(x,1.25,z,r+.16,.28,'zinc');
 const shell=cyl(x,h/2+1,z,r,h,finish);shell.name=tank?'Storage tank shell':'Insulated process column';
 mesh(new T.SphereGeometry(r,tank?64:40,16,0,Math.PI*2,0,Math.PI/2),finish,x,h+1,z).scale.y=tank?.16:.35;
 for(let y=3;y<h;y+=tank?2.8:2){const ring=mesh(new T.TorusGeometry(r+.025,.032,4,tank?64:40),'zinc',x,y,z);ring.rotation.x=Math.PI/2;}
 for(let k=0;k<(tank?16:10);k++){const a=k*Math.PI*2/(tank?16:10);cyl(x+Math.cos(a)*(r+.27),1.03,z+Math.sin(a)*(r+.27),.09,.26,'zinc');}
 // Roof vents, manways and bolted inspection covers give the vessels scale.
 cyl(x,h+1+r*.14,z,.32,.95,'zinc');cyl(x,h+1.5+r*.14,z,.52,.14,'steel');
 for(const y of tank?[2.4]:[3.2,h*.55]){pipe([x, y,z+r-.1],[x,y,z+r+.62],.38,'zinc');const cap=cyl(x,y,z+r+.67,.5,.15,'zinc');cap.rotation.x=Math.PI/2;}
 if(tank){circularRail(x,z,r-.3,h+1.35);ladder(x-r-.7,z,1,h+.6);cage(x-r-.7,z,3,h-2);}
 else{pipe([x-r-.6,1,z+.8],[x-r-.6,h*.8,z+.8],.12,'pipe');}
}
function circularRail(x,z,r,y){for(const yy of [y,y+1]){const ring=mesh(new T.TorusGeometry(r,.045,4,48),'yellow',x,yy,z);ring.rotation.x=Math.PI/2;}for(let k=0;k<16;k++){const a=k*Math.PI/8;pipe([x+r*Math.cos(a),y-.6,z+r*Math.sin(a)],[x+r*Math.cos(a),y+1,z+r*Math.sin(a)],.045,'zinc');}}
function cage(x,z,bottom,height){for(let y=bottom;y<bottom+height;y+=1.8){const hoop=mesh(new T.TorusGeometry(.7,.035,4,12,Math.PI*1.45),'zinc',x,y,z-.2);hoop.rotation.x=Math.PI/2;}for(const xx of [-.65,0,.65])pipe([x+xx,bottom,z-.65],[x+xx,bottom+height,z-.65],.028,'zinc');}
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
// Complete the outboard flare access boom as a connected cantilever truss,
// rather than leaving the original isolated pipes suspended over the water.
{
 const a=new T.Vector3(89,2.4,43.5),b=new T.Vector3(116.5,2.4,74.5),length=a.distanceTo(b);
 const boom=new T.Group();boom.name='Flare boom access truss';boom.position.copy(a).add(b).multiplyScalar(.5);boom.rotation.y=Math.atan2(b.x-a.x,b.z-a.z);plant.add(boom);
 box(0,.85,0,3.4,.16,length,'zinc',boom);
 for(const x of [-1.95,1.95]){
  for(const y of [-1,.75])pipe([x,y,-length/2],[x,y,length/2],.16,'edge',boom);
  for(const y of [1.35,2.2])pipe([x,y,-length/2],[x,y,length/2],.045,'yellow',boom);
  for(let z=-length/2;z<length/2;z+=4){const end=Math.min(z+4,length/2);pipe([x,-1,z],[x,2.2,z],.065,'zinc',boom);pipe([x,-1,z],[x,.75,end],.085,'edge',boom);}
 }
 for(let z=-length/2;z<=length/2;z+=2){pipe([-1.95,.7,z],[1.95,.7,z],.09,'edge',boom);box(0,.95,z,3.4,.03,.04,'dark',boom);}
 pipe([114,2,77],[119,2,72],.3,'edge');box(117,3.3,75,6,.28,6,'zinc');rail(117,75,6,6,3.9);
 cyl(117,3.65,75,1.1,.5,'zinc');cyl(117,32,75,.78,2.2,'dark');pipe([117.9,5,75],[117.9,32.4,75],.12,'pipe');
}

// Refinery-grade detail pass inspired by the supplied CCTV and aerial footage:
// multi-level steelwork, access systems, insulated pipe runs and dense process trains.
const hotPipe=mats.paint;
const galvanized=mats.insulation;
function ladder(x,z,bottom,height){for(const sx of [-.42,.42])pipe([x+sx,bottom,z],[x+sx,bottom+height,z],.075,'yellow');for(let y=bottom+.35;y<bottom+height;y+=.42)pipe([x-.42,y,z],[x+.42,y,z],.055,'yellow')}
function processFrame(x,z,w,d,levels=3){for(const sx of [-1,1])for(const sz of [-1,1]){box(x+sx*w/2,.7,z+sz*d/2,1.1,.4,1.1,'concrete');box(x+sx*w/2,(levels*4+1)/2,z+sz*d/2,.28,levels*4+1,.38,'edge');}for(let level=1;level<=levels;level++){const y=level*4;for(const zz of [-1,1]){box(x,y,z+zz*d/2,w,.45,.2,'edge');box(x,y+.24,z+zz*(d/2-.9),w,.1,1.8,'zinc');for(let xx=x-w/2;xx<x+w/2;xx+=.45)box(xx,y+.3,z+zz*(d/2-.9),.06,.06,1.8,'dark');}for(const xx of [-1,1])box(x+xx*w/2,y,z,.24,.45,d,'edge');rail(x,z,w,d,y+.45);}ladder(x-w/2-.35,z-d/2,1,levels*4);cage(x-w/2-.35,z-d/2,3,levels*4-2)}
function insulatedRun(a,b,r=.42){const start=new T.Vector3(...a),end=new T.Vector3(...b),v=end.clone().sub(start),length=v.length();const m=mesh(new T.CylinderGeometry(r,r,length,16),galvanized,...start.clone().add(end).multiplyScalar(.5).toArray());m.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),v.normalize());for(let p=.7;p<length;p+=1.6){const ring=mesh(new T.TorusGeometry(r+.02,.025,4,16),'zinc',...start.clone().lerp(end,p/length).toArray());ring.quaternion.copy(m.quaternion).multiply(new T.Quaternion().setFromAxisAngle(new T.Vector3(1,0,0),Math.PI/2));}}
// Tall fractionation/absorption towers, complete with side platforms and ladders.
for(const [x,z,h,r] of [[-3,-13,35,2.6],[10,-13,29,2.15],[20,-14,25,1.8],[4,47,31,2.35]]){vessel(x,z,r,h);for(let y=6;y<h;y+=6){box(x+r+1.6,y,z,3.2,.22,4,'zinc');rail(x+r+1.6,z,3.2,4,y+.5);pipe([x+r,y-2,z-1.5],[x+r+3,y,z-1.5],.08,'zinc');}ladder(x-r-1.1,z,1,h);cage(x-r-1.1,z,3,h-2)}
// Dense multi-level pipe bridge and equipment bay as seen in refinery footage.
processFrame(-3,-4,44,14,3);processFrame(52,13,35,14,3);processFrame(-61,-10,27,12,3);
for(const [z,y] of [[-10,14],[-7.4,14.5],[-4.8,15],[-2.2,15.5],[.4,16]]){pipe([-84,y,z],[85,y,z],.28,'pipe');for(let x=-78;x<82;x+=17)box(x,y-.3,z,1.3,.35,.9,'edge')}
for(const z of [-17,-13,-9,-5,-1])insulatedRun([-20,10,z],[31,10,z],.36);
for(const z of [13,17,21])insulatedRun([34,9,z],[84,9,z],.46);
for(const z of [-48,-42,-36]){pipe([-38,8,z],[36,8,z],.22,hotPipe);pipe([-38,7.2,z],[36,7.2,z],.18,'steel');}
// Pumps, valve clusters and local control cabinets create the tighter plant-floor texture in the CCTV scenes.
for(const [x,z] of [[-70,-18],[-64,-18],[-58,-18],[-12,-24],[-4,-24],[7,-24],[42,-4],[49,-4],[56,-4],[65,8]]){box(x,1,z,3.6,1.2,2.2,'dark');cyl(x-1.05,2,z,.6,1.8,'steel');cyl(x+1.05,2,z,.6,1.8,'steel');pipe([x-3,1.8,z],[x+3,1.8,z],.22,'pipe');const wheel=mesh(new T.TorusGeometry(.48,.08,6,12),'yellow',x,2.7,z);wheel.rotation.y=Math.PI/2;}
for(const [x,z] of [[-48,-9],[-40,-9],[35,-10],[39,-10],[45,15],[71,15],[-22,35],[-22,31]]){box(x,1.1,z,1.2,2.2,1,'building');box(x,2.35,z,1.5,.12,1.3,'yellow')}
// Diagonal bracing and stair flights make the access steelwork legible from the aerial angles.
for(const [x,z,w] of [[-3,-4,44],[52,13,35],[-61,-10,27]])for(let level=1;level<=3;level++){const y=(level-1)*4+1;pipe([x-w/2,y,z-7],[x-w/2+5,y+4,z-7],.1,'yellow');pipe([x-w/2+5,y+4,z-7],[x-w/2+10,y+4,z-7],.1,'yellow');}
// Bracing remains inside equipment bays; never span the vehicle corridors.
for(let x=-82;x<=82;x+=11){if((x< -23&&x+8> -33)||(x<34&&x+8>24))continue;pipe([x,1,50],[x+4,7,50],.1,'edge');pipe([x+4,7,50],[x+8,1,50],.1,'edge')}

// Material refinement retains the original EPS-1 geometry and all six process areas.
mats.deck.color.setHex(0x737c7a); mats.deck.metalness=.08; mats.deck.roughness=.91;
mats.edge.color.setHex(0x5a676c); mats.edge.metalness=.66; mats.edge.roughness=.5;
mats.dark.color.setHex(0x354246); mats.dark.metalness=.35;
mats.steel.color.setHex(0xbcc4c5); mats.steel.metalness=.78; mats.steel.roughness=.35;
mats.pipe.color.setHex(0x809b9b); mats.pipe.metalness=.55; mats.pipe.roughness=.46;
mats.building.color.setHex(0x8a9492); mats.building.metalness=.25;
mats.yellow.color.setHex(0xc4a547); mats.yellow.roughness=.59;
for(let x=-84;x<=84;x+=14)for(const z of [-66,65]){cyl(x,.22,z,.2,.45,'concrete');pipe([x,0,z],[x,6,z],.065,'zinc');pipe([x,6,z],[x,6,z-Math.sign(z)*.7],.045,'zinc');box(x,6,z-Math.sign(z)*.7,.7,.16,.4,'dark');box(x,5.9,z-Math.sign(z)*.7,.6,.05,.32,'lamp');}
// Flanged joints and actuators. All additions remain inside equipment bays.
function flange(x,y,z,r,axis='x'){
 const g=new T.Group();g.position.set(x,y,z);plant.add(g);
 for(const offset of [-.09,.09]){const disc=cyl(0,offset,0,r,.14,'zinc',g);disc.name='Bolted pipe flange';}
 for(let i=0;i<8;i++){const a=i*Math.PI/4;cyl(Math.cos(a)*r*.77,0,Math.sin(a)*r*.77,.055,.42,'dark',g);}
 if(axis==='x')g.rotation.z=Math.PI/2;else if(axis==='z')g.rotation.x=Math.PI/2;
}
for(let i=0;i<5;i++){const z=-47+i*6;for(const x of [-69,-57,-46]){flange(x-.65,2,z,.8);flange(x+.65,2,z,.8);box(x,2.1,z,.95,1,.95,'zinc');pipe([x,2.4,z],[x,3.25,z],.1,'zinc');}for(const x of [-72,-50]){box(x,.8,z,1.1,.6,1.4,'concrete');}}
for(const z of [-46,-32,-18])for(const x of [41.1,66.9])flange(x,5,z,1.05);
// Finned electric motors, couplings and pump bases distinguish the service skids.
for(const [x,z] of [[-70,-18],[-64,-18],[-58,-18],[-12,-24],[-4,-24],[7,-24],[42,-4],[49,-4],[56,-4],[65,8]]){
 box(x,.65,z,4.4,.45,2.6,'concrete');const motor=cyl(x-1,2.25,z,.55,1.5,'paint');motor.rotation.z=Math.PI/2;
 for(let k=0;k<8;k++){const a=k*Math.PI/4;box(x-1,2.25+Math.sin(a)*.57,z+Math.cos(a)*.57,1.4,.08,.08,'zinc');}
 flange(x+.6,1.8,z,.4);box(x-1,2.9,z,.5,.3,.5,'dark');
}
// Cladding seams, doorway, ventilation louvers and roof fan housings.
for(let x=-76;x<-55;x+=1.1)box(x,6,34.13,.035,11.4,.07,'zinc');
box(-67,2.4,34.2,2.2,4.5,.12,'dark');box(-67,2.5,34.3,1.85,4.1,.12,'zinc');box(-66.4,2.2,34.4,.12,.4,.08,'dark');
for(const z of [19,27]){box(-77.6,5,z,.1,3.5,4,'dark');for(let y=3.4;y<6.7;y+=.28)box(-77.72,y,z,.16,.06,3.8,'zinc');}
for(const x of [-73,-63]){cyl(x,16.1,24,1.8,.23,'dark');for(let a=0;a<3;a++){const blade=box(x,16.25,24,3.1,.06,.35,'zinc');blade.rotation.y=a*Math.PI/3;}const guard=mesh(new T.TorusGeometry(1.82,.045,4,32),'zinc',x,16.3,24);guard.rotation.x=Math.PI/2;}
// Drain grilles and panel joints break up broad decks without blocking lanes.
for(const [x,z] of centers){for(const sign of [-1,1])for(let k=-15;k<=15;k+=5){box(x+k,.515,z+sign*18,2.2,.02,.52,'dark');for(let j=-.8;j<=.8;j+=.25)box(x+k+j,.533,z+sign*18,.045,.015,.48,'zinc');}for(const xx of [-10,0,10])box(x+xx,.512,z,.025,.01,40,'dark');}
// Dedicated transverse service lanes connect the two existing longitudinal roads.
for(const z of [-58,57]){box(.5,.08,z,67,.14,10,'asphalt');for(let x=-28;x<31;x+=8)box(x,.18,z,3,.04,.15,'yellow');}
plant.name='TR AWARE EPS-1 detailed plant';
plant.userData={units:'metres',upAxis:'Y',representative:true,revision:'6.3',areas:6};
// Bake position, rotation and scale into local matrices before serialization.
plant.updateMatrixWorld(true);
writeFileSync(new URL('../models/eps1-model.json',import.meta.url),JSON.stringify(plant.toJSON()));
console.log('Exported separate plant model');

const optimized=batchStaticModel(plant);
exportGLB(optimized,new URL('../models/campus.glb',import.meta.url));
console.log('Exported batched GLB',optimized.userData);
