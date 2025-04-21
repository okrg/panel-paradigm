# Panel Paradigm Visual Experience

A self-contained, single-page web application that visually demonstrates the assembly process of our panelized building system using 3D animation. Built for easy embedding and extensibility.

## Features
- Animated 3D assembly and disassembly of multiple panelized structures
- Three.js-powered geometry and animation
- Tailwind CSS and Alpine.js for UI and interactivity
- Modular, embeddable container for future website integration
- Advanced procedural geometry generation for complex structures

## Tech Stack
- HTML, Tailwind CSS, Alpine.js
- Vanilla JavaScript
- [Three.js](https://threejs.org/)

## Quick Start
1. **Clone the repo:**
   ```sh
   git clone https://github.com/okrg/panel-paradigm.git
   cd panel-paradigm
   ```
2. **Install dependencies:**
   ```sh
   npm install
   ```
3. **Start the local server:**
   ```sh
   npm run dev
   # or use VSCode Live Server, then open index.html
   ```
4. **View in browser:**
   Open [http://localhost:3000](http://localhost:3000) (or the port shown in your terminal).

## Usage
- The main 3D experience is rendered in the container on the page.
- To add new structures, provide floor plans, elevations, and measurements. See `CLAUDE.md` for workflow details.
- For complex geometry, we use advanced Three.js features like ExtrudeGeometry and CSG operations.

## Contributing
- Open issues or pull requests for improvements, new features, or bug fixes.
- See `CLAUDE.md` for project goals, workflow, and advanced modeling notes.

## Documentation
- [CLAUDE.md](./CLAUDE.md): Full project description, workflow, and advanced modeling details
- [Three.js Documentation](https://threejs.org/docs/): Official Three.js reference

---
© 2025 Panel Paradigm. All rights reserved. 