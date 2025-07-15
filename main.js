// Panel Paradigm Visual Experience - Three.js Implementation
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import Environment from './environment.js';
import { createFoundation } from './foundation.js';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { getMaterials, shouldRemoveMesh } from './materials.js';

// This file contains the core Three.js implementation for the Panel Paradigm
// visualization.

// Get the container
const container = document.getElementById('threejs-container');
const width = container.clientWidth;
const height = container.clientHeight;

// Scene setup
const scene = new THREE.Scene();
window.scene = scene;
scene.background = new THREE.Color(0xf8fafc); // Light grey-ish background

// Camera
const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 2000);
// Set camera further out and at a front-right angle
camera.position.set(180, 80, 180); // Further out, higher, diagonal view
camera.lookAt(0, 30, 0); // Look at the center, slightly above ground

// Renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(width, height);
renderer.shadowMap.enabled = true; // Enable shadows
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.localClippingEnabled = true; // Enable Clipping
container.appendChild(renderer.domElement);

// Initialize environment (lights, floor, etc.)
const environment = new Environment(scene, renderer, camera);
const controls = environment.init();

// Create and add foundation
const symbolRadius = 6;
const symbolYOffset = 6; // slightly above foundation
const labelYOffset = 14;

// Load reusable material dictionary (persist for all OBJ files)
const MATERIALS = getMaterials();
// Babylon.js group names for material assignment (ordered by specificity: longest first)
const MATERIAL_GROUPS = [
  'plank_siding_metal_trims',
  'plank_siding_metal_color',
  'plank_siding_color',
  'plank_siding_metal',
  'plank_siding_trims',
  'plank_siding',
  'plank_trims',
  'plank_trim',
  'wood_texture_metal_trims',
  'wood_texture_metal',
  'wood_texture_trims',
  'wood_texture',
  'block_siding_metal_color',
  'block_siding_metal_fastener',
  'block_siding_metal_trims',
  'block_siding_metal',
  'block_siding_color',
  'block_siding_fastener',
  'block_siding_trims',
  'block_siding',
  'trim_color',
  'accent_color',  
  'metal_wainscot',
  'lifestyle',
  'lumber',
  'sheathing',
  'framing',
  'Interior',
  'glass',
  'door_color',
  'roof_fascia',
  'roof_eave',
  'roof_metal',
  'eave_plywood',
  'eave_rafter',
  'window_exterior',
  'awning',
  'pergola',
];
const FINISH_GROUPS = [
  'bathroom_floor', 'glass', 'mirror', 'shower_door_trim', 'shower_door_glass', 'appliance',
  'counter', 'countertop', 'cabinet', 'white', 'black', 'fixture', 'i_island', 'ii_dining_area',
  'G_1_furniture', 'G_2_furniture', 'couch',
];

// Helper symbol positions are based on the rotated foundation:
// Front/Back: ±72 (half of 144), Left/Right: ±60 (half of 120)
const helpers = [
  {
    name: 'front',
    color: 0xff3b3b, // bright red
    position: { x: 0, y: symbolYOffset, z: 60 + symbolRadius }, // 10ft/2 = 60
    label: 'FRONT',
  },
  {
    name: 'back',
    color: 0x3b8bff, // bright blue
    position: { x: 0, y: symbolYOffset, z: -60 - symbolRadius }, // -10ft/2 = -60
    label: 'BACK',
  },
  {
    name: 'left',
    color: 0x00d26a, // bright green
    position: { x: -72 - symbolRadius, y: symbolYOffset, z: 0 }, // -12ft/2 = -72
    label: 'LEFT',
  },
  {
    name: 'right',
    color: 0xffc300, // bright yellow
    position: { x: 72 + symbolRadius, y: symbolYOffset, z: 0 }, // 12ft/2 = 72
    label: 'RIGHT',
  },
];

