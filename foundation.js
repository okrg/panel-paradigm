import * as THREE from 'three';

// Dimensions (scaled up to match model sizes)
const FOUNDATION_HEIGHT = 6;   // 6 inches scaled up


/**
 * Creates the foundation geometry and mesh.
 * @returns {THREE.Mesh} The foundation mesh.
 */
export function createFoundation(depth, width) {
  const geometry = new THREE.BoxGeometry(
    width,
    FOUNDATION_HEIGHT,
    depth
  );

  const material = new THREE.MeshStandardMaterial({
    color: 0x909090, // Grey color
    roughness: 0.8,
    metalness: 0.1
  });

  const foundationMesh = new THREE.Mesh(geometry, material);
  foundationMesh.name = 'foundation';

  // Position the mesh so its top surface is at Y=0
  foundationMesh.position.set(0, -FOUNDATION_HEIGHT / 2, 0); 

  foundationMesh.receiveShadow = true; // Allow shadows on the foundation

  console.log('Foundation created:', foundationMesh);
  return foundationMesh;
}
