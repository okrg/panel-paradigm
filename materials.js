import * as THREE from 'three';

// Utility: Generate a procedural wood texture using CanvasTexture
function createWoodTexture({
  width = 512,
  height = 512,
  baseColor = '#b07d4a',
  ringColor = '#8c5a2b',
  ringCount = 20,
  noise = 0.15
} = {}) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  // Fill base
  ctx.fillStyle = baseColor;
  ctx.fillRect(0, 0, width, height);

  // Draw rings
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const dx = x - width / 2;
      const dy = y - height / 2;
      let r = Math.sqrt(dx * dx + dy * dy);
      r += Math.sin((x + y) * 0.05) * noise * width;
      const ring = Math.floor(r / (width / (2 * ringCount)));
      if (ring % 2 === 0) {
        ctx.fillStyle = ringColor;
        ctx.globalAlpha = 0.08;
        ctx.fillRect(x, y, 1, 1);
      }
    }
  }
  ctx.globalAlpha = 1.0;
  return new THREE.CanvasTexture(canvas);
}

// Utility: Generate a procedural corrugated metal normal map using CanvasTexture
function createCorrugatedNormalTexture({
  width = 512,
  height = 512,
  frequency = 16,
  amplitude = 0.5
} = {}) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      // Simulate normal map for corrugation
      const v = Math.sin((x / width) * frequency * Math.PI * 2);
      // Normal map: (0.5, 0.5 + v * amplitude, 1.0)
      const r = 128;
      const g = 128 + Math.floor(v * amplitude * 127);
      const b = 255;
      ctx.fillStyle = `rgb(${r},${g},${b})`;
      ctx.fillRect(x, y, 1, 1);
    }
  }
  return new THREE.CanvasTexture(canvas);
}

// Utility: Glass material (physically-based, no texture)
function createGlassMaterial() {
  return new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    metalness: 0,
    roughness: 0.05,
    transmission: 0.95, // true glass
    thickness: 0.5,
    ior: 1.5,
    transparent: true,
    opacity: 0.25,
    reflectivity: 0.5,
    clearcoat: 1.0,
    clearcoatRoughness: 0.05,
    envMapIntensity: 1.0,
  });
}

// Utility: Plank pattern (simple stripes)
function createPlankTexture({
  width = 512,
  height = 512,
  plankCount = 8,
  color1 = '#b07d4a',
  color2 = '#8c5a2b'
} = {}) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  const plankWidth = width / plankCount;
  for (let i = 0; i < plankCount; i++) {
    ctx.fillStyle = i % 2 === 0 ? color1 : color2;
    ctx.fillRect(i * plankWidth, 0, plankWidth, height);
  }
  return new THREE.CanvasTexture(canvas);
}

// Utility: Set color on a MeshStandardMaterial (hex or rgb string)
function setMaterialColor(material, color) {
  if (!material) return;
  if (typeof color === 'string' && color.startsWith('rgb')) {
    // Convert rgb(r,g,b) to hex
    const rgb = color.match(/\d+/g).map(Number);
    material.color.setRGB(rgb[0] / 255, rgb[1] / 255, rgb[2] / 255);
  } else {
    material.color.set(color);
  }
}

// List of material groups (as in Babylon code)
const materialGroups = [
  'block_siding_metal_fastener',
  'wood_texture_metal_color',
  'wood_texture_metal_trims',
  'block_siding_metal_color',
  'block_siding_metal_trims',
  'plank_siding_metal_trims',
  'plank_siding_metal_color',
  'plank_siding_color',
  'block_siding_fastener',
  'wood_texture_color',
  'wood_texture_metal',
  'wood_texture_trims',
  'block_siding_color',
  'block_siding_trims',
  'block_siding_metal',
  'plank_siding_trims',
  'plank_siding_color',
  'plank_siding_metal',
  'metal_wainscot1',
  'window_exterior',
  'metal_wainscot',
  'wood_texture',
  'block_siding',
  'plank_siding',
  'accent_color',
  'eave_plywood',
  'plank_trims',
  'roof_fascia',
  'eave_rafter',
  'plank_trim',
  'trim_color',
  'door_color',
  'roof_metal',
  'lifestyle',
  'sheathing',
  'roof_eave',
  'Interior',
  'framing',
  'pergola', 'lumber', 'awning', 'glass'
];

// Main material dictionary generator
export function getMaterials() {
  // Define all group names as in Babylon.js
  const materials = {};

  // Wood (for wood_texture, lumber, etc)
  const woodTexture = createWoodTexture();
  materials['wood_texture'] = new THREE.MeshStandardMaterial({
    map: woodTexture,
    roughness: 0.6,
    metalness: 0.1,
  });
  materials['lumber'] = new THREE.MeshStandardMaterial({
    map: woodTexture,
    roughness: 0.7,
    metalness: 0.05,
  });

  // Plank siding
  const plankTexture = createPlankTexture();
  materials['plank_siding'] = new THREE.MeshStandardMaterial({
    map: plankTexture,
    roughness: 0.5,
    metalness: 0.1,
  });
  materials['plank_siding_color'] = new THREE.MeshStandardMaterial({
    map: plankTexture,
    roughness: 0.5,
    metalness: 0.1,
  });

  // Corrugated metal (roof, siding)
  const corrugatedNormal = createCorrugatedNormalTexture();
  materials['roof_metal'] = new THREE.MeshStandardMaterial({
    color: 0x9b9e9e,
    metalness: 1.0,
    roughness: 0.3,
    normalMap: corrugatedNormal,
  });
  materials['block_siding_metal'] = new THREE.MeshStandardMaterial({
    color: 0x9b9e9e,
    metalness: 1.0,
    roughness: 0.4,
    normalMap: corrugatedNormal,
  });

  // Glass
  materials['glass'] = createGlassMaterial();

  // Simple color groups (trim, accent, etc)
  // trim_color: aluminum (from blissHarp.js: rgb(155, 158, 158)), metallic look
  materials['trim_color'] = new THREE.MeshStandardMaterial({ color: 0x9b9e9e, metalness: 0.8, roughness: 0.25 });
  materials['accent_color'] = new THREE.MeshStandardMaterial({ color: 0x888888, roughness: 0.4, metalness: 0.05 });
  materials['door_color'] = new THREE.MeshStandardMaterial({ color: 0x222222, roughness: 0.4, metalness: 0.05 });

  // Interior (matte black)
  materials['Interior'] = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.8, metalness: 0.05 });

  // Appliance (matte silver)
  materials['appliance'] = new THREE.MeshStandardMaterial({ color: 0xcfd4d9, roughness: 0.3, metalness: 0.7 });

  // Countertop (light gray)
  materials['countertop'] = new THREE.MeshStandardMaterial({ color: 0xe0e0e0, roughness: 0.5, metalness: 0.2 });

  // Cabinet (white)
  materials['cabinet'] = new THREE.MeshStandardMaterial({ color: 0xf5f1ee, roughness: 0.4, metalness: 0.1 });

  // Add more as needed for all group names...

  return materials;
} 