# Revision 02 — measured design notes

The authoritative geometry is in `src/layout.js`. One scene unit is one metre. East is +X, south is +Z and up is +Y. The north road is at negative Z. Room bounds are clear inside faces, except the overall lift shaft and stair/atrium footprints. Irregular-room dimensions are bounding sizes; their areas follow the actual polygon.

## Stair and arrival

The earlier 300-degree winding staircase is removed. Two straight flights form an L around an open atrium. There are ten rises to a 1.20 m square landing, then ten rises to the next floor. With 165 mm risers, each storey is 3.30 m high. Each flight has nine 290 mm treads plus its landing, and a 1.20 m nominal tread width. The first three ground-level treads flare by 225, 150 and 75 mm on the inside. Glass is set close to the tread edges; final usable width depends on the detailed guard specification.

The rounded stone treads, twin sculpted underside ribs, warm nose lights and slender metal/glass rails give the entrance its distinctive character without winding around a central axis. The upper landing aligns with the gallery west of the atrium. Upper-floor guards leave the next flight's entry open.

The lagoon has a single shared 192-sample smooth boundary in plan and model. Its southern end is held clear of the approach to the stairs. Two 2.60 × 5.20 m parking bays contain 1.86 × 4.65 m cars (body dimensions; mirrors/turning need further detailing). The model assumes direct access from the north road; road width and a turning study are not supplied. This compact revision omits separately allocated scooter bays.

## Actual envelope and height

| Item | Dimension |
|---|---|
| Site | 9.144 × 12.192 m / exactly 30 × 40 ft |
| Building outside faces | 8.50 × 10.96 m |
| East/west plot margin | 0.322 m each |
| North/south plot margin | 0.616 m each |
| Outside walls | 200 mm |
| Partitions | 120 mm |
| Floor-to-floor height | 3.30 m |
| Slab | 220 mm indicative |
| Ceiling allowance below slab | 60 mm |
| Clear ceiling height | 3.02 m |
| Lift shaft overall | 1.60 × 1.60 m |
| Indicative shaft interior | 1.36 × 1.36 m before lift vendor requirements |

These small plot margins are illustrative, not sanctioned setbacks. There is no local jurisdiction, road-width survey, neighbour survey or authority approval in the supplied brief. Do not assume the modelled coverage, height or storey count is permitted.

## Spaciousness and separation

The first-floor living room is L-shaped. Its 4.95 × 3.65 m bounding box contains a puja-room notch; its actual area is **15.29 m²**, not the area of that full rectangle. A 3.38 × 3.65 m main part connects to a 1.57 × 1.88 m bay. Dining is a separate 2.57 × 2.72 m open zone: living and dining together provide **22.28 m²**, with no separating wall.

The main kitchen is **2.26 × 2.72 m**. Its 600 mm east-side counter leaves a working aisle; there is no island. The separate wet kitchen is **2.85 × 1.61 m**, with one 600 mm counter and a 1.01 m aisle. Pantry shelving is 350 mm deep. Six chairs are modelled around a compact table; four people will have more comfortable spacing.

The guest bedroom is **3.03 × 3.35 m**, with a 1.55 × 2.05 m mattress and a nearby common bathroom, not an additional ensuite. The SW master sleeping room is **2.85 × 4.35 m**: it is long and compact in width. Its 1.80 × 2.05 m mattress, walk-in wardrobe and bath have distinct allocations. The family and premium bedrooms are the other two bedrooms, for four total.

Beds show a surrounding frame, headboard and bedside tables; mattress labels should not be mistaken for the complete furniture envelope. Room sizes are not carpet-area claims for legal sale documentation. The full schedule and all plans are provided in this folder.

## Model behaviour

The plan is a true top-down measured drawing, with a one-metre grid and full site/building dimensions. The 3D scene uses the same boundaries, partition segments and furniture positions. Glazed exterior walls are shown with blue lines in the plan; third-floor terrace edges use guarding.

A floor cutaway lowers displayed walls for inspection. Room selection restores full walls and ceiling. Eye-level cameras are at 1.65 m, with a fixed 50-degree vertical field of view; screen aspect ratio changes horizontal perspective. The 1.70 m scale figure and true-size furniture are additional references, not substitutes for measurement. Walk mode stays on the selected floor and blocks the atrium and lift shaft; stair climbing and lift travel are not animated.

## Brief compromises and next architectural work

North-road access, an east-facing residential entrance, NE water/puja and a SW master are retained. The main kitchen is east and the wet kitchen is SW; this is a Vastu compromise. There is no claim of complete Vastu compliance.

A local architect and engineers must resolve legal setbacks and permissible bulk, structural supports and spans, stair headroom and detailed rails, protected escape, lift specification, accessibility, pool depth/drainage/barriers, service shafts, ventilation and neighbour privacy. Concept supports are not structural calculations. Residential plans are compact, and the large open stair atrium deliberately consumes useful floor area.

## Performance

The lagoon and stairs are never decimated or retessellated for performance. The generated stone texture is encoded losslessly as WebP; geometry is batched by material, hidden upper floors are culled, and the 3D loop pauses in plan mode. Balanced mode adjusts texture filtering, vegetation visibility, pixel density and shadows. Neither quality mode alters measured architecture.
