import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import * as T from '../frontend/vendor/three.module.js';
import {workers,workerPosition} from '../frontend/domain.js';
const source=readFileSync(new URL('../frontend/personnel-renderer.js',import.meta.url),'utf8').replace("from 'three'","from '"+new URL('../frontend/vendor/three.module.js',import.meta.url).href+"'");
const {createPersonnelRenderer}=await import('data:text/javascript;base64,'+Buffer.from(source).toString('base64'));

test('all 248 instanced people retain individual picking, movement and AR transforms',()=>{
 const parent=new T.Group(),renderer=createPersonnelRenderer(parent,workers.length),pickables=[];
 const records=workers.map(data=>{const object=new T.Group();parent.add(object);renderer.selectable(object);object.children[0].userData.key=data.id;pickables.push(object.children[0]);return {data,object};});
 function at(time){for(const record of records){const p=workerPosition(record.data,time);record.object.position.set(p.x,.2,p.z);record.object.rotation.y=p.heading;}renderer.update(records,time,true);parent.updateMatrixWorld(true);}
 at(0);const first=records[0].object.position.clone();at(10);assert.ok(first.distanceTo(records[0].object.position)>1,'Walking changes actual scene positions');
 parent.position.set(2,.9,-3);parent.rotation.y=.72;parent.scale.setScalar(.004);parent.updateMatrixWorld(true);
 const instances=parent.children.filter(o=>o.isInstancedMesh);assert.ok(instances.length<20,'Personnel draw calls stay independent of worker count');
 for(let i=0;i<records.length;i++){
  const instanceMatrix=new T.Matrix4();instances[0].getMatrixAt(i,instanceMatrix);
  const renderedCentre=new T.Vector3().setFromMatrixPosition(instanceMatrix).applyMatrix4(parent.matrixWorld);
  const expected=new T.Vector3(0,1.08,0).applyMatrix4(records[i].object.matrixWorld);
  assert.ok(renderedCentre.distanceTo(expected)<.00001,'Rendered body and selectable asset remain synchronized in AR');
  const above=new T.Vector3(0,3,0).applyMatrix4(records[i].object.matrixWorld),target=new T.Vector3(0,1,0).applyMatrix4(records[i].object.matrixWorld);
  const hits=new T.Raycaster(above,target.sub(above).normalize()).intersectObjects(pickables,false);
  assert.equal(hits[0]?.object.userData.key,records[i].data.id,'Every worker remains directly selectable');
 }
 renderer.update(records,10,false);assert.ok(instances.every(o=>!o.visible),'Personnel layer hides the rendered population');
});
