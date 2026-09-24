import {test} from 'node:test';
import assert from 'node:assert/strict';
import * as T from '../frontend/vendor/three.module.js';
import {createARExperience} from '../frontend/ar-experience.js';
import {Element,installDOM} from './support/ar-dom.mjs';

function fixture(options={}){
 const dom=installDOM(),desktop=new T.Scene(),root=new T.Group(),car=new T.Mesh(new T.BoxGeometry(2,2,5),new T.MeshBasicMaterial());
 desktop.add(root);root.add(car);car.position.set(0,1,0);car.userData.key='vehicle:VEH-001';
 const rec={kind:'vehicle',data:{id:'VEH-001',name:'Road tanker'},object:car},records=new Map([['vehicle:VEH-001',rec]]),node=new Element('button');node.textContent='VEH-001';
 const events=[],layers={worker:true,vehicle:false,camera:true,drone:true,permit:true,alert:true,zone:true};let paused=true,cancelled=0,requests=[],ended=0;
 const xrCamera=new T.PerspectiveCamera(50,420/860,.01,50);xrCamera.position.set(0,1,1);xrCamera.lookAt(0,0,-1);xrCamera.updateMatrixWorld(true);
 const renderer={shadowMap:{enabled:true},toneMappingExposure:1.45,rendered:null,xr:{enabled:false,setReferenceSpaceType(){},async setSession(){},getReferenceSpace:()=>({kind:'local'}),updateCamera(){},getCamera:()=>({cameras:[xrCamera]})},render(scene){this.rendered=scene;}};
 class Session extends Element {
  constructor(){super();this.visibilityState='visible';}
  async requestReferenceSpace(){if(options.viewer)await options.viewer;return {kind:'viewer'};}
  async requestHitTestSource(){if(options.failHit)throw Error('Hit test unavailable');return {cancel(){cancelled++;}};}
  async end(){ended++;this.emit('end');}
 }
 const session=new Session();
 dom.set('navigator',{xr:{async requestSession(kind,opts){requests.push({kind,opts});if(options.deny)throw Error('Camera permission denied');return session;}}});
 let api;
 api=createARExperience({renderer,root,floorY:-3.5,environment:null,records,pins:[{rec,node}],pickables:[car],layers,
  getAlerts:()=>[{id:'A-1',kind:'vehicle',target:'VEH-001',title:'Seatbelt',severity:'warning',ack:false}],
  getPaused:()=>paused,setPaused:p=>paused=p,onEnter:()=>events.push('enter'),onExit:()=>events.push('exit'),onClear:()=>events.push('clear'),notify:s=>events.push(s),
  onSelect:(kind,id)=>{events.push([kind,id]);api.openPanel('Asset details');api.selectionHost.textContent=id;},onAlert:id=>events.push(['alert',id])});
 let tracked=true,plane=new T.Matrix4().makeTranslation(0,0,-1).toArray();
 const frame={getViewerPose:()=>tracked?{}:null,getHitTestResults:()=>plane?[{getPose:()=>({transform:{matrix:plane}})}]:[]};
 const inputFrame={getViewerPose(){throw Error('getViewerPose is invalid on select event frames');},getPose:()=>({transform:{matrix:new T.Matrix4().identity().toArray()}})};
 const $=s=>dom.document.querySelector(s);
 return {dom,desktop,root,car,records,rec,api,renderer,session,frame,inputFrame,events,layers,$,requests,
  get paused(){return paused;},get cancelled(){return cancelled;},get ended(){return ended;},
  tracking(value){tracked=value;},plane(value){plane=value;},tap(){session.emit('select',{frame:inputFrame,inputSource:{targetRaySpace:{}}});},
  async place(){api.render(performance.now(),frame);this.tap();},async close(){await session.end();await Promise.resolve();dom.restore();}};
}

