import * as T from 'three';
import {Water} from 'three/addons/objects/Water.js';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';
import {builders} from './geometry.js';
import {createStair} from './stair.js';
import {SITE,LEVELS,WALLS,FURNITURE,STAIR,LIFT,LAGOON,roomPoints,solidWallParts,dims,measure} from './layout.js';
export function createVilla(scene,m){
 const b=builders(m),{box,cyl,sphere,tube,group,plant,guard,window}=b;
 const site=group(scene),floors=[],slabs=[],roofs=[],stairs=[],lights=[],vegetation=[],wallGroups=[],ceilings=[],labels=[],people=[],selection=[];
 const floorH=SITE.floorHeight;
 const shapeFor=pts=>{const s=new T.Shape();pts.forEach((p,i)=>i?s.lineTo(p[0],p[1]):s.moveTo(p[0],p[1]));s.closePath();return s;};
 const extrude=(pts,height,holes=[])=>{const s=shapeFor(pts);s.holes=holes.map(p=>new T.Path(p.map(v=>new T.Vector2(...v))));const g=new T.ExtrudeGeometry(s,{depth:height,bevelEnabled:false,curveSegments:48});g.rotateX(Math.PI/2);return g;};
 const rect=([x,z,xx,zz])=>[[x,z],[xx,z],[xx,zz],[x,zz]];
 const lagoonPts=LAGOON;
 box(site,0,-.44,0,SITE.width,.25,SITE.depth,'stone');box(site,0,-.55,0,24,.1,25,new T.MeshStandardMaterial({color:'#d5dad4',roughness:1}));
 box(site,0,-.20,-8.5,25,.12,4.3,'dark');box(site,0,-.10,-6.4,18,.13,.55,'stone');for(let x=-11;x<12;x+=3)box(site,x,-.128,-8.8,1.4,.018,.065,'white');
 for(let x of [-4.49,4.49])box(site,x,.52,0,.16,1.15,12,'stone');box(site,0,.52,6.0,9,.0+1.15,.16,'stone');box(site,2.9,.48,-6.0,2.9,.95,.14,'stone');
 // Global plan labels are true dimensional annotations, not a rendered background image.
 function label(parent,r,floor){if(typeof document==='undefined')return;const canvas=document.createElement('canvas');canvas.width=512;canvas.height=160;const c=canvas.getContext('2d');function paint(unit){c.clearRect(0,0,512,160);c.fillStyle='rgba(248,247,239,.92)';c.fillRect(0,0,512,160);c.fillStyle='#2d423a';c.textAlign='center';c.font='600 28px Arial';c.fillText(r.name,256,49);c.font='30px Arial';c.fillText(measure(r,unit),256,95);c.font='22px Arial';c.fillText(dims(r).area.toFixed(2)+' m²'+(r.kind==='stair'||r.kind==='lift'?' footprint':' clear')+(r.polygon?' · irregular':''),256,134);}paint('m');const t=new T.CanvasTexture(canvas);const mat=new T.MeshBasicMaterial({map:t,transparent:true,depthWrite:false,side:T.DoubleSide});const o=new T.Mesh(new T.PlaneGeometry(1.65,.515),mat);o.rotation.x=-Math.PI/2;o.position.set((r.bounds[0]+r.bounds[2])/2,.07,(r.bounds[1]+r.bounds[3])/2);o.userData.noBatch=true;parent.add(o);o.visible=false;labels.push({mesh:o,floor,paint,texture:t});}
 function lamp(p,x,y,z,power=3){const l=new T.PointLight(0xffd8a4,power,5);l.position.set(x,y,z);p.add(l);lights.push(l);return l;}
 function sectionWall(p,w,f){for(const [a,bb] of solidWallParts(w)){const x=w.axis==='x'?(a+bb)/2:w.p,z=w.axis==='z'?(a+bb)/2:w.p;box(p,x,w.height/2,z,w.axis==='x'?bb-a:SITE.partition,w.height,w.axis==='z'?bb-a:SITE.partition,'plaster');b.colliders.push({x,z,w:w.axis==='x'?bb-a:SITE.partition,d:w.axis==='z'?bb-a:SITE.partition,floor:f});}for(const [a,bb] of w.doors){const mid=(a+bb)/2;box(p,w.axis==='x'?mid:w.p,(2.2+SITE.ceiling)/2,w.axis==='z'?mid:w.p,w.axis==='x'?bb-a:SITE.partition,SITE.ceiling-2.2,w.axis==='z'?bb-a:SITE.partition,'plaster');const hinge=group(p,w.axis==='x'?a:w.p,0,w.axis==='z'?a:w.p,w.axis==='x'?-Math.PI/4:Math.PI/4);box(hinge,w.axis==='x'?(bb-a)/2:0,1.10,w.axis==='z'?(bb-a)/2:0,w.axis==='x'?bb-a:.04,2.2,w.axis==='z'?bb-a:.04,'wood',.016);}}
 function furnish(p,o){const rot=o.rot||0;switch(o.type){
 case 'car':b.car(p,o.x,o.z,o.variant?'car2':'car');break;
 case 'bed':b.bed(p,o.x,o.z,o.w,rot);break;
 case 'sofa':b.sofa(p,o.x,o.z,o.w,rot);break;
 case 'chair':b.chair(p,o.x,o.z,rot);break;
 case 'wardrobe':b.wardrobe(p,o.x,o.z,o.w,rot);break;
 case 'kitchen':b.kitchen(p,o.x,o.z,o.w,rot);break;
 case 'vanity':b.vanity(p,o.x,o.z,o.w,rot,o.w>1.3);break;
 case 'toilet':b.toilet(p,o.x,o.z,rot);break;
 case 'shower':b.shower(p,o.x,o.z);break;
 case 'coffee':cyl(p,o.x,.36,o.z,o.w/2,o.w*.4,.11,'wood');cyl(p,o.x,.17,o.z,.10,.15,.32,'metal');break;
 case 'tv':{const q=group(p,o.x,0,o.z,rot);box(q,0,1.3,0,o.w,.77,.045,'screenTv',.035);box(q,0,.31,0,o.w+.1,.38,.20,'walnut',.03);break;}
 case 'dining':box(p,o.x,.75,o.z,o.w,.08,o.d,'wood',.08);for(let x of [o.x-.42,o.x+.42])box(p,x,.35,o.z,.06,.70,.50,'dark');for(let x of [-.49,0,.49]){b.chair(p,o.x+x,o.z-.67);b.chair(p,o.x+x,o.z+.67,Math.PI);}cyl(p,o.x,2.24,o.z,.38,.46,.10,'metal');tube(p,[[o.x,2.27,o.z],[o.x,3.02,o.z]],.009,'dark',2);break;
 case 'shrine':box(p,o.x,.3,o.z,o.w,.55,.42,'stone',.05);cyl(p,o.x,.73,o.z,.17,.23,.15,'metal');sphere(p,o.x,.95,o.z,.1,.17,.08,'metal');for(let x=o.x-.48;x<o.x+.49;x+=.12)box(p,x,1.7,o.z-.25,.035,1.55,.05,'wood');break;
 case 'shelves':{const q=group(p,o.x,0,o.z,rot);for(let y of [.3,.75,1.20,1.65,2.1]){box(q,0,y,0,o.w,.035,.35,'wood');for(let i=0;i<4;i++)cyl(q,-o.w*.37+i*o.w*.24,y+.115,0,.06,.06,.19,'white',12);}break;}
 case 'washer':box(p,o.x,.47,o.z,.60,.9,.60,'white',.04);{const w=cyl(p,o.x,.48,o.z-.31,.20,.20,.04,'black');w.rotation.x=Math.PI/2;}break;
 case 'fridge':case 'cabinet':box(p,o.x,1.1,o.z,o.w,2.2,o.d,'walnut',.025);box(p,o.x,1.12,o.z-o.d/2-.01,o.w-.025,2.14,.025,'metal');break;
 case 'desk':box(p,o.x,.76,o.z,o.w,.07,.60,'wood',.035);for(let x of [-o.w*.38,o.w*.38])box(p,o.x+x,.36,o.z,.055,.72,.5,'dark');box(p,o.x,1.10,o.z-.1,.6,.32,.045,'screenTv');b.tube(p,[[o.x,.8,o.z-.1],[o.x,1.03,o.z-.1]],.022,'dark',2);break;
 }}
 for(let f=0;f<4;f++){
  const fl=group(site,0,f*floorH,0);floors.push(fl);
  const slabGeo=f===0?extrude(rect([-4.47,-5.99,4.47,5.99]),.08,[lagoonPts]):extrude(rect(SITE.outer),.22,[rect(STAIR.bounds)]);
  const sl=b.mesh(fl,slabGeo,'floor',0,0,0);slabs.push({floor:f,mesh:sl});
  const cg=group(fl,0,3.08,0);ceilings.push(cg);const ceilingHoles=[rect(STAIR.bounds)];if(f===3)ceilingHoles.push(rect([.24,-5.27,4.05,-1.92]));b.mesh(cg,extrude(rect(SITE.outer),.06,ceilingHoles),'plaster');
  const wg=group(fl);wallGroups.push(wg);
  if(f>0){for(const w of WALLS[f])sectionWall(wg,w,f);
   box(wg,0,1.51,5.38,8.5,3.02,.20,'stone');
   // Continuous side enclosure. Opaque plinths and headers frame the glazing.
   for(const x of [-4.15,4.15]){
    const terraceSide=f===3&&x>0,from=terraceSide?-1.86:-5.28,to=5.28,mid=(from+to)/2;
    box(wg,x,.30,mid,.20,.60,to-from,'stone');box(wg,x,2.845,mid,.20,.35,to-from,'stone');window(wg,x,mid,to-from,2.07,'z',.60);
    if(terraceSide)guard(wg,x,-3.57,3.42,'z');
   }
   const northEnd=f===3?.12:4.05,northWidth=northEnd+4.05,northMid=(northEnd-4.05)/2;
   box(wg,northMid,.20,-5.38,northWidth,.40,.20,'stone');box(wg,northMid,2.845,-5.38,northWidth,.35,.20,'stone');window(wg,northMid,-5.38,northWidth,2.27,'x',.40);
   if(f===3)guard(wg,2.145,-5.38,3.81,'x');
   for(let z=-4.9;z<1.1;z+=.44){box(wg,-4.28,1.76,z,.26,2.4,.045,'walnut');if(z<-.7)box(wg,4.28,1.76,z,.26,2.4,.045,'walnut');}
   // North travertine fin adds privacy to the bedroom without enlarging the plot.
   box(wg,-3.86,1.5,-5.38,.70,3.0,.24,'stone',.025);
   // Gallery guards have an opening aligned to the actual upper landing.
   guard(fl,.22,2.68,2.44,'z');guard(fl,.22,5.245,.04,'z');guard(fl,1.52,1.475,2.56,'x');
  }
  // Axially aligned supports sit outside clear room and bay envelopes.
  for(const [x,z] of [[-4.15,-5.37],[4.15,-5.37],[-4.15,5.37],[4.15,5.37],[.14,1.36]])box(fl,x,1.54,z,.20,3.08,.20,'stone',.018);
  if(f>0){box(fl,0,-.06,-5.48,8.5,.30,.25,'stone',.065);box(fl,0,-.24,-5.38,8.35,.055,.4,'walnut');box(fl,0,-.20,-5.59,8.25,.015,.016,'led');}
  // Lift is at the same location on all four levels. Door faces east toward the gallery.
  const [lx,lz,lxx,lzz]=LIFT.bounds;box(wg,(lx+lxx)/2,1.5,(lz+lzz)/2,lxx-lx,3,lzz-lz,'glass');box(wg,lx+.06,1.5,(lz+lzz)/2,.12,3,lzz-lz,'dark');box(wg,lxx,1.1,(lz+lzz)/2,.055,2.2,.90,'metal');box(wg,lxx+.035,1.1,(lz+lzz)/2,.015,2.14,.01,'dark');
  for(const o of FURNITURE[f])furnish(fl,o);
  LEVELS[f].rooms.forEach(r=>label(fl,r,f));
  const sel=new T.Group();fl.add(sel);selection.push(sel);
  for(let x of [-2.7,.6,3.2])for(let z of [-4.3,-.4])cyl(fl,x,3.01,z,.05,.05,.022,'led',12);lamp(fl,.0,2.60,-2.5,3.5);
  if(f<3)stairs.push(createStair(site,b,m,f));
  if(f>0){for(const x of [-3.8,3.8]){box(fl,x,.15,-5.01,.45,.30,.45,'stone');const pg=group(fl);plant(pg,x,.30,-5.01,.46,'broad');vegetation.push(pg);}}
  // One 1.70 m scale figure on a clear gallery/apron, optional in the interface.
  const person=group(fl,f===0?.55:-.42,0,f===0?1.03:2.4);const pm=new T.MeshStandardMaterial({color:'#818e80',roughness:.85});b.mesh(person,new T.CapsuleGeometry(.16,.38,4,10),pm,0,1.06,0);sphere(person,0,1.59,0,.115,.115,.115,pm);for(const x of [-.095,.095]){const leg=b.mesh(person,new T.CapsuleGeometry(.065,.59,3,8),pm,x,.40,0);box(person,x,.045,-.07,.12,.08,.23,pm,.035);}for(const x of [-.22,.22])b.mesh(person,new T.CapsuleGeometry(.048,.43,3,8),pm,x,.99,0);people.push(person);
 }
 const ground=floors[0];for(const x of [-4,-1.4,1.2])box(ground,x,.012,-2.9,.025,.016,5.2,'white');
 // Water has a high-resolution freeform shoreline and real reflection plane.
 const ws=shapeFor(lagoonPts.map(p=>[p[0],-p[1]]));const geo=new T.ShapeGeometry(ws,128);
 const data=new Uint8Array(128*128*4);for(let y=0;y<128;y++)for(let x=0;x<128;x++){const i=(y*128+x)*4;data[i]=128+Math.sin(x*.42+y*.23)*32;data[i+1]=128+Math.cos(y*.39-x*.21)*32;data[i+2]=245;data[i+3]=255;}const normals=new T.DataTexture(data,128,128,T.RGBAFormat);normals.wrapS=normals.wrapT=T.RepeatWrapping;normals.needsUpdate=true;
 const water=new Water(geo,{textureWidth:512,textureHeight:512,waterNormals:normals,sunDirection:new T.Vector3(-.5,1,-.4).normalize(),sunColor:0xfff2d4,waterColor:0x268f91,distortionScale:1.2,alpha:.85});water.rotation.x=-Math.PI/2;water.position.y=-.045;ground.add(water);
 const bedGeo=geo.clone();bedGeo.rotateX(-Math.PI/2);const bp=bedGeo.attributes.position;for(let i=0;i<bp.count;i++)bp.setY(i,bp.getZ(i)>-.75?-.06-(.15-bp.getZ(i))*.28:-.32);bedGeo.computeVertexNormals();b.mesh(ground,bedGeo,'sand');
 tube(ground,lagoonPts.map(p=>[p[0],-.03,p[1]]),.085,'sand',192);
 for(let i=0;i<30;i++){const [px,pz]=lagoonPts[Math.floor(i*lagoonPts.length/30)];if(px<1.70&&pz<-1)continue;const p={x:px,y:pz};const r=b.mesh(ground,new T.IcosahedronGeometry(1,2),'rock',p.x,.04,p.y);r.scale.set(.14+(i%3)*.06,.1+(i%4)*.03,.16+(i%3)*.04);r.rotation.set(i*.31,i*.83,i*.12);}
 guard(ground,1.27,-2.8,5.0,'z');
 for(const [x,z] of [[4.07,-5.3],[4.08,-2.5],[4.07,-.25],[-4.12,2.0],[-4.10,3.15]]){const pg=group(ground);plant(pg,x,0,z,.62,z<-4?'palm':'broad');vegetation.push(pg);}
 for(let i=0;i<19;i++){const pg=group(ground);plant(pg,4.18,0,-5.25+i*.27,.20+(i%3)*.06,'broad');vegetation.push(pg);}
 const waterfall=box(ground,3.92,.26,-.85,.08,.45,.18,new T.MeshPhysicalMaterial({color:'#b7f1e7',transparent:true,opacity:.45,roughness:.08}));
 lamp(ground,3.8,.1,-3.8,1.3);lamp(ground,3.5,.1,-.3,1.2);
 // Timber deck, pergola and secure skylight.
 const f3=floors[3];for(let x=.3;x<4.05;x+=.15)box(f3,x,.012,-3.6,.13,.025,3.25,'wood');for(let x of [.27,4.0])for(let z of [-5.2,-1.95])box(f3,x,1.37,z,.065,2.74,.065,'dark');for(let z=-5.2;z<-1.9;z+=.25)box(f3,2.13,2.76,z,3.86,.10,.07,'walnut');
 const roof=group(site,0,13.2,0);roofs.push(roof);box(roof,-2.1,0,-.0,4.3,.23,10.96,'stone');box(roof,2.15,.02,3.4,4.1,.10,4.20,'glass');for(let x of [.14,4.15])box(roof,x,.08,3.4,.055,.16,4.2,'dark');for(let z of [1.30,5.50])box(roof,2.15,.08,z,4.07,.16,.055,'dark');for(let x=.8;x<4.1;x+=.8)box(roof,x,.08,3.4,.025,.09,4.2,'dark');
 for(let i=0;i<3;i++)box(roof,-2.6,.16,-3.6+i*1.25,2.0,.06,1.05,'screenTv');
 // Batch only opaque geometry by material. Never alter stair/lagoon topology for performance.
 function batch(root){root.updateMatrixWorld(true);const inv=new T.Matrix4().copy(root.matrixWorld).invert(),buckets=new Map(),remove=[];root.traverse(o=>{if(!o.isMesh||o===water||o===waterfall||o.material.transparent||o.userData.noBatch)return;const mat=o.material;if(Array.isArray(mat))return;let g=o.geometry.clone();g.applyMatrix4(new T.Matrix4().multiplyMatrices(inv,o.matrixWorld));g.deleteAttribute('uv1');if(!g.attributes.uv)g.setAttribute('uv',new T.Float32BufferAttribute(new Float32Array(g.attributes.position.count*2),2));if(g.index)g=g.toNonIndexed();if(!buckets.has(mat.uuid))buckets.set(mat.uuid,{mat,geos:[]});buckets.get(mat.uuid).geos.push(g);remove.push(o);});remove.forEach(o=>o.removeFromParent());for(const {mat,geos}of buckets.values()){const geo=mergeGeometries(geos,false);if(geo){const o=new T.Mesh(geo,mat);o.castShadow=true;o.receiveShadow=true;root.add(o);}geos.forEach(g=>g.dispose());}}
 // Keep walls, scale figures and planting independent for sectional views and quality controls.
 const detached=[...wallGroups,...ceilings,...vegetation,...people].map(g=>({g,parent:g.parent}));detached.forEach(({g})=>g.removeFromParent());floors.forEach(batch);stairs.forEach(batch);batch(roof);detached.forEach(({g,parent})=>{parent.add(g);batch(g);});
 return {site,floors,slabs,roofs,stairs,lights,water,waterfall,vegetation,wallGroups,ceilings,people,labels,colliders:b.colliders,stair:STAIR,selection,
 setLabels(v,unit='m',floor=-1){labels.forEach(l=>{l.paint(unit);l.texture.needsUpdate=true;l.mesh.visible=v&&(floor<0||l.floor===floor);});},
 selectRoom(room){selection.forEach(g=>{g.children.forEach(o=>{o.geometry.dispose();o.material.dispose();});g.clear();});if(!room)return;const pts=roomPoints(room);const sh=shapeFor(pts);const geo=new T.ShapeGeometry(sh);geo.rotateX(Math.PI/2);const o=new T.Mesh(geo,new T.MeshBasicMaterial({color:0x9ea956,transparent:true,opacity:.24,side:T.DoubleSide,depthWrite:false}));o.position.y=.018;selection[room.floor].add(o);}
 };
}
