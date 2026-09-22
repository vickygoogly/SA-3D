import {SITE,LEVELS,WALLS,FURNITURE,STAIR,LIFT,LAGOON,roomPoints,dims,measure,solidWallParts,feet} from './layout.js';
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]));
export function floorSvg(floor=1,{unit='m',selected=null,showFurniture=true,showDimensions=true,grid=true,includeSchedule=false}={}){
 const s=61,ox=365,oy=500;const X=x=>ox+x*s,Z=z=>oy+z*s;
 const colors={bedroom:'#ece3d6',living:'#e6e9dc',kitchen:'#efe5cc',bath:'#dce8e7',wardrobe:'#e8dfd7',service:'#e6e0d3',circulation:'#f3f1ea',stair:'#e8e6e0',lift:'#d7e0df',puja:'#efe8d6',outdoor:'#dfE8d8',parking:'#e6e6e0',water:'#a2d4d3'};
 const text=(x,y,str,size=12,fill='#435149',attrs='')=>`<text x="${x}" y="${y}" font-size="${size}" fill="${fill}" ${attrs.includes('text-anchor=')?'':'text-anchor="middle"'} ${attrs}>${esc(str)}</text>`;
 const rect=(b,fill,stroke='#52645a',sw=.7,extra='')=>`<rect x="${X(b[0])}" y="${Z(b[1])}" width="${(b[2]-b[0])*s}" height="${(b[3]-b[1])*s}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}" ${extra}/>`;
 const line=(x,y,xx,yy,stroke='#6f7e74',width=1,dash='')=>`<line x1="${x}" y1="${y}" x2="${xx}" y2="${yy}" stroke="${stroke}" stroke-width="${width}" ${dash?`stroke-dasharray="${dash}"`:''}/>`;
 const dim=(a,b,p,vertical,label)=>{const x=vertical?X(p):X(a),y=vertical?Z(a):Z(p),xx=vertical?X(p):X(b),yy=vertical?Z(b):Z(p);return line(x,y,xx,yy,'#485f56',1)+line(x-4,y-4,x+4,y+4)+line(xx-4,yy-4,xx+4,yy+4)+text(vertical?x-12:(x+xx)/2,vertical?(y+yy)/2:y-8,label,13,'#33483e',vertical?`transform="rotate(-90 ${x-12} ${(y+yy)/2})"`:'');};
 let out=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${includeSchedule?1180:790} 990" role="img" aria-label="Dimensioned ${esc(LEVELS[floor].title)} floor plan" style="font-family:Arial,sans-serif"><rect width="${includeSchedule?1180:790}" height="990" fill="#fcfbf7"/>`;
 out+=text(395,31,'LAGOON HOUSE / '+LEVELS[floor].title.toUpperCase(),17,'#283f32','font-weight="600"');
 out+=text(395,54,'30 × 40 ft site · clear internal room dimensions · 1 square = 1 metre',12);
 out+=rect([-4.572,-6.55,4.572,-6.18],'#e7e8e2','none',0)+text(365,Z(-6.30),'NORTH ROAD',13);
 out+=rect([-4.572,-6.096,4.572,6.096],'#f0f0e4','#839181',1.2);
 if(grid)for(let x=-4;x<=4;x++)out+=line(X(x),Z(-6.096),X(x),Z(6.096),'#d9ddd2',.6);if(grid)for(let z=-6;z<=6;z++)out+=line(X(-4.572),Z(z),X(4.572),Z(z),'#d9ddd2',.6);
 if(floor>0)out+=rect(SITE.outer,'#f6f4eb','#60675e',1);
 for(const [i,r] of LEVELS[floor].rooms.entries()){
 const d=dims(r),c=selected===r.id?'#d6dba8':colors[r.kind]||'#efece1';const pts=roomPoints(r).map(v=>`${X(v[0])},${Z(v[1])}`).join(' ');
 out+=`<g data-room="${r.id}" tabindex="0" role="button" aria-label="${esc(r.name+' '+measure(r,unit))}" style="cursor:pointer"><title>${esc(r.name+' — '+measure(r,unit)+' — '+d.area.toFixed(2)+' m²')}</title><polygon points="${pts}" fill="${c}" stroke="${selected===r.id?'#516941':'#afb8a7'}" stroke-width="${selected===r.id?2:.65}"/>`;
 out+='</g>';
 }
 // Solid wall geometry and clear openings are the same segments used by Three.js.
 if(floor>0){const [x,z,xx,zz]=SITE.outer;out+=rect([x,z,xx,z+.20],'#696e64','none')+rect([x,zz-.2,xx,zz],'#696e64','none')+rect([x,z,x+.2,zz],'#696e64','none')+rect([xx-.2,z,xx,zz],'#696e64','none');}
 if(floor>0){out+=line(X(-4.15),Z(-5.28),X(-4.15),Z(5.28),'#b7d0cf',3)+line(X(4.15),Z(-5.28),X(4.15),Z(5.28),'#b7d0cf',3)+line(X(-4.05),Z(-5.38),X(4.05),Z(-5.38),'#b7d0cf',3);}
 for(const w of WALLS[floor]){
 for(const [a,b] of solidWallParts(w)){out+=w.axis==='x'?rect([a,w.p-.06,b,w.p+.06],'#646a61','none'):rect([w.p-.06,a,w.p+.06,b],'#646a61','none');}
 for(const [a,b] of w.doors){const length=(b-a)*s,ax=X(w.axis==='x'?a:w.p),az=Z(w.axis==='z'?a:w.p);const ex=ax+(w.axis==='x'?length/Math.SQRT2:length/Math.SQRT2),ez=az+(w.axis==='x'?length/Math.SQRT2:length/Math.SQRT2);out+=line(ax,az,ex,ez,'#9b7a53',1.5);out+=`<path d="M ${ax+(w.axis==='x'?length:0)} ${az+(w.axis==='z'?length:0)} A ${length} ${length} 0 0 1 ${ex} ${ez}" fill="none" stroke="#9eaa97" stroke-width=".8"/>`;}
 }
 // Lift shaft (1.60 m exterior). Door opening faces east.
 out+=rect(LIFT.bounds,'#d9e1df','#657a72',1.4);out+=rect([LIFT.bounds[0]+.12,LIFT.bounds[1]+.12,LIFT.bounds[2]-.12,LIFT.bounds[3]-.12],'none','#82948c',.8);
 // The revised entrance is a quarter-turn, two-flight stair, never a spiral.
 for(let i=0;i<9;i++){const flare=floor===0?Math.max(0,3-i)*.075:0;out+=rect([2.85-flare,1.46+i*.29,4.05,1.46+(i+1)*.29],'#f1e8d6','#8c8476',.85);out+=text(X(3.45),Z(1.46+(i+.5)*.29)+3,String(i+1),9,'#8e8069');}
 out+=rect([2.85,4.07,4.05,5.27],'#e7ddc9','#8c8476',1);
 for(let i=0;i<9;i++){out+=rect([2.85-(i+1)*.29,4.07,2.85-i*.29,5.27],'#f1e8d6','#8c8476',.85);out+=text(X(2.85-(i+.5)*.29),Z(4.67)+3,String(i+11),9,'#8e8069');}
 out+=`<path d="${floor===3?`M ${X(3.28)} ${Z(1.90)} L ${X(3.45)} ${Z(1.66)} L ${X(3.62)} ${Z(1.90)}`:`M ${X(.68)} ${Z(4.50)} L ${X(.45)} ${Z(4.67)} L ${X(.68)} ${Z(4.84)}`}" fill="none" stroke="#546d61" stroke-width="1.5"/>`;
 out+=`<path d="M ${X(3.45)} ${Z(1.66)} L ${X(3.45)} ${Z(4.67)} L ${X(.45)} ${Z(4.67)}" fill="none" stroke="#546d61" stroke-width="1.5"/>`+text(X(2),Z(3.12),unit==='m'?'1.20 m flights':'3′ 11″ flights',11)+text(X(2),Z(3.40),'20 RISERS',11)+text(X(2),Z(3.66),unit==='m'?'165 mm each':'6.5 in each',11)+text(X(2),Z(3.92),(floor===3?'DOWN ':'UP ')+(unit==='m'?'3.30 m':'10′ 10″'),11);
 if(showFurniture){for(const o of FURNITURE[floor]){
 const w=o.w||.6,d=o.d||.6,rot=(o.rot||0)*180/Math.PI,cx=X(o.x),cz=Z(o.z);out+=`<g transform="translate(${cx} ${cz}) rotate(${-rot})" fill="#fffdf7" stroke="#7b8278" stroke-width=".85" pointer-events="none">`;
 const rr=(x,z,w,d,fill='#fffdf7',rad=3)=>`<rect x="${x*s}" y="${z*s}" width="${w*s}" height="${d*s}" rx="${rad}" fill="${fill}"/>`;
 out+=rr(-w/2,-d/2,w,d,o.type==='car'?'#ccd2ce':o.type==='kitchen'?'#dfcfb6':'#fffdf7');
 if(o.type==='bed'){out+=rr(-w/2-.06,-1.09,w+.12,2.18,'none')+rr(-w/2-.20,-1.11,w+.40,.12,'#d8c5a7')+rr(-w/2+.08,-d/2+.12,w/2-.13,.44)+rr(.04,-d/2+.12,w/2-.13,.44)+`<path d="M ${-w/2*s} ${-.40*s} H ${w/2*s}"/>`;for(let side of [-1,1])out+=rr(side*(w/2+.28)-.21,-.995,.42,.43,'#d8c5a7');}
 if(o.type==='sofa'){out+=rr(-w/2,-d/2,w,.20,'#ddd6c7');for(let x=-w/2+.08;x<w/2-.1;x+=.72)out+=rr(x,-d/2+.23,.62,.64,'#f4efe3');}
 if(o.type==='dining')for(let x of [-.49,0,.49])for(let z of [-.67,.67])out+=rr(x-.24,z-.25,.48,.50,'#e2d5c0');
 if(o.type==='car'){out+=rr(-w*.40,-.6,w*.80,1.6,'#667f7a');out+=rr(-w*.42,-2.0,w*.84,1.2,'#dedfda');}
 if(o.type==='shower')out+=`<path d="M ${-w/2*s} ${-d/2*s} L ${w/2*s} ${d/2*s} M ${w/2*s} ${-d/2*s} L ${-w/2*s} ${d/2*s}"/>`;
 out+='</g>';
 }}
 for(const [i,r] of LEVELS[floor].rooms.entries()){
 let [x,z,xx,zz]=r.bounds,cx=X((x+xx)/2),cz=Z((z+zz)/2);if(r.id==='living'){cx=X(.75);cz=Z(-2.55);}if(r.kind==='stair'){cx=X(1.72);cz=Z(2.40);}const d=dims(r);out+=`<g pointer-events="none"><circle cx="${cx}" cy="${cz-13}" r="11" fill="#40574b"/>`+text(cx,cz-9,i+1,11,'#ffffff');
 if(showDimensions){const lbl=unit==='m'?`${d.w.toFixed(2)} × ${d.d.toFixed(2)}`:`${feet(d.w)} × ${feet(d.d)}`;const font=unit==='ft'&&d.w<1.9?9:11;const tw=lbl.length*font*.55;out+=`<rect x="${cx-tw/2-4}" y="${cz+3}" width="${tw+8}" height="17" rx="2" fill="#fcfbf7" fill-opacity=".94"/>`+text(cx,cz+15,lbl,font);}
 out+='</g>';
 }
 out+=dim(-4.572,4.572,-6.9,false,unit==='m'?'9.144 m / 30 ft':'30′ 0″ / 9.144 m');
 out+=dim(-6.096,6.096,-5.24,true,unit==='m'?'12.192 m / 40 ft':'40′ 0″ / 12.192 m');
 // Building width and depth are measured outside faces. Dashed border is the plot.
 if(floor>0){out+=dim(-4.25,4.25,6.56,false,'Building 8.50 m / '+feet(8.50));out+=dim(-5.48,5.48,5.10,true,'Building 10.96 m / '+feet(10.96));}
 out+=text(715,96,'N',17,'#40574b')+line(715,133,715,109,'#40574b',2)+`<path d="M 710 116 L 715 106 L 720 116" fill="none" stroke="#40574b" stroke-width="2"/>`;
 out+=text(390,932,'Walls: 200 mm outside / 120 mm partitions · Clear ceiling: 3.02 m',12);
 out+=text(390,953,'Concept only. Reserved plot margins are illustrative, not approved setbacks.',11);
 out+=line(120,973,120+2*s,973,'#40574b',3)+text(120,965,'0',10)+text(120+s,965,'1 m',10)+text(120+2*s,965,'2 m',10);
 if(includeSchedule){
  out+=line(800,28,800,965,'#d8ddd0',1)+text(990,43,'ROOM SCHEDULE',17,'#283f32','font-weight="600"')+text(990,67,'Clear internal sizes · numbered on plan',12);
  for(const [i,r]of LEVELS[floor].rooms.entries()){const y=112+i*52,d=dims(r);out+=`<circle cx="827" cy="${y+1}" r="10" fill="#40574b"/>`+text(827,y+5,i+1,11,'#ffffff')+text(848,y+5,r.name,13,'#2d4135','text-anchor="start"')+text(848,y+25,measure(r,unit),12,'#566450','text-anchor="start"')+text(1150,y+25,d.area.toFixed(2)+' m²',12,'#566450','text-anchor="end"')+line(817,y+37,1154,y+37,'#dce0d4',.7);}
  out+=text(990,893,'Lift / stair areas are overall footprints.',12)+text(990,915,'Irregular rooms use bounding dimensions',12)+text(990,933,'and their actual polygon area.',12);
 }
 return out+'</svg>';
}