helpers.forEach(({ name, color, position, label }) => {
  // Sphere
  const geometry = new THREE.SphereGeometry(symbolRadius, 32, 32);
  const material = new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 0.7 });
  const sphere = new THREE.Mesh(geometry, material);
  sphere.position.set(position.x, position.y, position.z);
  sphere.name = `${name}-helper-sphere`;
  sphere.castShadow = true;
  scene.add(sphere);

  // Text label (using built-in canvas texture)
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 64;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 40px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.shadowColor = '#000';
  ctx.shadowBlur = 8;
  ctx.fillText(label, canvas.width / 2, canvas.height / 2);
  const texture = new THREE.CanvasTexture(canvas);
  const textMaterial = new THREE.SpriteMaterial({ map: texture, depthTest: false });
  const sprite = new THREE.Sprite(textMaterial);
  sprite.scale.set(36, 9, 1); // Large readable label
  sprite.position.set(position.x, position.y + labelYOffset, position.z);
  sprite.name = `${name}-helper-label`;
  scene.add(sprite);
});

// Create a LoadingManager to track all OBJ loads
const manager = new THREE.LoadingManager();
manager.onLoad = function () {
  // This runs after ALL OBJ files are loaded
  const wallNames = ['front', 'back', 'left', 'right'];
  scene.traverse((child) => {
    if (child.isMesh) {
      const wallName = wallNames.find(name => child.name.toLowerCase().includes(name + '_wall')); // Adjust name matching
      if (wallName) {
        console.log(`DEBUG: Identified ${wallName} wall mesh:`, child.name, 'Setting visible=false'); // Re-enable log
        child.visible = false; // Hide the wall initially
        wallMeshes[wallName] = child; // Store reference
        applyClippingPlanesToMesh(wallName, child); // Apply planes
      }
    }
  });
};

// Debug: List all mesh names in an OBJ file
// function listMeshNames(obj, fileName = '') {
//   const names = [];
//   obj.traverse(child => {
//     if (child.isMesh && child.name) {
//       names.push(child.name);
//     }
//   });
  
//   return names;
// }

// Utility: Load and position a single OBJ panel
async function loadAndPositionPanel({
  scene,
  path,
  file,
  position = { x: 0, y: 0, z: 0 },
  rotation = { x: 0, y: 0, z: 0 },
  material = null,
  receiveShadow = true,
  name = ''
}) {
  return new Promise((resolve, reject) => {
    // Use the shared LoadingManager for all OBJ loads
    const loader = new OBJLoader(manager);
    loader.load(
      path + file,
      (obj) => {
        obj.position.set(position.x, position.y, position.z);
        obj.rotation.set(rotation.x, rotation.y, rotation.z);
        obj.name = name;

        // Create a list to store meshes that should be removed
        const meshesToRemove = [];
        
        obj.traverse((child) => {
          if (child.isMesh) {
            // Check if this mesh should be removed
            if (shouldRemoveMesh(child.name)) {
              // console.log('Filtering out mesh:', child.name);
              meshesToRemove.push(child);
              return; // Skip material assignment for meshes that will be removed
            }
    
            child.castShadow = true;
            child.receiveShadow = receiveShadow;
            // Assign material by most specific group name first
            let assigned = false;
            for (const group of MATERIAL_GROUPS) {
              if (child.name && child.name.includes(group) && MATERIALS[group]) {
                child.material = MATERIALS[group];
                assigned = true;
                break;
              }
            }
            if (!assigned) {
              for (const group of FINISH_GROUPS) {
                if (child.name && child.name.includes(group) && MATERIALS[group]) {
                  child.material = MATERIALS[group];
                  assigned = true;
                  break;
                }
              }
            }
          }
        });

        // Remove the filtered meshes
        meshesToRemove.forEach(mesh => {
          if (mesh.parent) {
            mesh.parent.remove(mesh);
          }
        });

        scene.add(obj);
        resolve(obj);
      },
      undefined,
      (err) => reject(err)
    );
  });
}

// Helper function to animate a mesh dropping into place
function animateDrop(mesh, targetY, duration, onComplete) {
  const startY = mesh.position.y;
  const startTime = Date.now();

  function drop() {
    const elapsedTime = Date.now() - startTime;
    const progress = Math.min(elapsedTime / duration, 1);

    // Simple easing (easeOutQuad)
    const easedProgress = progress * (2 - progress);
    mesh.position.y = startY + (targetY - startY) * easedProgress;

    if (progress < 1) {
      requestAnimationFrame(drop);
    } else {
      if (onComplete) onComplete();
    }
  }
  requestAnimationFrame(drop);
}

