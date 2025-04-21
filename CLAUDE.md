# Panel Paradigm Visual Experience

## Overview
This project is a self-contained, single-page web application that visually demonstrates the assembly process of our panelized building system using 3D animation. The app is designed for easy embedding as a container in other websites (Phase 2), but Phase 1 focuses on generating and animating the geometry for various structures.

## Tech Stack
- **HTML, Tailwind CSS, Alpine.js**: For UI, layout, and interactivity.
- **Vanilla JavaScript**: For application logic and animation control.
- **Three.js**: For 3D rendering, geometry creation, and animation.

## Project Goals
- Animate the construction of various panelized structures, starting from panels stacked on a delivery pallet.
- Sequentially move panels from the pallet to the foundation, assembling the structure step by step.
- After completion, "explode" the structure and return panels to the pallet, then repeat with a new structure.
- Cycle through all structure types to showcase the flexibility of the building system.

## Workflow
1. **Input**: You provide floor plans, elevations, and detailed measurements for each structure.
2. **Geometry Generation**: We create Three.js code to procedurally build and animate the structures.
3. **Animation**: The app animates the delivery, assembly, and disassembly of each structure in sequence.
4. **Iteration**: The process repeats for all provided structure types.

## Example: Simple Home Structure
```js
// See the main.js for a basic Three.js scene setup and house geometry example.
```

## Advanced Modeling Techniques
For complex structures, we'll use advanced Three.js techniques:
- **Geometry Extrusion**: Using THREE.ExtrudeGeometry for complex panel shapes.
- **CSG operations**: Constructive Solid Geometry for boolean operations on meshes.
- **Instanced Meshes**: For efficient rendering of multiple identical panels.
- **GLTF Export/Import**: For sharing or reusing complex structures.

## Installation & Setup
1. Clone this repo.
2. Run `npm install` to install dependencies.
3. Start a local server (e.g., `npx serve` or use VSCode Live Server) and open `index.html` in your browser.

## Contributing
- Provide clear structure descriptions (floor plans, elevations, measurements).
- Suggest improvements or new features via issues or pull requests.

---
© 2025 Panel Paradigm. All rights reserved. 