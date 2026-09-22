import * as T from 'three';
import {Water} from 'three/addons/objects/Water.js';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';
import {builders} from './geometry.js';
export function createVilla(scene,m){
 const b=builders(m),{box,sphere,cyl,tube,group,wall,doorWall,guard,window,plant,chair,sofa,bed,wardrobe,vanity,toilet,shower,kitchen,car}=b;
 const site=new T.Group();scene.add(site);const floors=[],slabs=[],roofs=[],lights=[],vegetation=[];
 const floorH=3.3;
 function light(p,x,y,z,power=2,color=0xffd6a0){const l=new T.PointLight(color,power,5,2);l.position.set(x,y,z);p.add(l);lights.push(l);return l;}
 function slab(p,y,roof=false){const s=new T.Shape();s.moveTo(-4.35,-5.8);s.lineTo(4.35,-5.8);s.lineTo(4.35,5.8);s.lineTo(-4.35,5.8);s.closePath();if(!roof){const hole=new T.Path();hole.moveTo(.12,1.7);hole.lineTo(.12,5.55);hole.lineTo(4.05,5.55);hole.lineTo(4.05,1.7);hole.closePath();s.holes.push(hole);}const geo=new T.ExtrudeGeometry(s,{depth:.22,bevelEnabled:true,bevelSegments:2,steps:1,bevelSize:.035,bevelThickness:.025,curveSegments:24});geo.rotateX(Math.PI/2);const o=b.mesh(p,geo,'stone',0,y,0);box(p,0,y-.25,-5.76,8.6,.07,.04,'walnut');return o;}
 // Site and road are dimensioned independently; no landscaping on the road or parking approach.
 box(site,0,-.43,0,9.144,.3,12.192,'stone',.08);
 box(site,0,-.26,-9.2,24,.12,5.4,'dark');box(site,0,-.13,-6.45,18,.13,.58,'stone');for(let x=-10;x<11;x+=3)box(site,x,-.19,-9.2,1.5,.013,.065,'white');
 box(site,0,-.45,1,34,.1,34,'grass');
 for(let x of [-4.47,4.47])box(site,x,.59,.25,.16,1.3,11.7,'stone');box(site,0,.59,6.0,9,.1+1.2,.16,'stone');
 // Gate and independent pedestrian entry. Sliding leaf is stowed at the western boundary.
 for(let x=-4.2;x<-3.65;x+=.085)box(site,x,.75,-5.93,.034,1.6,.12,'dark');box(site,2.0,.48,-5.98,4.3,.92,.12,'stone');
 for(let x=.15;x<4.2;x+=.15)box(site,x,1.12,-5.98,.036,.35,.06,'walnut');
 const g=group(site);floors.push(g);
 // Two marked parking bays with 5.2 m clear length, 2.6 m width each.
 for(let x of [-4.0,-1.4,1.2])box(g,x,.015,-3.0,.025,.016,5.2,'white');
 car(g,-2.7,-3,'car');car(g,-.1,-3,'car2');
 // Two scooters tucked west behind parking, out of the approach corridor.
 for(let x of [-3.9,-3.15]){const q=group(g,x,0,.75);for(let z of [-.43,.43]){const wh=cyl(q,0,.22,z,.21,.21,.1,'black',20);wh.rotation.z=Math.PI/2;}box(q,0,.55,.05,.32,.35,.72,'dark',.12);box(q,0,.8,.11,.34,.09,.62,'fabric',.06);tube(q,[[0,.45,-.4],[0,1,-.4],[.2,1,-.4]],.023,'metal',8);}
 // Concealed filtration/service enclosure south-west, with ventilation louvres.
 box(g,-3.35,.85,5.0,1.65,1.7,1.4,'walnut');for(let i=0;i<12;i++)box(g,-3.35,.2+i*.115,4.28,1.57,.038,.03,'dark');
 // Organic lagoon: high resolution boundary is preserved in every performance mode.
 const lagoonPoints=[[1.68,-5.43],[3.28,-5.54],[4.11,-4.95],[4.19,-3.62],[3.84,-2.38],[4.13,-1.1],[3.68,.33],[2.62,1.21],[1.58,.54],[1.45,-.5],[1.81,-1.8],[1.49,-3.1],[1.68,-5.43]];
 const curve=new T.CatmullRomCurve3(lagoonPoints.slice(0,-1).map(v=>new T.Vector3(v[0],v[1],0)),true,'centripetal');
 const pts=curve.getPoints(192);const pavingShape=new T.Shape();pavingShape.moveTo(-4.45,-5.95);pavingShape.lineTo(4.45,-5.95);pavingShape.lineTo(4.45,5.95);pavingShape.lineTo(-4.45,5.95);pavingShape.closePath();const poolHole=new T.Path(pts.map(v=>new T.Vector2(v.x,v.y)));pavingShape.holes.push(poolHole);const pavingGeo=new T.ExtrudeGeometry(pavingShape,{depth:.08,bevelEnabled:false,curveSegments:128});pavingGeo.rotateX(Math.PI/2);b.mesh(g,pavingGeo,'floor',0,.0,0);const shape=new T.Shape(pts.map(v=>new T.Vector2(v.x,-v.y)));const waterGeo=new T.ShapeGeometry(shape,128);
 const bedGeo=waterGeo.clone();bedGeo.rotateX(-Math.PI/2);const bp=bedGeo.attributes.position;for(let i=0;i<bp.count;i++){const z=bp.getZ(i);bp.setY(i,z>.1?-.055-(1.15-z)*.14:-.28);}bedGeo.computeVertexNormals();const poolBed=b.mesh(g,bedGeo,'waterbed',0,0,0);poolBed.receiveShadow=true;
 const normalData=new Uint8Array(128*128*4);for(let y=0;y<128;y++)for(let x=0;x<128;x++){const i=(y*128+x)*4;normalData[i]=128+Math.sin(x*.42+y*.23)*32;normalData[i+1]=128+Math.cos(y*.39-x*.21)*32;normalData[i+2]=245;normalData[i+3]=255;}const normal=new T.DataTexture(normalData,128,128,T.RGBAFormat);normal.wrapS=normal.wrapT=T.RepeatWrapping;normal.needsUpdate=true;
 const water=new Water(waterGeo,{textureWidth:512,textureHeight:512,waterNormals:normal,sunDirection:new T.Vector3(-.5,1,-.4).normalize(),sunColor:0xfff2d4,waterColor:0x268f91,distortionScale:1.4,alpha:.84,fog:false});water.rotation.x=-Math.PI/2;water.position.y=-.055;g.add(water);
 // Cove rim, sand pockets, varied boulders. High tessellation shoreline never reduced.
 tube(g,pts.map(v=>[v.x,-.03,v.y]),.10,'sand',192);
 for(let i=0;i<27;i++){const t=i/27;const v=curve.getPoint(t);const outward=new T.Vector2(v.x-2.85,v.y+2.1).normalize();if(v.x<1.7&&v.y<-1)continue;const r=.13+.13*(.5+.5*Math.sin(i*11));const rock=b.mesh(g,new T.IcosahedronGeometry(1,2),'rock',v.x+outward.x*.08,.045,v.y+outward.y*.08);rock.scale.set(r*1.5,r*.75,r);rock.rotation.set(i*.7,i*1.3,i*.2);}
 // Shallow beach cove, sloping into the southern end of the pool.
 const beach=new T.Shape();beach.moveTo(1.45,.6);beach.bezierCurveTo(2,.3,2.5,.5,3.12,1.05);beach.bezierCurveTo(2.75,1.55,1.9,1.62,1.45,.6);const bg=new T.ShapeGeometry(beach,40);bg.rotateX(Math.PI/2);b.mesh(g,bg,'sand',0,.018,0);
 for(let i=0;i<5;i++){const r=b.mesh(g,new T.IcosahedronGeometry(1,2),'rock',4.0,.2+i*.11,-1.4+i*.13);r.scale.set(.25,.27,.22);}
 const waterfall=box(g,3.82,.32,-1.07,.12,.54,.2,new T.MeshPhysicalMaterial({color:'#b7f1e7',transparent:true,opacity:.48,roughness:.06,metalness:.12}));
 // Low transparent pool guard along traffic edge, with beach access only from dry garden.
 guard(g,1.28,-3.05,4.65,'z');
 for(let p of [[3.8,-4.4],[3.9,-2.0],[3.5,.5]])light(g,p[0],.08,p[1],1.6,0xa8eee1);
 // Eastern stepping path connects garden with stair without crossing water.
 for(let z=-.1;z<2;z+=.45)box(g,.87,.018,z,.58,.04,.34,'stone',.07);
 sofa(g,-1.7,2,1.6,Math.PI/2);cyl(g,-.6,.39,2,.34,.28,.07,'wood');cyl(g,-.6,.18,2,.04,.07,.37,'dark');
 // Stair core SE/south: 20 consistent 165mm risers, 1.2m clear width, 300-degree sweep.
 const cx=2.05,cz=3.65,ri=.55,ro=1.75,n=20,sweep=Math.PI*5/3,start=-Math.PI/2;
 const stairs=[];
 for(let f=0;f<3;f++){
  const stair=group(site,0,f*floorH,0);stairs.push(stair);
  for(let i=0;i<n;i++){const a=start+sweep*i/n,aa=start+sweep*(i+1)/n;const sh=new T.Shape();sh.moveTo(cx+ri*Math.cos(a),cz+ri*Math.sin(a));sh.absarc(cx,cz,ro,a,aa,false);sh.lineTo(cx+ri*Math.cos(aa),cz+ri*Math.sin(aa));sh.absarc(cx,cz,ri,aa,a,true);sh.closePath();const geo=new T.ExtrudeGeometry(sh,{depth:.075,bevelEnabled:true,bevelSize:.009,bevelThickness:.006,bevelSegments:2,curveSegments:14});geo.rotateX(Math.PI/2);b.mesh(stair,geo,'stone',0,(i+1)*floorH/n,0);
   tube(stair,Array.from({length:9},(_,j)=>{const r=ri+j/8*(ro-ri);return [cx+r*Math.cos(a),(i+1)*floorH/n-.046,cz+r*Math.sin(a)]}),.011,'led',10);
  }
  // Curved structural spine beneath treads.
  tube(stair,Array.from({length:101},(_,i)=>{const a=start+sweep*i/100;return[cx+1.13*Math.cos(a),.09+floorH*i/100-.16,cz+1.13*Math.sin(a)]}),.10,'walnut',128);
  for(let r of [ri,ro]){const positions=[],indices=[];const ptsRail=[];for(let i=0;i<=120;i++){const t=i/120,a=start+sweep*t,y=.165+3.135*t;for(let dy of [0,1.06])positions.push(cx+r*Math.cos(a),y+dy,cz+r*Math.sin(a));ptsRail.push([cx+r*Math.cos(a),y+1.08,cz+r*Math.sin(a)]);if(i<120){let k=i*2;indices.push(k,k+1,k+2,k+1,k+3,k+2);}}const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(positions,3));geo.setIndex(indices);geo.computeVertexNormals();b.mesh(stair,geo,'glass');tube(stair,ptsRail,.017,'metal',144);}
  // Landing aligns with final tread southwest of the circular flight, at upper level.
  box(stair,.33,3.26,2.42,.94,.12,1.0,'floor');guard(stair,.05,2.42,1.0,'z',3.3);
 }
 // Aligned structural piers and beams avoid the 2 parking envelopes.
 for(let f=0;f<4;f++){const fl=f===0?g:group(site,0,f*floorH,0);if(f>0)floors.push(fl);if(f>0)slabs.push({floor:f,mesh:slab(fl,0)});
  for(let [x,z] of [[-4.23,-5.66],[4.23,-5.66],[-4.23,1.2],[-4.23,5.65],[4.23,1.45],[4.23,5.65],[-1.46,1.62]])box(fl,x,1.55,z,.23,3.1,.23,'stone',.018);
  if(f<3){box(fl,0,3.02,-5.62,8.5,.32,.3,'stone');box(fl,0,3.02,5.62,8.5,.32,.3,'stone');}
  // Lift 1.5 x 1.6m external shaft; its doors face east onto the gallery.
  box(fl,-.55,1.54,1.0,1.58,3.08,1.72,'glass');box(fl,-1.32,1.54,1.0,.07,3.08,1.76,'dark');box(fl,.28,1.18,1.0,.065,2.3,1.05,'metal');box(fl,.325,1.18,1.0,.02,2.22,.012,'dark');box(fl,.335,1.3,1.61,.025,.15,.09,'black');
  if(f>0){guard(fl,.07,1.89,.4,'z');guard(fl,.07,4.26,2.5,'z');guard(fl,2.05,1.68,3.92,'x');guard(fl,4.03,3.62,3.8,'z');}
  // Ceiling downlights, subtle cove line and warm wall lighting.
  for(let x of [-3,0,3])for(let z of [-4,0]){cyl(fl,x,3.045,z,.055,.055,.025,'led',12);}if(f>0)light(fl,0,2.5,-2,3.8);
 }
 // Upper facade: open north daylight, shaded side windows, timber fins and narrow shadow gaps.
 for(let f=1;f<4;f++){
  const fl=floors[f];
  if(f<3){wall(fl,0,5.7,8.45,.14,f);wall(fl,-4.25,0,.14,11.3,f,.55);wall(fl,4.25,-2,.14,7.3,f,.55);window(fl,0,-5.67,8.15,2.25,'x',.45);window(fl,-4.25,-1.85,6.9,1.65,'z',.75);window(fl,4.25,-2.95,4.9,1.9,'z',.65);
   for(let z=-5.3;z<1.3;z+=.38){box(fl,-4.38,1.67,z,.23,2.25,.045,'walnut');}for(let z=-5.2;z<-2;z+=.4)box(fl,4.39,1.68,z,.28,2.2,.04,'walnut');
   guard(fl,0,-5.91,8.6);box(fl,0,.06,-5.82,8.5,.1,.25,'floor');
  }else{wall(fl,-4.25,-1,.14,9.3,f);wall(fl,-2.3,3.55,3.85,.14,f);window(fl,-2.3,-5.65,3.7,2.2,'x',.5);guard(fl,2.1,-5.72,4.3);guard(fl,4.26,-1.9,7.6,'z');guard(fl,2.1,5.72,4.3);}
  // Layered rounded fascia, warm soffit and recessed north frontage.
  box(fl,0,-.04,-5.78,8.76,.34,.42,'stone',.11);
  box(fl,0,-.245,-5.64,8.5,.045,.52,'walnut',.015);
  box(fl,0,-.205,-5.98,8.48,.022,.018,'led');
  for(let x=-4.08;x<4.1;x+=.19)box(fl,x,-.276,-5.57,.045,.024,.5,'wood');
  if(f<3){box(fl,-3.72,1.5,-5.68,1.08,2.96,.16,'stone',.035);box(fl,2.5,1.53,-5.71,.12,3.02,.23,'walnut');}
  // East-facing first-floor door, exterior approach gallery at level.
  if(f===1){box(fl,4.22,1.2,-.43,.085,2.4,1.05,'walnut');box(fl,4.28,1.18,-.15,.04,.45,.025,'metal');box(fl,4.39,-.015,.28,.35,.14,2.8,'floor');guard(fl,4.51,.28,2.8,'z');box(fl,3.57,.015,-.4,.9,.025,1.3,'rug');}
 }
 // First floor: north social rooms, guest NW; services southwest; east-side cooking.
 const f1=floors[1];
 doorWall(f1,-1.23,-3.65,4.0,'z',1);doorWall(f1,-2.8,-1.62,2.95,'x',1);bed(f1,-2.85,-3.82,1.55);wardrobe(f1,-3.92,-2.2,1.1,Math.PI/2);
 box(f1,.2,.025,-3.8,2.7,.035,2.8,'rug',.04);sofa(f1,.05,-4.77,2.45);sofa(f1,-.72,-3.34,1.6,Math.PI/2);cyl(f1,.72,.34,-3.53,.52,.47,.10,'wood');cyl(f1,.72,.17,-3.53,.18,.2,.31,'dark');box(f1,2.2,1.22,-3.64,.12,.9,1.6,'screenTv',.035);box(f1,2.24,.34,-3.6,.25,.4,2.0,'walnut',.05);
 // Puja corner NE, screen and altar.
 doorWall(f1,2.43,-4.72,1.9,'z',1);wall(f1,3.35,-3.7,1.7,.12,1);box(f1,3.35,.37,-5.24,1.1,.65,.5,'stone',.05);box(f1,3.35,.82,-5.29,.65,.3,.2,'metal',.06);sphere(f1,3.35,1.13,-5.29,.12,.19,.08,'metal');for(let x=2.65;x<4.1;x+=.13)box(f1,x,1.75,-5.45,.035,1.55,.09,'wood');light(f1,3.35,2.2,-4.9,2);
 // Dining and statement pendant.
 box(f1,1.05,.755,-1.35,1.55,.10,.82,'wood',.12);for(let x of [.55,1.55])box(f1,x,.37,-1.35,.07,.73,.6,'dark');for(let x of [.49,1.05,1.61]){chair(f1,x,-2.0,0);chair(f1,x,-.68,Math.PI);}tube(f1,[[1.05,3,-1.35],[1.05,2.25,-1.35]],.008,'dark',2);cyl(f1,1.05,2.18,-1.35,.48,.55,.13,'metal');cyl(f1,1.05,2.1,-1.35,.44,.44,.012,'led');
 kitchen(f1,3.86,.62,2.15,-Math.PI/2);box(f1,3.85,1.14,-2.87,.65,2.28,.68,'dark',.04);box(f1,3.5,1.15,-2.87,.02,2.22,.62,'metal');
 // Guest bathroom western mid-zone, powder room adjacent.
 doorWall(f1,-2.8,.06,2.9,'x',1);wall(f1,-4.18,-.77,.12,1.6,1);vanity(f1,-3.95,-.68,.75,Math.PI/2,false);toilet(f1,-2.0,-.87);shower(f1,-3.28,-.82);
 // Pantry as room, separate wet kitchen with an open door, utility and powder.
 doorWall(f1,-1.5,2.35,1.65,'z',1);wall(f1,-2.5,1.5,2.1,.12,1);doorWall(f1,-2.83,3.47,2.7,'x',1);wall(f1,-4.18,2.47,.12,1.9,1);
 for(let yy of [.35,.85,1.35,1.85,2.3]){box(f1,-3.76,yy,2.35,.38,.035,1.3,'wood');for(let i=0;i<4;i++)cyl(f1,-3.76,yy+.12,1.9+i*.3,.07,.07,.2,i%2?'white':'fabric2',12);}
 kitchen(f1,-2.93,5.37,2.3,0,true);box(f1,-4.0,.5,4.6,.58,.92,.58,'white',.04);const washer=cyl(f1,-4.0,.49,4.29,.19,.19,.045,'black');washer.rotation.x=Math.PI/2;window(f1,-3.0,5.72,1.8,.6,'x',1.85);
 doorWall(f1,-2.5,.7,2.9,'x',1);toilet(f1,-3.7,.67);vanity(f1,-2.4,.66,.65,0,false);
 // Second floor: master sleeping zone SW, dressing and bath to its north.
 const f2=floors[2];
 doorWall(f2,-.8,3.88,3.55,'z',2);doorWall(f2,-2.85,1.33,2.7,'x',2);bed(f2,-2.65,3.78,1.8);sofa(f2,-3.38,1.93,1.2,Math.PI/2);box(f2,-.51,1.34,3.76,.10,.8,1.3,'screenTv',.025);
 doorWall(f2,-2.3,-.82,3.8,'x',2);wardrobe(f2,-3.92,.24,1.8,Math.PI/2);wardrobe(f2,-1.65,.24,1.8,-Math.PI/2);box(f2,-2.25,.38,.3,.62,.72,.9,'fabric',.09);box(f2,-2.3,1.45,1.27,1,1.5,.025,'glass');
 doorWall(f2,-.38,-2.14,2.4,'z',2);wall(f2,-2.3,-3.36,3.8,.12,2);vanity(f2,-2.7,-3.03,1.7,0,true);shower(f2,-3.58,-1.54);toilet(f2,-1.05,-2.85);wall(f2,-1.55,-2.6,.09,1.2,2,1.6,'stone');
 // Family bedroom NE and attached bathroom NW access from hall.
 doorWall(f2,1.0,-4.05,3.25,'z',2);doorWall(f2,2.7,-2.37,3.3,'x',2);bed(f2,2.74,-4.27,1.55);wardrobe(f2,4.0,-3.45,1.4,-Math.PI/2);
 sofa(f2,.08,-1.25,1.7);chair(f2,1.88,-.5,-Math.PI/2);cyl(f2,.52,.36,-.25,.43,.4,.12,'stone');box(f2,.36,.025,-.64,2.6,.035,2.3,'rug');
 doorWall(f2,-2.53,-3.42,3.35,'x',2);vanity(f2,-3.53,-5.26,1,0,false);toilet(f2,-1.7,-5.19);shower(f2,-3.55,-4.21);wardrobe(f2,3.99,.55,1.6,-Math.PI/2);
 // Third floor: premium suite with separate walk-in and bath, study and outdoor terrace.
 const f3=floors[3];doorWall(f3,-.57,-3.65,4.0,'z',3);doorWall(f3,-2.5,-1.61,3.8,'x',3);bed(f3,-2.65,-3.95,1.75);sofa(f3,-3.2,-2.1,1.15,Math.PI/2);
 doorWall(f3,-2.5,.66,3.8,'x',3);doorWall(f3,-.56,-.46,2.1,'z',3);wardrobe(f3,-3.92,-.45,1.7,Math.PI/2);wardrobe(f3,-1.65,-.45,1.7,-Math.PI/2);
 doorWall(f3,-.56,2.1,2.8,'z',3);vanity(f3,-2.5,3.22,1.7,Math.PI,true);shower(f3,-3.57,1.4);toilet(f3,-1.1,2.75);
 box(f3,.65,.77,-1.4,1.8,.065,.65,'wood',.045);for(let x of [-.05,1.3])box(f3,x,.38,-1.4,.05,.75,.5,'dark');chair(f3,.7,-.68,Math.PI);box(f3,.7,1.16,-1.52,.6,.36,.035,'screenTv',.02);tube(f3,[[.7,.8,-1.52],[.7,1.02,-1.52]],.025,'dark',4);
 // Terrace deck, pergola and planted seating.
 for(let x=.0;x<4.15;x+=.14)box(f3,x,.018,-3.9,.12,.04,3.2,'wood');sofa(f3,1.6,-4.8,2.2);sofa(f3,3.57,-3.85,1.6,-Math.PI/2);cyl(f3,2.3,.4,-3.67,.58,.49,.12,'stone');
 for(let x of [.0,4.12])for(let z of [-5.6,-2.2])box(f3,x,1.38,z,.08,2.75,.08,'dark');for(let z=-5.6;z<-2.1;z+=.24)box(f3,2.05,2.73,z,4.2,.10,.07,'walnut');
 // Top slabs only cover the suite and the atrium skylight; terrace remains open.
 const top=group(site,0,13.2,0);roofs.push(top);box(top,-2.25,0,-1.0,4.2,.22,9.5,'stone');box(top,2.05,.06,3.65,4.1,.12,4.05,'glass');for(let x of [.05,4.05])box(top,x,.08,3.65,.07,.15,4.15,'dark');for(let z of [1.58,5.72])box(top,2.05,.08,z,4.1,.15,.07,'dark');for(let x=.6;x<4;x+=.8)box(top,x,.08,3.65,.035,.08,4.05,'dark');
 // Solar panels screened on suite roof.
 for(let i=0;i<3;i++){box(top,-2.6,.18,-2.8+i*1.25,2.0,.06,1.05,'screenTv');for(let x=-3.5;x<-1.5;x+=.25)box(top,x,.215,-2.8+i*1.25,.009,.005,1.02,'metal');}box(top,-3.3,.4,2.45,1.1,.8,1.2,'screen');
 // Deliberate planting bands, not randomly distributed trees. Every plant avoids vehicle bounds.
 const plantSpecs=[[4.18,-5.42,1.15,'palm'],[4.15,-3.2,.55,'broad'],[4.16,-2.25,.65,'broad'],[4.16,.42,.9,'palm'],[3.6,1.45,.48,'broad'],[2.35,1.3,.55,'broad'],[1.65,.95,.45,'broad'],[-4.16,2.1,.65,'palm'],[-4.13,3.1,.55,'broad'],[-4.13,4.0,.5,'broad'],[-2.2,5.67,.52,'broad'],[4.23,5.7,.7,'palm']];
 for(let i=0;i<18;i++){const z=-5.2+i*.39;const pg=group(g);plant(pg,4.19,0,z,.21+(i%3)*.06,'broad');vegetation.push(pg);}
 for(let i=0;i<8;i++){const pg=group(g);plant(pg,-4.13,0,1.85+i*.45,.22+(i%3)*.05,'broad');vegetation.push(pg);}
 for(let [x,z,s,t] of plantSpecs){const pg=group(g);plant(pg,x,0,z,s,t);vegetation.push(pg);}
 for(let f=1;f<4;f++){const fl=floors[f];for(let x of [-3.8,3.85]){box(fl,x,.17,-5.45,.53,.35,.55,'stone',.05);const pg=group(fl);plant(pg,x,.34,-5.45,.55,'broad');vegetation.push(pg);}plant(fl,-.0,0,.8,.6,'potted');plant(fl,3.85,0,1.55,.62,'potted');}
 for(let p of [[.1,-5.35],[3.9,-2.4]]){box(f3,p[0],.2,p[1],.55,.4,.55,'stone');plant(f3,p[0],.4,p[1],.72,'palm');}
 for(let x of [-3.8,.85,4.2]){box(g,x,.22,.0,.065,.44,.065,'dark');box(g,x,.45,.0,.075,.025,.075,'led');light(g,x,.45,0,.5);}
 // Cameras, controls and discretely integrated home automation panels.
 for(let f=0;f<4;f++){const fl=floors[f];sphere(fl,4.1,2.75,-5.4,.065,.06,.065,'black',12);box(fl,3.92,1.35,-.7,.026,.18,.12,'screenTv',.01);}
 // Batch static meshes by material per floor; protect Water and explicit visibility groups.
 function batch(root){root.updateMatrixWorld(true);const inv=new T.Matrix4().copy(root.matrixWorld).invert();const buckets=new Map();const remove=[];root.traverse(o=>{if(!o.isMesh||o===water||o===waterfall||o.material.transparent||o.userData.noBatch)return;const mat=o.material;if(Array.isArray(mat))return;const geo=o.geometry.clone();geo.applyMatrix4(new T.Matrix4().multiplyMatrices(inv,o.matrixWorld));geo.deleteAttribute('uv1');if(!geo.getAttribute('uv'))geo.setAttribute('uv',new T.Float32BufferAttribute(new Float32Array(geo.getAttribute('position').count*2),2));let ng=geo.index?geo.toNonIndexed():geo;const key=mat.uuid;if(!buckets.has(key))buckets.set(key,{mat,geos:[]});buckets.get(key).geos.push(ng);remove.push(o);});for(let o of remove)o.removeFromParent();for(let {mat,geos} of buckets.values()){const geo=mergeGeometries(geos,false);if(geo){const merged=new T.Mesh(geo,mat);merged.castShadow=true;merged.receiveShadow=true;root.add(merged);}for(let gg of geos)gg.dispose();}}
 // Vegetation is separate so leaf density can be reduced before architectural detail.
 // Prevent broad batching from absorbing vegetation; batch them individually and detach during floor merge.
 const vegParents=vegetation.map(pg=>({pg,parent:pg.parent}));vegParents.forEach(({pg})=>pg.removeFromParent());floors.forEach(batch);stairs.forEach(batch);batch(top);vegParents.forEach(({pg,parent})=>{parent.add(pg);batch(pg);});
 // Site non-floor meshes remain modest in count.
 return {site,floors,slabs,roofs,stairs,lights,water,waterfall,vegetation,colliders:b.colliders,stair:{cx,cz,ri,ro,n,sweep,start},batch};
}
