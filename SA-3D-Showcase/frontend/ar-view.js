import * as T from 'three';
const button=document.getElementById('ar-view');
let session,renderer,scene,camera,reticle,model,hitTestSource,referenceSpace,overlay;
function message(text,kind='info'){const toast=document.getElementById('toast');toast.textContent=text;toast.dataset.kind=kind;toast.style.display='block';clearTimeout(message.timer);message.timer=setTimeout(()=>toast.style.display='none',4400);}
function makeOverlay(){overlay=document.createElement('div');overlay.className='ar-overlay';overlay.innerHTML='<div class="ar-card"><span class="ar-live">AR MODE · CAMERA ACTIVE</span><strong>Find a clear, flat surface</strong><p>Move your device slowly. When the placement marker appears, tap once to place the EPS-1 model.</p><button type="button" class="ar-exit">Exit AR</button></div>';overlay.querySelector('.ar-exit').onclick=()=>session?.end();document.body.append(overlay);}
function cleanup(){hitTestSource?.cancel?.();hitTestSource=null;referenceSpace=null;if(renderer){renderer.setAnimationLoop(null);renderer.dispose();renderer.domElement.remove();}renderer=null;scene=null;camera=null;reticle=null;model=null;session=null;overlay?.remove();overlay=null;button.disabled=false;button.classList.remove('ar-active');}
async function loadPlant(){const data=await new T.ObjectLoader().loadAsync(window.SA_CONFIG.modelUrl);data.scale.setScalar(.016);data.rotation.y=Math.PI*.22;data.visible=false;data.traverse(node=>{if(node.isMesh){node.castShadow=true;node.receiveShadow=true;}});return data;}
async function startAR(){
 if(!navigator.xr){message('AR View needs a WebXR-enabled mobile or tablet browser over HTTPS.','warn');return;}
 const available=await navigator.xr.isSessionSupported('immersive-ar').catch(()=>false);
 if(!available){message('This browser or device does not provide immersive AR. Open this secure site on a compatible Android tablet or phone.','warn');return;}
 button.disabled=true;button.classList.add('ar-active');
 try{
  session=await navigator.xr.requestSession('immersive-ar',{requiredFeatures:['hit-test'],optionalFeatures:['dom-overlay','light-estimation'],domOverlay:{root:document.body}});
  renderer=new T.WebGLRenderer({alpha:true,antialias:true,preserveDrawingBuffer:false});renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.xr.enabled=true;renderer.xr.setReferenceSpaceType('local');renderer.setClearColor(0x000000,0);renderer.domElement.className='ar-canvas';document.body.append(renderer.domElement);
  scene=new T.Scene();camera=new T.PerspectiveCamera();scene.add(new T.HemisphereLight(0xe6f6ff,0x102033,2.4));const directional=new T.DirectionalLight(0xffffff,1.6);directional.position.set(4,8,3);scene.add(directional);
  reticle=new T.Mesh(new T.RingGeometry(.12,.17,32).rotateX(-Math.PI/2),new T.MeshBasicMaterial({color:0x51dcc2,transparent:true,opacity:.94}));reticle.matrixAutoUpdate=false;reticle.visible=false;scene.add(reticle);
  model=await loadPlant();scene.add(model);const viewerSpace=await session.requestReferenceSpace('viewer');referenceSpace=await session.requestReferenceSpace('local');hitTestSource=await session.requestHitTestSource({space:viewerSpace});
  makeOverlay();session.addEventListener('end',cleanup);session.addEventListener('select',()=>{if(reticle.visible&&model&&!model.visible){model.position.setFromMatrixPosition(reticle.matrix);model.quaternion.setFromRotationMatrix(reticle.matrix);model.rotateY(Math.PI*.16);model.visible=true;overlay.querySelector('strong').textContent='EPS-1 model placed';overlay.querySelector('p').textContent='Walk around the model to inspect the spatial layout. Exit AR when you are done.';}});
  renderer.xr.setSession(session);renderer.setAnimationLoop((_,frame)=>{if(frame&&hitTestSource){const hit=frame.getHitTestResults(hitTestSource)[0];if(hit){const pose=hit.getPose(referenceSpace);if(pose){reticle.visible=true;reticle.matrix.fromArray(pose.transform.matrix);}}else reticle.visible=false;}renderer.render(scene,camera);});
 }catch(error){console.error('AR session could not start',error);message('Could not start AR. Confirm camera permission and open over HTTPS.','warn');cleanup();}
}
button?.addEventListener('click',startAR);
