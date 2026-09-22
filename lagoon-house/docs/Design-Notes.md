# Design notes and planning boundaries

## Coordinates and scale

- Plot: 9.144 m east–west × 12.192 m north–south (30 × 40 ft).
- North is negative Z, east is positive X, vertical is Y.
- Ground 0.00 m; first 3.30 m; second 6.60 m; third 9.90 m; top roof 13.20 m.
- Typical slabs: 220 mm. Geometry is a concept allocation, not a structural calculation.
- Parking: two marked 2.60 × 5.20 m bays, west side, with north-road access. Third tandem parking is deliberately omitted.
- Stair: three repeated curved flights; 20 × 165 mm rises per storey; inner radius 0.55 m, outer radius 1.75 m; clear tread width 1.20 m; sweep 300 degrees. Walk-line going depends on the adopted walking radius and must be reviewed against local stair rules. Continuous guards and curved structural spine are modelled.
- Lift shaft: approximately 1.58 × 1.72 m. Not a vendor-approved accessible lift design.

## Floor program

| Level | Modelled program |
|---|---|
| Ground | Two cars, two scooters, lagoon, sand cove, planting, dry access, stairs, lift, pool service cabinet, seating |
| First | NW guest bedroom; north living; dining; NE puja; east galley show kitchen; separate SW wet kitchen; pantry; washrooms; utility; east-facing main door |
| Second | SW master bedroom, separate west dressing and bathroom; NE family bedroom; family lounge; additional bathroom and storage |
| Third | NW premium bedroom, separate dressing/bathroom; study; outdoor pergola lounge; planting; atrium access |
| Roof | Partial roof, glazed atrium skylight, solar and screened plant |

## Vastu intent: respected and unresolved

Respected in the concept: north road, east-facing residential door, NE puja/water, SW master sleeping zone, north/east daylight, residential functions above the ground resort level.

Disclosed compromises: the stair is south/south-east rather than west/south-west; the show kitchen is east rather than the strict SE corner; the working kitchen is SW. These choices leave the parking and master suite usable on the compact footprint. They are not final Vastu approval. The scene must not be described as fully Vastu-compliant.

## What needs architectural resolution

1. Actual legal setbacks, ground coverage, FAR, permitted storeys and height; the scene assumes a nearly full-plot shell and will need replanning if the authority requires larger setbacks.
2. Exact clear room dimensions, all furniture clearances and door swings. The scene contains compact rooms rather than the very large spaces suggested by the concept renders.
3. Structural calculations and support for cantilevers, the stair spine, openings and glazed guards. Supports are indicative.
4. Stair headroom, walking-line going, landing interfaces and continuous safe access to all floors. Interactive walk mode changes floor through navigation; it is not a physical stair simulation.
5. Lift vendor dimensions, accessible approach, clear door openings and emergency provisions.
6. Full independent protected escape strategy, fire requirements and travel distances.
7. Pool depth grading, waterproofing, drainage, non-slip finishes, child-safety barriers and compliant gates. Glass guarding is illustrative, not a safety certification.
8. Service shafts, plumbing stacks, electrical routing, equipment ventilation and construction details. Kitchen/bath fixtures are visual provisions.
9. Vehicle turning outside the north boundary depends on actual road width. The project provides direct-in parking, not an in-plot turning circle.
10. Privacy and neighbouring setbacks, security glass specification and natural ventilation performance.

## Performance policy

Never lower the detail of the lagoon perimeter, pool edge or staircase to meet a frame-rate target. The implementation batches opaque geometry by material, hides upper levels and offers lower pixel/shadow resolution plus reduced selected planting. The curved staircase and 192-sample lagoon boundary remain invariant. Reflection resolution is bounded; physical leaf motion and expensive postprocessing are omitted.

## Assets

The material palette is warm travertine, oak/walnut, plaster, brushed metal, neutral fabrics and tinted glass. The travertine texture was generated; timber grain is deterministic. Furnishings and plants are custom parametric meshes. No photogrammetry or branded asset library is claimed.
