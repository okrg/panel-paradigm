/**
 * AnimationController.js
 * Manages animations for panel assembly, disassembly, and transitions
 */

class AnimationController {
  constructor() {
    // Timeline of animation sequences
    this.timeline = [];
    
    // Current animation state
    this.isPlaying = false;
    this.currentTime = 0;
    this.duration = 0;
    
    // Animation properties
    this.defaultDuration = 1.5; // seconds
    this.defaultDelay = 0.5; // seconds between panel animations
    
    // Current active animations
    this.activeAnimations = [];
    
    // Callback for when animation sequence completes
    this.onCompleteCallback = null;
  }
  
  /**
   * Add a panel movement animation to the timeline
   * @param {Object} panel - Panel object with moveTo method
   * @param {Object} targetPosition - {x, y, z} target position
   * @param {number} duration - Animation duration in seconds
   * @param {number} delay - Delay before starting animation in seconds
   */
  addPanelMovement(panel, targetPosition, duration = this.defaultDuration, delay = this.timeline.length * this.defaultDelay) {
    const animation = {
      type: 'movement',
      startTime: delay,
      duration: duration,
      panel: panel,
      targetPosition: targetPosition,
      animationData: panel.moveTo(targetPosition, duration)
    };
    
    this.timeline.push(animation);
    this.duration = Math.max(this.duration, delay + duration);
    return this;
  }
  
  /**
   * Add a panel rotation animation to the timeline
   * @param {Object} panel - Panel object with rotateTo method
   * @param {Object} targetRotation - {x, y, z} target rotation in radians
   * @param {number} duration - Animation duration in seconds
   * @param {number} delay - Delay before starting animation in seconds
   */
  addPanelRotation(panel, targetRotation, duration = this.defaultDuration, delay = this.timeline.length * this.defaultDelay) {
    const animation = {
      type: 'rotation',
      startTime: delay,
      duration: duration,
      panel: panel,
      targetRotation: targetRotation,
      animationData: panel.rotateTo(targetRotation, duration)
    };
    
    this.timeline.push(animation);
    this.duration = Math.max(this.duration, delay + duration);
    return this;
  }
  
  /**
   * Add multiple panel assembly animations in sequence
   * @param {Array} panels - Array of panel objects
   * @param {Array} targetPositions - Array of target positions
   * @param {Array} targetRotations - Optional array of target rotations
   * @param {number} durationPerPanel - Duration for each panel animation
   * @param {number} delayBetweenPanels - Delay between panel animations
   */
  addSequentialAssembly(panels, targetPositions, targetRotations = null, durationPerPanel = this.defaultDuration, delayBetweenPanels = this.defaultDelay) {
    let currentDelay = this.timeline.length > 0 ? 
      Math.max(...this.timeline.map(a => a.startTime + a.duration)) + delayBetweenPanels : 0;
    
    panels.forEach((panel, index) => {
      // Add movement animation
      this.addPanelMovement(panel, targetPositions[index], durationPerPanel, currentDelay);
      
      // Add rotation animation if provided
      if (targetRotations && targetRotations[index]) {
        this.addPanelRotation(panel, targetRotations[index], durationPerPanel, currentDelay);
      }
      
      currentDelay += durationPerPanel + delayBetweenPanels;
    });
    
    return this;
  }
  
  /**
   * Add explosion animation for all panels
   * @param {Array} panels - Array of panel objects
   * @param {Array} startPositions - Original positions to return to after explosion
   * @param {number} explosionFactor - How far to explode panels
   * @param {number} duration - Animation duration
   */
  addExplosionAnimation(panels, startPositions, explosionFactor = 2, duration = this.defaultDuration * 2) {
    const lastAnimationEnd = Math.max(...this.timeline.map(a => a.startTime + a.duration));
    const explosionDelay = lastAnimationEnd + this.defaultDelay;
    
    // Calculate explosion directions for each panel
    panels.forEach((panel, index) => {
      const originalPos = startPositions[index];
      
      // Get panel's current position (usually the assembled position)
      const currentPos = { 
        x: panel.getMesh().position.x,
        y: panel.getMesh().position.y, 
        z: panel.getMesh().position.z 
      };
      
      // Calculate direction vector from center
      const center = { x: 0, y: 0, z: 0 }; // Or calculate actual center of structure
      const direction = {
        x: currentPos.x - center.x,
        y: currentPos.y - center.y,
        z: currentPos.z - center.z
      };
      
      // Normalize and scale by explosion factor
      const length = Math.sqrt(direction.x * direction.x + direction.y * direction.y + direction.z * direction.z);
      const explosionPos = {
        x: currentPos.x + (direction.x / length) * explosionFactor,
        y: currentPos.y + (direction.y / length) * explosionFactor,
        z: currentPos.z + (direction.z / length) * explosionFactor
      };
      
      // Add explosion movement animation
      this.addPanelMovement(panel, explosionPos, duration / 2, explosionDelay);
      
      // Add return to start position animation
      this.addPanelMovement(panel, originalPos, duration / 2, explosionDelay + duration / 2 + 0.2);
    });
    
    return this;
  }
  
  /**
   * Update animations based on elapsed time
   * @param {number} deltaTime - Time since last frame in seconds
   */
  update(deltaTime) {
    if (!this.isPlaying) return;
    
    this.currentTime += deltaTime;
    
    // Process all animations in the timeline
    this.timeline.forEach(animation => {
      const { startTime, duration, animationData } = animation;
      
      // Check if animation is active in current time
      if (this.currentTime >= startTime && this.currentTime <= startTime + duration) {
        const progress = (this.currentTime - startTime) / duration;
        this.updateAnimation(animationData, progress);
      }
    });
    
    // Check if animation sequence is complete
    if (this.currentTime >= this.duration && this.onCompleteCallback) {
      this.isPlaying = false;
      this.onCompleteCallback();
    }
  }
  
  /**
   * Update a specific animation based on progress (0-1)
   * @param {Object} animationData - Animation data from panel.moveTo/rotateTo
   * @param {number} progress - Animation progress (0-1)
   */
  updateAnimation(animationData, progress) {
    const { object, property, startValue, endValue } = animationData;
    
    // Interpolate each property (x, y, z)
    Object.keys(startValue).forEach(key => {
      const start = startValue[key];
      const end = endValue[key];
      object[property][key] = start + (end - start) * this.easeInOutCubic(progress);
    });
  }
  
  /**
   * Easing function for smooth animations
   * @param {number} t - Progress (0-1)
   * @returns {number} Eased value
   */
  easeInOutCubic(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }
  
  /**
   * Start playing the animation sequence
   * @param {Function} onComplete - Callback for when animation completes
   */
  play(onComplete = null) {
    this.isPlaying = true;
    this.onCompleteCallback = onComplete;
  }
  
  /**
   * Pause the animation sequence
   */
  pause() {
    this.isPlaying = false;
  }
  
  /**
   * Reset the animation sequence
   */
  reset() {
    this.currentTime = 0;
    this.isPlaying = false;
    
    // Reset all objects to their initial positions/rotations
    this.timeline.forEach(animation => {
      const { animationData } = animation;
      const { object, property, startValue } = animationData;
      
      Object.keys(startValue).forEach(key => {
        object[property][key] = startValue[key];
      });
    });
  }
  
  /**
   * Clear the animation timeline
   */
  clear() {
    this.timeline = [];
    this.duration = 0;
    this.currentTime = 0;
    this.isPlaying = false;
  }
}

export default AnimationController; 