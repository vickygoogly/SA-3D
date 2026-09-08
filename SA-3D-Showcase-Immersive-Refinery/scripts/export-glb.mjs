// Dependency-free glTF 2.0 binary export for this model's triangle meshes.
import {writeFileSync} from 'node:fs';
export function exportGLB(root,file){
 root.updateMatrixWorld(true);
 const doc={asset:{version:'2.0',generator:'SA 3D Showcase model exporter'},scene:0,scenes:[{nodes:[]}],nodes:[],meshes:[],materials:[],accessors:[],bufferViews:[],buffers:[{byteLength:0}]};
 const chunks=[];let offset=0;const materials=new Map(),geometries=new Map();
 function attr(a,target,type){
  const bytes=Buffer.from(a.array.buffer,a.array.byteOffset,a.array.byteLength),padding=(4-bytes.length%4)%4;
  const view=doc.bufferViews.push({buffer:0,byteOffset:offset,byteLength:bytes.length,target})-1;
  chunks.push(bytes,Buffer.alloc(padding));offset+=bytes.length+padding;
  const componentType=a.array instanceof Float32Array?5126:a.array instanceof Uint32Array?5125:5123;
  const acc={bufferView:view,componentType,count:a.count,type};
  if(type==='VEC3'){acc.min=[Infinity,Infinity,Infinity];acc.max=[-Infinity,-Infinity,-Infinity];for(let i=0;i<a.count;i++)for(let j=0;j<3;j++){const v=a.array[i*3+j];acc.min[j]=Math.min(acc.min[j],v);acc.max[j]=Math.max(acc.max[j],v);}}
  return doc.accessors.push(acc)-1;
 }
 root.traverse(obj=>{
  if(!obj.isMesh)return;
  const m=obj.material;if(Array.isArray(m))throw new Error('Multi-material export is unsupported');
  let material=materials.get(m.uuid);
  if(material===undefined){material=doc.materials.push({name:m.name||'Plant material',pbrMetallicRoughness:{baseColorFactor:[...m.color.toArray(),m.opacity],metallicFactor:m.metalness??0,roughnessFactor:m.roughness??1},doubleSided:m.side===2})-1;materials.set(m.uuid,material);}
  const key=obj.geometry.uuid+':'+material;let mesh=geometries.get(key);
  if(mesh===undefined){const g=obj.geometry;const attributes={POSITION:attr(g.attributes.position,34962,'VEC3')};if(g.attributes.normal)attributes.NORMAL=attr(g.attributes.normal,34962,'VEC3');if(g.attributes.uv)attributes.TEXCOORD_0=attr(g.attributes.uv,34962,'VEC2');const primitive={attributes,material,mode:4};if(g.index)primitive.indices=attr(g.index,34963,'SCALAR');mesh=doc.meshes.push({primitives:[primitive]})-1;geometries.set(key,mesh);}
  const index=doc.nodes.push({name:obj.name||'Plant equipment',mesh,matrix:obj.matrixWorld.toArray()})-1;doc.scenes[0].nodes.push(index);
 });
 doc.buffers[0].byteLength=offset;
 let json=Buffer.from(JSON.stringify(doc));json=Buffer.concat([json,Buffer.alloc((4-json.length%4)%4,32)]);const binary=Buffer.concat(chunks);
 const header=Buffer.alloc(12);header.writeUInt32LE(0x46546c67,0);header.writeUInt32LE(2,4);header.writeUInt32LE(12+8+json.length+8+binary.length,8);
 const jh=Buffer.alloc(8);jh.writeUInt32LE(json.length,0);jh.writeUInt32LE(0x4e4f534a,4);const bh=Buffer.alloc(8);bh.writeUInt32LE(binary.length,0);bh.writeUInt32LE(0x004e4942,4);
 writeFileSync(file,Buffer.concat([header,jh,json,bh,binary]));
}