// Panel/roof loading logic
async function cookBuilding(scene, recipe) {
  // --- Wall Loading (Provided in prompt) ---
  // Foundation
  const foundationMesh = createFoundation(recipe.depth, recipe.width);
  scene.add(foundationMesh);

  // Wall panels initialization (assuming wallMeshes is defined in outer scope)
  // const wallMeshes = {}; 
  
  const wallSides = ['front', 'back', 'left', 'right'];
  const INCHES_TO_SCENE_UNITS = 1; // Assuming 1 OBJ unit = 1 scene unit (e.g., inches)
  const FEET_TO_INCHES = 12;
  
  const dropHeight = 200; // Units to drop from
  const animationDuration = 800; // Milliseconds for the drop animation
  const sequenceDelay = 300; // milliseconds between each section starting its drop

  for (const side of wallSides) {
    const panel = recipe[side];
    if (!panel || !panel.obj) continue;

    if (side === 'front' && recipe.model === 'signature') { // Hardcoded for signature front wall
      // console.log("Loading hardcoded front wall sections, assuming pre-positioned geometry...");
      // const frontWallSections = [
      //   { file: 'F12-W2L-D72C-W2R_section_1.obj'},
      //   { file: 'F12-W2L-D72C-W2R_section_2.obj'},
      //   { file: 'F12-W2L-D72C-W2R_section_3.obj' }
      // ];

      // instead of hardcoding- we are going assume the file name is the panel + _section_ + section number + .obj and it is always going to be 3 sections
      const frontWallSections = [
        { file: `${panel.obj}_section_1.obj`},
        { file: `${panel.obj}_section_2.obj`},
        { file: `${panel.obj}_section_3.obj`}
      ];
      wallMeshes[side] = []; // Store front sections in an array

      for (let i = 0; i < frontWallSections.length; i++) {
        const section = frontWallSections[i];
        const finalSectionPosition = {
          x: panel.x, // Use the base panel.x for all sections
          y: panel.y,
          z: panel.z
        };

        console.log(`Loading section: ${section.file} to drop to:`, finalSectionPosition);
        await loadAndPositionPanel({
          scene,
          path: `/obj/${recipe.model}/${side}/`, // Path to sections
          file: section.file,
          position: { ...finalSectionPosition, y: panel.y + dropHeight }, // Start higher
          rotation: { x: 0, y: 0, z: 0 },
          name: `${side}_section_${i + 1}`
        }).then((obj) => {
          obj.visible = true; // Make it visible at the starting (high) position
          wallMeshes[side].push({ mesh: obj, targetY: panel.y }); // Store mesh and its final Y
        });
      }

      // Sequentially animate the drop for front wall sections
      wallMeshes[side].forEach((sectionData, index) => {
        setTimeout(() => {
          animateDrop(sectionData.mesh, sectionData.targetY, animationDuration);
        }, index * sequenceDelay);
      });

    } else if (side === 'right' && recipe.model === 'signature') {
      // console.log("Loading hardcoded RIGHT wall sections, using panel.rotation...");
      // const rightWallSections = [
      //   { file: 'R10-W2L-36C_section_1.obj', description: 'Section 1 of right wall' },
      //   { file: 'R10-W2L-36C_section_2.obj', description: 'Section 2 of right wall' },
      //   { file: 'R10-W2L-36C_section_3.obj', description: 'Section 3 of right wall' }
      // ];
      const rightWallSections = [
        { file: `${panel.obj}_section_1.obj`},
        { file: `${panel.obj}_section_2.obj`},
        { file: `${panel.obj}_section_3.obj`}
      ];
      wallMeshes[side] = []; // Store right wall sections in an array

      for (let i = 0; i < rightWallSections.length; i++) {
        const section = rightWallSections[i];
        const finalSectionPosition = {
          x: panel.x, // Use the base panel.x for all sections
          y: panel.y,
          z: panel.z
        };

        console.log(`Loading RIGHT section: ${section.file} to drop to:`, finalSectionPosition, `with rotation:`, panel.rotation);
        await loadAndPositionPanel({
          scene,
          path: `/obj/${recipe.model}/${side}/`, // Path to sections: /obj/signature/right/
          file: section.file,
          position: { ...finalSectionPosition, y: panel.y + dropHeight }, // Start higher
          rotation: { x: 0, y: Math.PI / 2, z: 0 }, // Explicitly set rotation for the right wall
          name: `${side}_section_${i + 1}`
        }).then((obj) => {
          obj.visible = true; // Make it visible at the starting (high) position
          wallMeshes[side].push({ mesh: obj, targetY: panel.y }); // Store mesh and its final Y
        });
      }

      // Sequentially animate the drop for right wall sections
      wallMeshes[side].forEach((sectionData, index) => {
        setTimeout(() => {
          animateDrop(sectionData.mesh, sectionData.targetY, animationDuration);
        }, index * sequenceDelay);
      });
    
    } else if (side === 'left' && recipe.model === 'signature') {
      // console.log("Loading hardcoded LEFT wall sections, using panel.rotation...");
      // const leftWallSections = [
      //   { file: 'L10-36C-W2R_section_1.obj', description: 'Section 1 of left wall' },
      //   { file: 'L10-36C-W2R_section_2.obj', description: 'Section 2 of left wall' },
      //   { file: 'L10-36C-W2R_section_3.obj', description: 'Section 3 of left wall' }
      // ];
      const leftWallSections = [
        { file: `${panel.obj}_section_1.obj`},
        { file: `${panel.obj}_section_2.obj`},
        { file: `${panel.obj}_section_3.obj`}
      ];

      wallMeshes[side] = []; // Store left wall sections in an array

      for (let i = 0; i < leftWallSections.length; i++) {
        const section = leftWallSections[i];
        const finalSectionPosition = {
          x: panel.x, // Use the base panel.x for all sections
          y: panel.y,
          z: panel.z
        };

        console.log(`Loading LEFT section: ${section.file} to drop to:`, finalSectionPosition, `with rotation:`, panel.rotation);
        await loadAndPositionPanel({
          scene,
          path: `/obj/${recipe.model}/${side}/`, // Path to sections: /obj/signature/left/
          file: section.file,
          position: { ...finalSectionPosition, y: panel.y + dropHeight }, // Start higher
          rotation: { x: 0, y: -Math.PI / 2, z: 0 }, // Explicitly set rotation for the left wall
          name: `${side}_section_${i + 1}`
        }).then((obj) => {
          obj.visible = true; // Make it visible at the starting (high) position
          wallMeshes[side].push({ mesh: obj, targetY: panel.y }); // Store mesh and its final Y
        });
      }

      // Sequentially animate the drop for left wall sections
      wallMeshes[side].forEach((sectionData, index) => {
        setTimeout(() => {
          animateDrop(sectionData.mesh, sectionData.targetY, animationDuration);
        }, index * sequenceDelay);
      });

    } else if (side === 'back' && recipe.model === 'signature') {
      // console.log("Loading hardcoded BACK wall sections...");
      // const backWallSections = [
      //   { file: 'B10x12_section_1.obj', description: 'Section 1 of back wall' },
      //   { file: 'B10x12_section_2.obj', description: 'Section 2 of back wall' },
      //   { file: 'B10x12_section_3.obj', description: 'Section 3 of back wall' }
      // ];
      const backWallSections = [
        { file: `${panel.obj}_section_1.obj`},
        { file: `${panel.obj}_section_2.obj`},
        { file: `${panel.obj}_section_3.obj`}
      ];
      wallMeshes[side] = []; // Store back wall sections in an array

      for (let i = 0; i < backWallSections.length; i++) {
        const section = backWallSections[i];
        const finalSectionPosition = {
          x: panel.x, // Use the base panel.x for all sections
          y: panel.y,
          z: panel.z
        };

        console.log(`Loading BACK section: ${section.file} to drop to:`, finalSectionPosition, `with rotation:`, panel.rotation);
        await loadAndPositionPanel({
          scene,
          path: `/obj/${recipe.model}/${side}/`, // Path to sections: /obj/signature/back/
          file: section.file,
          position: { ...finalSectionPosition, y: panel.y + dropHeight }, // Start higher
          rotation: { x: 0, y: 0, z: 0 }, // Explicitly set rotation for the back wall (no rotation needed)
          name: `${side}_section_${i + 1}`
        }).then((obj) => {
          obj.visible = true; // Make it visible at the starting (high) position
          wallMeshes[side].push({ mesh: obj, targetY: panel.y }); // Store mesh and its final Y
        });
      }

      // Sequentially animate the drop for back wall sections
      wallMeshes[side].forEach((sectionData, index) => {
        setTimeout(() => {
          animateDrop(sectionData.mesh, sectionData.targetY, animationDuration);
        }, index * sequenceDelay);
      });

    } else {
      // Existing logic for other walls or models
      let rotation = { x: 0, y: 0, z: 0 };
      // Match legacy orientation logic
      if (side === 'right') rotation.y = -Math.PI / 2;
      if (side === 'left') rotation.y = -Math.PI / 2;
      if (side === 'back' && recipe.model === 'portland') rotation.y = Math.PI;
      
      await loadAndPositionPanel({
        scene,
        path: `/obj/${recipe.model}/${side}/`,
        file: `${panel.obj}.obj`,
        position: { x: panel.x, y: panel.y, z: panel.z },
        rotation,
        name: side
      }).then((obj) => {
        wallMeshes[side] = obj;
        obj.visible = true; // Hide initially
      });
    }
  }

    // --- Roof Loading and Dropping Implementation ---

  if (recipe.roof && recipe.roof.obj) {
    let roofMeshes = [];
    
    // Define the components in the order they should be loaded and animated
    const roofComponents = [
      'drywall',
      'eaves',
      'framing',
      'sheathing',
      'trim-color'
    ];

    const roofBasePath = `/obj/${recipe.model}/roof/`;
    const roofTargetY = recipe.roof.y;
    // Assuming THREE.js is available for MathUtils.degToRad
    const roofRotation = { x: 0, y: THREE.MathUtils.degToRad(recipe.roof.rotation || 0), z: 0 };

    // 1. Load all roof components sequentially
    for (const componentName of roofComponents) {
      const fileName = `${recipe.roof.obj}-${componentName}.obj`;
      const finalPosition = { x: recipe.roof.x, y: roofTargetY, z: recipe.roof.z };
      
      console.log(`Loading roof component: ${roofBasePath}${fileName}`);

      await loadAndPositionPanel({
        scene,
        path: roofBasePath,
        file: fileName,
        // Start position is above the final position
        position: { ...finalPosition, y: roofTargetY + dropHeight }, 
        rotation: roofRotation,
        name: `roof-${componentName}`
      }).then((obj) => {
        obj.visible = true; // Make visible at the starting (high) position
        // Store the mesh and its final target Y position
        roofMeshes.push({ mesh: obj, targetY: roofTargetY, componentName: componentName });
      });
    }

    // 2. Calculate delay required to wait for wall animations to complete.
    // Based on the wall logic: Max sections (3) * delay (300ms) + duration (800ms) = approx 1400-1700ms.
    // We use 1500ms as a safe estimate for when the last wall panel settles.
    const wallAnimationWaitTime = 1500; 

    // 3. Sequentially animate the drop for roof components
    roofMeshes.forEach((componentData, index) => {
      // Calculate start time: wait for walls + (index * sequence delay for roof components)
      const startTime = wallAnimationWaitTime + (index * sequenceDelay);
      
      setTimeout(() => {
        console.log(`Dropping roof component: ${componentData.componentName}`);
        animateDrop(componentData.mesh, componentData.targetY, animationDuration);
      }, startTime);
    });
  }
  
}

