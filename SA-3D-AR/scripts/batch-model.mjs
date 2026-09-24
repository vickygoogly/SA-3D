import * as T from '../frontend/vendor/three.module.js';
// Combine static geometry by finish and spatial tile. Keep the editable source
// separate so collision tests still inspect individual parts rather than a
// giant batch AABB spanning a road. No geometry is simplified or discarded.
export function batchStaticModel(root){
 root.updateMatrixWorld(true);const buckets=new Map();let sourceMeshes=0,triangles=0;
 root.traverse(o=>{if(!o.isMesh)return;sourceMeshes++;
  const p=o.getWorldPosition(new T.Vector3());
  const key=[o.material.uuid,Math.floor(p.x/24),Math.floor(p.y/16),Math.floor(p.z/24)].join(':');
  if(!buckets.has(key))buckets.set(key,{material:o.material,parts:[]});
  const g=o.geometry.clone().applyMatrix4(o.matrixWorld);buckets.get(key).parts.push(g);triangles+=(g.index?.count||g.attributes.position.count)/3;
 });
 const result=new T.Group();result.name=root.name;result.userData={...root.userData,sourceMeshes,triangles,batches:buckets.size};
 for(const [key,{material,parts}] of buckets){
  const counts=parts.map(g=>g.attributes.position.count),vertices=counts.reduce((a,b)=>a+b,0);
  const positions=new Float32Array(vertices*3),normals=new Float32Array(vertices*3),uvs=new Float32Array(vertices*2),indices=[];let vertex=0;
  for(const g of parts){positions.set(g.attributes.position.array,vertex*3);normals.set(g.attributes.normal.array,vertex*3);if(g.attributes.uv)uvs.set(g.attributes.uv.array,vertex*2);
   for(let i=0;i<(g.index?.count||g.attributes.position.count);i++)indices.push(vertex+(g.index?g.index.getX(i):i));vertex+=g.attributes.position.count;g.dispose();
  }
  const geometry=new T.BufferGeometry();geometry.setAttribute('position',new T.BufferAttribute(positions,3));geometry.setAttribute('normal',new T.BufferAttribute(normals,3));geometry.setAttribute('uv',new T.BufferAttribute(uvs,2));geometry.setIndex(indices);geometry.computeBoundingSphere();
  const mesh=new T.Mesh(geometry,material);mesh.name=material.name+' / '+key.split(':').slice(1).join(',');result.add(mesh);
 }
 return result;
}
