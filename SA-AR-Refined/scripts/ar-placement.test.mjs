import {test} from 'node:test';
import assert from 'node:assert/strict';
import * as T from '../frontend/vendor/three.module.js';
import {ARPlacement} from '../frontend/ar-placement.js';
import {vehicles,vehicleState,workers,workerPosition} from '../frontend/domain.js';

function fixture(){
 const desktop=new T.Scene(),ar=new T.Scene(),root=new T.Group();
 const before=new T.Group(),after=new T.Group();desktop.add(before,root,after);
 const plant=new T.Mesh(new T.BoxGeometry(185,3,140),new T.MeshBasicMaterial());plant.position.y=-2;
 const vehicle=new T.Group(),worker=new T.Group();root.add(plant,vehicle,worker);
 return {desktop,ar,root,plant,vehicle,worker,placement:new ARPlacement(root,{floorY:-3.5})};
}
const plane=(x=0,y=0,z=-1)=>new T.Matrix4().makeTranslation(x,y,z).toArray();
test('requires an explicit tap on a fresh, upward horizontal plane; never autoplaces',()=>{
 const {placement,ar}=fixture();placement.begin(ar);
 assert.equal(placement.place(0),false);assert.equal(placement.anchor.visible,false);
 const wall=new T.Matrix4().makeRotationZ(Math.PI/2).toArray();assert.equal(placement.offerHit(wall,5),false);
 assert.equal(placement.offerHit(Array(16).fill(NaN),5),false);
 assert.equal(placement.offerHit(plane(),10),true);assert.equal(placement.placed,false);assert.equal(placement.anchor.visible,false);
 assert.equal(placement.place(300),false,'stale plane cannot be placed');
 placement.offerHit(plane(),400);assert.equal(placement.place(401),true);assert.equal(placement.placed,true);
 assert.equal(placement.place(402),false,'subsequent asset taps cannot move the plant');
});
test('deck bottom lies on placement surface; model, worker and vehicle remain the same objects',()=>{
 const {root,ar,plant,vehicle,worker,placement}=fixture();const identities=root.children.map(x=>x.uuid);
 placement.begin(ar);placement.offerHit(plane(.4,.7,-1.2),10);placement.place(11);ar.updateMatrixWorld(true);
 const bounds=new T.Box3().setFromObject(plant);assert.ok(Math.abs(bounds.min.y-.7)<1e-8);
 assert.deepEqual(root.children.map(x=>x.uuid),identities);
 const vehicleAt=t=>{const p=vehicleState(vehicles[0],t);vehicle.position.set(p.x,.1,p.z);ar.updateMatrixWorld(true);return vehicle.getWorldPosition(new T.Vector3());};
 assert.ok(vehicleAt(8).distanceTo(vehicleAt(12))>.01,'the shared moving vehicle advances inside AR');
 const workerAt=t=>{const p=workerPosition(workers[0],t);worker.position.set(p.x,.2,p.z);ar.updateMatrixWorld(true);return worker.getWorldPosition(new T.Vector3());};
 assert.ok(workerAt(8).distanceTo(workerAt(12))>.001,'the shared worker advances inside AR');
 placement.setScale(.008);ar.updateMatrixWorld(true);assert.ok(Math.abs(new T.Box3().setFromObject(plant).min.y-.7)<1e-8,'scaling preserves the ground contact');
});
test('reposition hides all operational geometry and discards old hit; exit restores transform and sibling order',()=>{
 const {root,desktop,ar,placement}=fixture();const order=desktop.children.map(o=>o.uuid);
 root.position.set(2,3,4);root.rotation.y=.3;root.scale.setScalar(1.2);root.updateMatrix();const original=root.matrix.clone();
 placement.begin(ar);placement.offerHit(plane(),5);placement.place(6);
 placement.reposition();assert.equal(placement.anchor.visible,false);assert.equal(placement.state,'scanning');assert.equal(placement.place(7),false);
 placement.end();assert.equal(root.parent,desktop);assert.deepEqual(desktop.children.map(o=>o.uuid),order);root.updateMatrix();assert.deepEqual(root.matrix.toArray(),original.toArray());
 placement.end();assert.equal(root.parent,desktop,'cleanup can be repeated safely');
 placement.begin(ar);assert.equal(root.parent,placement.lift);assert.equal(placement.anchor.visible,false);placement.end();
});
test('lost/tilted hit clears previously valid placement; scale is bounded',()=>{
 const {placement,ar}=fixture();placement.begin(ar);placement.offerHit(plane(),2);placement.offerHit(null,3);assert.equal(placement.place(4),false);
 placement.offerHit(plane(),5);placement.offerHit(new T.Matrix4().makeRotationX(Math.PI/4).toArray(),6);assert.equal(placement.place(7),false);
 placement.setScale(100);assert.equal(placement.content.scale.x,.012);placement.setScale(-1);assert.equal(placement.content.scale.x,.002);
});
