/**
 * BasePanel.js
 * Base class for all panel types in the panelized building system
 */

import * as THREE from 'three';

class BasePanel {
  /**
   * Create a panel with the specified dimensions and properties
   * @param {Object} options - Configuration options
   * @param {number} options.width - Panel width (default: 4)
   * @param {number} options.height - Panel height (default: 8)
   * @param {number} options.thickness - Panel thickness (default: 0.2)
   * @param {string} options.name - Panel identifier name
   * @param {number} options.position - {x, y, z} panel position
   * @param {number} options.rotation - {x, y, z} panel rotation in radians
   * @param {Object} options.materialProps - Material properties override
   */
  constructor(options = {}) {
    this.width = options.width || 4;
    this.height = options.height || 8;
    this.thickness = options.thickness || 0.2;
    this.name = options.name || `panel_${Math.floor(Math.random() * 1000)}`;
    
    this.position = options.position || { x: 0, y: 0, z: 0 };
    this.rotation = options.rotation || { x: 0, y: 0, z: 0 };
    
    // Default material properties
    this.materialProps = {
      color: 0xeeeeee,
      roughness: 0.5,
      metalness: 0.1,
      ...options.materialProps
    };
    
    // Create the panel mesh
    this.mesh = this.createPanelMesh();
    
    // Apply position and rotation
    this.mesh.position.set(this.position.x, this.position.y, this.position.z);
    this.mesh.rotation.set(this.rotation.x, this.rotation.y, this.rotation.z);
    
    // Set panel name
    this.mesh.name = this.name;
  }
  
  /**
   * Create the basic panel geometry and mesh
   * @returns {THREE.Mesh} Panel mesh
   */
  createPanelMesh() {
    const geometry = new THREE.BoxGeometry(this.width, this.height, this.thickness);
    const material = new THREE.MeshStandardMaterial(this.materialProps);
    
    const mesh = new THREE.Mesh(geometry, material);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    
    return mesh;
  }
  
  /**
   * Move panel to new position with animation
   * @param {Object} newPosition - {x, y, z} target position
   * @param {number} duration - Animation duration in seconds
   * @returns {Object} Animation properties for the animation system
   */
  moveTo(newPosition, duration = 1) {
    // Returns animation data to be used by the animation system
    return {
      object: this.mesh,
      property: 'position',
      startValue: { ...this.mesh.position },
      endValue: { ...newPosition },
      duration: duration
    };
  }
  
  /**
   * Rotate panel to new rotation with animation
   * @param {Object} newRotation - {x, y, z} target rotation in radians
   * @param {number} duration - Animation duration in seconds
   * @returns {Object} Animation properties for the animation system
   */
  rotateTo(newRotation, duration = 1) {
    // Returns animation data to be used by the animation system
    return {
      object: this.mesh,
      property: 'rotation',
      startValue: { ...this.mesh.rotation },
      endValue: { ...newRotation },
      duration: duration
    };
  }
  
  /**
   * Add a cutout (door, window) to the panel
   * @param {Object} options - Cutout options
   * @param {string} options.type - 'door' or 'window'
   * @param {Object} options.position - {x, y} position relative to panel center
   * @param {number} options.width - Cutout width
   * @param {number} options.height - Cutout height
   */
  addCutout(options) {
    // This will be implemented by subclasses
    console.warn('addCutout() must be implemented by subclass');
  }
  
  /**
   * Get the panel mesh for adding to scene
   * @returns {THREE.Mesh} The panel mesh
   */
  getMesh() {
    return this.mesh;
  }
}

export default BasePanel; 