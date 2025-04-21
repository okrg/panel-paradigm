// Panel Paradigm Visual Experience - Three.js Implementation

// This file contains the core Three.js implementation for the Panel Paradigm
// visualization. We use procedural geometry generation to create and animate
// panel-based structures without any external 3D modeling dependencies.

// Get the container
const container = document.getElementById('threejs-container');
const width = container.clientWidth;
const height = container.clientHeight;

// Scene setup
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xf8fafc);

// Camera
const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
camera.position.set(4, 3, 6);
camera.lookAt(0, 0, 0);

// Renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(width, height);
container.appendChild(renderer.domElement);

// Lighting
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(5, 10, 7.5);
scene.add(light);
// Add ambient light for better overall illumination
const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
scene.add(ambientLight);

// Example geometry: a simple cube
const geometry = new THREE.BoxGeometry(1, 1, 1);
const material = new THREE.MeshLambertMaterial({ color: 0x3b82f6 });
const cube = new THREE.Mesh(geometry, material);
scene.add(cube);

// TODO: Replace this cube with panel system components
// Future implementations will include:
// 1. Pallet with stacked panels
// 2. Sequential panel animation from pallet to structure
// 3. Structure completion animation
// 4. Structure explosion and panel return
// 5. Cycling through multiple structure types

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
  cube.rotation.y += 0.01;
  renderer.render(scene, camera);
}
animate(); 