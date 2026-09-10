import {test} from 'node:test';
import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {mkdtempSync,readFileSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {once} from 'node:events';
import * as THREE from '../frontend/vendor/three.module.js';
test('backend serves frontend/model, persists acknowledgment and resets demo',async()=>{
 const temp=mkdtempSync(path.join(tmpdir(),'sa-test-'));let child;
 async function start(){child=spawn(process.execPath,['backend/server.mjs'],{cwd:new URL('../',import.meta.url),env:{...process.env,PORT:'0',HOST:'127.0.0.1',RENDER_EXTERNAL_URL:'https://sa-demo.example',SA_STATE_FILE:path.join(temp,'state.json'),SA_MEDIA_DIR:path.join(temp,'media')},stdio:['ignore','pipe','pipe']});
 return await new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(new Error('Startup timeout')),5000);child.stdout.on('data',d=>{const match=d.toString().match(/http:\/\/127\.0\.0\.1:\d+/);if(match){clearTimeout(timer);resolve(match[0]);}});child.on('error',reject);child.on('exit',c=>{if(c)reject(new Error('Server exit '+c));});});}
 async function stop(){if(child&&!child.killed){child.kill();await once(child,'exit');}}
 try{
  let base=await start();assert.equal((await fetch(base+'/api/health')).status,200);
  const page=await (await fetch(base)).text();assert.ok(page.includes('operations.js'));
  const loaderSource=readFileSync(new URL('../frontend/campus-loader.js',import.meta.url),'utf8').replace("from 'three'","from '"+new URL('../frontend/vendor/three.module.js',import.meta.url).href+"'");
  const {loadCampus}=await import('data:text/javascript;base64,'+Buffer.from(loaderSource).toString('base64'));
  const campus=await loadCampus(base+'/models/campus.glb');assert.ok(campus.children.length>800);const bounds=new THREE.Box3().setFromObject(campus).getSize(new THREE.Vector3());assert.ok(bounds.x>350&&bounds.y>40&&bounds.z>170,'Entire campus geometry and transforms must survive loading');
  const range=await fetch(base+'/models/campus.glb',{headers:{Range:'bytes=0-15'}});assert.equal(range.status,206);assert.equal((await range.arrayBuffer()).byteLength,16);
  assert.equal((await fetch(base+'/models/campus.glb',{headers:{Range:'bytes=999999999-'}})).status,416);
  assert.equal((await fetch(base+'/models/%2e%2e%2fbackend/config.json')).status,403);
  const seed=await (await fetch(base+'/api/state')).json();assert.equal(seed.zones.reduce((n,z)=>n+z.people,0),248);
  const vitals=await (await fetch(base+'/api/personnel/P-042/vitals')).json();assert.equal(vitals.id,'P-042');assert.equal(typeof vitals.heartRate,'number');
  const ivms=await (await fetch(base+'/api/ivms?elapsed=20')).json();assert.equal(ivms.vehicles.length,8);assert.equal(ivms.vehicles[5].seatbelt,false);
  assert.equal((await fetch(base+'/api/ivms?elapsed=bad')).status,400);
  const ptw=await (await fetch(base+'/api/permits')).json();assert.equal(ptw.permits.length,3);
  assert.equal((await fetch(base+'/models/campus.glb',{headers:{Range:'bytes=0-11'}})).status,206);
  const configured=await (await fetch(base+'/api/config')).json();assert.ok(configured.cameraVideos['CAM-021']);assert.ok(configured.droneVideos['DRN-001']);
  assert.equal((await fetch(base+'/api/alerts/SA-2041/acknowledge',{method:'POST',headers:{Origin:'https://other.example'}})).status,403);
  assert.equal((await fetch(base+'/api/alerts/SA-2040/acknowledge',{method:'POST',headers:{Origin:'https://sa-demo.example'}})).status,200);
  assert.equal((await fetch(base+'/api/alerts/UNKNOWN/acknowledge',{method:'POST'})).status,404);
  assert.equal((await (await fetch(base+'/api/alerts/SA-2041/acknowledge',{method:'POST'})).json()).ack,true);
  await stop();base=await start();assert.equal((await (await fetch(base+'/api/state')).json()).alerts[0].ack,true);
  await fetch(base+'/api/demo/reset',{method:'POST'});assert.equal((await (await fetch(base+'/api/state')).json()).alerts[0].ack,false);
 }finally{await stop();rmSync(temp,{recursive:true,force:true});}
});
