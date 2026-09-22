// Single dimensional source for the 2D drawing, 3D shell, furniture and camera targets.
// One world unit = one metre. +X east, +Z south, Y up. Room bounds are clear inside faces.
export const SITE={width:9.144,depth:12.192,floorHeight:3.30,wall:.20,partition:.12,ceiling:3.02,outer:[-4.25,-5.48,4.25,5.48],inner:[-4.05,-5.28,4.05,5.28],eyeHeight:1.65};
export const FLOORS=['Ground','First','Second','Third / Terrace'];
export const STAIR={bounds:[.24,1.46,4.05,5.27],width:1.20,going:.29,risers:20,rise:.165,landing:1.20,lowerX:3.45,upperZ:4.67,startZ:1.46,turnX:2.85,turnZ:4.07};
export const LIFT={bounds:[-2.80,3.67,-1.20,5.27],wall:.12};
export const LAGOON_CONTROLS=[[1.62,-5.37],[3.3,-5.40],[4.03,-4.80],[4.08,-3.70],[3.76,-2.55],[4.08,-1.12],[3.73,-.57],[2.65,.10],[1.6,-.31],[1.44,-.60],[1.74,-1.9],[1.43,-3.2]];
// Closed uniform Catmull–Rom shoreline sampled once for both the drawing and mesh.
// Every performance mode retains all 192 segments.
function sampleShore(points,n=192){return Array.from({length:n},(_,k)=>{const t=k/n*points.length,i=Math.floor(t),u=t-i,u2=u*u,u3=u2*u;return [0,1].map(axis=>{const a=points[(i-1+points.length)%points.length][axis],b=points[i][axis],c=points[(i+1)%points.length][axis],d=points[(i+2)%points.length][axis];return .5*((2*b)+(-a+c)*u+(2*a-5*b+4*c-d)*u2+(-a+3*b-3*c+d)*u3);});});}
export const LAGOON=sampleShore(LAGOON_CONTROLS);
const lagoonBounds=[Math.min(...LAGOON.map(p=>p[0])),Math.min(...LAGOON.map(p=>p[1])),Math.max(...LAGOON.map(p=>p[0])),Math.max(...LAGOON.map(p=>p[1]))];
const R=(id,name,bounds,kind='room',extra={})=>({id,name,bounds,kind,...extra});
export const LEVELS=[
 {title:'Resort arrival',rooms:[
 R('parking','Two-car parking',[-4.0,-5.5,1.2,-.3],'parking',{note:'Two bays of 2.60 × 5.20 m. Cars shown at 1.86 × 4.65 m.'}),
 R('lagoon','Lagoon water',lagoonBounds,'water',{polygon:LAGOON,note:'Irregular water boundary; dimensions are the overall bounding box, not a rectangular pool.'}),
 R('arrival','Arrival lounge',[-4.05,1.55,-1.30,3.35],'outdoor',{note:'Dry garden seating clear of the parking bay.'}),
 R('services','Pool plant / services',[-4.05,3.67,-2.92,5.27],'service'),
 R('approach','Dry approach',[-1.08,1.34,.12,5.27],'circulation',{note:'1.20 m dry route beside the stair and lift.'}),
 R('lift0','Lift shaft',LIFT.bounds,'lift',{note:'1.60 m overall shaft; indicative 1.36 m internal width, vendor confirmation required.'}),
 R('stair0','Sculptural entrance stair',STAIR.bounds,'stair',{note:'Two broad straight flights with one quarter-turn landing. No spiral geometry.'})]},
 {title:'Social floor',rooms:[
 R('guest','Guest / parents bedroom',[-4.05,-5.27,-1.02,-1.92],'bedroom',{note:'Queen bed 1.55 × 2.05 m. Compact guest room; common bathroom nearby.'}),
 R('living','Living hall',[-.90,-5.27,4.05,-1.62],'living',{polygon:[[-.90,-5.27],[2.48,-5.27],[2.48,-3.50],[4.05,-3.50],[4.05,-1.62],[-.90,-1.62]],note:'L-shaped hall: main rectangle 3.38 × 3.65 m plus 1.57 × 1.88 m bay. Puja area is excluded.'}),
 R('puja','Puja room',[2.60,-5.27,4.05,-3.62],'puja'),
 R('dining','Dining',[-.90,-1.50,1.67,1.22],'living',{note:'Four comfortable or six close seats around a 1.45 × 0.80 m table. Open connection to the living hall.'}),
 R('kitchen','Show kitchen',[1.79,-1.50,4.05,1.22],'kitchen',{note:'2.26 m width: 600 mm east counter with a clear central working aisle. No island.'}),
 R('bath1','Common bathroom',[-4.05,-1.80,-2.18,.32],'bath',{note:'Shared guest/common bathroom. A separate guest ensuite is not added to this compact floor.'}),
 R('hall1','Bedroom passage',[-2.06,-1.80,-1.02,.32],'circulation'),
 R('pantry','Walk-in pantry',[-4.05,.44,-2.57,1.82],'service',{note:'350 mm shelving leaves 1.13 m clear width at the shelf face.'}),
 R('foyer','Entrance foyer',[-2.45,.44,-1.20,1.82],'circulation',{note:'East-facing main door opens from the gallery into this foyer; onward access leads north to living.'}),
 R('wet','Wet kitchen',[-4.05,1.94,-1.20,3.55],'kitchen',{note:'Single 600 mm working counter; remaining clear aisle 1.01 m. A compact working kitchen.'}),
 R('utility','Utility',[-4.05,3.67,-2.92,5.27],'service'),
 R('lift1','Lift shaft',LIFT.bounds,'lift'),
 R('gallery1','Arrival gallery',[-1.08,1.34,.24,5.27],'circulation',{note:'The stair arrives onto a 1.32 m gallery leading to the east-facing door.'}),
 R('stair1','Stair / atrium',STAIR.bounds,'stair')]},
 {title:'Private family floor',rooms:[
 R('master','Master sleeping room',[-4.05,-.80,-1.20,3.55],'bedroom',{note:'2.85 × 4.35 m sleeping room: long rather than wide. King bed 1.80 × 2.05 m; dressing and bath are separate.'}),
 R('wardrobe','Master walk-in',[-4.05,-3.12,-1.20,-.92],'wardrobe',{note:'600 mm wardrobes face a 1.65 m central aisle.'}),
 R('bath','Master bathroom',[-4.05,-5.27,-1.20,-3.24],'bath',{note:'Double vanity, walk-in shower and WC; no bathtub.'}),
 R('bedroom','Family bedroom',[.24,-5.27,4.05,-1.72],'bedroom',{note:'Queen bed and full-height storage. North and east daylight.'}),
 R('familybath','Family bathroom',[2.27,-1.60,4.05,1.22],'bath'),
 R('family','Family lounge',[.24,-1.60,2.15,1.22],'living',{note:'Small private sitting area with two seats.'}),
 R('hall2','Suite passage',[-1.08,-5.27,.12,1.22],'circulation'),
 R('linen','Linen / utility',[-4.05,3.67,-2.92,5.27],'service'),
 R('lift2','Lift shaft',LIFT.bounds,'lift'),
 R('gallery2','Floor gallery',[-1.08,1.34,.24,5.27],'circulation'),
 R('stair2','Stair / atrium',STAIR.bounds,'stair')]},
 {title:'Premium suite & terrace',rooms:[
 R('premium','Premium bedroom',[-4.05,-5.27,.12,-1.92],'bedroom',{note:'King bed 1.80 × 2.05 m. This wider room shows the benefit of a less crowded floor.'}),
 R('premiumwardrobe','Premium walk-in',[-4.05,-1.80,-1.20,.32],'wardrobe'),
 R('premiumbath','Premium bathroom',[-4.05,.44,-1.20,3.55],'bath'),
 R('study','Study / reading',[.24,-1.80,2.15,1.22],'study'),
 R('terrace','Roof terrace',[.24,-5.27,4.05,-1.92],'outdoor',{note:'Open deck under a light pergola. Full-size lounge furniture.'}),
 R('terracepass','Terrace access',[2.27,-1.80,4.05,1.22],'circulation'),
 R('hall3','Suite passage',[-1.08,-1.80,.12,1.22],'circulation'),
 R('plant','Screened services',[-4.05,3.67,-2.92,5.27],'service'),
 R('lift3','Lift shaft',LIFT.bounds,'lift'),
 R('gallery3','Floor gallery',[-1.08,1.34,.24,5.27],'circulation'),
 R('stair3','Atrium & skylight',STAIR.bounds,'stair')]}
];
// Axis-aligned walls: p is centreline, a/b are extents; openings are true clear door gaps.
const W=(axis,p,a,b,doors=[],height=SITE.ceiling)=>({axis,p,a,b,doors,height});
export const WALLS=[[],[
 W('z',-.96,-5.27,-1.86,[[-3.05,-2.15]]),W('x',-1.86,-4.05,-1.02),
 W('z',2.54,-5.27,-3.56,[[-4.65,-3.85]]),W('x',-3.56,2.60,4.05),
 W('z',-2.12,-1.86,.38,[[-1.50,-.68]]),W('x',.38,-4.05,-2.18),
 W('z',-2.51,.38,1.88,[[.77,1.57]]),W('x',1.88,-4.05,-1.20,[[-2.25,-1.4]]),
 W('x',3.61,-4.05,-1.20,[[-3.97,-3.12]]),W('z',-2.86,3.61,5.27),
 W('z',-1.14,.38,1.88,[[.78,1.78]]),W('z',1.73,-1.56,1.22,[[-.20,.80]])
],[
 W('z',-1.14,-5.27,3.61,[[-4.60,-3.75],[-2.65,-1.80],[.65,1.55]]),
 W('x',-3.18,-4.05,-1.20,[[-2.75,-1.90]]),W('x',-.86,-4.05,-1.20,[[-2.75,-1.90]]),W('x',3.61,-4.05,-1.20,[[-3.97,-3.12]]),W('z',-2.86,3.61,5.27),
 W('z',.18,-5.27,-1.66,[[-2.70,-1.80]]),W('x',-1.66,.24,4.05,[[.65,1.55]]),W('z',2.21,-1.66,1.22,[[-.20,.65]])
],[
 W('x',-1.86,-4.05,.12,[[-.90,-.02]]),W('z',.18,-5.27,-1.86,[[-2.8,-1.9]]),
 W('z',-1.14,-1.86,3.61,[[-1.20,-.35],[1.35,2.20]]),W('x',.38,-4.05,-1.20,[[-2.75,-1.90]]),W('x',3.61,-4.05,-1.20,[[-3.97,-3.12]]),W('z',-2.86,3.61,5.27)
]];
export const FURNITURE=[
 [{type:'car',x:-2.7,z:-2.9,w:1.86,d:4.65},{type:'car',x:-.10,z:-2.9,w:1.86,d:4.65,variant:1},{type:'sofa',x:-2.4,z:2.45,w:1.65,d:.98},{type:'cabinet',x:-3.46,z:4.47,w:.75,d:1.2}],
 [{type:'bed',x:-2.75,z:-3.89,w:1.55,d:2.05},{type:'wardrobe',x:-3.73,z:-2.46,w:1.0,d:.60,rot:Math.PI/2},
 {type:'sofa',x:.65,z:-4.73,w:2.45,d:.98},{type:'chair',x:1.2,z:-2.22,w:.48,d:.50,rot:Math.PI},{type:'coffee',x:.60,z:-3.44,w:.85,d:.65},{type:'tv',x:2.38,z:-3.97,w:1.30,d:.10,rot:Math.PI/2},
 {type:'dining',x:.38,z:-.12,w:1.45,d:.80},{type:'kitchen',x:3.73,z:-.13,w:2.35,d:.60,rot:-Math.PI/2},{type:'fridge',x:2.16,z:-1.15,w:.65,d:.60},
 {type:'shrine',x:3.33,z:-4.90,w:.90,d:.42},
 {type:'shower',x:-3.55,z:-1.30,w:.90,d:.90},{type:'toilet',x:-2.63,z:-1.32,w:.45,d:.70},{type:'vanity',x:-3.24,z:.04,w:.85,d:.50,rot:Math.PI},
 {type:'shelves',x:-3.85,z:1.13,w:1.04,d:.35,rot:Math.PI/2},
 {type:'kitchen',x:-2.60,z:3.23,w:2.50,d:.60,rot:Math.PI},{type:'washer',x:-3.50,z:4.84,w:.60,d:.60}],
 [{type:'bed',x:-2.625,z:1.42,w:1.80,d:2.05},{type:'chair',x:-3.61,z:2.96,w:.48,d:.50,rot:-Math.PI/2},{type:'tv',x:-1.27,z:1.55,w:1.35,d:.10,rot:Math.PI/2},
 {type:'wardrobe',x:-3.74,z:-2.01,w:1.80,d:.60,rot:Math.PI/2},{type:'wardrobe',x:-1.51,z:-2.01,w:1.80,d:.60,rot:-Math.PI/2},
 {type:'vanity',x:-2.08,z:-4.97,w:1.48,d:.50},{type:'shower',x:-3.55,z:-3.80,w:.90,d:.90},{type:'toilet',x:-1.68,z:-3.62,w:.45,d:.70},
 {type:'bed',x:2.25,z:-3.84,w:1.55,d:2.05},{type:'wardrobe',x:3.74,z:-2.54,w:1.35,d:.60,rot:-Math.PI/2},
 {type:'sofa',x:1.17,z:-.90,w:1.55,d:.98},{type:'coffee',x:1.17,z:.30,w:.50,d:.50},
 {type:'shower',x:3.55,z:-1.08,w:.90,d:.90},{type:'toilet',x:2.72,z:-1.08,w:.45,d:.70},{type:'vanity',x:3.20,z:.93,w:.85,d:.50,rot:Math.PI}],
 [{type:'bed',x:-2.05,z:-3.85,w:1.80,d:2.05},{type:'wardrobe',x:-3.74,z:-.76,w:1.80,d:.60,rot:Math.PI/2},{type:'wardrobe',x:-1.51,z:-.76,w:1.80,d:.60,rot:-Math.PI/2},
 {type:'vanity',x:-2.35,z:3.23,w:1.70,d:.50,rot:Math.PI},{type:'shower',x:-3.50,z:1.04,w:.90,d:.90},{type:'toilet',x:-1.68,z:1.05,w:.45,d:.70},
 {type:'desk',x:1.18,z:-1.36,w:1.70,d:.60},{type:'chair',x:1.18,z:-.58,w:.48,d:.50,rot:Math.PI},
 {type:'sofa',x:2.0,z:-4.74,w:2.45,d:.98},{type:'chair',x:3.55,z:-2.69,w:.48,d:.50,rot:-Math.PI/2},{type:'coffee',x:2.30,z:-3.32,w:.8,d:.65}]
];
export function polygonArea(p){return Math.abs(p.reduce((s,a,i)=>{const b=p[(i+1)%p.length];return s+a[0]*b[1]-a[1]*b[0]},0)/2);}
export function dims(r){const [x,z,xx,zz]=r.bounds;return {w:xx-x,d:zz-z,area:r.polygon?polygonArea(r.polygon):(xx-x)*(zz-z)};}
export function feet(m){const inches=Math.round(m/.0254);return `${Math.floor(inches/12)}′ ${inches%12}″`;}
export function measure(r,unit='m'){const d=dims(r);return unit==='m'?`${d.w.toFixed(2)} × ${d.d.toFixed(2)} m`:`${feet(d.w)} × ${feet(d.d)}`;}
export function roomPoints(r){if(r.polygon)return r.polygon;const [x,z,xx,zz]=r.bounds;return [[x,z],[xx,z],[xx,zz],[x,zz]];}
export function solidWallParts(w){let parts=[],s=w.a;for(const [a,b] of [...w.doors].sort((a,b)=>a[0]-b[0])){if(a>s)parts.push([s,a]);s=b;}if(s<w.b)parts.push([s,w.b]);return parts;}
export function insidePolygon(x,z,poly){let inside=false;for(let i=0,j=poly.length-1;i<poly.length;j=i++){const a=poly[i],b=poly[j];if((a[1]>z)!==(b[1]>z)&&x<(b[0]-a[0])*(z-a[1])/(b[1]-a[1])+a[0])inside=!inside;}return inside;}
