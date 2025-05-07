// Panel Paradigm Visual Experience - Three.js Implementation
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import Environment from './environment.js';
import { createFoundation } from './foundation.js';

// This file contains the core Three.js implementation for the Panel Paradigm
// visualization.

// Get the container
const container = document.getElementById('threejs-container');
const width = container.clientWidth;
const height = container.clientHeight;

// Scene setup
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xf8fafc); // Light grey-ish background

// Camera
const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
camera.position.set(4, 3, 6); // Slightly elevated side view
camera.lookAt(0, 0, 0);

// Renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(width, height);
renderer.shadowMap.enabled = true; // Enable shadows
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
container.appendChild(renderer.domElement);

// Initialize environment (lights, floor, etc.)
const environment = new Environment(scene, renderer, camera);
const controls = environment.init();

// Create and add foundation
const foundationMesh = createFoundation();
scene.add(foundationMesh);

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