import * as T from '../frontend/vendor/three.module.js';
import {readFileSync,writeFileSync,existsSync} from 'node:fs';
import {gunzipSync} from 'node:zlib';
import {exportGLB} from './export-glb.mjs';
const root=new T.Group();root.name='Illustrative full refinery campus';
const mat=(color,metalness=.35,roughness=.55)=>new T.MeshStandardMaterial({color,metalness,roughness});
const M={steel:mat(0xbcc7c6,.75,.32),white:mat(0xd8dfdc,.32,.43),green:mat(0x24796b,.5,.38),dark:mat(0x283d47),concrete:mat(0x788582,0,.95),road:mat(0x273239,0,.95),yellow:mat(0xe9ba4e),red:mat(0xae5347),blue:mat(0x397085),soil:mat(0x344b43,0,1)};
function mesh(geo,m,x,y,z,name='Equipment',parent=root){const o=new T.Mesh(geo,M[m]||m);o.position.set(x,y,z);o.name=name;parent.add(o);return o;}
const box=(x,y,z,w,h,d,m='steel',name)=>mesh(new T.BoxGeometry(w,h,d),m,x,y,z,name);
const cyl=(x,y,z,r,h,m='steel',name)=>mesh(new T.CylinderGeometry(r,r,h,24),m,x,y,z,name);
function pipe(a,b,r=.2,m='steel'){const s=new T.Vector3(...a),e=new T.Vector3(...b),v=e.clone().sub(s);const p=mesh(new T.CylinderGeometry(r,r,v.length(),8),m,...s.add(e).multiplyScalar(.5).toArray(),'Pipe / structural member');p.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),v.normalize());return p;}
function rail(x,z,w,d,y=.8){for(const side of [-1,1]){for(let n=-w/2;n<=w/2;n+=4)pipe([x+n,y,z+side*d/2],[x+n,y+1.2,z+side*d/2],.05,'yellow');pipe([x-w/2,y+1.2,z+side*d/2],[x+w/2,y+1.2,z+side*d/2],.055,'yellow');}for(const s of [-1,1])pipe([x+s*w/2,y+1.2,z-d/2],[x+s*w/2,y+1.2,z+d/2],.055,'yellow');}
function pad(x,z,w,d){box(x,.15,z,w,.3,d,'concrete','Raised process foundation');rail(x,z,w,d);}
// Geometry from the user's OBJ. Fine grating is replaced by its exact bounds for browser LOD.
const source=JSON.parse(readFileSync(new URL('../models/refinery.json',import.meta.url)));const raw=new URL('../models/refinery.bin',import.meta.url);const bytes=existsSync(raw)?readFileSync(raw):gunzipSync(readFileSync(new URL('../models/refinery.bin.gz',import.meta.url)));const tank=new T.Group();
for(const part of source.meshes){if(part.name==='Plane001')continue;let g;
 if(part.name.startsWith('Grill_')){const [a,b]=part.bounds;g=new T.BoxGeometry(...b.map((v,i)=>Math.max(.04,v-a[i])));g.translate(...a.map((v,i)=>(v+b[i])/2));}
 else{g=new T.BufferGeometry();g.setAttribute('position',new T.BufferAttribute(new Float32Array(bytes.buffer,bytes.byteOffset+part.positionOffset,part.vertexCount*3).slice(),3));g.setAttribute('normal',new T.BufferAttribute(new Float32Array(bytes.buffer,bytes.byteOffset+part.normalOffset,part.vertexCount*3).slice(),3));g.setIndex(new T.BufferAttribute(new Uint32Array(bytes.buffer,bytes.byteOffset+part.indexOffset,part.indexCount).slice(),1));}
 const green=/Grill|Line|Tube|Stair/i.test(part.name);const m=new T.Mesh(g,green?M.green:M.white);m.name=part.name;tank.add(m);
}
// Merge imported pieces by finish to avoid thousands of draw calls per tank.
const merged=new T.Group();
for(const material of [M.white,M.green]){const pp=[],nn=[],ii=[];let base=0;tank.children.filter(x=>x.material===material).forEach(x=>{const g=x.geometry;pp.push(g.attributes.position.array);nn.push(g.attributes.normal.array);const ids=g.index?g.index.array:Uint32Array.from({length:g.attributes.position.count},(_,i)=>i);ii.push(Uint32Array.from(ids,i=>i+base));base+=g.attributes.position.count;});const join=(a,Type=Float32Array)=>{const o=new Type(a.reduce((n,x)=>n+x.length,0));let k=0;for(const x of a){o.set(x,k);k+=x.length;}return o;};const g=new T.BufferGeometry();g.setAttribute('position',new T.BufferAttribute(join(pp),3));g.setAttribute('normal',new T.BufferAttribute(join(nn),3));g.setIndex(new T.BufferAttribute(join(ii,Uint32Array),1));merged.add(new T.Mesh(g,material));}
box(0,-1,0,252,2,182,'concrete','Main refinery island');box(0,-3,0,258,3,188,'dark','Concrete seawall');
// Clear ring roads and a central spine; animated traffic follows these exact corridors.
for(const x of [-111,111])box(x,.035,0,12,.05,164,'road','Perimeter road');for(const z of [-77,77,0])box(0,.04,z,234,.06,12,'road','Service road');
for(const z of [-77,77,0])for(let x=-108;x<110;x+=7)box(x,.085,z,3,.018,.18,'yellow','Road marking');
for(const x of [-111,111])for(let z=-68;z<70;z+=7)box(x,.085,z,.18,.018,3,'yellow','Road marking');
const zones=[{id:'Z01',name:'Oil storage & export',x:-65,z:-40},{id:'Z02',name:'Inlet & separation',x:0,z:-40},{id:'Z03',name:'Gas processing',x:65,z:-40},{id:'Z04',name:'Utilities & water',x:-65,z:40},{id:'Z05',name:'Loading & logistics',x:0,z:40},{id:'Z06',name:'Control & maintenance',x:65,z:40},{id:'Z07',name:'Wellhead islands',x:-168,z:-38},{id:'Z08',name:'Flare & relief',x:166,z:42}];
for(const z of zones.slice(0,6))pad(z.x,z.z,56,52);
for(const [i,x,z] of [[1,-79,-52],[2,-52,-52],[3,-79,-27],[4,-52,-27]]){const t=merged.clone(true);t.scale.setScalar(.092);t.position.set(x,.4,z);t.name='TK-10'+i+' · supplied storage tank';root.add(t);}
function vessel(x,z,len=22,r=2.5){const v=cyl(x,r+2,z,r,len,'white','Horizontal separator');v.rotation.z=Math.PI/2;for(const s of [-1,1]){const cap=mesh(new T.SphereGeometry(r,20,12),'steel',x+s*len/2,r+2,z,'Dished vessel head');cap.scale.x=.32;box(x+s*len*.32,1.2,z,1.4,2.4,r*1.7,'dark','Vessel saddle');}pipe([x-len/2,r+2,z],[x-len/2-3,r+2,z],.38);}
for(const z of [-57,-41,-25]){vessel(0,z);for(const s of [-1,1])pipe([s*14,1,z],[s*14,7,z],.22,'green');}
for(const [x,z,h] of [[50,-52,27],[68,-52,35],[82,-30,23]]){cyl(x,h/2+.4,z,2.5,h,'steel','Gas treatment column');mesh(new T.SphereGeometry(2.5,18,12),'steel',x,h+.4,z).scale.y=.3;for(let y=7;y<h;y+=7){cyl(x,y,z,3.3,.2,'dark','Column access platform');rail(x,z,7,7,y);}pipe([x+3,1,z],[x+3,h,z],.14,'yellow');}
for(const z of [-43,-24]){vessel(57,z,15,1.7);box(57,3,z+4,15,3,4,'blue','Compressor enclosure');}
// Parallel elevated pipe rack links all process units with structural supports.
for(let x=-96;x<=96;x+=12){for(const z of [-10,10])box(x,4.4,z,.4,8.8,.4,'dark','Pipe rack column');box(x,8.7,0,.5,.35,22,'dark','Pipe rack crossbeam');}
for(let z=-8;z<=8;z+=2)pipe([-100,9,z],[100,9,z],.24,z%4===0?'green':'steel');
for(const x of [-80,-52,0,55,82]){pipe([x,9,-8],[x,9,-18],.22);pipe([x,9,-18],[x,3,-18],.22);}
for(const [x,z] of [[-81,30],[-60,30],[-81,51]]){cyl(x,4,z,6,8,'white','Water / chemical storage');cyl(x,8,z,6.2,.35,'blue');}
box(-57,3,52,15,6,12,'dark','Substation');for(let x=-63;x<-50;x+=3){box(x,6.3,52,1.5,.6,8,'steel','Cooling fins');}
for(const x of [-17,0,17]){box(x,5.5,42,12,.45,34,'green','Tanker loading canopy');for(const z of [28,56])for(const dx of [-5,5])box(x+dx,2.75,z,.25,5.5,.25,'yellow','Canopy column');pipe([x,5,28],[x,5,54],.17);}
box(64,4,48,38,8,20,'white','Control building');box(64,8.2,48,40,.4,22,'dark','Roof');for(let x=48;x<83;x+=5)for(const z of [37.8,58.2])box(x,4.5,z,3.2,2.6,.15,'blue','Glazing');for(let x=50;x<80;x+=9)box(x,9,48,5,1.5,5,'steel','Roof HVAC');
// Two actual geometry satellite islands, connected by utility bridges.
for(const [cx,cz] of [[-168,-38],[166,42]]){box(cx,-.8,cz,48,2,46,'concrete','Satellite island');box(cx,-3,cz,51,3,49,'dark','Island seawall');rail(cx,cz,46,44,.3);}
box(-139,1,-38,30,1,7,'dark','Wellhead bridge');box(139,1,42,30,1,7,'dark','Flare bridge');
for(const cx of [-180,-157]){for(const dx of [-4,4])for(const dz of [-4,4])pipe([cx+dx,.5,-38+dz],[cx+dx*.4,23,-38+dz*.4],.18,'yellow');for(let y=2;y<=20;y+=6){box(cx,y,-38,8-y*.2,.3,8-y*.2,'dark','Wellhead tower platform');for(const s of [-1,1])pipe([cx-4+y*.1,y,-38+s*(4-y*.1)],[cx+4-(y+6)*.1,y+6,-38+s*(4-(y+6)*.1)],.08,'steel');}}
for(const x of [-181,-170,-158])cyl(x,1.5,-25,.5,3,'yellow','Wellhead valve assembly');
for(const x of [158,174]){cyl(x,23,42,.8,46,'steel','Flare stack');for(const dx of [-5,5])pipe([x+dx,.4,42],[x,35,42],.12,'dark');cyl(x,46.5,42,1.1,.7,'red','Flare tip');}
// Road lights and perimeter security fence.
for(let x=-116;x<=116;x+=16)for(const z of [-87,87]){pipe([x,.2,z],[x,7,z],.09,'dark');box(x,7,z,1.6,.12,.6,new T.MeshStandardMaterial({color:0xffe5a4,emissive:0xffc466,emissiveIntensity:3}),'Site luminaire');}
rail(0,0,245,175,.1);
writeFileSync(new URL('../models/campus.json',import.meta.url),JSON.stringify(root.toJSON()));exportGLB(root,new URL('../models/campus.glb',import.meta.url));writeFileSync(new URL('../models/zones.json',import.meta.url),JSON.stringify(zones,null,2));
let triangles=0;root.traverse(o=>{if(o.isMesh)triangles+=(o.geometry.index?.count||o.geometry.attributes.position.count)/3;});console.log({triangles,objects:root.children.length});
