import * as T from 'three';

// A fully geometric environment: procedural sky, a moving water surface and
// reflections rendered from the actual plant. No backdrop photographs or grids.
export function createPlantEnvironment(renderer,scene){
 const time={value:0},dusk={value:0};
 const skyMaterial=new T.ShaderMaterial({side:T.BackSide,depthWrite:false,uniforms:{uDusk:dusk},vertexShader:`
  varying vec3 vSky;void main(){vSky=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}
 `,fragmentShader:`
  uniform float uDusk;varying vec3 vSky;
  void main(){vec3 direction=normalize(vSky);float h=max(direction.y,0.);
   vec3 horizon=mix(vec3(.43,.52,.57),vec3(.16,.19,.25),uDusk);
   vec3 zenith=mix(vec3(.075,.17,.27),vec3(.012,.025,.065),uDusk);
   vec3 c=mix(horizon,zenith,pow(h,.45));
   float sun=max(dot(direction,normalize(vec3(-.65,.75,.4))),0.);
   c+=mix(vec3(.45,.33,.18),vec3(.17,.08,.035),uDusk)*pow(sun,24.);
   c+=vec3(.75,.66,.48)*pow(sun,1800.)*(1.-uDusk*.8);
   gl_FragColor=vec4(c,1.);
   #include <tonemapping_fragment>
   #include <colorspace_fragment>
  }
 `});
 const sky=new T.Mesh(new T.SphereGeometry(1100,32,16),skyMaterial);sky.name='Procedural sky';sky.frustumCulled=false;scene.add(sky);
 scene.background=new T.Color(0x8c9eaa);scene.fog=new T.Fog(0x8c9eaa,330,950);
 const hemi=new T.HemisphereLight(0xc5ddf1,0x575247,1.35);scene.add(hemi);
 const sun=new T.DirectionalLight(0xffefd7,3.2);sun.position.set(-95,135,65);sun.castShadow=true;
 sun.shadow.mapSize.set(2048,2048);Object.assign(sun.shadow.camera,{left:-140,right:140,top:118,bottom:-118,near:1,far:360});sun.shadow.bias=-.00015;sun.shadow.normalBias=.055;scene.add(sun);
 const fill=new T.DirectionalLight(0xb7d8ed,.45);fill.position.set(100,55,-100);scene.add(fill);
 const practicals=[];
 for(const [x,z]of [[-72,-49],[61,-49],[-73,45],[62,45],[0,13],[49,9]]){
  const light=new T.PointLight(0xffce86,25,30,2);light.position.set(x,8,z);scene.add(light);practicals.push(light);
 }
 // Capture the procedural sky once per lighting mode for rough metal reflections.
 const pmrem=new T.PMREMGenerator(renderer),environmentScene=new T.Scene();
 const environmentSky=new T.Mesh(new T.SphereGeometry(100,32,16),skyMaterial);environmentScene.add(environmentSky);
 const ground=new T.Mesh(new T.PlaneGeometry(300,300),new T.MeshBasicMaterial({color:0x454c4e,side:T.DoubleSide}));ground.rotation.x=-Math.PI/2;ground.position.y=-15;environmentScene.add(ground);
 let environmentTarget;const environmentCache=new Map();
 function captureEnvironment(){const key=dusk.value;if(!environmentCache.has(key))environmentCache.set(key,pmrem.fromScene(environmentScene,.035,.1,200));environmentTarget=environmentCache.get(key);scene.environment=environmentTarget.texture;}
 captureEnvironment();

 const reflectionTarget=new T.WebGLRenderTarget(512,512,{type:T.HalfFloatType,depthBuffer:true});
 reflectionTarget.texture.name='Actual plant reflection';
 const reflectionCamera=new T.PerspectiveCamera(),textureMatrix=new T.Matrix4();
 const reflectionUniform={value:reflectionTarget.texture},matrixUniform={value:textureMatrix};
 const waterMaterial=new T.MeshPhysicalMaterial({color:0x26545f,metalness:0,roughness:.22,ior:1.333,clearcoat:1,clearcoatRoughness:.12,envMapIntensity:.55});
 waterMaterial.name='Procedural sea water';
 waterMaterial.customProgramCacheKey=()=> 'tr-aware-water-3';
 const waveGLSL=`
  uniform float uWaterTime;
  // Independent directions and wavelengths avoid the old parallel stripe pattern.
  float waveHeight(vec2 p){return .13*sin(dot(p,vec2(.11,.067))+uWaterTime*.46)+.08*sin(dot(p,vec2(-.074,.16))-uWaterTime*.59)+.045*sin(dot(p,vec2(.29,-.18))+uWaterTime*.7);}
 `;
 waterMaterial.onBeforeCompile=shader=>{
  Object.assign(shader.uniforms,{uWaterTime:time,uPlantReflection:reflectionUniform,uReflectionMatrix:matrixUniform});
  shader.vertexShader=waveGLSL+'varying vec2 vWaterXZ;varying vec4 vReflection;uniform mat4 uReflectionMatrix;\n'+shader.vertexShader;
  shader.vertexShader=shader.vertexShader.replace('#include <beginnormal_vertex>',`#include <beginnormal_vertex>
   float epsilon=.15;vec2 p=position.xz;
   float dx=(waveHeight(p+vec2(epsilon,0))-waveHeight(p-vec2(epsilon,0)))/(2.*epsilon);
   float dz=(waveHeight(p+vec2(0,epsilon))-waveHeight(p-vec2(0,epsilon)))/(2.*epsilon);
   objectNormal=normalize(vec3(-dx,1.,-dz));
  `).replace('#include <begin_vertex>',`#include <begin_vertex>
   transformed.y+=waveHeight(position.xz);vWaterXZ=position.xz;
   vReflection=uReflectionMatrix*modelMatrix*vec4(transformed,1.);
  `);
  shader.fragmentShader=`uniform float uWaterTime;uniform sampler2D uPlantReflection;varying vec2 vWaterXZ;varying vec4 vReflection;
   float seaHash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
   float seaNoise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(seaHash(i),seaHash(i+vec2(1,0)),f.x),mix(seaHash(i+vec2(0,1)),seaHash(i+vec2(1,1)),f.x),f.y);}
  `+shader.fragmentShader;
  shader.fragmentShader=shader.fragmentShader.replace('#include <normal_fragment_maps>',`#include <normal_fragment_maps>
   vec2 drift=vec2(uWaterTime*.09,-uWaterTime*.035);
   float rippleFade=1.-smoothstep(.35,1.8,length(fwidth(vWaterXZ)));
   vec2 ripple=(vec2(seaNoise(vWaterXZ*.8+drift),seaNoise(vWaterXZ*.83-drift+vec2(37.2,81.7)))-.5)*.075*rippleFade;
   vec3 rippleView=mat3(viewMatrix)*vec3(ripple.x,0.,ripple.y);normal=normalize(normal+rippleView);
  `);
  shader.fragmentShader=shader.fragmentShader.replace('#include <opaque_fragment>',`
   vec2 reflectionUV=vReflection.xy/vReflection.w+ripple*.022;
   vec3 reflected=texture2D(uPlantReflection,clamp(reflectionUV,vec2(.002),vec2(.998))).rgb;
   float fresnel=.035+.72*pow(1.-clamp(dot(normal,normalize(vViewPosition)),0.,1.),4.);
   outgoingLight=mix(outgoingLight,reflected,clamp(fresnel,.07,.8));
   #include <opaque_fragment>
  `);
 };
 const geometry=new T.PlaneGeometry(1800,1800,180,180);geometry.rotateX(-Math.PI/2);
 const water=new T.Mesh(geometry,waterMaterial);water.position.y=-4.8;water.name='Animated sea with plant reflections';water.receiveShadow=true;scene.add(water);
 const reflectedPosition=new T.Vector3(),forward=new T.Vector3(),up=new T.Vector3(),target=new T.Vector3(),plane=new T.Plane(new T.Vector3(0,1,0),4.79);
 const bias=new T.Matrix4().set(.5,0,0,.5,0,.5,0,.5,0,0,.5,.5,0,0,0,1);
 let lastReflection=-Infinity,lastTime=-1,isDusk=false;const lastCameraMatrix=new T.Matrix4(),lastProjection=new T.Matrix4();
 function reflect(camera,now){
  // Cap reflection refresh to 8 Hz; keep full main-view animation frequency.
  if(now-lastReflection<125)return;
  camera.updateMatrixWorld();
  if(lastReflection!==-Infinity&&lastTime===time.value&&lastCameraMatrix.equals(camera.matrixWorld)&&lastProjection.equals(camera.projectionMatrix))return;
  lastReflection=now;lastTime=time.value;lastCameraMatrix.copy(camera.matrixWorld);lastProjection.copy(camera.projectionMatrix);
  reflectedPosition.copy(camera.position);reflectedPosition.y=2*water.position.y-camera.position.y;
  camera.getWorldDirection(forward);forward.y*=-1;up.set(0,1,0).applyQuaternion(camera.quaternion);up.y*=-1;
  reflectionCamera.position.copy(reflectedPosition);reflectionCamera.up.copy(up);reflectionCamera.lookAt(target.copy(reflectedPosition).add(forward));
  reflectionCamera.projectionMatrix.copy(camera.projectionMatrix);reflectionCamera.projectionMatrixInverse.copy(camera.projectionMatrixInverse);reflectionCamera.updateMatrixWorld();
  textureMatrix.copy(bias).multiply(reflectionCamera.projectionMatrix).multiply(reflectionCamera.matrixWorldInverse);
  const previousTarget=renderer.getRenderTarget(),previousClipping=renderer.clippingPlanes,previousShadow=renderer.shadowMap.autoUpdate,previousXR=renderer.xr.enabled;
  water.visible=false;renderer.xr.enabled=false;renderer.shadowMap.autoUpdate=false;renderer.clippingPlanes=[plane];
  try{renderer.setRenderTarget(reflectionTarget);renderer.clear();renderer.render(scene,reflectionCamera);}
  finally{renderer.setRenderTarget(previousTarget);renderer.clippingPlanes=previousClipping;renderer.shadowMap.autoUpdate=previousShadow;renderer.xr.enabled=previousXR;water.visible=true;}
 }
 return {
  update(elapsed,now,camera){time.value=elapsed;reflect(camera,now);},
  setDusk(value){
   isDusk=value;dusk.value=value?1:0;hemi.intensity=value?.7:1.35;sun.intensity=value?.85:3.2;fill.intensity=value?.55:.45;
   sun.color.set(value?0xffc78d:0xffefd7);renderer.toneMappingExposure=value?1.3:1.08;
   scene.fog.color.set(value?0x1c293e:0x8c9eaa);scene.background.copy(scene.fog.color);
   practicals.forEach(light=>light.intensity=value?260:25);captureEnvironment();lastReflection=-Infinity;
  },
  get isDusk(){return isDusk;}
 };
}
