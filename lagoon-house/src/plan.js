import {SITE,FLOORS,LEVELS,dims,measure} from './layout.js';
export {SITE,FLOORS};
const views={parking:{eye:[-1.2,1.65,-6.8],target:[-1.1,.8,-3]},lagoon:{eye:[.85,1.65,-1],target:[2.8,.2,-2.6]},stair0:{eye:[1.65,1.65,.60],target:[3.35,1.8,3.7]},guest:{eye:[-1.65,4.95,-2.42],target:[-2.75,4.2,-3.9]},living:{eye:[1.67,4.95,-2.08],target:[.3,4.2,-4.4]},dining:{eye:[1.3,4.95,.85],target:[.0,4.1,-.25]},kitchen:{eye:[2.05,4.95,.72],target:[3.5,4.2,-.3]},master:{eye:[-1.70,8.25,2.95],target:[-2.6,7.4,.9]},premium:{eye:[-.65,11.55,-2.3],target:[-2.05,10.7,-4]},terrace:{eye:[3.67,11.55,-2.5],target:[1.4,10.8,-4.6]}};
export const ROOMS=LEVELS.flatMap((l,f)=>l.rooms.map((r,i)=>{const [x,z,xx,zz]=r.bounds,y=f*SITE.floorHeight;return {...r,floor:f,number:i+1,...dims(r),note:`${measure(r)} ${r.kind==='lift'||r.kind==='stair'?'overall footprint':r.polygon?'bounding size':'clear'}. ${r.note||''}`,eye:[(x+xx)/2,y+SITE.eyeHeight,z+(zz-z)*.72],target:[(x+xx)/2,y+1.05,z+.35],...views[r.id]};}));
export const VIEWS=[
{id:'street',name:'North street elevation',eye:[0,6.2,-20],target:[0,5.4,0]},
{id:'aerial',name:'North-east aerial',eye:[15,15,-19],target:[0,4.8,0]},
{id:'arrival',name:'Ground arrival',eye:[.9,1.65,-6.6],target:[2.5,.8,-1.5],floor:0},
...ROOMS.filter(r=>['stair0','parking','lagoon','foyer','gallery1','living','dining','kitchen','wet','pantry','puja','guest','master','wardrobe','bath','premium','terrace'].includes(r.id)).map(r=>({...r,id:'view-'+r.id})),
{id:'atrium',name:'Stair atrium looking up',floor:0,eye:[2.05,1.65,3.0],target:[2.8,10,3.6]},
{id:'night',name:'Night exterior',eye:[13,9,-16],target:[0,4.5,0],night:true},
{id:'isometric',name:'Full isometric',eye:[17,21,-19],target:[0,4.8,0]}
];