test('AR isolates the overlay, gates all content until tap, then shares the animated scene',async()=>{
 const f=fixture();try{
  await f.api.start();assert.equal(f.requests.length,1);const {opts}=f.requests[0];
  assert.equal(opts.domOverlay.root,f.$('#ar-overlay'));assert.notEqual(opts.domOverlay.root,f.dom.document.body);assert.ok(opts.requiredFeatures.includes('dom-overlay'));
  assert.equal(f.dom.document.body.classList.contains('ar-active'),true);assert.equal(f.$('main').inert,true);assert.equal(f.$('main').getAttribute('aria-hidden'),'true');
  for(const id of ['#ar-status','#ar-controls','#ar-panel','#ar-pins'])assert.equal(f.$(id).hidden,true,id);
  assert.equal(f.$('#ar-instruction').hidden,false);assert.equal(f.api.openPanel('Premature'),false);
  f.api.render(performance.now(),f.frame);assert.equal(f.api.placed,false,'valid plane alone must not place');
  f.tap();assert.equal(f.api.placed,true,'explicit selection places');assert.equal(f.$('#ar-panel').hidden,true,'nothing opens automatically');assert.equal(f.$('#ar-instruction').hidden,true);
  assert.equal(f.paused,false);assert.equal(f.layers.vehicle,true);assert.notEqual(f.root.parent,f.desktop);assert.equal(f.root.children[0],f.car);
  const old=f.car.getWorldPosition(new T.Vector3());f.car.position.x+=10;f.api.render(performance.now(),f.frame);assert.ok(f.car.getWorldPosition(new T.Vector3()).distanceTo(old)>.01);
  f.$('#ar-pins').children[0].click();assert.deepEqual(f.events.at(-1),['vehicle','VEH-001']);assert.equal(f.$('#ar-panel').hidden,false);
  const uiEvent=f.$('#ar-overlay').emit('beforexrselect',{target:f.$('#ar-exit')});assert.equal(uiEvent.defaultPrevented,true);
  const blankEvent=f.$('#ar-overlay').emit('beforexrselect',{target:f.$('#ar-overlay')});assert.equal(blankEvent.defaultPrevented,false);
 }finally{await f.close();}
});
test('tracking loss and vertical surfaces cannot place; input-frame getViewerPose is never used',async()=>{
 const f=fixture();try{
  await f.api.start();f.plane(new T.Matrix4().makeRotationX(Math.PI/2).toArray());await f.place();assert.equal(f.api.placed,false);
  f.plane(new T.Matrix4().makeTranslation(0,0,-1).toArray());f.api.render(performance.now(),f.frame);f.tracking(false);f.api.render(performance.now(),f.frame);f.tap();assert.equal(f.api.placed,false);
  f.tracking(true);await f.place();assert.equal(f.api.placed,true);
 }finally{await f.close();}
});
test('AR ray selects the real transformed asset and panels never reposition the plant',async()=>{
 const f=fixture();try{
  await f.api.start();await f.place();f.root.updateWorldMatrix(true,true);
  const point=f.car.getWorldPosition(new T.Vector3()),origin=point.clone().add(new T.Vector3(0,.2,.2));
  const matrix=new T.Matrix4().lookAt(origin,point,new T.Vector3(0,1,0)).setPosition(origin).toArray();
  f.session.emit('select',{frame:{getPose:()=>({transform:{matrix}})},inputSource:{targetRaySpace:{}}});
  assert.deepEqual(f.events.at(-1),['vehicle','VEH-001']);assert.equal(f.api.placed,true);assert.equal(f.$('#ar-panel').hidden,false);
  f.$('#ar-reposition').click();assert.equal(f.api.placed,false);assert.equal(f.$('#ar-panel').hidden,true);assert.equal(f.$('#ar-pins').hidden,true);assert.equal(f.api.openPanel('Late request'),false);
  await f.place();assert.equal(f.api.placed,true);assert.equal(f.$('#ar-panel').hidden,true);
 }finally{await f.close();}
});
test('exit restores dashboard, layers, paused state, renderer and root without duplication',async()=>{
 const f=fixture();try{
  await f.api.start();await f.place();f.$('#ar-alerts').click();assert.equal(f.$('#ar-panel').hidden,false);
  await f.session.end();await Promise.resolve();assert.equal(f.api.active,false);assert.equal(f.api.placed,false);assert.equal(f.root.parent,f.desktop);assert.equal(f.desktop.children.length,1);
  assert.equal(f.$('#ar-overlay').hidden,true);assert.equal(f.$('main').inert,false);assert.equal(f.$('main').getAttribute('aria-hidden'),null);assert.equal(f.layers.vehicle,false);assert.equal(f.paused,true);assert.equal(f.renderer.shadowMap.enabled,true);assert.equal(f.renderer.toneMappingExposure,1.45);assert.equal(f.cancelled,1);
  await f.api.start();assert.equal(f.$('#ar-panel').hidden,true);assert.equal(f.dom.document.querySelectorAll('#ar-overlay').length,1);await f.place();assert.equal(f.api.placed,true);
 }finally{await f.close();}
});
test('denied permission and initialization failure both leave a usable dashboard',async t=>{
 t.mock.method(console,'warn',()=>{});
 for(const options of [{deny:true},{failHit:true}]){
  const f=fixture(options);try{await f.api.start();await Promise.resolve();assert.equal(f.api.active,false);assert.equal(f.root.parent,f.desktop);assert.equal(f.$('main').inert,false);assert.equal(f.$('#ar-overlay').hidden,true);assert.equal(f.dom.document.body.classList.contains('ar-active'),false);}finally{f.dom.restore();}
 }
});
test('ending during async initialization cannot expose controls or move the model later',async()=>{
 let resolve;const viewer=new Promise(r=>resolve=r),f=fixture({viewer});try{
  const starting=f.api.start();await Promise.resolve();await Promise.resolve();await f.session.end();await Promise.resolve();resolve();await starting;
  assert.equal(f.api.active,false);assert.equal(f.root.parent,f.desktop);assert.equal(f.$('#ar-overlay').hidden,true);assert.equal(f.$('#ar-panel').hidden,true);
 }finally{f.dom.restore();}
});