// Store wall meshes
const wallMeshes = { front: null, back: null, left: null, right: null };

// Generate the Signature recipe and store it to recipe
let recipe = {
  model: 'signature',
  depth: 120,
  width: 144,
  roof:  { obj: '10x12-STE-06F', x: 0,    y: -9,   z: 6.5, rotation: 90 },    //m.rotation.y = BABYLON.Tools.ToRadians(90);
  front: { obj: 'F12-W2L-D72C-W2R', x: -68,  y: -9,  z: 60 },
  back:  { obj: 'B10x12', x: -68,  y: -9,  z: -59.5 },
  left:  { obj: 'L10-36C-W2R', x: -71.5, y: -9,  z: -60 },
  right: { obj: 'R10-W2L-36C', x: 71.5,  y: -9,  z: 60 }
}

// Call the loader after foundation is added
cookBuilding(scene, recipe);

// Responsive resize
window.addEventListener('resize', () => {
  const newWidth = container.clientWidth;
  const newHeight = container.clientHeight;
  camera.aspect = newWidth / newHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(newWidth, newHeight);
});

// Animation loop
function animate() {
  requestAnimationFrame(animate);
  // Update controls
  if (controls) controls.update();
  renderer.render(scene, camera);
}
animate();

// --- Debug: Show mesh group on click ---
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

