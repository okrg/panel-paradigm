// /Users/rolandogarcia/dev/panel-paradigm/animations.js
// Animation utilities placeholder for Panel Paradigm
// (Clipping plane and wall reveal animation code removed as requested)

// You may add new animation functions for wall, roof, or foundation assembly here in the future.


// --- Animation State and Configuration ---
const animationState = {
    running: false,
    startTime: 0,
    duration: 8, // seconds to reveal the longest wall (was 5)
    sectionWidth: 0.6096 // 2 feet in meters
};

const wallDimensions = { // Define wall properties relative to origin (adjust if model origins differ)
    // For each wall:
    // axis: The local axis ('x' or 'z') along which the reveal occurs.
    // normal: THREE.Vector3, the direction of the reveal. E.g., for -X to +X reveal, normal is (1,0,0).
    // start: The coordinate on 'axis' where the reveal begins in the wall's local space.
    // length: The total length of the reveal along 'axis'.

    front: { axis: 'x', normal: new THREE.Vector3(1, 0, 0), start: -1.83, length: 3.66 },   // Reveals from wall's local -X to +X
    back:  { axis: 'x', normal: new THREE.Vector3(-1, 0, 0),  start: 1.83, length: 3.66 },  // Reveals from wall's local +X to -X (start field is 1.83, normal points to -X)
    left:  { axis: 'z', normal: new THREE.Vector3(0, 0, 1), start: -1.525, length: 3.05 }, // Reveals from wall's local -Z to +Z
    right: { axis: 'z', normal: new THREE.Vector3(0, 0, 1), start: -1.525, length: 3.05 }  // Reveals from wall's local -Z to +Z (was (0,0,-1), revealing +Z to -Z)
};

const clippingPlanes = {}; // Will store { startPlane, endPlane } for each wall

// Store indicator meshes for debugging
export const planeIndicators = {};
window.planeIndicators = planeIndicators;

// --- Functions ---

/**
 * Creates the clipping plane pairs for each wall based on dimensions.
 */
export function setupClippingPlanes(scene) {
    // Optionally pass scene for adding indicator meshes
    for (const wallName in wallDimensions) {
        const dim = wallDimensions[wallName];
        let normalA = dim.normal.clone();
        let normalB = dim.normal.clone().negate();
        let startA = dim.start;
        let startB = dim.start + dim.length;
        if (dim.axis === 'x' && dim.normal.x < 0) {
            [normalA, normalB] = [normalB, normalA];
            [startA, startB] = [startB, startA];
        }
        const planeA = new THREE.Plane(normalA, 0);
        const planeB = new THREE.Plane(normalB, 0);
        clippingPlanes[wallName] = { planeA, planeB, axis: dim.axis, startA, startB };

        // --- Add indicator meshes ---
        // Color by wall
        const wallColors = { front: 0xff3b3b, back: 0x3b8bff, left: 0x00d26a, right: 0xffc300 };
        const color = wallColors[wallName] || 0xffffff;
        // Size: match wall face (thickness x height x length)
        const thickness = 0.04; // ~1.5in visual
        const height = 2.4; // meters, adjust as needed
        const width = (dim.axis === 'x') ? thickness : dim.length;
        const depth = (dim.axis === 'z') ? thickness : dim.length;
        // Plane A mesh
        const geoA = new THREE.BoxGeometry(
            dim.axis === 'x' ? thickness : dim.length,
            height,
            dim.axis === 'z' ? thickness : dim.length
        );
        const matA = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.35, depthWrite: false });
        const meshA = new THREE.Mesh(geoA, matA);
        meshA.name = wallName + '_planeA_indicator';
        // Plane B mesh
        const geoB = geoA.clone();
        const matB = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.7, depthWrite: false });
        const meshB = new THREE.Mesh(geoB, matB);
        meshB.name = wallName + '_planeB_indicator';
        if (scene) {
            scene.add(meshA);
            scene.add(meshB);
        }
        planeIndicators[wallName] = { meshA, meshB };
    }
    console.log("Clipping planes (dual) created:", clippingPlanes);
}


/**
 * Applies the correct clipping planes to all materials of a given mesh.
 * @param {string} wallName - 'front', 'back', 'left', or 'right'.
 * @param {THREE.Object3D} mesh - The loaded wall mesh group.
 */
