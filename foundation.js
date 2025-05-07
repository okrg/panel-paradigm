import * as THREE from 'three';

// Dimensions (converted from Imperial)
const FOUNDATION_WIDTH = 3.6576;  // 12 feet
const FOUNDATION_HEIGHT = 0.1524; // 6 inches
const FOUNDATION_DEPTH = 3.048;   // 10 feet

/**
 * Creates the foundation geometry and mesh.
 * @returns {THREE.Mesh} The foundation mesh.
 */
export function createFoundation() {
  const geometry = new THREE.BoxGeometry(
    FOUNDATION_WIDTH,
    FOUNDATION_HEIGHT,
    FOUNDATION_DEPTH
  );

  const material = new THREE.MeshStandardMaterial({
    color: 0x909090, // Grey color
    roughness: 0.8,
    metalness: 0.1
  });

  const foundationMesh = new THREE.Mesh(geometry, material);
  foundationMesh.name = 'foundation';

  // Position the mesh so its top surface is at Y=0 (optional, depends on preference)
  // Centered by default, so bottom is at -H/2, top is at +H/2
  // foundationMesh.position.set(0, FOUNDATION_HEIGHT / 2, 0); 

  foundationMesh.receiveShadow = true; // Allow shadows on the foundation

  console.log('Foundation created:', foundationMesh);
  return foundationMesh;
}
