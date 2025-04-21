/**
 * Environment setup for the Panel Paradigm visualization
 * Creates sky, ground, lighting, and optional environmental elements
 */

import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

class Environment {
  constructor(scene, renderer, camera) {
    this.scene = scene;
    this.renderer = renderer;
    this.camera = camera;
    
    // Create organizational groups
    this.environmentGroup = new THREE.Group();
    this.environmentGroup.name = 'Environment';
    
    this.lightingGroup = new THREE.Group();
    this.lightingGroup.name = 'Lighting';
    
    // Add groups to scene
    this.scene.add(this.environmentGroup);
    this.scene.add(this.lightingGroup);
    
    // Enable shadows
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  }

  setupSky() {
    // Create sky gradient using shader material
    const vertexShader = `
      varying vec3 vWorldPosition;
      void main() {
        vec4 worldPosition = modelMatrix * vec4(position, 1.0);
        vWorldPosition = worldPosition.xyz;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `;

    const fragmentShader = `
      uniform vec3 topColor;
      uniform vec3 bottomColor;
      uniform float offset;
      uniform float exponent;
      varying vec3 vWorldPosition;
      void main() {
        float h = normalize(vWorldPosition + offset).y;
        gl_FragColor = vec4(mix(bottomColor, topColor, max(pow(max(h, 0.0), exponent), 0.0)), 1.0);
      }
    `;

    // Create sky dome with gradient
    const uniforms = {
      topColor: { value: new THREE.Color(0x0077ff) },
      bottomColor: { value: new THREE.Color(0xffffff) },
      offset: { value: 33 },
      exponent: { value: 0.6 }
    };

    const skyGeometry = new THREE.SphereGeometry(500, 32, 15);
    const skyMaterial = new THREE.ShaderMaterial({
      uniforms: uniforms,
      vertexShader: vertexShader,
      fragmentShader: fragmentShader,
      side: THREE.BackSide
    });

    const sky = new THREE.Mesh(skyGeometry, skyMaterial);
    this.environmentGroup.add(sky);
    
    return sky;
  }

  setupGround() {
    // Create large ground plane
    const groundGeometry = new THREE.PlaneGeometry(60, 60, 32, 32);
    groundGeometry.rotateX(-Math.PI / 2);
    
    // Add subtle displacement for natural unevenness
    const positionAttribute = groundGeometry.getAttribute('position');
    for (let i = 0; i < positionAttribute.count; i++) {
      const y = 0.3 * Math.random();
      positionAttribute.setY(i, y);
    }
    groundGeometry.computeVertexNormals();
    
    // Create ground material
    const groundMaterial = new THREE.MeshStandardMaterial({
      color: 0x6b8e23, // Medium green for grass
      roughness: 0.8,
      metalness: 0.2
    });
    
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.receiveShadow = true;
    this.environmentGroup.add(ground);
    
    return ground;
  }

  createTree(x, z, scale) {
    // Create a simple low-poly tree
    const trunkGeometry = new THREE.CylinderGeometry(0.2, 0.3, 1.5, 8);
    const trunkMaterial = new THREE.MeshStandardMaterial({ color: 0x8b4513 });
    const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
    trunk.castShadow = true;
    
    const leavesGeometry = new THREE.ConeGeometry(1, 2, 8);
    const leavesMaterial = new THREE.MeshStandardMaterial({ color: 0x228b22 });
    const leaves = new THREE.Mesh(leavesGeometry, leavesMaterial);
    leaves.position.y = 1.7;
    leaves.castShadow = true;
    
    const tree = new THREE.Group();
    tree.add(trunk);
    tree.add(leaves);
    
    tree.position.set(x, 0, z);
    tree.scale.set(scale, scale, scale);
    
    return tree;
  }

  setupTrees() {
    // Add a few trees around the periphery
    const trees = new THREE.Group();
    trees.add(this.createTree(20, 15, 1.2));
    trees.add(this.createTree(-15, -18, 1.5));
    trees.add(this.createTree(18, -20, 1.0));
    this.environmentGroup.add(trees);
    
    return trees;
  }

  setupLighting() {
    // Main directional light (sun)
    const sunLight = new THREE.DirectionalLight(0xfff6e5, 5.0); // Warm sunlight
    sunLight.position.set(15, 20, 15); // 45° angle from above
    sunLight.castShadow = true;
    
    // Configure shadow properties
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.camera.near = 0.5;
    sunLight.shadow.camera.far = 50;
    sunLight.shadow.camera.left = -20;
    sunLight.shadow.camera.right = 20;
    sunLight.shadow.camera.top = 20;
    sunLight.shadow.camera.bottom = -20;
    sunLight.shadow.bias = -0.0005;
    
    this.lightingGroup.add(sunLight);
    
    // Ambient light for general illumination
    const ambientLight = new THREE.AmbientLight(0xeaf6ff, 0.7); // Cool white ambient
    this.lightingGroup.add(ambientLight);
    
    // Fill light from opposite side
    const fillLight = new THREE.PointLight(0xeaf6ff, 0.5); // Cool white fill
    fillLight.position.set(-15, 5, -15); // Opposite the sun
    this.lightingGroup.add(fillLight);
    
    return { sunLight, ambientLight, fillLight };
  }

  setupFog() {
    // Add exponential fog for distance fade
    this.scene.fog = new THREE.FogExp2(0xdfe9f3, 0.005);
    return this.scene.fog;
  }

  setupControls() {
    // Add orbit controls for interactive camera
    const controls = new OrbitControls(this.camera, this.renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.screenSpacePanning = false;
    controls.minDistance = 5;
    controls.maxDistance = 50;
    controls.maxPolarAngle = Math.PI / 2;
    
    return controls;
  }

  // Initialize the entire environment
  init() {
    this.setupSky();
    this.setupGround();
    this.setupTrees();
    this.setupLighting();
    this.setupFog();
    const controls = this.setupControls();
    
    // Return controls for animation loop updates
    return controls;
  }
}

export default Environment; 