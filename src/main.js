/**
 * Panel Paradigm Visual Experience - Main Application
 * 
 * This file serves as the entry point for the Panel Paradigm application.
 * It sets up the Three.js scene, initializes the environment, and manages
 * the animation loop for panel assembly visualization.
 */

import * as THREE from 'three';
import Environment from './environment/index.js';
import BasePanel from './components/panels/BasePanel.js';
import AnimationController from './components/animations/AnimationController.js';

// Get the container
const container = document.getElementById('threejs-container');
const width = container.clientWidth;
const height = container.clientHeight;

// Scene setup
const scene = new THREE.Scene();

// Camera
const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
camera.position.set(12, 8, 12);
camera.lookAt(0, 0, 0);

// Renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(width, height);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
container.appendChild(renderer.domElement);

// Initialize environment (sky, ground, lighting)
const environment = new Environment(scene, renderer, camera);
const controls = environment.init();

// Animation controller for panel movements
const animationController = new AnimationController();

// Clock for animation timing
const clock = new THREE.Clock();

/**
 * Example: Create foundation for the structure
 */
function createFoundation() {
  const geometry = new THREE.BoxGeometry(10, 0.5, 8);
  const material = new THREE.MeshStandardMaterial({ 
    color: 0x888888,
    roughness: 0.9,
    metalness: 0.1
  });
  
  const foundation = new THREE.Mesh(geometry, material);
  foundation.position.set(0, -0.25, 0);
  foundation.receiveShadow = true;
  
  scene.add(foundation);
  return foundation;
}

/**
 * Example: Create delivery pallet with stacked panels
 */
function createPallet() {
  // Pallet base
  const palletGeometry = new THREE.BoxGeometry(4, 0.4, 3);
  const palletMaterial = new THREE.MeshStandardMaterial({ color: 0x8B4513 });
  const pallet = new THREE.Mesh(palletGeometry, palletMaterial);
  pallet.position.set(-6, 0.2, -5);
  pallet.castShadow = true;
  pallet.receiveShadow = true;
  
  scene.add(pallet);
  return pallet;
}

// Create foundation and pallet
const foundation = createFoundation();
const pallet = createPallet();

// TODO: Create panels and add them to the scene
// Example of how panels will be created and animated:
/*
// Create panels stacked on pallet
const panels = [];
const panelPositions = [];
const assemblyPositions = [];

// Front wall panel
const frontPanel = new BasePanel({
  width: 8,
  height: 4,
  name: 'front_panel',
  position: { x: -6, y: 1, z: -5 }, // On pallet
  materialProps: { color: 0xF5F5DC }
});

panels.push(frontPanel);
panelPositions.push({ x: -6, y: 1, z: -5 }); // Starting position on pallet
assemblyPositions.push({ x: 0, y: 2, z: 4 }); // Final position in structure

// Add to scene
scene.add(frontPanel.getMesh());

// Set up animation sequence
animationController.addSequentialAssembly(
  panels,
  assemblyPositions,
  null, // No rotation for this example
  1.5, // Duration per panel
  0.5  // Delay between panels
);

// Start animation
animationController.play(() => {
  console.log('Assembly complete!');
});
*/

// Animation loop
function animate() {
  requestAnimationFrame(animate);
  
  // Update controls (if using OrbitControls)
  if (controls) controls.update();
  
  // Update animations
  const deltaTime = clock.getDelta();
  animationController.update(deltaTime);
  
  // Render scene
  renderer.render(scene, camera);
}

// Handle window resize
window.addEventListener('resize', () => {
  const newWidth = container.clientWidth;
  const newHeight = container.clientHeight;
  
  camera.aspect = newWidth / newHeight;
  camera.updateProjectionMatrix();
  
  renderer.setSize(newWidth, newHeight);
});

// Start animation loop
animate(); 