export function applyClippingPlanesToMesh(wallName, mesh) {
    if (!mesh) {
        console.warn(`Mesh for ${wallName} not found in applyClippingPlanesToMesh.`);
        return;
    }
    // We no longer need clippingPlanes[wallName] here as planes are assigned in startWallRevealAnimation

    mesh.traverse((child) => {
        if (child.isMesh && child.material) {
            const applyToMaterial = (mat) => {
                // mat.clippingPlanes = null; // Explicitly set to null or defer assignment
                mat.clipIntersection = true; // Ensure this is set
                mat.needsUpdate = true;
            };

            if (Array.isArray(child.material)) {
                child.material.forEach(applyToMaterial);
            } else {
                applyToMaterial(child.material);
            }
        }
    });
    console.log(`Clipping planes applied to ${wallName}`);
}

/**
 * Starts the wall reveal animation sequence.
 * Resets plane positions and animation state.
 * @param {Object.<string, THREE.Object3D>} wallMeshes - Object containing the loaded wall meshes.
 */
export function startWallRevealAnimation(wallMeshes) {
    // Find scene from any mesh (assume all walls share parent scene)
    let scene = null;
    for (const wallName in wallMeshes) {
        if (wallMeshes[wallName] && wallMeshes[wallName].parent) {
            scene = wallMeshes[wallName].parent;
            break;
        }
    }
    // If indicators not created, add them now
    if (scene && Object.keys(planeIndicators).length === 0) {
        setupClippingPlanes(scene);
    }

    if (animationState.running) {
        console.log("Animation already running.");
        return;
    }
    console.log("Starting wall reveal animation...");
    animationState.running = true;
    animationState.revealProgress = {};

    for (const wallName in clippingPlanes) {
        const planes = clippingPlanes[wallName];
        const dim = wallDimensions[wallName];
        const mesh = wallMeshes[wallName];
        if (!mesh) continue;
        // Calculate number of steps (from both ends to midpoint)
        const halfLen = dim.length / 2;
        const maxSteps = Math.ceil(halfLen / animationState.sectionWidth);
        animationState.revealProgress[wallName] = {
            stepA: 0,
            stepB: 0,
            maxSteps
        };
        // Set initial plane positions at both ends
        let posA = dim.start;
        let posB = dim.start + dim.length;
        if (dim.axis === 'x') {
            planes.planeA.constant = -planes.planeA.normal.dot(new THREE.Vector3(mesh.position.x + posA, mesh.position.y, mesh.position.z));
            planes.planeB.constant = -planes.planeB.normal.dot(new THREE.Vector3(mesh.position.x + posB, mesh.position.y, mesh.position.z));
        } else if (dim.axis === 'z') {
            planes.planeA.constant = -planes.planeA.normal.dot(new THREE.Vector3(mesh.position.x, mesh.position.y, mesh.position.z + posA));
            planes.planeB.constant = -planes.planeB.normal.dot(new THREE.Vector3(mesh.position.x, mesh.position.y, mesh.position.z + posB));
        }
        // Assign planes to mesh materials
        mesh.traverse((child) => {
            if (child.isMesh && child.material) {
                const applyConfiguredPlanes = (mat) => {
                    mat.clippingPlanes = [planes.planeA, planes.planeB];
                    mat.clipIntersection = true;
                    mat.needsUpdate = true;
                };
                if (Array.isArray(child.material)) {
                    child.material.forEach(applyConfiguredPlanes);
                } else {
                    applyConfiguredPlanes(child.material);
                }
            }
        });
        mesh.visible = true;
    }
}

/**
 * Updates the constants of the clipping planes based on elapsed time.
 * Should be called within the main animation loop (requestAnimationFrame).
 * @param {Object.<string, THREE.Object3D>} wallMeshes - Object containing the loaded wall meshes.
 * @returns {boolean} - True if the animation is still running, false if finished.
 */
