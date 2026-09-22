import * as THREE from 'three';
import {createVilla} from '../src/villa.js';
import assert from 'node:assert/strict';
import {SITE,STAIR,LEVELS,FURNITURE,WALLS,LAGOON,dims,roomPoints,insidePolygon,solidWallParts} from '../src/layout.js';
import {writeFileSync} from 'node:fs';
const names=['stone','floor','plaster','wood','walnut','dark','metal','glass','screen','fabric','fabric2','white','rug','black','sand','soil','rock','leaf','leaf2','grass','waterbed','led','screenTv','car','car2'];
const colors=['#d9cbb5','#d9d2c1','#eee6d9','#c9a175','#735038','#252c2b','#a28c64','#dceae6','#666e64','#d7cdbb','#a8b0a0','#f5eee3','#b7ab97','#181e1e','#dac7a0','#473f2c','#9a9989','#48634a','#758253','#6f7e53','#bbd4bb','#fff0c4','#182c31','#e9e7df','#425055'];
const materials=Object.fromEntries(names.map((n,i)=>[n,new THREE.MeshStandardMaterial({name:n,color:colors[i],roughness:n==='metal'?.25:.7,metalness:n==='metal'?.7:0,transparent:n==='glass',opacity:n==='glass'?.23:1,side:n.includes('leaf')?THREE.DoubleSide:THREE.FrontSide})]));
const scene=new THREE.Scene();const villa=createVilla(scene,materials);scene.updateMatrixWorld(true);let triangles=0,meshes=0,invalid=0;const exportMeshes=[];
scene.traverse(o=>{if(!o.isMesh)return;meshes++;const pos=o.geometry.getAttribute('position');for(const v of pos.array)if(!Number.isFinite(v))invalid++;triangles+=(o.geometry.index?o.geometry.index.count:pos.count)/3;
 const copy=o.geometry.clone();copy.applyMatrix4(o.matrixWorld);const vertices=Array.from(copy.getAttribute('position').array);const indices=o.geometry.index?Array.from(o.geometry.index.array):Array.from({length:pos.count},(_,i)=>i);let level=-1;for(let i=0;i<4;i++){let p=o;while(p){if(p===villa.floors[i])level=i;p=p.parent;}}let p=o;while(p){if(villa.roofs.includes(p))level=4;p=p.parent;}if(villa.stairs.some(g=>{let p=o;while(p){if(p===g)return true;p=p.parent;}return false;}))level=Math.floor(o.parent.position.y/3.3);
 let category='shell';for(const [key,groups]of [['ceiling',villa.ceilings],['wall',villa.wallGroups],['stair',villa.stairs],['figure',villa.people]])for(const g of groups){let p=o;while(p){if(p===g)category=key;p=p.parent;}}
 const mat=o.material;if(process.env.EXPORT_GEOMETRY)exportMeshes.push({category,name:mat.name||o.type,level,vertices,indices,color:mat.color?.toArray()||[.1,.5,.5],opacity:mat.opacity??1,roughness:mat.roughness??.15,metalness:mat.metalness??.1,water:o===villa.water});copy.dispose();});
if(invalid)throw new Error(invalid+' invalid vertex coordinates');if(villa.floors.length!==4||villa.stairs.length!==3)throw new Error('Missing floor or stair');
assert.equal(SITE.width/.3048,30);assert.equal(SITE.depth/.3048,40);
assert.ok(Math.abs(STAIR.risers*STAIR.rise-SITE.floorHeight)<1e-8);assert.equal(STAIR.width,1.2);assert.equal(STAIR.landing,1.2);assert.equal(LAGOON.length,192);
const close=(a,b)=>assert.ok(Math.abs(a-b)<1e-8,`${a} differs from ${b}`);
close(9*STAIR.going+STAIR.width,STAIR.bounds[2]-STAIR.bounds[0]);close(9*STAIR.going+STAIR.landing,STAIR.bounds[3]-STAIR.bounds[1]);
assert.equal(LEVELS.flatMap(f=>f.rooms).filter(r=>r.kind==='bedroom').length,4);
for(let f=0;f<4;f++){
 for(const r of LEVELS[f].rooms){const d=dims(r);assert.ok(d.w>0&&d.d>0&&d.area>0,`Invalid dimensions: ${r.id}`);for(const[x,z]of roomPoints(r))assert.ok(Math.abs(x)<SITE.width/2&&Math.abs(z)<SITE.depth/2,`Room outside plot: ${r.id}`);}
 for(const w of WALLS[f])for(const [a,b]of w.doors)assert.ok(a>=w.a&&b<=w.b&&b>a,`Invalid opening on level ${f}`);
 for(const o of FURNITURE[f]){
  const c=Math.cos(o.rot||0),s=Math.sin(o.rot||0),pts=[[-o.w/2,-o.d/2],[o.w/2,-o.d/2],[o.w/2,o.d/2],[-o.w/2,o.d/2]].map(([x,z])=>[o.x+x*c+z*s,o.z-x*s+z*c]);
  assert.ok(LEVELS[f].rooms.some(r=>pts.every(([x,z])=>insidePolygon(x,z,roomPoints(r)))),`Furniture outside room: level ${f}, ${o.type}`);
  const xs=pts.map(p=>p[0]),zs=pts.map(p=>p[1]);for(const w of WALLS[f])for(const[a,b]of solidWallParts(w)){const minx=w.axis==='x'?a:w.p-.06,maxx=w.axis==='x'?b:w.p+.06,minz=w.axis==='z'?a:w.p-.06,maxz=w.axis==='z'?b:w.p+.06;assert.ok(!(Math.max(...xs)>minx+.001&&Math.min(...xs)<maxx-.001&&Math.max(...zs)>minz+.001&&Math.min(...zs)<maxz-.001),`Furniture intersects partition: level ${f}, ${o.type}`);}
 }
}
const report={floors:villa.floors.length,stairStoreys:villa.stairs.length,flightsPerStorey:2,risersPerStorey:STAIR.risers,riserMetres:STAIR.rise,nominalStairWidth:STAIR.width,goingMetres:STAIR.going,lagoonSegments:LAGOON.length,measuredSpaces:LEVELS.reduce((n,l)=>n+l.rooms.length,0),meshes,triangles,invalid,collisionWalls:villa.colliders.length,geometryValidation:'passed',visualValidation:'blocked: cloud browser WebGL disabled'};
writeFileSync('docs/geometry-check.json',JSON.stringify(report,null,2));if(process.env.EXPORT_GEOMETRY)writeFileSync(process.env.EXPORT_GEOMETRY,JSON.stringify(exportMeshes));console.log(report);
