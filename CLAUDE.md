# Panel Paradigm Visual Experience

## Overview
This project is a self-contained, single-page web application that visually demonstrates the assembly process of our panelized building system using 3D animation. The app is designed for easy embedding as a container in other websites (Phase 2), but Phase 1 focuses on generating and animating the geometry for various structures.

## Tech Stack
- **HTML, Tailwind CSS, Alpine.js**: For UI, layout, and interactivity.
- **Vanilla JavaScript**: For application logic and animation control.
- **Three.js**: For 3D rendering, geometry creation, and animation.
- **(Optional, Advanced)**: Blender + Blender Model Context Protocol (MCP) for complex model generation and AI-assisted 3D workflows.

## Project Goals
- Animate the construction of various panelized structures, starting from panels stacked on a delivery pallet.
- Sequentially move panels from the pallet to the foundation, assembling the structure step by step.
- After completion, "explode" the structure and return panels to the pallet, then repeat with a new structure.
- Cycle through all structure types to showcase the flexibility of the building system.

## Workflow
1. **Input**: You provide floor plans, elevations, and detailed measurements for each structure.
2. **Geometry Generation**: We create Three.js code to procedurally build and animate the structures. For complex cases, we use Blender (see below).
3. **Animation**: The app animates the delivery, assembly, and disassembly of each structure in sequence.
4. **Iteration**: The process repeats for all provided structure types.

## Example: Simple Home Structure
```js
// See the main.js for a basic Three.js scene setup and house geometry example.
```

## Advanced Modeling: Blender MCP Integration
For structures too complex for procedural Three.js code, we use Blender with the Blender Model Context Protocol (MCP):
- **BlenderMCP** connects Blender to Claude AI, enabling prompt-assisted 3D modeling, scene creation, and manipulation.
- **Features**: Two-way communication, object/material control, scene inspection, and Python code execution in Blender.
- **Workflow**: Claude can generate or modify Blender scenes, then export models for use in Three.js.
- **Resources**: [Blender MCP Server](https://mcpmarket.com/server/blender-model-context-protocol)

## Installation & Setup
1. Clone this repo.
2. Run `npm install` to install dependencies.
3. Start a local server (e.g., `npx serve` or use VSCode Live Server) and open `index.html` in your browser.
4. For advanced Blender workflows, see the [Blender MCP documentation](https://mcpmarket.com/server/blender-model-context-protocol).

## Contributing
- Provide clear structure descriptions (floor plans, elevations, measurements).
- Suggest improvements or new features via issues or pull requests.

## Security & Limitations
- The Blender MCP integration allows arbitrary Python execution in Blender. Use with caution and always save your work.
- Poly Haven integration may download external assets; disable if not needed.

---
© 2025 Panel Paradigm. All rights reserved. 