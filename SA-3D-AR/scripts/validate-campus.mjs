import {readFileSync} from 'node:fs';
import assert from 'node:assert/strict';
import * as T from '../frontend/vendor/three.module.js';
import {workers,workerPosition,vehicles,vehicleState,permits,cameras,drones,alerts,zones} from '../frontend/domain.js';
const glb=readFileSync(new URL('../models/campus.glb',import.meta.url));assert.equal(glb.readUInt32LE(0),0x46546c67);assert.equal(glb.readUInt32LE(8),glb.length);const len=glb.readUInt32LE(12),doc=JSON.parse(glb.subarray(20,20+len));assert.equal(doc.nodes.length,doc.scenes[0].extras.batches);assert.ok(doc.nodes.length>100);assert.ok(doc.nodes.length<doc.scenes[0].extras.sourceMeshes/4);assert.ok(glb.length<24*1024*1024,'Keep the model below GitHub browser upload size');for(const n of doc.nodes)assert.ok(n.matrix.every(Number.isFinite));for(const a of doc.accessors){assert.ok(a.count>0);const v=doc.bufferViews[a.bufferView];assert.ok(v.byteOffset+v.byteLength<=doc.buffers[0].byteLength);}
// Compare the delivered batches against the editable geometry. A smaller node
// count is an optimization, not permission to omit equipment or corrupt indices.
const source=new T.ObjectLoader().parse(JSON.parse(readFileSync(new URL('../models/eps1-model.json',import.meta.url))));
const sourceBounds=new T.Box3().setFromObject(source,true);let sourceMeshes=0,sourceTriangles=0,exportTriangles=0;
source.traverse(o=>{if(o.isMesh){sourceMeshes++;sourceTriangles+=(o.geometry.index?.count||o.geometry.attributes.position.count)/3;}});
const binaryStart=28+len,exportBounds=new T.Box3();
function array(index){const a=doc.accessors[index],v=doc.bufferViews[a.bufferView],Type={5126:Float32Array,5125:Uint32Array,5123:Uint16Array}[a.componentType];return new Type(glb.buffer,glb.byteOffset+binaryStart+(v.byteOffset||0),a.count*({VEC3:3,VEC2:2,SCALAR:1}[a.type]));}
for(const node of doc.nodes){for(const primitive of doc.meshes[node.mesh].primitives){
 const p=doc.accessors[primitive.attributes.POSITION],indices=array(primitive.indices),normals=array(primitive.attributes.NORMAL);
 assert.ok(indices.every(i=>i<p.count),'No index may reference a missing vertex');exportTriangles+=indices.length/3;
 for(let i=0;i<normals.length;i+=3)assert.ok(Math.abs(Math.hypot(normals[i],normals[i+1],normals[i+2])-1)<.005,'Transformed normals remain normalized');
 const box=new T.Box3(new T.Vector3().fromArray(p.min),new T.Vector3().fromArray(p.max));box.applyMatrix4(new T.Matrix4().fromArray(node.matrix));exportBounds.union(box);
}}
assert.equal(sourceMeshes,doc.scenes[0].extras.sourceMeshes);assert.equal(exportTriangles,sourceTriangles);assert.equal(exportTriangles,doc.scenes[0].extras.triangles);
assert.ok(sourceBounds.min.distanceTo(exportBounds.min)<.001&&sourceBounds.max.distanceTo(exportBounds.max)<.001,'Batched export preserves all equipment bounds');
for(const name of ['tank','insulation','zinc','asphalt','concrete','lamp'])assert.ok(doc.materials.some(m=>m.name===name&&m.extras.finish===name),'Preserve '+name+' finish');
const registry={worker:workers,vehicle:vehicles,permit:permits,camera:cameras,drone:drones};for(const a of alerts)assert.ok(registry[a.kind].some(r=>r.id===a.target));for(const p of permits)for(const w of p.workers)assert.ok(workers.some(r=>r.id===w));
let closest=Infinity;for(let t=0;t<=180;t+=5){const p=workers.map(w=>workerPosition(w,t));for(let i=0;i<p.length;i++)for(let j=i+1;j<p.length;j++)closest=Math.min(closest,Math.hypot(p[i].x-p[j].x,p[i].z-p[j].z));for(const v of vehicles){const s=vehicleState(v,t);assert.ok(Number.isFinite(s.x)&&Number.isFinite(s.z));assert.ok(s.speedKph<=s.limit);}}
assert.ok(closest>=1.5,'Worker walking routes must retain separation');console.log(JSON.stringify({sourceMeshes,batches:doc.nodes.length,triangles:exportTriangles,modelMB:glb.length/1e6,areas:zones.length,workers:workers.length,vehicles:vehicles.length,permits:permits.length,minimumWorkerSeparationFirst3Minutes:closest,alertTargets:'all valid'}));
