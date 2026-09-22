import * as T from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {RoomEnvironment} from 'three/addons/environments/RoomEnvironment.js';
import {materials} from './materials.js';
import {createVilla} from './villa.js';
import {ROOMS,VIEWS} from './plan.js';
import {SITE,STAIR,LIFT,LAGOON,FURNITURE,insidePolygon,roomPoints} from './layout.js';
export function createEngine(host,onReady,onStats,onFloor){
 const scene=new T.Scene();scene.background=new T.Color('#d9ded9');scene.fog=new T.Fog('#d9ded9',40,95);
 const renderer=new T.WebGLRenderer({antialias:true,alpha:false,preserveDrawingBuffer:true,powerPreference:'high-performance'});
 renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.setSize(host.clientWidth,host.clientHeight);renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.12;renderer.outputColorSpace=T.SRGBColorSpace;host.appendChild(renderer.domElement);renderer.domElement.tabIndex=0;renderer.domElement.setAttribute('aria-label','3D house at metric scale. Drag to orbit or choose an eye-level room view.');
 const pmrem=new T.PMREMGenerator(renderer),env=pmrem.fromScene(new RoomEnvironment(),.04);scene.environment=env.texture;scene.environmentIntensity=.55;
 const camera=new T.PerspectiveCamera(50,host.clientWidth/host.clientHeight,.045,180);camera.position.set(15,15,-19);
 const controls=new OrbitControls(camera,renderer.domElement);controls.enableDamping=true;controls.dampingFactor=.07;controls.target.set(0,4.8,0);controls.minDistance=.4;controls.maxDistance=46;controls.maxPolarAngle=Math.PI*.49;
 const sun=new T.DirectionalLight(0xffedcf,3.2);sun.position.set(-9,18,-12);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);Object.assign(sun.shadow.camera,{left:-13,right:13,top:18,bottom:-15,near:1,far:55});sun.shadow.bias=-.00025;sun.shadow.normalBias=.028;scene.add(sun);scene.add(sun.target);const hemi=new T.HemisphereLight(0xe7f1ed,0x756451,1.65);scene.add(hemi);
 const m=materials(renderer),villa=createVilla(scene,m);
 let night=false,floor=-1,actualFloor=0,isolated=true,roof=true,cutaway=true,walk=false,destroyed=false,active=true,dimensions=false,unit='m',showPeople=true,autoTour=false,tourIndex=0,tourTimer=0,transition=null;
 let keys={},yaw=0,pitch=0,drag=false,last={x:0,y:0};const clock=new T.Clock();let frameCount=0,statTime=0;
 const insideRect=(x,z,b,pad=0)=>x>b[0]-pad&&x<b[2]+pad&&z>b[1]-pad&&z<b[3]+pad;
 function blocked(x,z,f=actualFloor){
  const margin=.14;if(x<SITE.inner[0]+margin||x>SITE.inner[2]-margin||z>SITE.inner[3]-margin||z<(f===0?-6.9:SITE.inner[1]+margin))return true;
  if(f===0&&insidePolygon(x,z,LAGOON))return true;if(insideRect(x,z,STAIR.bounds,.06)||insideRect(x,z,LIFT.bounds,.08))return true;
  if(villa.colliders.some(c=>c.floor===f&&Math.abs(x-c.x)<c.w/2+margin&&Math.abs(z-c.z)<c.d/2+margin))return true;
  return FURNITURE[f].some(o=>{const c=Math.cos(o.rot||0),s=Math.sin(o.rot||0),dx=x-o.x,dz=z-o.z,lx=c*dx-s*dz,lz=s*dx+c*dz;return Math.abs(lx)<o.w/2+margin&&Math.abs(lz)<o.d/2+margin;});
 }
 function safePoint(r){
  if(r.kind==='stair'||r.kind==='lift')return r.floor===0?[1.65,1.65,.65]:[-.43,r.floor*SITE.floorHeight+SITE.eyeHeight,4.50];
  const p=[...r.eye];if(!blocked(p[0],p[2],r.floor))return p;
  // Search the actual selected room, not an invented extra-wide camera position.
  let best=null,dist=Infinity;for(let x=r.bounds[0]+.22;x<r.bounds[2]-.15;x+=.20)for(let z=r.bounds[1]+.22;z<r.bounds[3]-.15;z+=.20){if(!insidePolygon(x,z,roomPoints(r))||blocked(x,z,r.floor))continue;const d=(x-p[0])**2+(z-p[2])**2;if(d<dist){dist=d;best=[x,r.floor*SITE.floorHeight+SITE.eyeHeight,z];}}
  return best||[-.43,r.floor*SITE.floorHeight+SITE.eyeHeight,2.9];
 }
 function applyVisibility(){
  villa.floors.forEach((g,i)=>g.visible=floor<0||!isolated||i<=floor);villa.stairs.forEach((g,i)=>g.visible=floor<0||!isolated||i<=floor);
  villa.roofs.forEach(g=>g.visible=roof&&(floor<0||(!isolated&&!cutaway)));
  villa.wallGroups.forEach((g,i)=>g.scale.y=cutaway&&floor===i?.30:1);
  villa.ceilings.forEach((g,i)=>g.visible=!(cutaway&&floor===i)&&(floor<0||i<=floor));
  villa.people.forEach(g=>g.visible=showPeople);villa.setLabels(dimensions,unit,floor);
 }
 function orient(){const e=new T.Euler().setFromQuaternion(camera.quaternion,'YXZ');yaw=e.y;pitch=e.x;}
 function goTo(p,isRoom=false){
  autoTour=false;if(p.floor!==undefined){setFloor(p.floor,false);onFloor?.(p.floor);}if(p.night)setNight(true);
  if(isRoom){cutaway=false;applyVisibility();villa.selectRoom(p);}
  const eye=isRoom&&p.bounds?safePoint(p):p.eye;
  transition={from:camera.position.clone(),to:new T.Vector3(...eye),fromTarget:controls.target.clone(),toTarget:new T.Vector3(...p.target),t:0};
 }
 function setFloor(f,move=true){floor=f;actualFloor=Math.max(0,f);if(move){walk=false;controls.enabled=true;keys={};cutaway=f>=0;villa.selectRoom(null);}applyVisibility();if(move){const y=f<0?4.8:f*SITE.floorHeight+.7;goTo({eye:f<0?[15,15,-19]:[10,y+13,-13],target:[0,y,0]});}}
 function setNight(v){night=v;scene.background.set(v?'#101c29':'#d9ded9');scene.fog.color.copy(scene.background);sun.intensity=v?.12:3.2;sun.color.set(v?0xa8c8fa:0xffedcf);hemi.intensity=v?.45:1.65;scene.environmentIntensity=v?.22:.55;renderer.toneMappingExposure=v?1.22:1.12;m.led.emissiveIntensity=v?3:1.0;villa.lights.forEach(l=>l.visible=v);villa.water.material.uniforms.sunColor.value.set(v?0x8baccd:0xfff2d4);}
 function setWalk(v){
  walk=v;controls.enabled=!v;autoTour=false;keys={};cutaway=false;applyVisibility();
  if(v){if(floor<0){setFloor(0,false);onFloor?.(0);}if(!transition&&(blocked(camera.position.x,camera.position.z)||Math.abs(camera.position.y-(actualFloor*SITE.floorHeight+SITE.eyeHeight))>.2)){const r=ROOMS.find(r=>r.id===(actualFloor===0?'stair0':`gallery${actualFloor}`));goTo(r,true);}orient();}
  else{const d=new T.Vector3();camera.getWorldDirection(d);controls.target.copy(camera.position).addScaledVector(d,3);}
 }
 function setQuality(v){
  const textures=new Set();Object.values(m).forEach(mat=>{if(mat.map)textures.add(mat.map);});textures.forEach(t=>{t.anisotropy=Math.min(renderer.capabilities.getMaxAnisotropy(),v==='high'?8:2);t.needsUpdate=true;});
  villa.vegetation.forEach((g,i)=>g.visible=v==='high'||i%3!==1);
  renderer.setPixelRatio(Math.min(devicePixelRatio,v==='high'?1.5:1));sun.shadow.mapSize.setScalar(v==='high'?2048:1024);sun.shadow.map?.dispose();sun.shadow.map=null;
  // Stair and lagoon meshes are never replaced, decimated or retessellated.
 }
 const handleKey=e=>{if(/INPUT|SELECT|TEXTAREA/.test(e.target.tagName))return;if(['KeyW','KeyA','KeyS','KeyD','ArrowUp','ArrowDown','ArrowLeft','ArrowRight','ShiftLeft'].includes(e.code)){if(walk)e.preventDefault();keys[e.code]=e.type==='keydown';}if(e.code==='Escape'){keys={};drag=false;}};
 const down=e=>{if(!walk)return;drag=true;last={x:e.clientX,y:e.clientY};renderer.domElement.setPointerCapture(e.pointerId);};
 const move=e=>{if(!walk||!drag)return;yaw-=(e.clientX-last.x)*.004;pitch=T.MathUtils.clamp(pitch-(e.clientY-last.y)*.004,-1.25,1.25);camera.quaternion.setFromEuler(new T.Euler(pitch,yaw,0,'YXZ'));last={x:e.clientX,y:e.clientY};};const up=()=>drag=false,blur=()=>{keys={};drag=false;};
 window.addEventListener('keydown',handleKey);window.addEventListener('keyup',handleKey);window.addEventListener('blur',blur);renderer.domElement.addEventListener('pointerdown',down);renderer.domElement.addEventListener('pointermove',move);renderer.domElement.addEventListener('pointerup',up);renderer.domElement.addEventListener('pointercancel',up);
 function resize(){const w=host.clientWidth,h=host.clientHeight;if(!w||!h)return;camera.aspect=w/h;camera.updateProjectionMatrix();renderer.setSize(w,h);}const observer=new ResizeObserver(resize);observer.observe(host);
 const tourList=[VIEWS[0],...['stair0','living','kitchen','guest','master','premium','terrace'].map(id=>ROOMS.find(r=>r.id===id))];
 function animate(){if(destroyed)return;requestAnimationFrame(animate);const rawDt=clock.getDelta();if(!active)return;const dt=Math.min(rawDt,.05);statTime+=rawDt;frameCount++;
  if(transition){transition.t+=dt;const t=T.MathUtils.smoothstep(transition.t,0,1);camera.position.lerpVectors(transition.from,transition.to,t);controls.target.lerpVectors(transition.fromTarget,transition.toTarget,t);camera.lookAt(controls.target);if(transition.t>=1){transition=null;orient();}}
  else if(walk){const forward=(keys.KeyW||keys.ArrowUp?1:0)-(keys.KeyS||keys.ArrowDown?1:0),side=(keys.KeyD||keys.ArrowRight?1:0)-(keys.KeyA||keys.ArrowLeft?1:0),step=(keys.ShiftLeft?2:1.25)*dt,norm=Math.hypot(forward,side)||1;const dx=(-Math.sin(yaw)*forward+Math.cos(yaw)*side)*step/norm,dz=(-Math.cos(yaw)*forward-Math.sin(yaw)*side)*step/norm;
   if(!blocked(camera.position.x+dx,camera.position.z))camera.position.x+=dx;if(!blocked(camera.position.x,camera.position.z+dz))camera.position.z+=dz;camera.position.y=actualFloor*SITE.floorHeight+SITE.eyeHeight;
  }else controls.update();
  if(autoTour){tourTimer+=dt;if(tourTimer>7){const p=tourList[tourIndex];tourIndex=(tourIndex+1)%tourList.length;tourTimer=0;if(p.floor===undefined){setFloor(-1,false);onFloor?.(-1);}goTo(p,!!p.bounds);autoTour=true;}}
  villa.water.material.uniforms.time.value+=dt*.55;villa.waterfall.material.opacity=.43+Math.sin(clock.elapsedTime*7)*.04;renderer.render(scene,camera);
  if(statTime>1.5){onStats?.({fps:Math.round(frameCount/statTime),triangles:renderer.info.render.triangles});statTime=0;frameCount=0;}
 }
 setNight(false);applyVisibility();animate();onReady?.();
 return {setFloor,setNight,setWalk,goTo,setQuality,setActive(v){active=v;keys={};if(v)resize();},selectRoom(r){villa.selectRoom(r);},setIsolated(v){isolated=v;applyVisibility();},setRoof(v){roof=v;applyVisibility();},setCutaway(v){cutaway=v;applyVisibility();},setDimensions(v,u=unit){dimensions=v;unit=u;applyVisibility();},setPeople(v){showPeople=v;applyVisibility();},setKey(k,v){keys[k]=v;},tour(v){autoTour=v;tourIndex=0;tourTimer=8;},screenshot(){renderer.render(scene,camera);const a=document.createElement('a');a.download='Lagoon-House-'+(night?'Night':'Day')+'.png';a.href=renderer.domElement.toDataURL('image/png');a.click();},dispose(){destroyed=true;observer.disconnect();window.removeEventListener('keydown',handleKey);window.removeEventListener('keyup',handleKey);window.removeEventListener('blur',blur);controls.dispose();renderer.dispose();pmrem.dispose();env.dispose();const tex=new Set(),mats=new Set();scene.traverse(o=>{o.geometry?.dispose();if(o.material&&!Array.isArray(o.material))mats.add(o.material);});mats.forEach(mat=>{for(const v of Object.values(mat))if(v?.isTexture)tex.add(v);mat.dispose();});tex.forEach(t=>t.dispose());renderer.domElement.remove();}};
}
