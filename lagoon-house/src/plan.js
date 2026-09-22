// All geometry uses metres. +X east; -Z north. No arbitrary world-scale conversions.
export const SITE={width:9.144,depth:12.192,floorHeight:3.3};
export const FLOORS=['Ground','First','Second','Third / Terrace'];
export const ROOMS=[
 {id:'lagoon',name:'Lagoon & shoreline',floor:0,eye:[3.8,1.65,-4.9],target:[2.9,.2,-1.4],note:'Organic shoreline, beach entry and a dry pedestrian edge.'},
 {id:'stair',name:'Stair atrium',floor:0,eye:[-.4,1.65,2.2],target:[2.05,2.0,3.65],note:'1.20 m clear curved stair · 20 risers per storey · glazed atrium.'},
 {id:'parking',name:'Parking & arrival',floor:0,eye:[-.8,2,-7.6],target:[-1.45,.8,-2.7],note:'Two 2.60 × 5.20 m bays. Vehicle approach is from the north road.'},
 {id:'bridge',name:'First-floor gallery',floor:1,eye:[.0,4.95,1.0],target:[4.15,4.8,.0],note:'Gallery wraps to the east-facing residential entrance.'},
 {id:'entry',name:'East-facing entrance',floor:1,eye:[4.85,4.9,-.4],target:[2.5,4.85,-.4],note:'The main door faces east; a recessed foyer separates entry and seating.'},
 {id:'living',name:'Living room',floor:1,eye:[1.55,4.95,-2.6],target:[-.1,4.3,-4.8],note:'North-facing social space, soft seating and recessed media wall.'},
 {id:'dining',name:'Dining',floor:1,eye:[2.35,4.95,-.05],target:[1.3,4.1,-1.3],note:'Six seats with direct connection to the kitchen and living space.'},
 {id:'kitchen',name:'Show kitchen',floor:1,eye:[2.15,4.95,1.15],target:[3.5,4.1,.2],note:'East-side galley, east-facing hob; no island to preserve circulation.'},
 {id:'wet',name:'Wet kitchen',floor:1,eye:[-1.25,4.95,4.8],target:[-3.3,4.2,4.8],note:'Separate heavy-cooking kitchen with sink, hob and external ventilation.'},
 {id:'pantry',name:'Walk-in pantry',floor:1,eye:[-2.1,4.95,2.2],target:[-3.76,4.5,2.3],note:'Dedicated dry storage room with 400 mm shelving.'},
 {id:'puja',name:'Puja room',floor:1,eye:[3.3,4.95,-4.12],target:[3.35,4.3,-5.1],note:'North-east shrine with stone altar and a timber screen.'},
 {id:'guest',name:'Guest / parents bedroom',floor:1,eye:[-2.0,4.95,-2.1],target:[-2.85,4.2,-3.8],note:'North-west bedroom with accessible lift connection and bathroom access.'},
 {id:'master',name:'Master bedroom',floor:2,eye:[-1.25,8.25,2.25],target:[-2.7,7.4,3.9],note:'South-west suite, king bed, shaded windows and dressing transition.'},
 {id:'wardrobe',name:'Master walk-in',floor:2,eye:[-2.65,8.25,.65],target:[-3.35,7.7,.1],note:'Dedicated dressing room with full-height storage and central aisle.'},
 {id:'bath',name:'Master bathroom',floor:2,eye:[-1.55,8.25,-1.3],target:[-3.25,7.6,-2.25],note:'Double vanity, separate shower and screened WC.'},
 {id:'bedroom',name:'Family bedroom',floor:2,eye:[1.1,8.25,-2.45],target:[2.7,7.4,-4.4],note:'Queen bed, built-in wardrobe and north daylight.'},
 {id:'family',name:'Family lounge',floor:2,eye:[1.6,8.25,-.1],target:[.1,7.4,-2.1],note:'Private lounge between bedrooms and the atrium.'},
 {id:'premium',name:'Premium bedroom suite',floor:3,eye:[-1.7,11.55,-2.4],target:[-2.55,10.65,-4.1],note:'Fourth bedroom with its own walk-in wardrobe and bathroom.'},
 {id:'premiumwardrobe',name:'Premium walk-in',floor:3,eye:[-2.65,11.55,-.25],target:[-3.5,10.8,-.4],note:'Full-height wardrobes, mirror and accessory drawers.'},
 {id:'premiumbath',name:'Premium bathroom',floor:3,eye:[-2.25,11.55,1.45],target:[-3.3,10.8,2.3],note:'Separate wet and dry zones, natural high-level light.'},
 {id:'study',name:'Study & reading',floor:3,eye:[-.6,11.55,-1.3],target:[1.5,10.8,-2.3],note:'Quiet workspace opening toward the terrace.'},
 {id:'terrace',name:'Terrace garden',floor:3,eye:[4.0,11.55,-4.9],target:[1.7,10.4,-3.4],note:'Pergola, planted seating, shaded lounge and screened services.'},
];
export const VIEWS=[
 {id:'street',name:'North street elevation',eye:[0,6.2,-20],target:[0,5.4,0]},
 {id:'aerial',name:'North-east aerial',eye:[16,16,-20],target:[0,5,0]},
 {id:'arrival',name:'Ground arrival',eye:[-.4,1.75,-6.7],target:[2,.8,-1.4],floor:0},
 ...ROOMS.slice(0,3).map(r=>({...r,id:'view-'+r.id})),
 {id:'stairlagoon',name:'Staircase from lagoon',eye:[3.6,1.7,-.6],target:[2.05,2.2,3.5],floor:0},
 {id:'atriumup',name:'Atrium looking upward',eye:[2.05,1.65,3.5],target:[1.8,10,3.3],floor:0},
 ...ROOMS.filter(r=>['bridge','entry','living','dining','kitchen','puja','master','wardrobe','bath','premium'].includes(r.id)).map(r=>({...r,id:'view-'+r.id})),
 {id:'night',name:'Night exterior',eye:[13,9,-16],target:[0,4.5,0],night:true},
 {id:'view-terrace',...ROOMS.find(r=>r.id==='terrace')},
 {id:'isometric',name:'Full isometric',eye:[17,21,-19],target:[0,4.8,0]},
];
