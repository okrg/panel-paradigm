## Overview
This project is a self-contained, single-page web application that visually demonstrates the assembly process of our panelized building system using 3D animation. The app focuses on generating and animating the geometry for various structures.

## Tech Stack
- **HTML, Tailwind CSS, Alpine.js**: For UI, layout, and interactivity.
- **Vanilla JavaScript**: For application logic and animation control.
- **Three.js**: For 3D rendering, geometry creation, and animation.

## Project Goals
- Animate the construction of panelized structures, starting from panels stacked on a delivery pallet.
- Sequentially move panels from the stack to the foundation, assembling the structure step by step.
- (Future) Optionally "explode" the structure and cycle through different types.

## Workflow
1. **Input**: Floor plans, elevations, and measurements for structures.
2. **Geometry Generation**: Create Three.js code to procedurally build structures.
3. **Animation**: Animate the assembly of each structure.
4. **Iteration**: (Future) Repeat for all structure types.

# Component Specifications (MVP Focus - 10'x12' Example)
General specifications for components using Three.js. Geometry is constructed programmatically.

## Precise Dimensions (Imperial to Metric)
1" = 0.0254m 1' = 0.3048m


## Foundation
- **Dimensions**: 12'0" × 10'0" × 6" (3.66m × 3.05m × 0.15m)
- **Material**: Concrete slab concept.
- **Three.js Modeling**: Simple geometry representing the slab.

## Wall Panels
- **General**: Represent standard wall panels. Variations exist (e.g., different heights, sloped tops for side walls, door/window openings) and should be modeled in Three.js as needed.
- **Dimensions**: Use specified heights (e.g., 7'3.5" back, 8'6" front) and standard widths (e.g., 48"). Thickness is 5.5".
- **Details**: Include basic visual representation of exterior sheathing and interior framing concept.

## Roof Components
- **Rafters**: Basic representation of 2x6 rafters, spaced appropriately (e.g., 24" OC) with overhangs.
- **Roof Panels/Sheathing**: Geometry covering the rafters.
- **Roofing Material**: Simple representation of corrugated metal panels.

## Panel Alignment & Positioning
- **Guideline:** Wall panel exterior faces must align flush with the foundation's exterior face.

# Panelized Structure Assembly & Animation Specification (Three.js - MVP)

## 1. Overview
Defines the sequence for demonstrating assembly using Three.js animation.

## 2. Core Animation Concept
- **Initial State:** Components start in a "delivery stack".
- **Assembly Animation:** Components animate sequentially from the stack to their final position following the build order.
- **Completion:** View the assembled structure.

## 3. Component Preparation (Three.js)
- **Geometry:** Procedurally generate component geometry.
- **Grouping:** Use groups for logical management.
- **Origin Points:** Define consistent origins.
- **Initial Stack:** Position geometries in the stack.

## 4. Animation Sequence & Style (MVP)
- **Sequence:**
    1.  **Foundation:** Appears/forms on the build site.
    2.  **Wall Assembly:** Wall panels (back, sides, front, including integrated doors/windows) animate from the stack to the foundation.
    3.  **Roof Construction:** Roof components (rafters, panels, roofing) animate into place on top of the walls.
- **Animation Style:**
    - Components move smoothly from stack to position.
    - Use clear, easy-to-follow transitions.

## 5. Camera Movement
- **General:** Start wide, follow the action dynamically (zoom/pan/orbit), end with a view of the completed structure.

## 6. General Animation Principles
- **Timing:** Use smooth easing. Allow brief pauses between major phases.
- **Clarity:** Ensure the sequence clearly demonstrates construction logic.

##  General Workflow
- Create and render a 3D representation of the concrete foundation slab using Three.js.
- Import the OBJ files for the panels for specified for each side. There are alwayus going to be more than 1 panels and the order they are specified in is the order they are positiond starting from left to right if you are facing the interior face of the wall from the origin (0,0,0)
- Import the interior wall components and interior kitchen  and bath components as specified and position them into place with an animation that makes them appear to come from the top down. 
- Import the OBJ files for the roof elements with all of sub compomonents hidden by default. Then animate into view the specified components in the order provided.

## Workflow Overview
1. **Asset Analysis & Feature Extraction**
   - Build a list of product models to be built in the sequence (5 models)
   - Build a list of OBJ files to be imported for each product model
   - Extract elements: door/window placement, roof pitch, panel dimensions, texture references.
   - Output a JavaScript configuration that can be used to sequence in each model into the scene
   - Output a Javascript sequence that will allow models to be exploded out of the scene so that the next model can be positioned into place on a new foundtation size

2. **Three.js Generation Structure**
   - Use modular, component-based architecture to organize code.
   - Leverage Three.js native capabilities and plugins for efficient rendering.
   - Implement reusable geometry generators for common panel types.


4. **Animation Preparation**
   - Organize wall panels so they can be indepenantly animated into the scene
   - Implement animation sequences for panel assembly.
   - Create a timeline-based animation controller.


## Implementation Notes
- Each panel type is implemented as an imported OBJ file. 
- Animation sequences are defined in a timeline format, allowing for sequential or parallel animations.
- Configuration files define structure plans that can be loaded and rendered dynamically.
- Environment settings (lighting, ground, sky) are encapsulated in reusable modules.

## Series Profile Definition (Encoded in Rules)
- Define the Signature series parameters directly in this rules document:
  - `series`: Signature
  - `dimensions`: width=10ft (3.05m), depth=12ft (3.66m), height inferred per wall preset
  - `roofStyle`: gable, pitch as specified per elevation
  - `windowTypes`: doubleHung on side walls, awning clerestory on front
  
### Component Breakdown
  - Foundation: 12'×10'×6" concrete slab to be rendered as Three.JS component

  These objects are provided as OBJ files using an OBJ loader you will provide code to bring them into the scene and position them according to the rules
  - Back Wall Panels 
  - Front Wall Panel
  - Side Panels
  - Rafters
  - Roof Panels: corrugated metal, 3' width, overlaps per spec
  
### Animation Phases
  1. **Build** – sequence of panel/wall/foundation placement (keyframes, durations)
  2. **Explode** – radial outward motion with easing and spin
  3. **Reassemble** – inward motion back to pile with overshoot easing
  
Phase timelines and easings are defined in the SequenceManager methods rather than external JSON.

## Camera Manager
- Create a `CameraManager` module with methods:
  - `setTarget(position: Vector3, lookAt: Vector3)`
  - `animateTo(state: { position, lookAt, duration, easing })`
- Include default camera keyframes in profile under `cameraPositions`:
  ```json
  "cameraPositions": {
    "overview": { "pos": [x,y,z], "lookAt": [x,y,z] },
    "wallCloseup": {...},
    "connectionDetail": {...},
    "finalOrbit": {...}
  }
  ```