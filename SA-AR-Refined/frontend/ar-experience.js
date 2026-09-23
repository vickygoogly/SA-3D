import * as T from './vendor/three.module.js';
import {ARPlacement} from './ar-placement.js';

/** Dedicated mobile AR shell around the very same operational scene. */
export function createARExperience({renderer, root, floorY, environment, records, pins, pickables, layers, getAlerts, onSelect, onAlert, onEnter, onExit, onClear, getPaused, setPaused, notify}) {
  const overlay = document.createElement('div');
  overlay.id = 'ar-overlay'; overlay.hidden = true; overlay.dataset.stage = 'scanning';
  overlay.innerHTML = `
    <div id="ar-pins" hidden></div>
    <div class="ar-top"><div id="ar-status" hidden><b>TR AWARE · AR</b><span>Plant placed · simulated operations</span></div><button id="ar-exit" data-ar-ui>Exit AR</button></div>
    <p id="ar-instruction" role="status">Point at a flat surface, then tap to place.</p>
    <div id="ar-locator" role="status" hidden></div><div id="ar-message" role="status" hidden></div>
    <section id="ar-panel" data-ar-ui aria-label="AR asset details" hidden><div class="ar-panel-head"><b id="ar-panel-title">Asset details</b><button id="ar-panel-close" aria-label="Close details">×</button></div><div id="ar-selection"></div></section>
    <div id="ar-controls" data-ar-ui hidden><button id="ar-alerts">Alerts</button><button id="ar-assets">Assets</button><button id="ar-layers">Layers</button><button id="ar-motion">Pause</button><button id="ar-smaller" aria-label="Make plant smaller">−</button><button id="ar-larger" aria-label="Make plant larger">+</button><button id="ar-reposition">Reposition</button></div>`;
  document.body.append(overlay);
  const $ = s => overlay.querySelector(s), selectionHost = $('#ar-selection');
  const placement = new ARPlacement(root, {floorY});
  const scene = new T.Scene(); scene.environment = environment;
  scene.add(new T.HemisphereLight(0xddefff, 0x5c6450, 2.2));
  const light = new T.DirectionalLight(0xffedd6, 3); light.position.set(-2,4,2); scene.add(light);
  const rim = new T.DirectionalLight(0x83baff, 1.2); rim.position.set(2,1,-2); scene.add(rim);
  const camera = new T.PerspectiveCamera(50,1,.01,50);
  const reticle = new T.Mesh(new T.RingGeometry(.09,.105,48).rotateX(-Math.PI/2), new T.MeshBasicMaterial({color:0x5effd5, side:T.DoubleSide, depthTest:false}));
  reticle.matrixAutoUpdate = false; reticle.visible = false; scene.add(reticle);
  const ray = new T.Raycaster(), vector = new T.Vector3(), normal = new T.Matrix4();
  const target = new T.Vector3(), worldScale = new T.Vector3();
  let session = null, reference = null, hitSource = null, starting = false, active = false, tracking = false, focused = null, lastPins = 0, savedDOM = [], savedLayers, savedPause, savedScroll, savedShadow, savedExposure, messageTimer;
  const arPins = pins.map(p => {
    const node = document.createElement('button');
    node.className = p.rec.kind; node.textContent = p.node.textContent;
    node.setAttribute('aria-label',p.node.getAttribute('aria-label')); node.dataset.arUi = ''; node.hidden = true;
    node.onclick = () => { if (!placement.placed) return; p.rec.kind === 'alert' ? onAlert(p.rec.data.id) : onSelect(p.rec.kind,p.rec.data.id); };
    $('#ar-pins').append(node); return {rec:p.rec,node};
  });
  // DOM buttons must not also trigger plane placement or a raycast behind a panel.
  overlay.addEventListener('beforexrselect', event => { if (event.target.closest?.('[data-ar-ui]')) event.preventDefault(); });
  function stopVideo() { selectionHost.querySelectorAll('video').forEach(video => {video.pause();video.removeAttribute('src');video.load();}); }
  function closePanel(clear = true) {
    stopVideo(); $('#ar-panel').hidden = true; selectionHost.replaceChildren();
    if (clear) { focused = null; onClear(); $('#ar-locator').hidden = true; }
  }
  function openPanel(title) {
    if (!active || !placement.placed) return false;
    stopVideo(); selectionHost.replaceChildren(); $('#ar-panel-title').textContent = title; $('#ar-panel').hidden = false;
    return true;
  }
  function message(text) {
    if (!active || !placement.placed) return;
    $('#ar-message').textContent = text; $('#ar-message').hidden = false;
    clearTimeout(messageTimer); messageTimer = setTimeout(()=>$('#ar-message').hidden = true,4000);
  }
  function showStage() {
    const placed = placement.placed;
    overlay.dataset.stage = placed ? 'placed' : 'scanning';
    for (const id of ['#ar-controls','#ar-status','#ar-pins']) $(id).hidden = !placed;
    $('#ar-instruction').hidden = placed;
    if (!placed) { closePanel(); $('#ar-message').hidden = true; $('#ar-locator').hidden = true; }
    refresh();
  }
  function refresh() {
    $('#ar-alerts').textContent = 'Alerts · '+getAlerts().filter(a=>!a.ack).length;
    $('#ar-motion').textContent = getPaused() ? 'Resume' : 'Pause';
    $('#ar-motion').setAttribute('aria-pressed',String(getPaused()));
  }
  function focus(rec) {
    if (!placement.placed) return;
    focused = rec;
    message(rec.data.id+' highlighted. Move around the plant to inspect.');
  }
  function showAlerts() {
    if (!openPanel('Priority alerts')) return;
    for (const a of getAlerts().filter(a=>!a.ack)) {
      const button=document.createElement('button');button.className='ar-row';button.textContent=a.severity.toUpperCase()+' · '+a.title;
      const small=document.createElement('small');small.textContent=a.id+' · '+a.target+' · Highlight on plant';button.append(small);button.onclick=()=>onAlert(a.id);selectionHost.append(button);
    }
    if (!selectionHost.childElementCount) selectionHost.textContent='All demo events acknowledged.';
  }
  function showAssets() {
    if (!openPanel('Find an asset')) return;
    const search=document.createElement('input');search.type='search';search.placeholder='Worker, vehicle, camera, drone, PTW…';search.setAttribute('aria-label','Find AR asset');
    const list=document.createElement('div');selectionHost.append(search,list);
    function populate() {
      list.replaceChildren(); const q=search.value.trim().toLowerCase();
      for (const rec of records.values()) {
        const text=rec.data.id+' · '+rec.kind+' '+(rec.data.name||rec.data.role||rec.data.type||'');
        if (!text.toLowerCase().includes(q)) continue;
        const b=document.createElement('button');b.className='ar-row';b.textContent=text;b.onclick=()=>onSelect(rec.kind,rec.data.id);list.append(b);
      }
      if (!list.childElementCount) list.textContent='No matching assets.';
    }
    search.oninput=populate;populate();
  }
  function showLayers() {
    if (!openPanel('AR layers')) return;
    for (const [key,label] of Object.entries({worker:'Workers',camera:'CCTV cameras',drone:'Drones',vehicle:'Vehicles',permit:'PTW zones',alert:'Alerts',zone:'Area names'})) {
      const row=document.createElement('label'),input=document.createElement('input');input.type='checkbox';input.checked=layers[key];input.onchange=()=>{layers[key]=input.checked;};row.append(input,document.createTextNode(label));selectionHost.append(row);
    }
  }
  $('#ar-panel-close').onclick=()=>closePanel();
  $('#ar-alerts').onclick=showAlerts; $('#ar-assets').onclick=showAssets; $('#ar-layers').onclick=showLayers;
  $('#ar-smaller').onclick=()=>placement.setScale(placement.content.scale.x/1.2);
  $('#ar-larger').onclick=()=>placement.setScale(placement.content.scale.x*1.2);
  $('#ar-motion').onclick=()=>{setPaused(!getPaused());refresh();};
  $('#ar-reposition').onclick=()=>{placement.reposition();reticle.visible=false;showStage();};
  $('#ar-exit').onclick=async()=>{try{await session?.end();}catch{message('Unable to end AR. Use your browser’s Back control.');}};

  function scan(frame, now) {
    const pose=frame.getViewerPose(reference); tracking=!!pose;
    if (placement.placed) {reticle.visible=false;return;}
    let matrix=null;
    if (tracking && hitSource) {
      // The same hit-test source uses plane geometry, not isolated feature points.
      for (const result of frame.getHitTestResults(hitSource)) {
        const candidate=result.getPose(reference)?.transform.matrix;
        if (placement.offerHit(candidate,now)) {matrix=candidate;break;}
      }
    }
    if (!matrix) placement.offerHit(null,now);
    reticle.visible=!!matrix;
    if (matrix) reticle.matrix.fromArray(matrix);
    $('#ar-instruction').textContent=matrix ? 'Surface found. Tap to place the plant.' : 'Point at a flat surface, then tap to place.';
  }
  function selectInWorld(event) {
    if (!active || !reference || !tracking) return;
    if (!placement.placed) {
      // Input-event XRFrames cannot call getViewerPose. Use the last animation
      // frame's plane hit, with the short freshness gate in ARPlacement.place.
      if (placement.place(performance.now())) {reticle.visible=false;showStage();}
      return;
    }
    const pose=event.frame.getPose(event.inputSource.targetRaySpace,reference); if (!pose) return;
    normal.fromArray(pose.transform.matrix);ray.ray.origin.setFromMatrixPosition(normal);ray.ray.direction.set(0,0,-1).transformDirection(normal);
    root.updateWorldMatrix(true,true);
    const hit=ray.intersectObjects(pickables.filter(o=>layers[o.userData.key?.split(':')[0]]),false)[0];
    if (hit) {const [kind,id]=hit.object.userData.key.split(':');onSelect(kind,id);return;}
    // At table scale a worker is only millimetres tall. A small, bounded hit area
    // makes every worker selectable without changing its displayed geometry.
    let best=null,bestDistance=Infinity;
    for (const rec of records.values()) {
      if (!layers[rec.kind] || !['worker','vehicle','camera','drone','permit'].includes(rec.kind)) continue;
      rec.object.getWorldPosition(target);rec.object.getWorldScale(worldScale);
      target.y+=(rec.kind==='camera'?5.5:rec.kind==='drone'?0:1)*worldScale.y;
      const along=target.clone().sub(ray.ray.origin).dot(ray.ray.direction);
      if (along<0) continue;
      const distance=ray.ray.distanceToPoint(target),radius=rec.kind==='worker'?.007:.011;
      if (distance<radius && distance<bestDistance) {best=rec;bestDistance=distance;}
    }
    if(best) onSelect(best.kind,best.data.id);
  }
  function projectPins(now) {
    if (!placement.placed || !tracking) {arPins.forEach(p=>p.node.hidden=true);$('#ar-locator').hidden=true;return;}
    const width=overlay.clientWidth,height=overlay.clientHeight;
    const eye=renderer.xr.getCamera().cameras[0]||camera;
    const activeAlerts=new Set(getAlerts().filter(a=>!a.ack).map(a=>a.id));
    const priorities={alert:0,vehicle:1,drone:2,permit:3,camera:4,zone:5};
    const occupied=[];
    // Keep labels stable in world space and avoid a wall of overlapping badges.
    for (const p of [...arPins].sort((a,b)=>(a.rec.object===focused?.object?-1:priorities[a.rec.kind])-(b.rec.object===focused?.object?-1:priorities[b.rec.kind]))) {
      const {rec,node}=p;node.hidden=true;
      if (!layers[rec.kind] || (rec.kind==='alert'&&!activeAlerts.has(rec.data.id))) continue;
      rec.object.getWorldPosition(vector);rec.object.getWorldScale(worldScale);
      vector.y+=(rec.kind==='camera'?6:rec.kind==='vehicle'?5:rec.kind==='alert'?8:2)*worldScale.y;
      vector.project(eye);
      if (vector.z < -1 || vector.z > 1 || Math.abs(vector.x)>.94 || Math.abs(vector.y)>.83) continue;
      const x=(vector.x+1)*width/2,y=(1-vector.y)*height/2;
      const w=Math.max(45,node.textContent.length*6+18),h=34;
      const rect={x:x-w/2,y:y-h,w,h};
      if (rec.object!==focused?.object && occupied.some(r=>rect.x<r.x+r.w+5&&rect.x+rect.w+5>r.x&&rect.y<r.y+r.h+5&&rect.y+rect.h+5>r.y)) continue;
      node.style.left=x+'px';node.style.top=y+'px';node.hidden=false;node.classList.toggle('ar-selected',!!focused&&rec.object===focused.object);occupied.push(rect);
    }
    if (focused) {
      focused.object.getWorldPosition(vector);vector.project(eye);
      const outside=Math.abs(vector.x)>.86||Math.abs(vector.y)>.75||vector.z>1||vector.z< -1;
      $('#ar-locator').hidden=!outside;
      if(outside) $('#ar-locator').textContent=focused.data.id+' · '+(vector.z>1||vector.z< -1?'Turn toward the plant':Math.abs(vector.x)>.86?(vector.x<0?'Look left ←':'Look right →'):(vector.y>0?'Look up ↑':'Look down ↓'));
    }
  }
  function cleanup() {
    if (!active && !session) return;
    try{hitSource?.cancel();}catch{/* Session end invalidates hit sources on some runtimes. */}
    hitSource=null;reference=null;session=null;tracking=false;starting=false;
    closePanel();clearTimeout(messageTimer);reticle.visible=false;
    placement.end();overlay.hidden=true;overlay.dataset.stage='scanning';
    document.body.classList.remove('ar-active');
    savedDOM.forEach(({node,inert,aria})=>{node.inert=inert;if(aria===null)node.removeAttribute('aria-hidden');else node.setAttribute('aria-hidden',aria);});savedDOM=[];
    if(savedLayers) Object.assign(layers,savedLayers);
    if(savedPause!==undefined) setPaused(savedPause);
    if(savedShadow!==undefined) renderer.shadowMap.enabled=savedShadow;
    if(savedExposure!==undefined) renderer.toneMappingExposure=savedExposure;
    active=false;renderer.xr.enabled=false;
    onExit();
    requestAnimationFrame(()=>{if(savedScroll)window.scrollTo(...savedScroll);});
  }
  async function start() {
    if (active||starting) return;
    if (!window.isSecureContext || !navigator.xr) {notify('AR needs HTTPS and a browser/device with WebXR surface placement.');return;}
    starting=true;
    try {
      // Fail cleanly if the compact interactive overlay is unavailable.
      // Falling back to document.body would recreate the reported obstruction.
      session=await navigator.xr.requestSession('immersive-ar',{requiredFeatures:['hit-test','dom-overlay'],domOverlay:{root:overlay}});
      const currentSession=session;
      session.addEventListener('end',()=>queueMicrotask(()=>{if(session===currentSession)cleanup();}),{once:true});
      savedLayers={...layers};for(const key of Object.keys(layers))layers[key]=true;
      savedPause=getPaused();savedScroll=[window.scrollX,window.scrollY];savedShadow=renderer.shadowMap.enabled;savedExposure=renderer.toneMappingExposure;
      savedDOM=[...document.querySelectorAll('body>header,body>.rail,body>main,body>#feed-dialog')].map(node=>({node,inert:node.inert,aria:node.getAttribute('aria-hidden')}));
      savedDOM.forEach(({node})=>{node.inert=true;node.setAttribute('aria-hidden','true');});
      active=true;document.body.classList.add('ar-active');overlay.hidden=false;
      onEnter();setPaused(false);placement.begin(scene);showStage();
      renderer.shadowMap.enabled=false;renderer.toneMappingExposure=1.25;
      renderer.xr.enabled=true;renderer.xr.setReferenceSpaceType('local');
      await renderer.xr.setSession(currentSession);
      if(session!==currentSession)return;
      reference=renderer.xr.getReferenceSpace();
      const viewer=await currentSession.requestReferenceSpace('viewer');
      if(session!==currentSession)return;
      const source=await currentSession.requestHitTestSource({space:viewer,entityTypes:['plane']});
      if(session!==currentSession){try{source.cancel();}catch{}return;}
      hitSource=source;currentSession.addEventListener('select',selectInWorld);
      currentSession.addEventListener('visibilitychange',()=>{if(currentSession.visibilityState!=='visible'){placement.offerHit(null,performance.now());reticle.visible=false;tracking=false;}});
      starting=false;
    } catch(error) {
      console.warn('AR session could not start:',error);
      const ending=session;
      if(ending){try{await ending.end();}catch{}cleanup();}else starting=false;
      notify('AR could not start. Check camera permission and use HTTPS on a device supporting WebXR hit-test and DOM overlay.');
    }
  }
  return {
    get active(){return active;},get placed(){return placement.placed;},selectionHost,
    start,openPanel,closePanel,focus,message,refresh,
    render(now,frame) {
      if(!active)return;
      if(frame&&reference) {
        scan(frame,now);
        $('#ar-status span').textContent=tracking?'Plant placed · simulated operations':'Tracking paused · move the device slowly';
        placement.anchor.visible=placement.placed&&tracking;
        renderer.xr.updateCamera(camera);
        scene.updateMatrixWorld(true);
        if(now-lastPins>50){projectPins(now);lastPins=now;}
      }
      renderer.render(scene,camera);
    }
  };
}
