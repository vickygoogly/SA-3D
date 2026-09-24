// Physically based finishes with subtle procedural grain. Coordinates are local
// to the plant, so the finish does not crawl or change scale during AR placement.
export function refinePlantMaterials(root){
 const done=new Set();
 root.traverse(object=>{
  const material=object.material;if(!material||done.has(material))return;done.add(material);
  const finish=material.userData.finish||material.name;
  if(['lamp','glass','red','blue','green'].includes(finish))return;
  const concrete=['deck','concrete','asphalt'].includes(finish);
  const metal=['steel','insulation','tank','zinc'].includes(finish);
  material.envMapIntensity=metal?.85:.55;
  material.customProgramCacheKey=()=>`tr-aware-finish-2-${finish}`;
  material.onBeforeCompile=shader=>{
   shader.vertexShader='varying vec3 vFinishPosition;\n'+shader.vertexShader;
   shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nvFinishPosition=position;');
   shader.fragmentShader=`varying vec3 vFinishPosition;
    float finishHash(vec3 p){p=fract(p*.1031);p+=dot(p,p.yzx+33.33);return fract((p.x+p.y)*p.z);}
    float finishNoise(vec3 p){vec3 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(mix(finishHash(i),finishHash(i+vec3(1,0,0)),f.x),mix(finishHash(i+vec3(0,1,0)),finishHash(i+vec3(1,1,0)),f.x),f.y),mix(mix(finishHash(i+vec3(0,0,1)),finishHash(i+vec3(1,0,1)),f.x),mix(finishHash(i+vec3(0,1,1)),finishHash(i+vec3(1,1,1)),f.x),f.y),f.z);}
    `+shader.fragmentShader;
   const grainScale=concrete?9:35;
   shader.fragmentShader=shader.fragmentShader.replace('#include <color_fragment>',`#include <color_fragment>
    float macroGrain=finishNoise(vFinishPosition*.6);
    float detailFade=1.-smoothstep(.25,1.,length(fwidth(vFinishPosition*${grainScale.toFixed(1)})));
    float microGrain=(finishNoise(vFinishPosition*${grainScale.toFixed(1)})-.5)*detailFade;
    diffuseColor.rgb*= ${concrete?'(.88 + .16*macroGrain + .16*microGrain)':metal?'(.97 + .055*macroGrain + .025*microGrain)':'(.94 + .07*macroGrain)'};
    ${finish==='insulation'?`float seamDist=abs(fract(vFinishPosition.y*.65)-.5);float seamWidth=max(fwidth(vFinishPosition.y*.65),.008);float panelSeam=1.-smoothstep(seamWidth,seamWidth*2.,seamDist);diffuseColor.rgb*=1.-panelSeam*.08;`:''}
   `);
   shader.fragmentShader=shader.fragmentShader.replace('#include <roughnessmap_fragment>',`#include <roughnessmap_fragment>
    roughnessFactor=clamp(roughnessFactor+${concrete?'.08':'.045'}*(macroGrain-.5)+microGrain*.04,.18,1.);
   `);
  };
  material.needsUpdate=true;
 });
 return done.size;
}
