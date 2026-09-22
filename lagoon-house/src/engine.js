import * as T from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {RoomEnvironment} from 'three/addons/environments/RoomEnvironment.js';
import {materials} from './materials';
import {createVilla} from './villa';
import {ROOMS,VIEWS} from './plan';
export function createEngine(host,onReady,onStats,onFloor){
 const scene=new T.Scene();scene.background=new T.Color('#d9ded9');scene.fog=new T.Fog('#d9ded9',36,85);
 const renderer=new T.WebGLRenderer({antialias:true,alpha:false,preserveDrawingBuffer:true,powerPreference:'high-performance'});renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.setSize(host.clientWidth,host.clientHeight);renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.12;renderer.outputColorSpace=T.SRGBColorSpace;host.appendChild(renderer.domElement);renderer.domElement.setAttribute('aria-label','Interactive 3D villa. Drag to rotate. Select Walk to explore with WASD.');renderer.domElement.tabIndex=0;
 const pmrem=new T.PMREMGenerator(renderer);const env=pmrem.fromScene(new RoomEnvironment(),.04);scene.environment=env.texture;scene.environmentIntensity=.55;
 const camera=new T.PerspectiveCamera(45,host.clientWidth/host.clientHeight,.045,180);camera.position.set(16,14,-19);
 const controls=new OrbitControls(camera,renderer.domElement);controls.enableDamping=true;controls.dampingFactor=.07;controls.target.set(0,5.1,0);controls.minDistance=.6;controls.maxDistance=46;controls.maxPolarAngle=Math.PI*.49;
 const sun=new T.DirectionalLight(0xffedcf,3.2);sun.position.set(-9,18,-12);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);Object.assign(sun.shadow.camera,{left:-13,right:13,top:18,bottom:-15,near:1,far:55});sun.shadow.bias=-.00025;sun.shadow.normalBias=.028;scene.add(sun);scene.add(sun.target);
 const hemi=new T.HemisphereLight(0xe7f1ed,0x756451,1.65);scene.add(hemi);
 const m=materials(renderer);const villa=createVilla(scene,m);let night=false,floor=-1,isolated=true,roof=true,cutaway=false,walk=false,destroyed=false,autoTour=false,tourIndex=0,tourTimer=0,transition=null;
 let keys={},yaw=0,pitch=0,drag=false,last={x:0,y:0};let actualFloor=0;const clock=new T.Clock();let count=0,sum=0,lastStats=0;
 function applyVisibility(){villa.floors.forEach((g,i)=>g.visible=floor<0||!isolated||i<=floor);villa.stairs.forEach((g,i)=>g.visible=floor<0||!isolated||i<=floor);villa.roofs.forEach(g=>g.visible=roof&&(floor<0||!isolated||floor===3));villa.slabs.forEach(({floor:f,mesh})=>mesh.visible=!(cutaway&&f>Math.max(0,floor)));}
 function setFloor(f,move=true){floor=f;actualFloor=Math.max(0,f);applyVisibility();if(move){const yy=f<0?5.1:f*3.3+.85;goTo({eye:f<0?[16,14,-19]:[12,yy+13,-15],target:[0,yy,0]},false);}}
 function orient(){const e=new T.Euler().setFromQuaternion(camera.quaternion,'YXZ');yaw=e.y;pitch=e.x;}
 function goTo(p,room=false){autoTour=false;if(p.floor!==undefined){setFloor(p.floor,false);onFloor?.(p.floor);}if(p.night)setNight(true);transition={from:camera.position.clone(),to:new T.Vector3(...p.eye),fromTarget:controls.target.clone(),toTarget:new T.Vector3(...p.target),t:0};if(room){actualFloor=p.floor;}}
 function setNight(v){night=v;scene.background.set(v?'#101c29':'#d9ded9');scene.fog.color.copy(scene.background);sun.intensity=v?.12:3.2;sun.color.set(v?0xa8c8fa:0xffedcf);hemi.intensity=v?.45:1.65;scene.environmentIntensity=v?.22:.55;renderer.toneMappingExposure=v?1.22:1.12;m.led.emissiveIntensity=v?3:1.0;villa.lights.forEach(l=>l.visible=v);villa.water.material.uniforms.sunColor.value.set(v?0x8baccd:0xfff2d4);}
 setNight(false);
 function setWalk(v){walk=v;controls.enabled=!v;autoTour=false;if(v){if(floor<0){setFloor(0,false);onFloor?.(0);goTo(ROOMS[1],true);}else if((actualFloor===0&&camera.position.x>1.27&&camera.position.z<.88)||camera.position.y>actualFloor*3.3+2.8){goTo(actualFloor===0?ROOMS[1]:ROOMS.find(r=>r.floor===actualFloor),true);}camera.position.x=T.MathUtils.clamp(camera.position.x,-4.05,4.35);orient();}else{keys={};const d=new T.Vector3();camera.getWorldDirection(d);controls.target.copy(camera.position).addScaledVector(d,3);}}
 const furniture=[{floor:0,x:-2.7,z:-3,w:1.98,d:4.8},{floor:0,x:-.1,z:-3,w:1.98,d:4.8},{floor:1,x:-2.85,z:-3.82,w:1.67,d:2.18},{floor:1,x:1.05,z:-1.35,w:1.65,d:.94},{floor:2,x:-2.65,z:3.78,w:1.92,d:2.18},{floor:2,x:2.74,z:-4.27,w:1.67,d:2.18},{floor:3,x:-2.65,z:-3.95,w:1.87,d:2.18}];
 function blocked(x,z){if(x<-4.08||x>4.43||z>5.58||z<(actualFloor===0?-6.65:-5.48))return true;if(actualFloor===0&&x>1.27&&x<4.3&&z<.88&&z>-5.8)return true;return [...villa.colliders,...furniture].some(c=>c.floor===actualFloor&&Math.abs(x-c.x)<c.w/2+.13&&Math.abs(z-c.z)<c.d/2+.13);}
 const handleKey=e=>{if(/INPUT|SELECT|TEXTAREA/.test(e.target.tagName))return;if(['KeyW','KeyA','KeyS','KeyD','ArrowUp','ArrowDown','ArrowLeft','ArrowRight','ShiftLeft'].includes(e.code)){if(walk)e.preventDefault();keys[e.code]=e.type==='keydown';}if(e.code==='Escape'){keys={};drag=false;}};
 const down=e=>{if(!walk)return;drag=true;last={x:e.clientX,y:e.clientY};renderer.domElement.setPointerCapture(e.pointerId);};
 const move=e=>{if(!walk||!drag)return;yaw-=(e.clientX-last.x)*.004;pitch=T.MathUtils.clamp(pitch-(e.clientY-last.y)*.004,-1.35,1.35);camera.quaternion.setFromEuler(new T.Euler(pitch,yaw,0,'YXZ'));last={x:e.clientX,y:e.clientY};};
 const up=()=>drag=false;const blur=()=>{keys={};drag=false;};
 window.addEventListener('keydown',handleKey);window.addEventListener('keyup',handleKey);window.addEventListener('blur',blur);renderer.domElement.addEventListener('pointerdown',down);renderer.domElement.addEventListener('pointermove',move);renderer.domElement.addEventListener('pointerup',up);
 function resize(){const w=host.clientWidth,h=host.clientHeight;if(!w||!h)return;camera.aspect=w/h;camera.updateProjectionMatrix();renderer.setSize(w,h);}const observer=new ResizeObserver(resize);observer.observe(host);
 function animate(){if(destroyed)return;requestAnimationFrame(animate);const rawDt=clock.getDelta();const dt=Math.min(rawDt,.05);sum+=rawDt;count++;
  if(transition){transition.t+=dt*.9;const t=T.MathUtils.smoothstep(transition.t,0,1);camera.position.lerpVectors(transition.from,transition.to,t);controls.target.lerpVectors(transition.fromTarget,transition.toTarget,t);camera.lookAt(controls.target);if(transition.t>=1){transition=null;orient();}}
  else if(walk){const forward=(keys.KeyW||keys.ArrowUp?1:0)-(keys.KeyS||keys.ArrowDown?1:0),side=(keys.KeyD||keys.ArrowRight?1:0)-(keys.KeyA||keys.ArrowLeft?1:0);const step=(keys.ShiftLeft?2.3:1.35)*dt;const norm=Math.hypot(forward,side)||1;const dx=(-Math.sin(yaw)*forward+Math.cos(yaw)*side)*step/norm,dz=(-Math.cos(yaw)*forward-Math.sin(yaw)*side)*step/norm;
   if(!blocked(camera.position.x+dx,camera.position.z))camera.position.x+=dx;if(!blocked(camera.position.x,camera.position.z+dz))camera.position.z+=dz;
   // Stay at eye level on the selected floor. A protected atrium prevents stepping into its void.
   const inVoid=camera.position.x>.15&&camera.position.x<4.02&&camera.position.z>1.74&&camera.position.z<5.53;
   if(inVoid&&actualFloor>0&&(dx||dz)){camera.position.x-=dx;camera.position.z-=dz;}
   camera.position.y=T.MathUtils.damp(camera.position.y,actualFloor*3.3+1.65,8,dt);
  }else controls.update();
  if(autoTour){tourTimer+=dt;if(tourTimer>5){tourIndex=(tourIndex+1)%tourList.length;tourTimer=0;const p=tourList[tourIndex];goTo(p,true);autoTour=true;}}
  villa.water.material.uniforms.time.value+=dt*.55;villa.waterfall.material.opacity=.43+Math.sin(clock.elapsedTime*7)*.04;
  renderer.render(scene,camera);
  if(sum-lastStats>1.5){onStats?.({fps:Math.round(count/sum),triangles:renderer.info.render.triangles,calls:renderer.info.render.calls});lastStats=sum;}
 }
 const tourList=[VIEWS[0],ROOMS[0],ROOMS[1],ROOMS[3],ROOMS[5],ROOMS[7],ROOMS[12],ROOMS[14],ROOMS[17],ROOMS[21]];
 animate();onReady?.();
 return {setFloor,setNight,setWalk,goTo,setIsolated(v){isolated=v;applyVisibility();},setRoof(v){roof=v;applyVisibility();},setCutaway(v){cutaway=v;applyVisibility();},setQuality(v){renderer.setPixelRatio(Math.min(devicePixelRatio,v==='high'?1.75:1));sun.shadow.mapSize.setScalar(v==='high'?2048:1024);sun.shadow.map?.dispose();sun.shadow.map=null;villa.vegetation.forEach((g,i)=>g.visible=v==='high'||i%3!==1);},setKey(k,v){keys[k]=v;},tour(v){autoTour=v;tourIndex=0;tourTimer=5;},screenshot(){renderer.render(scene,camera);const a=document.createElement('a');a.download='Lagoon-House-'+(night?'Night':'Day')+'.png';a.href=renderer.domElement.toDataURL('image/png');a.click();},reset(){setWalk(false);setFloor(-1);},dispose(){destroyed=true;observer.disconnect();window.removeEventListener('keydown',handleKey);window.removeEventListener('keyup',handleKey);window.removeEventListener('blur',blur);controls.dispose();renderer.dispose();pmrem.dispose();env.dispose();scene.traverse(o=>{if(o.geometry)o.geometry.dispose();});Object.values(m).forEach(mat=>mat.dispose());renderer.domElement.remove();}};
}
