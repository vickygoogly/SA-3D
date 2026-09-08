import {test} from 'node:test';
import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {mkdtempSync,readFileSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {once} from 'node:events';
import * as THREE from '../frontend/vendor/three.module.js';
test('separate model is parseable geometry with metre coordinates',()=>{
 const json=JSON.parse(readFileSync(new URL('../models/plant-model.json',import.meta.url)));
 const model=new THREE.ObjectLoader().parse(json);let meshes=0;model.traverse(o=>{if(o.isMesh)meshes++});
 assert.ok(meshes>400);assert.equal(model.userData.units,'metres');
 const placed=model.children.filter(o=>o.position.length()>1);assert.ok(placed.length>600,'Equipment transforms must survive export');
 assert.deepEqual(model.children[0].position.toArray(),[-1,-2,-2]);
 const positions=new Set(placed.map(o=>o.position.toArray().join(',')));assert.ok(positions.size>400,'Equipment must be spatially distributed');
 const size=new THREE.Box3().setFromObject(model).getSize(new THREE.Vector3());assert.ok(size.x>180&&size.y>30&&size.z>100);
});
test('backend serves frontend/model, persists acknowledgment and resets demo',async()=>{
 const temp=mkdtempSync(path.join(tmpdir(),'sa-test-'));let child;
 async function start(){child=spawn(process.execPath,['backend/server.mjs'],{cwd:new URL('../',import.meta.url),env:{...process.env,PORT:'0',HOST:'127.0.0.1',RENDER_EXTERNAL_URL:'https://sa-demo.example',SA_STATE_FILE:path.join(temp,'state.json'),SA_MEDIA_DIR:path.join(temp,'media')},stdio:['ignore','pipe','pipe']});
 return await new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(new Error('Startup timeout')),5000);child.stdout.on('data',d=>{const match=d.toString().match(/http:\/\/127\.0\.0\.1:\d+/);if(match){clearTimeout(timer);resolve(match[0]);}});child.on('error',reject);child.on('exit',c=>{if(c)reject(new Error('Server exit '+c));});});}
 async function stop(){if(child&&!child.killed){child.kill();await once(child,'exit');}}
 try{
  let base=await start();assert.equal((await fetch(base+'/api/health')).status,200);
  const page=await (await fetch(base)).text();assert.ok(page.includes('bootstrap.js'));
  assert.equal((await fetch(base+'/models/plant-model.json')).status,200);
  const range=await fetch(base+'/models/plant-model.json',{headers:{Range:'bytes=0-15'}});assert.equal(range.status,206);assert.equal((await range.arrayBuffer()).byteLength,16);
  assert.equal((await fetch(base+'/models/plant-model.json',{headers:{Range:'bytes=999999999-'}})).status,416);
  assert.equal((await fetch(base+'/models/%2e%2e%2fbackend/config.json')).status,403);
  const seed=await (await fetch(base+'/api/state')).json();assert.equal(seed.zones.reduce((n,z)=>n+z.people,0),248);
  const vitals=await (await fetch(base+'/api/personnel/P-042/vitals')).json();assert.equal(vitals.id,'P-042');assert.equal(typeof vitals.heartRate,'number');
  const form=new FormData();form.append('video',new Blob([Buffer.from('demo-video')],{type:'video/mp4'}),'walkthrough.mp4');
  const uploaded=await fetch(base+'/api/cameras/CAM-021/video',{method:'POST',body:form});assert.equal(uploaded.status,201);const video=await uploaded.json();assert.equal((await fetch(base+video.url)).status,200);
  assert.ok((await (await fetch(base+'/api/config')).json()).cameraVideos['CAM-021']);
  assert.equal((await fetch(base+'/api/alerts/SA-2041/acknowledge',{method:'POST',headers:{Origin:'https://other.example'}})).status,403);
  assert.equal((await fetch(base+'/api/alerts/SA-2040/acknowledge',{method:'POST',headers:{Origin:'https://sa-demo.example'}})).status,200);
  assert.equal((await fetch(base+'/api/alerts/UNKNOWN/acknowledge',{method:'POST'})).status,404);
  assert.equal((await (await fetch(base+'/api/alerts/SA-2041/acknowledge',{method:'POST'})).json()).ack,true);
  await stop();base=await start();assert.equal((await (await fetch(base+'/api/state')).json()).alerts[0].ack,true);
  await fetch(base+'/api/demo/reset',{method:'POST'});assert.equal((await (await fetch(base+'/api/state')).json()).alerts[0].ack,false);
 }finally{await stop();rmSync(temp,{recursive:true,force:true});}
});
