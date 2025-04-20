// Panel Paradigm Visual Experience - Three.js Bootstrap

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

// Example geometry: a simple cube
const geometry = new THREE.BoxGeometry(1, 1, 1);
const material = new THREE.MeshLambertMaterial({ color: 0x3b82f6 });
const cube = new THREE.Mesh(geometry, material);
scene.add(cube);

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