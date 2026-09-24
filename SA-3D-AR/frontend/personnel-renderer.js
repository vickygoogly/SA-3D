import * as T from 'three';
// Every person retains a separate selectable scene node. Shared instanced parts
// render PPE and walking limbs in a handful of draw calls, including in AR.
export function createPersonnelRenderer(parent,count){
 const materials={
  suit:new T.MeshStandardMaterial({color:0x487d75,roughness:.86}),
  vest:new T.MeshStandardMaterial({color:0xc2c84f,roughness:.77}),
  helmet:new T.MeshStandardMaterial({color:0xdfc981,roughness:.47}),
  boots:new T.MeshStandardMaterial({color:0x293134,roughness:.96}),
  skin:new T.MeshStandardMaterial({color:0xc49c79,roughness:.8}),
  stripe:new T.MeshStandardMaterial({color:0xd8dfd4,roughness:.43,metalness:.15})
 };
 const parts=[];
 function add(geometry,material,position,limb=0){
  const mesh=new T.InstancedMesh(geometry,materials[material],count);mesh.castShadow=true;mesh.receiveShadow=true;mesh.frustumCulled=false;mesh.instanceMatrix.setUsage(T.DynamicDrawUsage);parent.add(mesh);parts.push({mesh,position,limb});
 }
 add(new T.BoxGeometry(.46,.58,.28),'suit',[0,1.08,0]);
 add(new T.BoxGeometry(.48,.38,.3),'vest',[0,1.18,0]);
 add(new T.BoxGeometry(.49,.07,.31),'stripe',[0,1.1,0]);
 add(new T.SphereGeometry(.16,10,8),'skin',[0,1.57,0]);
 add(new T.SphereGeometry(.205,12,8,0,Math.PI*2,0,Math.PI*.58),'helmet',[0,1.68,0]);
 add(new T.CylinderGeometry(.25,.25,.035,12),'helmet',[0,1.66,0]);
 for(const side of [-1,1]){
  add(new T.BoxGeometry(.15,.67,.18),'suit',[side*.14,.47,0],side);
  add(new T.BoxGeometry(.18,.15,.31),'boots',[side*.14,.16,.06],side);
  add(new T.BoxGeometry(.13,.55,.17),'suit',[side*.31,1.03,0],-side*2);
  add(new T.SphereGeometry(.08,6,6),'skin',[side*.31,.73,0],-side*2);
 }
 const proxyGeometry=new T.CapsuleGeometry(.36,1.15,2,6),proxyMaterial=new T.MeshBasicMaterial();
 const partMatrix=new T.Matrix4(),quaternion=new T.Quaternion(),position=new T.Vector3(),scale=new T.Vector3(1,1,1),axis=new T.Vector3(1,0,0),combined=new T.Matrix4();
 return {
  selectable(group){const proxy=new T.Mesh(proxyGeometry,proxyMaterial);proxy.position.y=1;proxy.visible=false;group.add(proxy);},
  update(records,time,visible){
   for(const {mesh} of parts)mesh.visible=visible;
   if(!visible)return;
   for(let i=0;i<records.length;i++){
    const record=records[i];record.object.updateMatrix();
    const phase=time*4+record.data.offset;
    for(const part of parts){
     position.fromArray(part.position);let angle=0;
     if(part.limb){angle=Math.sin(phase+(part.limb<0?Math.PI:0))*.3;
      const pivot=Math.abs(part.limb)===2?1.34:.8;
      const dy=position.y-pivot;position.z+=Math.sin(angle)*dy;position.y=pivot+Math.cos(angle)*dy;
     }
     quaternion.setFromAxisAngle(axis,angle);partMatrix.compose(position,quaternion,scale);combined.multiplyMatrices(record.object.matrix,partMatrix);part.mesh.setMatrixAt(i,combined);
    }
   }
   for(const {mesh} of parts)mesh.instanceMatrix.needsUpdate=true;
  }
 };
}
