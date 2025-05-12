import * as THREE from 'three';

// List of forbidden strings that will cause meshes to be removed
const FORBIDDEN_MESH_STRINGS = [
  'plank_siding',
  'block_siding',
  'wood_texture_metal',
  'metal_wainscot',
];

// List of mesh name strings and their corresponding materials
const MESH_MATERIAL_MAPPINGS = {
  'eave_rafter': 'eave_rafter_material',
  'eave_plywood': 'eave_plywood_material',
};

// Utility: Check if a mesh name contains any forbidden strings
export function shouldRemoveMesh(meshName) {
  if (!meshName) return false;
  return FORBIDDEN_MESH_STRINGS.some(forbidden => meshName.includes(forbidden));
}

// Utility: Get material name for a mesh based on its name
export function getMaterialForMesh(meshName) {
  if (!meshName) return null;
  
  for (const [meshString, materialName] of Object.entries(MESH_MATERIAL_MAPPINGS)) {
    if (meshName.includes(meshString)) {
      return materialName;
    }
  }
  
  return null;
}

// Main material dictionary generator
export function getMaterials() {
  const materials = {};

  // Procedural wood plank texture (red horizontal planks)
  function createWoodPlankTexture({
    width = 512, height = 512, plankCount = 6, plankColor = '#8B2D24', gapColor = '#e5ded7', gapHeight = 6, shadowAlpha = 0.10, repeatY = 1 } = {}) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    // Fill background with plank color
    ctx.fillStyle = plankColor;
    ctx.fillRect(0, 0, width, height);

    // Draw horizontal plank gaps and subtle shadow
    const plankHeight = height / plankCount;
    for (let i = 1; i < plankCount; ++i) {
      const y = Math.round(i * plankHeight);
      // Gap line
      ctx.fillStyle = gapColor;
      ctx.fillRect(0, y - gapHeight / 2, width, gapHeight);
      // Shadow below gap
      ctx.save();
      ctx.globalAlpha = shadowAlpha;
      ctx.fillStyle = '#000';
      ctx.fillRect(0, y + gapHeight / 2, width, gapHeight * 2);
      ctx.restore();
    }

    ctx.globalAlpha = 1.0;

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(1, 
        
    );
    texture.anisotropy = 4;
    return texture;
  }

  const wood_texture = new THREE.TextureLoader().load('cedar-plank.jpg');
  wood_texture.wrapS = THREE.RepeatWrapping;
  wood_texture.wrapT = THREE.RepeatWrapping;
  wood_texture.repeat.set(0.0075, 0.05); // uScale, vScale from Babylon.js

  materials['wood_texture'] = new THREE.MeshStandardMaterial({
    map: wood_texture,
    color: new THREE.Color('#ffb890'), // Lighter warm orange tint
    roughness: 0.8,
    metalness: 0.0,
  });

  // Eave rafter material (exposed wood beam)
  const rafter_texture = new THREE.TextureLoader().load('cedar-plank.jpg');
  rafter_texture.wrapS = THREE.RepeatWrapping;s
  rafter_texture.wrapT = THREE.RepeatWrapping;
  rafter_texture.repeat.set(0.01, 0.1); // Different scale for beams
  
  materials['eave_rafter'] = new THREE.MeshStandardMaterial({
    map: rafter_texture,
    color: new THREE.Color('#d9bc8c'), // Light golden wood tone
    roughness: 0.9,
    metalness: 0.0,
  });

  // Eave plywood material (soffit/underlayment)
  const plywood_texture = new THREE.TextureLoader().load('cedar-plank.jpg');
  plywood_texture.wrapS = THREE.RepeatWrapping;
  plywood_texture.wrapT = THREE.RepeatWrapping;
  plywood_texture.repeat.set(0.1, 0.1); // More square pattern for plywood
  
  materials['eave_plywood'] = new THREE.MeshStandardMaterial({
    map: plywood_texture,
    color: new THREE.Color('#e5d3b8'), // Very light tan/beige
    roughness: 0.85,
    metalness: 0.0,
  });

  // Simple color groups (trim, accent, etc)
  materials['trim_color'] = new THREE.MeshStandardMaterial({ 
    color: new THREE.Color('rgb(225, 230, 235)'), // Much brighter, almost white silvery color
    metalness: 0.5,  // Moderate metalness to maintain the aluminum look but allow color to show
    roughness: 0.2   // Lower roughness for more shine but not mirror-like
  });
  
  materials['accent_color'] = new THREE.MeshStandardMaterial({ 
    color: 0x888888, 
    roughness: 0.4, 
    metalness: 0.05 
  });
  
  materials['door_color'] = new THREE.MeshStandardMaterial({ 
    color: 0xffffff, // Pure white color for doors
    roughness: 0.3, 
    metalness: 0.0 
  });

  // Interior (matte black)
  materials['Interior'] = new THREE.MeshStandardMaterial({ 
    color: 0x111111, 
    roughness: 0.8, 
    metalness: 0.05 
  });

  // Glass - light blue-green tint
  materials['glass'] = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color('rgb(210, 230, 240)'), // Light blue-green glass color
    metalness: 0.1,
    roughness: 0.05,
    transmission: 0.95, 
    thickness: 0.5,
    ior: 1.5,
    transparent: true,
    opacity: 0.25, // Matching your Babylon.js alpha setting
    reflectivity: 0.5,
    clearcoat: 1.0,
    clearcoatRoughness: 0.05,
    envMapIntensity: 1.0,
  });

  // Appliance (matte silver)
  materials['appliance'] = new THREE.MeshStandardMaterial({ 
    color: 0xcfd4d9, 
    roughness: 0.3, 
    metalness: 0.7 
  });

  // Countertop (light gray)
  materials['countertop'] = new THREE.MeshStandardMaterial({ 
    color: 0xe0e0e0, 
    roughness: 0.5, 
    metalness: 0.2 
  });

  // Cabinet (white)
  materials['cabinet'] = new THREE.MeshStandardMaterial({ 
    color: 0xf5f1ee, 
    roughness: 0.4, 
    metalness: 0.1 
  });

  return materials;
} 