function showMeshGroupOverlay(groups) {
  let overlay = document.getElementById('mesh-name-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'mesh-name-overlay';
    overlay.style.position = 'fixed';
    overlay.style.top = '-60px';
    overlay.style.left = '50%';
    overlay.style.transform = 'translateX(-50%)';
    overlay.style.background = 'rgba(30,30,30,0.95)';
    overlay.style.color = '#fff';
    overlay.style.fontSize = '2rem';
    overlay.style.padding = '16px 32px';
    overlay.style.borderRadius = '8px';
    overlay.style.zIndex = '9999';
    overlay.style.transition = 'top 0.3s cubic-bezier(.4,2,.6,1), opacity 0.5s';
    overlay.style.opacity = '0';
    document.body.appendChild(overlay);
  }
  overlay.textContent = groups.length ? `Groups: ${groups.join(', ')}` : 'No group';
  overlay.style.top = '32px';
  overlay.style.opacity = '1';
  setTimeout(() => {
    overlay.style.top = '-60px';
    overlay.style.opacity = '0';
  }, 1800);
}

renderer.domElement.addEventListener('click', (event) => {
  const rect = renderer.domElement.getBoundingClientRect();
  mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(scene.children, true);
  
  if (intersects.length > 0) {
    const mesh = intersects[0].object;
    if (mesh) {
      const meshName = mesh.name || '(unnamed mesh)';
      
      if (event.shiftKey) {
        // Shift + Click: Remove the mesh
        // console.log('Removing mesh:', meshName);
        mesh.parent.remove(mesh);
        // Show removal confirmation
        let overlay = document.getElementById('mesh-name-overlay');
        if (!overlay) {
          overlay = document.createElement('div');
          overlay.id = 'mesh-name-overlay';
          overlay.style.position = 'fixed';
          overlay.style.top = '-60px';
          overlay.style.left = '50%';
          overlay.style.transform = 'translateX(-50%)';
          overlay.style.background = 'rgba(255,0,0,0.95)';
          overlay.style.color = '#fff';
          overlay.style.fontSize = '2rem';
          overlay.style.padding = '16px 32px';
          overlay.style.borderRadius = '8px';
          overlay.style.zIndex = '9999';
          overlay.style.transition = 'top 0.3s cubic-bezier(.4,2,.6,1), opacity 0.5s';
          overlay.style.opacity = '0';
          document.body.appendChild(overlay);
        }
        overlay.textContent = `Removed: ${meshName}`;
        overlay.style.background = 'rgba(255,0,0,0.95)';
        overlay.style.top = '32px';
        overlay.style.opacity = '1';
        setTimeout(() => {
          overlay.style.top = '-60px';
          overlay.style.opacity = '0';
        }, 1800);
      } else {
        // Regular Click: Show mesh name
        // console.log('Clicked mesh:', meshName);
        let overlay = document.getElementById('mesh-name-overlay');
        if (!overlay) {
          overlay = document.createElement('div');
          overlay.id = 'mesh-name-overlay';
          overlay.style.position = 'fixed';
          overlay.style.top = '-60px';
          overlay.style.left = '50%';
          overlay.style.transform = 'translateX(-50%)';
          overlay.style.background = 'rgba(30,30,30,0.95)';
          overlay.style.color = '#fff';
          overlay.style.fontSize = '2rem';
          overlay.style.padding = '16px 32px';
          overlay.style.borderRadius = '8px';
          overlay.style.zIndex = '9999';
          overlay.style.transition = 'top 0.3s cubic-bezier(.4,2,.6,1), opacity 0.5s';
          overlay.style.opacity = '0';
          document.body.appendChild(overlay);
        }
        overlay.textContent = `Mesh: ${meshName}`;
        overlay.style.background = 'rgba(30,30,30,0.95)';
        overlay.style.top = '32px';
        overlay.style.opacity = '1';
        setTimeout(() => {
          overlay.style.top = '-60px';
          overlay.style.opacity = '0';
        }, 1800);
      }
    }
  }
});

// If using OrbitControls, set the target to match the lookAt
if (controls && controls.target) {
  controls.target.set(0, 30, 0);
  controls.update();
}

// UI / Event Listeners
// (Reveal button logic removed - no more wall reveal animation)