export function updateClippingAnimation(wallMeshes) {
    if (!animationState.running) return false;
    let allWallsFinished = true;
    for (const wallName in clippingPlanes) {
        const planes = clippingPlanes[wallName];
        const dim = wallDimensions[wallName];
        const mesh = wallMeshes[wallName];
        if (!mesh) {
            allWallsFinished = false;
            continue;
        }
        const progress = animationState.revealProgress[wallName];
        if (!progress) {
            allWallsFinished = false;
            continue;
        }
        // Advance one section per frame for both ends, until they meet/cross at midpoint
        if (progress.stepA < progress.maxSteps) progress.stepA++;
        if (progress.stepB < progress.maxSteps) progress.stepB++;
        // Calculate current positions for both planes
        let posA = dim.start + progress.stepA * animationState.sectionWidth;
        let posB = dim.start + dim.length - progress.stepB * animationState.sectionWidth;
        // Clamp so they don't cross
        const midpoint = dim.start + dim.length / 2;
        if ((dim.axis === 'x' && posA > midpoint) || (dim.axis === 'z' && posA > midpoint)) posA = midpoint;
        if ((dim.axis === 'x' && posB < midpoint) || (dim.axis === 'z' && posB < midpoint)) posB = midpoint;
        // Set plane constants
        let posVecA, posVecB;
        if (dim.axis === 'x') {
            posVecA = new THREE.Vector3(mesh.position.x + posA, mesh.position.y, mesh.position.z);
            posVecB = new THREE.Vector3(mesh.position.x + posB, mesh.position.y, mesh.position.z);
            planes.planeA.constant = -planes.planeA.normal.dot(posVecA);
            planes.planeB.constant = -planes.planeB.normal.dot(posVecB);
        } else if (dim.axis === 'z') {
            posVecA = new THREE.Vector3(mesh.position.x, mesh.position.y, mesh.position.z + posA);
            posVecB = new THREE.Vector3(mesh.position.x, mesh.position.y, mesh.position.z + posB);
            planes.planeA.constant = -planes.planeA.normal.dot(posVecA);
            planes.planeB.constant = -planes.planeB.normal.dot(posVecB);
        }
        // --- Update indicator meshes ---
        const indicators = planeIndicators[wallName];
        if (indicators) {
            // Height offset for visualization
            const yOffset = 1.2; // meters above ground
            // PlaneA
            indicators.meshA.position.copy(posVecA);
            indicators.meshA.position.y = mesh.position.y + yOffset;
            indicators.meshA.visible = true;
            if (indicators.meshA.material) { indicators.meshA.material.opacity = 1.0; indicators.meshA.material.color.set(0xff00ff); }
            // PlaneB
            indicators.meshB.position.copy(posVecB);
            indicators.meshB.position.y = mesh.position.y + yOffset;
            indicators.meshB.visible = true;
            if (indicators.meshB.material) { indicators.meshB.material.opacity = 1.0; indicators.meshB.material.color.set(0x00ffff); }
            // Orient the indicators
            if (dim.axis === 'x') {
                indicators.meshA.rotation.set(0, 0, 0);
                indicators.meshB.rotation.set(0, 0, 0);
            } else if (dim.axis === 'z') {
                indicators.meshA.rotation.set(0, Math.PI / 2, 0);
                indicators.meshB.rotation.set(0, Math.PI / 2, 0);
            }
        } else {
            console.warn(`No indicator meshes for wall: ${wallName}`);
        }
        // --- Ensure clipping planes are assigned every frame ---
        mesh.traverse((child) => {
            if (child.isMesh && child.material) {
                const assignPlanes = (mat) => {
                    mat.clippingPlanes = [planes.planeA, planes.planeB];
                    mat.clipIntersection = true;
                    mat.needsUpdate = true;
                };
                if (Array.isArray(child.material)) {
                    child.material.forEach(assignPlanes);
                } else {
                    assignPlanes(child.material);
                }
            }
        });
        // If both planes have reached the midpoint, wall is fully revealed
        if (posA >= midpoint && posB <= midpoint) {
            // Remove clipping planes and set mesh fully visible
            mesh.traverse((child) => {
                if (child.isMesh && child.material) {
                    const clearMaterial = (mat) => {
                        mat.clippingPlanes = null;
                        mat.needsUpdate = true;
                    };
                    if (Array.isArray(child.material)) {
                        child.material.forEach(clearMaterial);
                    } else {
                        clearMaterial(child.material);
                    }
                }
            });
        } else {
            allWallsFinished = false;
        }
    }
    if (allWallsFinished) {
        animationState.running = false;
        console.log("Wall reveal animation finished.");
    }
    return animationState.running;
}

/**
 * Optional: Removes clipping planes from all materials of the given meshes.
 * @param {Object.<string, THREE.Object3D>} wallMeshes - Object containing the loaded wall meshes.
 */
export function removeClippingPlanes(wallMeshes) {
     for (const wallName in wallMeshes) {
         const mesh = wallMeshes[wallName];
         if (!mesh) continue;
         mesh.traverse((child) => {
             if (child.isMesh && child.material) {
                 const clearMaterial = (mat) => {
                     mat.clippingPlanes = null;
                     mat.needsUpdate = true;
                 };
                 if (Array.isArray(child.material)) {
                     child.material.forEach(clearMaterial);
                 } else {
                     clearMaterial(child.material);
                 }
             }
         });
     }
     console.log("Clipping planes removed.");
}
