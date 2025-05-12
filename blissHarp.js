import * as BABYLON from '@babylonjs/core/Legacy/legacy';
import { OBJFileLoader } from '@babylonjs/loaders/OBJ';
import {backgroundUboDeclaration} from "@babylonjs/core/Shaders/ShadersInclude/backgroundUboDeclaration.js";
window.Harp = {}

OBJFileLoader.SKIP_MATERIALS = true
OBJFileLoader.OPTIMIZE_WITH_UV = true

BABYLON.Mesh.prototype.rotateAroundPivot = function(pivotPoint, axis, angle) {
  if(!this._rotationQuaternion) {
    this._rq = BABYLON.Quaternion.RotationYawPitchRoll(this.rotation.y, this.rotation.x, this.rotation.z);
  }
  var _p = new BABYLON.Quaternion(this.position.x - pivotPoint.x, this.position.y - pivotPoint.y, this.position.z - pivotPoint.z, 0);
  axis.normalize();
  var _q = BABYLON.Quaternion.RotationAxis(axis,angle);  //form quaternion rotation
  var _qinv = BABYLON.Quaternion.Inverse(_q);
  var _pdash = _q.multiply(_p).multiply(_qinv);
  this.position = new BABYLON.Vector3(pivotPoint.x + _pdash.x, pivotPoint.y + _pdash.y, pivotPoint.z + _pdash.z);
  this.rotationQuaternion = this._rq.multiply(_q);
  this._rq = this.rotationQuaternion;
}


BABYLON.ArcRotateCamera.prototype.spinTo = function (whichprop, targetval, speed) {
  var ease = new BABYLON.CubicEase()
  ease.setEasingMode(BABYLON.EasingFunction.EASINGMODE_EASEINOUT)
  BABYLON.Animation.CreateAndStartAnimation('at4', this, whichprop, speed, 120, this[whichprop], targetval, 0, ease)
}

BABYLON.Mesh.prototype.scaleFromPivot = function(pivotPoint, sx, sy, sz) {
  var _sx = sx / this.scaling.x;
  var _sy = sy / this.scaling.y;
  var _sz = sz / this.scaling.z;
  this.scaling = new BABYLON.Vector3(sx, sy, sz);
  this.position = new BABYLON.Vector3(pivotPoint.x + _sx * (this.position.x - pivotPoint.x), pivotPoint.y + _sy * (this.position.y - pivotPoint.y), pivotPoint.z + _sz * (this.position.z - pivotPoint.z));
}


//const canvas = document.getElementById('renderCanvas')
var canvas = document.createElement("canvas");

const engine = new BABYLON.Engine(canvas, true, {
  preserveDrawingBuffer: true,
  stencil: true
});
const createScene = function () {

  const scene = new BABYLON.Scene(engine)
  scene.useRightHandedSystem = true

  //Optionable Groups **********
  Harp.optionableGroups.forEach(function (group) {
    Harp[group] = new BABYLON.Mesh(group, scene)
  })

  //Furniture Groups **********
  Harp.furnitureGroups.forEach(function (group) {
    Harp[group] = new BABYLON.Mesh(group, scene)
  })

  //Material Groups **********
  Harp.materialGroups.forEach(function (group) {
    Harp[group] = new BABYLON.Mesh(group, scene)
    Harp[group + '_material'] = new BABYLON.StandardMaterial(group + '_material', scene)
    Harp[group + '_material'].maxSimultaneousLights = 24;
    Harp[group + '_material'].environmentIntensity = 0.5
    Harp[group + '_material'].useRadianceOcclusion = true
    Harp[group + '_material'].usePhysicalLightFalloff = true
    Harp[group + '_material'].useSpecularOverAlpha = true
    Harp[group + '_material'].useAlphaFromDiffuseTexture = true

  })

  //Finish Groups **********
  Harp.finishGroups.forEach(function (group) {
    Harp[group] = new BABYLON.Mesh(group, scene)
    Harp[group + '_material'] = new BABYLON.StandardMaterial(group + '_material', scene)
    Harp[group + '_material'].maxSimultaneousLights = 24;
    Harp[group + '_material'].environmentIntensity = 0.5
    Harp[group + '_material'].useRadianceOcclusion = true
    Harp[group + '_material'].usePhysicalLightFalloff = true
  })

  //Camera **********
  // This creates and positions a free camera (non-mesh)
  var camera = new BABYLON.FreeCamera("camera1", new BABYLON.Vector3(0, 5, -10), scene);
  // This targets the camera to scene origin
  camera.setTarget(BABYLON.Vector3.Zero());
  // This attaches the camera to the canvas
  camera.attachControl(canvas, true);
  camera.layerMask = "0x1000000";

  Harp.skyColor = new BABYLON.Color3(
  (218/256) * 1.25,
  (237/256) * 1.25,
  (245/256) * 1.25
).toLinearSpace();

  Harp.vignetteColor = new BABYLON.Color3(0.6, 0.6, 0.6).toLinearSpace();

  Harp.defaultCamera = new BABYLON.ArcRotateCamera('defaultCamera',
    BABYLON.Tools.ToRadians(45),
    BABYLON.Tools.ToRadians(75),
    1000,
    new BABYLON.Vector3(0, 24, 0),
    scene
  )
  Harp.defaultCamera.radius = 400
  //Harp.defaultCamera.lowerRadiusLimit = Harp.defaultCamera.upperRadiusLimit = Harp.defaultCamera.radius;
  Harp.defaultCamera.upperAlphaLimit = Harp.defaultCamera.lowerAlphaLimit = Harp.defaultCamera.alpha;
  Harp.defaultCamera.upperBetaLimit = Harp.defaultCamera.lowerBetaLimit = Harp.defaultCamera.beta;

  Harp.topCamera = new BABYLON.ArcRotateCamera('topCamera',
    BABYLON.Tools.ToRadians(90),
    BABYLON.Tools.ToRadians(0),
    1000,
    new BABYLON.Vector3(0, 52, 0),
    scene
  )
  Harp.topCamera.radius = 400
  //Harp.topCamera.lowerRadiusLimit = Harp.topCamera.upperRadiusLimit = Harp.topCamera.radius;
  Harp.topCamera.upperAlphaLimit = Harp.topCamera.lowerAlphaLimit = Harp.topCamera.alpha;
  Harp.topCamera.upperBetaLimit = Harp.topCamera.lowerBetaLimit = Harp.topCamera.beta;

  Harp.exteriorCamera = new BABYLON.ArcRotateCamera('exteriorCamera',
    BABYLON.Tools.ToRadians(120),
    BABYLON.Tools.ToRadians(90),
    400,
    new BABYLON.Vector3(0, 52, 0),
    scene
  )
  Harp.exteriorCamera.upperBetaLimit = Harp.exteriorCamera.lowerBetaLimit = Harp.exteriorCamera.beta;

  Harp.renderCamera = new BABYLON.ArcRotateCamera('renderCamera',
    BABYLON.Tools.ToRadians(50),
    BABYLON.Tools.ToRadians(90),
    1000,
    new BABYLON.Vector3(0, 52, 0),
    scene
  )


  Harp.elevationCamera = new BABYLON.ArcRotateCamera('elevationCamera',
    BABYLON.Tools.ToRadians(50),
    BABYLON.Tools.ToRadians(90),
    1000,
    new BABYLON.Vector3(0, 52, 0),
    scene
  )

  Harp.elevationCamera.upperBetaLimit = Harp.elevationCamera.lowerBetaLimit = Harp.elevationCamera.beta;
  Harp.summaryCamera = new BABYLON.ArcRotateCamera('summaryCamera',
    BABYLON.Tools.ToRadians(90),
    BABYLON.Tools.ToRadians(80),
    500,
    new BABYLON.Vector3(0, 52, 0),
    scene
  )

  Harp.summaryCamera.upperBetaLimit = Harp.summaryCamera.lowerBetaLimit = Harp.summaryCamera.beta;


  var pipeline = new BABYLON.DefaultRenderingPipeline(
    "defaultPipeline",
    true,
    scene,
    [camera, Harp.defaultCamera, Harp.renderCamera, Harp.exteriorCamera, Harp.topCamera,Harp.elevationCamera, Harp.summaryCamera]
  );
  pipeline.samples = 12
  pipeline.fxaaEnabled = false
  pipeline.grainEnabled = true
  pipeline.grain.intensity = 7.5

  pipeline.imageProcessingEnabled = true
  pipeline.imageProcessing.contrast = 1.5
  pipeline.imageProcessing.exposure = 1.5
  pipeline.imageProcessing.toneMappingEnabled = true
  pipeline.imageProcessing.toneMappingType = BABYLON.ImageProcessingConfiguration.TONEMAPPING_ACES


  var postProcess = new BABYLON.ImageProcessingPostProcess("processing", 1.0, camera);
  postProcess.vignetteWeight = 5
  postProcess.vignetteStretch = 0.5
  postProcess.samples = 4
  postProcess.vignetteColor = Harp.vignetteColor
  postProcess.vignetteEnabled = true



  //Lighting **********

  let ambient = new BABYLON.HemisphericLight('ambient', new BABYLON.Vector3(0, 100, 0), scene)
  ambient.diffuse = new BABYLON.Color3(1, 1, 1)
  ambient.specular = new BABYLON.Color3(1, 1, 1)
  ambient.intensity = 0.9
  ambient.groundColor = new BABYLON.Color3(1, 1, 1)


  var sun = new BABYLON.DirectionalLight("sun", new BABYLON.Vector3(0.5, -1, -0.5), scene);
  sun.intensity = 1.0;
  sun.position = new BABYLON.Vector3(0, 300, 0)
  sun.diffuse = new BABYLON.Color3(1, 1, 1); // Warm light
  sun.specular = new BABYLON.Color3(1, 0.9, 0.7); // Specular highlights

  var gradientLight = new BABYLON.SpotLight("gradientLight", new BABYLON.Vector3(0, 10, 0), new BABYLON.Vector3(0, -1, 1), Math.PI / 3, 2, scene);
  gradientLight.intensity = 1.5;
  gradientLight.range = 100; // Adjust as necessary
  gradientLight.falloffType = BABYLON.Light.FALLOFF_GLTF; // Use glTF falloff for a smoother gradient
  gradientLight.exponent = 1.0; // Adjust for the desired gradient effect
  // Position the spotlight to cover the ground plane from one side
  gradientLight.position = new BABYLON.Vector3(0, 50, -50);

  // Point the spotlight down towards the ground
  gradientLight.setDirectionToTarget(BABYLON.Vector3.Zero());
  // Adjust the light intensity and range
  gradientLight.intensity = 0.9; // Lower intensity for a more subtle effect
  gradientLight.range = 200; // Increase range to cover more ground
  // Set the falloff type for a custom gradient effect
  gradientLight.falloffType = BABYLON.Light.FALLOFF_STANDARD;
  gradientLight.exponent = 0.5; // Adjust the exponent for the desired falloff





  Harp.shadowGenerator = new BABYLON.ShadowGenerator(1024, sun)
  Harp.shadowGenerator.useBlurExponentialShadowMap = true; // Use blur exponential for soft shadows
  Harp.shadowGenerator.usePoissonSampling = true;
  Harp.shadowGenerator.darkness = 0.1;
  Harp.shadowGenerator.shadowColor = new BABYLON.Color3(0.4, 0.4, 0.4); // Light grey shadows
  Harp.shadowGenerator.bias = 0.001;
  Harp.shadowGenerator.blurKernel = 32;

  Harp.smallHomeConfiguration = function(key,value) {
    if(key === 'roof') {
      if(value === 'standard') {
        Harp.createRoof()
      }
      if(value === 'extended') {
        Harp.createRoof('extended')
      }
    }
    if(key === 'layout') {

      if(value === 'more-living') {
        Harp['G_1_more_living'].setEnabled(true)
        Harp['G_1_furniture'].setEnabled(true)

        Harp['G_2_more_storage'].setEnabled(false)
        Harp['G_2_furniture'].setEnabled(false)

        if(!Harp['i_island'].isEnabled()) {
          Harp['ii_dining_area_more_storage'].setEnabled(false)
          Harp['ii_dining_area_more_living'].setEnabled(true)
        }
      }
      if(value === 'more-storage') {
        Harp['G_1_more_living'].setEnabled(false)
        Harp['G_1_furniture'].setEnabled(false)

        Harp['G_2_more_storage'].setEnabled(true)
        Harp['G_2_furniture'].setEnabled(true)

        if(!Harp['i_island'].isEnabled()) {
          Harp['ii_dining_area_more_storage'].setEnabled(true)
          Harp['ii_dining_area_more_living'].setEnabled(false)
        }
      }
    }

    if(key === 'bedroom') {
      if (value === 'bedroom-door') {
        Harp['i_bedroom_door'].setEnabled(true)
        Harp['b_bedroom_door'].setEnabled(true)

        Harp['ii_bedroom_window'].setEnabled(false)
        Harp['a_bedroom_window'].setEnabled(false )
      }
      if (value === 'bedroom-window') {
        Harp['i_bedroom_door'].setEnabled(false)
        Harp['b_bedroom_door'].setEnabled(false)

        Harp['ii_bedroom_window'].setEnabled(true)
        Harp['a_bedroom_window'].setEnabled(true)
      }
    }

    if(key === 'kitchen') {

      if(value === 'kitchen-door') {
        if(Harp['G_1_larger_living'].isEnabled()) {
          Harp['G_1_ii_kitchen_door'].setEnabled(true)
          Harp['G_2_ii_kitchen_door'].setEnabled(false)
          Harp['G_3_ii_kitchen_door'].setEnabled(false)
        }

        if(Harp['G_2_larger_kitchen_pantry'].isEnabled()) {
          Harp['G_1_ii_kitchen_door'].setEnabled(false)
          Harp['G_2_ii_kitchen_door'].setEnabled(true)
          Harp['G_3_ii_kitchen_door'].setEnabled(false)
        }

        if(Harp['G_3_larger_kitchen_entry'].isEnabled()) {
          Harp['G_1_ii_kitchen_door'].setEnabled(false)
          Harp['G_2_ii_kitchen_door'].setEnabled(false)
          Harp['G_3_ii_kitchen_door'].setEnabled(true)
        }

        Harp['G_1_i_kitchen_window'].setEnabled(false)
        Harp['G_2_i_kitchen_window'].setEnabled(false)
        Harp['G_3_i_kitchen_window'].setEnabled(false)
      }


      if(value === 'island') {
        Harp['i_island'].setEnabled(true)
        Harp['ii_dining_area_more_living'].setEnabled(false)
        Harp['ii_dining_area_more_storage'].setEnabled(false)
      }
      if(value === 'dining') {
        Harp['i_island'].setEnabled(false)

        if(Harp['G_1_more_living'].isEnabled()) {
          Harp['ii_dining_area_more_living'].setEnabled(true)
          Harp['ii_dining_area_more_storage'].setEnabled(false)
        }
        if(Harp['G_2_more_storage'].isEnabled()) {
          Harp['ii_dining_area_more_storage'].setEnabled(true)
          Harp['ii_dining_area_more_living'].setEnabled(false)
        }
      }
    }


    if(key == 'exterior') {

      if(value === 'more-operable') {
        if(Harp['G_1_more_living'].isEnabled()) {

          Harp['a_more_operable_more_living'].setEnabled(true)
          Harp['a_more_operable_more_storage'].setEnabled(false)
          Harp['b_more_glass_more_living'].setEnabled(false)
          Harp['b_more_glass_more_storage'].setEnabled(false)
          Harp['c_most_glass'].setEnabled(false)
        }
        if(Harp['G_2_more_storage'].isEnabled()) {

          Harp['a_more_operable_more_storage'].setEnabled(true)
          Harp['a_more_operable_more_living'].setEnabled(false)
          Harp['b_more_glass_more_living'].setEnabled(false)
          Harp['b_more_glass_more_storage'].setEnabled(false)
          Harp['c_most_glass'].setEnabled(false)
        }
      }

      if(value === 'more-glass') {
        if(Harp['G_1_more_living'].isEnabled()) {
          Harp['b_more_glass_more_living'].setEnabled(true)
          Harp['a_more_operable_more_living'].setEnabled(false)
          Harp['a_more_operable_more_storage'].setEnabled(false)
          Harp['b_more_glass_more_storage'].setEnabled(false)
          Harp['c_most_glass'].setEnabled(false)
        }
        if(Harp['G_2_more_storage'].isEnabled()) {
          Harp['b_more_glass_more_storage'].setEnabled(true)
          Harp['a_more_operable_more_storage'].setEnabled(false)
          Harp['a_more_operable_more_living'].setEnabled(false)
          Harp['b_more_glass_more_living'].setEnabled(false)
          Harp['c_most_glass'].setEnabled(false)
        }
      }

      if(value === 'most-glass') {
        Harp['c_most_glass'].setEnabled(true)
        Harp['a_more_operable_more_storage'].setEnabled(false)
        Harp['a_more_operable_more_living'].setEnabled(false)
        Harp['b_more_glass_more_living'].setEnabled(false)
        Harp['b_more_glass_more_storage'].setEnabled(false)
      }

    }

  }


  Harp.importSummitNxModel= function(code='0_Common') {
    // code is going to be a value like 'A-1' or 'B-2', or 'B-1-b' , 'A-a-ii', etc'.
    // it must be converted from hyphen to underscore so that it can be used as a variable name
    // or if not set then defaults to 0 in which case it should be A_0 or B_0 depending on the model letter
    // the model letter can be extracted from the use case like ß-a  would be "A"
    // the goal is to determine the assetPath and asset based on the model and code for instance
    // window.recipe-model = 'summit-800'
    // code = 'A_a_ii'
    // the resulting assetPath and asset will be '/assets/models/summit-nx/summit-800-A_a_ii.obj'

    code = code.replace(/-/g, '_')

    let assetPath, assetName, container
    if(code === '0_Common') {
      container = 'summitNxContainer_Common'
    } else if(code.endsWith('0')) {
      container = 'summitNxContainer_Base'
    } else {
      container = 'summitNxContainer_Option'
    }
    if(Harp[container] == null) {
      Harp[container] = new BABYLON.AssetContainer(scene)
    } else {
      Harp[container].dispose()
    }
  
    assetPath = '/assets/models/summit-nx/'

    //if summit 680 model c and code is 0_Common then do nothing
    if(window.recipe.model === 'summit-680' && code === '0_Common') {
      return
    }
  
    if (window.recipe.model === 'summit-1000' && code !== '0_Common' && code !== 'A_0' && code !== 'B_0') {
      
      // Parse the code for summit-1000
      let [modelLetter, number, letter, roman] = code.split('_');
      let assetNames;
  
      if (modelLetter === 'A') {
        assetNames = [
          `summit-1000-${modelLetter}_${number}.obj`,
          `summit-1000-${modelLetter}_${letter}.obj`,
          `summit-1000-${modelLetter}_${roman}.obj`
        ];
      } else if (modelLetter === 'B') {
        assetNames = [
          `summit-1000-${modelLetter}_${letter}.obj`,
          `summit-1000-${modelLetter}_${number}_${roman}.obj`
        ];
      }
  
      // Load each asset
      Promise.all(assetNames.map(assetName => 
        new Promise((resolve) => {
          //console.log('assetName: ', assetName)
          BABYLON.SceneLoader.ImportMesh('', assetPath, assetName, scene, function (newMeshes) {
            processMeshes(newMeshes, container);
            resolve();
          });
        })
      )).then(() => {
        //console.log('All summit-1000 assets loaded');
      });
    } else {
      // Original logic for other models
      assetName = `${window.recipe.model}-${code}.obj`
      BABYLON.SceneLoader.ImportMesh('', assetPath, assetName, scene, function (newMeshes) {
        processMeshes(newMeshes, container);
      });
    }
  }

// Helper function to process meshes
function processMeshes(newMeshes, container) {
  newMeshes.forEach(function (m) {
    Harp[container].meshes.push(m)

    Harp.materialGroups.forEach(function (group) {
      if (m.name.includes(' ' + group)) {
        m.parent = Harp[group]
        m.material = Harp[group + '_material']
      }
    })

    Harp.finishGroups.forEach(function (group) {
      if (m.name.includes(' ' + group)) {
        m.parent = Harp[group]
        m.material = Harp[group + '_material']
      }
    })

    m.position.x = 0
    m.position.y = -9.25
    m.position.z = 0
    m.receiveShadows = true
    Harp.shadowGenerator.getShadowMap().renderList.push(m);

    if(!m.name.includes('wood_') && !m.name.includes('plank_') && !m.name.includes('metal_') ) {
      m.enableEdgesRendering();
      m.edgesWidth = 66;
      m.edgesColor =  new BABYLON.Color4(0, 0, 0, 0.66)
    }
  })
}



  Harp.importAduModel = function(containerSuffix = 'base', modelSuffix = 0) {
    let aduAssetPath, aduAsset
    let container = 'aduContainer_' + containerSuffix
    if(Harp[container] == null) {
      Harp[container] = new BABYLON.AssetContainer(scene)
    } else {
      Harp[container].dispose()
    }

    aduAsset = `${window.recipe.useCase}_${modelSuffix}.obj`
    aduAssetPath = '/assets/models/summit-1000/'
    BABYLON.SceneLoader.ImportMesh('', aduAssetPath, aduAsset, scene, function (newMeshes) {
      newMeshes.forEach(function (m) {
        Harp[container].meshes.push(m)

        if(containerSuffix === 'bedroom') {
          //console.log(m.name)
        }
        Harp.materialGroups.forEach(function (group) {
          if (m.name.includes(' ' + group)) {
            m.parent = Harp[group]
            m.material = Harp[group + '_material']
          }
        })

        Harp.finishGroups.forEach(function (group) {
          if (m.name.includes(' ' + group)) {
            m.parent = Harp[group]
            m.material = Harp[group + '_material']
          }
        })

        m.position.x = 0
        m.position.y = -9.25
        m.position.z = 0
        m.receiveShadows = true
        Harp.shadowGenerator.getShadowMap().renderList.push(m);

        if(!m.name.includes('wood_') && !m.name.includes('plank_') && !m.name.includes('metal_') ) {
          m.enableEdgesRendering();
          m.edgesWidth = 66;
          m.edgesColor =  new BABYLON.Color4(0, 0, 0, 0.66)

        }

      })
    })
  }

  Harp.createSmallHome = function () {
    if (Harp.smallHomeContainer == null) {
      Harp.smallHomeContainer = new BABYLON.AssetContainer(scene)
    } else {
      Harp.smallHomeContainer.dispose()
    }
    let smallHomeAssetPath, smallHomeAsset
    if (window.recipe.model === 'noc') {
      smallHomeAsset = `${window.recipe.depth}x${window.recipe.length}_model_${window.recipe.exteriorOrientation}.obj`
      smallHomeAssetPath = '/assets/models/noc/'
    }


    BABYLON.SceneLoader.ImportMesh('', smallHomeAssetPath, smallHomeAsset, scene, function (newMeshes) {
      newMeshes.forEach(function (m) {
        //console.log(m.name)
        Harp.smallHomeContainer.meshes.push(m)
        Harp.materialGroups.forEach(function (group) {
          if (m.name.includes(' ' + group)) {
            m.parent = Harp[group]
            m.material = Harp[group + '_material']
          }
        })

        Harp.finishGroups.forEach(function (group) {
          if (m.name.includes(' ' + group)) {
            m.parent = Harp[group]
            m.material = Harp[group + '_material']
          }
        })

        Harp.optionableGroups.forEach(function (group) {
          if (m.name.includes(' ' + group)) {
            m.parent = Harp[group]
          }
        })

        Harp.furnitureGroups.forEach(function (group) {
          if (m.name.includes(' ' + group)) {
            m.parent = Harp[group]
          }
        })

        m.position.x = 0
        if(window.recipe.exteriorOrientation === 'right') {
          m.position.x = 6
        }
        m.position.y = -9.25
        m.position.z = 0
        m.enableEdgesRendering();
        m.edgesWidth = 66;
        m.edgesColor =  new BABYLON.Color4(0, 0, 0, 0.66)
        m.receiveShadows = true
        Harp.shadowGenerator.getShadowMap().renderList.push(m);

        if(m.name.includes('window') || m.name.includes('door') || m.name.includes('framing')) {
          m.enableEdgesRendering();
          m.edgesWidth = 66;
          m.edgesColor =  new BABYLON.Color4(0, 0, 0, 0.66)
          m.receiveShadows = true
          Harp.shadowGenerator.getShadowMap().renderList.push(m);
        }
        if(m.name.includes('lifestyle')) {
          m.receiveShadows = true
        }

        // Harp.sconceLights = []
        //
        // if(m.name.includes('cube')) {
        //   let bulbColor = BABYLON.Color3.White()
        //   let bulbName = 'bulb_' + m.uniqueId
        //   let bulbPosition = m.getBoundingInfo().boundingBox.centerWorld;
        //   Harp.sconceLights[bulbName] = new BABYLON.PointLight(bulbName, bulbPosition, scene)
        //   Harp.sconceLights[bulbName].intensity = 1.0
        //   Harp.sconceLights[bulbName].diffuse = bulbColor
        //   Harp.sconceLights[bulbName].specular = bulbColor
        //   Harp.sconceLights[bulbName].range = 36
        //   Harp.sconceLights[bulbName].parent = m.parent
        //   Harp.sconceLights[bulbName].setEnabled(true)
        //   Harp.shadowGenerator.addShadowCaster(m)
        //   Harp.shadowGenerator.getShadowMap().renderList.push(m);
        // }

        setTimeout(() => {
          window.dispatchEvent(new CustomEvent('loadColorway'))
        }, 1000)
      })
    })
  }

  Harp.createRoof = function (option = null) {
    // If bliss exists and bliss.side is set to 'top', return immediately
    if (typeof bliss !== 'undefined' && bliss.side === 'top') {
      return;
    }

    // Initialize or dispose the roof container
    if (Harp.roofContainer == null) {
      Harp.roofContainer = new BABYLON.AssetContainer(scene);
    } else {
      Harp.roofContainer.dispose();
    }

    // Define constants for suffix and paths
    const SUFFIXES = {
      DEFAULT: '-STV',
      SIGNATURE: '-STE-06F',
      SUMMIT_1000: '_roof',
      SUMMIT_NX: '-Roof.obj'
    };

    let suffix = SUFFIXES.DEFAULT;

    switch (window.recipe.model) {
      case 'signature':
        suffix = SUFFIXES.SIGNATURE;
        break;
      case 'noc':
        suffix = `_roof_${window.recipe.exteriorOrientation}`;
        if (option === 'extended') {
          suffix += '_extended';
        }
        break;
      case 'summit-1000':
      case 'summit-800':
      case 'summit-680':
      case 'summit-608':
      case 'summit-476':
      case 'summit-440':
      case 'summit-308':
        suffix = SUFFIXES.SUMMIT_NX;
        break;
    }

    let roofPath = `/assets/models/${window.recipe.model}/roof/`;
    let roofAsset = `${window.recipe.depth}x${window.recipe.length}${suffix}.obj`;

    if (['summit-1000', 'summit-800', 'summit-680', 'summit-608', 'summit-476', 'summit-440', 'summit-308'].includes(window.recipe.model)) {
      roofPath = '/assets/models/summit-nx/';
      roofAsset = window.recipe.model + SUFFIXES.SUMMIT_NX;
    }

    // Load the roof mesh
    BABYLON.SceneLoader.ImportMesh('', roofPath, roofAsset, scene, (newMeshes) => {
      newMeshes.forEach((m) => {
        Harp.roofContainer.meshes.push(m);

        // Apply materials and parent groups
        Harp.materialGroups.forEach((group) => {
          if (m.name.includes(group)) {
            m.parent = Harp[group];
            m.material = Harp[group + '_material'];
          }
        });

        // Set mesh rotation and position based on model
        if (window.recipe.model === 'signature') {
          m.rotation.y = BABYLON.Tools.ToRadians(90);
          m.position.set(0, -9, 6.5);
        } else {
          m.position.set(0, window.recipe.depth <= 16 ? -12 : -9, 0);
          if (window.recipe.model === 'portland') {
            m.position.y = -8.5;
          }
        }

        // Enable edges rendering
        m.enableEdgesRendering();
        m.edgesWidth = 66;
        m.edgesColor = new BABYLON.Color4(0, 0, 0, 0.66);

        // Add shadow caster
        Harp.shadowGenerator.addShadowCaster(m);

      });
    });
  };

  Harp.createFoundation = function () {
    var worldFloor = BABYLON.MeshBuilder.CreateBox("worldFloor", { width: 5000, depth: 5000, height: 1 }, scene);
    worldFloor.position = new BABYLON.Vector3(0, -10, 0); // Center the floor at 0, 0, 0
    var worldFloorMaterial = new BABYLON.StandardMaterial("worldFloorMaterial", scene);
    worldFloorMaterial.diffuseColor = new BABYLON.Color3(0.6, 0.6, 0.6); // Light gray
    worldFloorMaterial.specularColor = new BABYLON.Color3(0, 0, 0); // Specular settings
    worldFloorMaterial.roughness = 1.0; // Roughness
    worldFloorMaterial.metallic = 1.0; // Metallic
    worldFloor.material = worldFloorMaterial;
    worldFloor.receiveShadows = true;



    Harp.foundation_material = new BABYLON.StandardMaterial('foundation_material', scene)
    if (Harp.foundationContainer == null) {
      Harp.foundationContainer = new BABYLON.AssetContainer(scene)
    } else {
      Harp.foundationContainer.dispose()
    }

    Harp.foundationMesh = BABYLON.MeshBuilder.CreateBox('foundation', {
      width: window.recipe.length * 12,
      height: 0.2,
      depth: window.recipe.depth * 12,
    })
    Harp.foundationMesh.position.y = -10
    Harp.foundationContainer.meshes.push(Harp.foundationMesh)

    Harp.foundationMesh.material = Harp.foundation_material
    Harp.foundation_material.specularColor = new BABYLON.Color3(1.0, 1.0, 1.0)
    Harp.foundation_material.specularPower = 32
    Harp.foundationMesh.receiveShadows = true
  }

  Harp.createFlooring = function() {
    if(Harp.floorContainer == null) {
      Harp.floorContainer = new BABYLON.AssetContainer(scene)
    } else {
      Harp.floorContainer.dispose()
    }
    var faceUV = new Array(6);
    for (var i = 0; i < 6; i++) {
      faceUV[i] = new BABYLON.Vector4(0, 0, 0, 0);
    }
    faceUV[4] = new BABYLON.Vector4(0, 0, 1, 1);
    Harp.floorMesh = BABYLON.MeshBuilder.CreateBox('floor', {
      width: window.recipe.length * 12,
      height: 1,
      depth: window.recipe.depth * 12,
      faceUV: faceUV
    })
    Harp.floorMesh.position.y = -9.75
    Harp.floorContainer.meshes.push(Harp.floorMesh)
    Harp.floor_material = new BABYLON.StandardMaterial('floor_material', scene)
    Harp.floor_material.specularColor = new BABYLON.Color3(0.125, 0.125, 0.125)
    Harp.floor_material.specularPower = 32
    Harp.floor_material.diffuseTexture = new BABYLON.Texture(Harp.textures.concrete)
    Harp.floor_material.diffuseTexture.uScale = 1
    Harp.floor_material.diffuseTexture.vScale = 1
    Harp.floorMesh.material = Harp.floor_material
    Harp.floorMesh.receiveShadows = true
  }
  Harp.createInterior = function () {
    Harp.importInteriorLayout(window.recipe.interior)
  }

  Harp.importAndPositionPanel = function (side, elevation) {
    if (elevation === null) {
      return
    }

    if (window[side]) {
      window[side].dispose()
    }
    let slotData = window.recipe[side]
    let assetPath = '/assets/models/' + window.recipe.model + '/' + side + '/'
    let objFile = elevation + '.obj'

    BABYLON.SceneLoader.ImportMesh('', assetPath, objFile, scene, function (newMeshes) {

      window[side] = new BABYLON.AssetContainer(scene)
      newMeshes.forEach(function (m) {

        window[side].meshes.push(m)
        Harp.materialGroups.forEach(function (group) {


          if (m.name.includes(group)) {
            m.parent = Harp[group]
            m.material = Harp[group + '_material']
          }
        })

        if (side === 'right') {
          m.rotation.y = BABYLON.Tools.ToRadians(90)
        }

        if (side === 'left') {
          m.rotation.y = BABYLON.Tools.ToRadians(270)
        }

        if (side === 'back' && window.recipe.model === 'portland') {
          m.rotation.y = BABYLON.Tools.ToRadians(180)
        }

        m.position.z = slotData.z
        m.position.y = slotData.y
        m.position.x = slotData.x

        // m.visibility = 0;
        // animateVisibility();
        // function animateVisibility() {
        //   if (m.visibility < 1) {
        //     m.visibility += 0.05;
        //     requestAnimationFrame(animateVisibility);
        //   }
        // }
        Harp.shadowGenerator.getShadowMap().renderList.push(m);

        Harp.shadowGenerator.addShadowCaster(m)


        m.receiveShadows = true;

        if(m.name.includes('window') || m.name.includes('door') || m.name.includes('framing')) {
          m.enableEdgesRendering();
          m.edgesWidth = 66;
          m.edgesColor =  new BABYLON.Color4(0, 0, 0, 0.66)
          m.receiveShadows = true

        }
        if(m.name.includes('lifestyle')) {
          m.receiveShadows = true
          m.enableEdgesRendering();
          m.edgesWidth = 66;
          m.edgesColor =  new BABYLON.Color4(0, 0, 0, 0.66)
        }


      })
      Harp.elevationsLoaded++
    })
  }

  Harp.importAduKit= function(sku,depth,length) {
    return new Promise((resolve, reject) => {
      BABYLON.SceneLoader.ImportMeshAsync('', '/assets/models/summit/interior/', sku + '-interior-kit.obj', scene).then((result) => {
        result.meshes.forEach(function (m) {

          Harp.interiorContainer.meshes.push(m)

          Harp.finishGroups.forEach(function (group) {

            if (m.name.includes(group)) {
              m.parent = Harp[group]
              m.material = Harp[group + '_material']
            }
          })
          m.position.x = 0
          m.position.y = -8
          m.position.z = 0

          m.enableEdgesRendering();
          m.edgesWidth = 66;
          m.edgesColor =  new BABYLON.Color4(0, 0, 0, 0.66)
          m.receiveShadows = true
          Harp.shadowGenerator.addShadowCaster(m)
          Harp.shadowGenerator.getShadowMap().renderList.push(m)
        })

        //window.dispatchEvent(new CustomEvent('loadColorway'))
        resolve()
      })
    })
  }

  Harp.importBedroomKit= function(sku, side) {
    return new Promise((resolve, reject) => {
      let depth = window.recipe.depth
      let length = window.recipe.length
      let x,z
      z = -(((window.recipe.depth*12)/2) - 6)
      if(side === 'R') {
        //x = ((window.recipe.floor.width/2) - 6)
        //x = -27
        if(length == 34) { x = -27 }
        if(length == 38) { x = -27 }
        if(length == 42) { x = 18 }
        if(length == 46) { x = 18}
        if(length == 50) { x = 60 }
      }
      if(side === 'L') {
        //x = -((window.recipe.floor.width/2) - 6)
        //x = -39
        if(length == 34) { x = -39 }
        if(length == 38) { x = -42 }
        if(length == 42) { x = -81 }
        if(length == 46) { x = -81 }
        if(length == 50) { x = -123 }
      }
      if(sku === '2BED-R-MM' || sku === '2BED-L-MM') {
        x = 0
        z = 0
      }
      BABYLON.SceneLoader.ImportMeshAsync('', '/assets/models/summit/interior/',  sku + '-' + depth + '.obj', scene).then((result) => {
        result.meshes.forEach(function (m){
          Harp.interiorContainer.meshes.push(m)
          Harp.finishGroups.forEach(function (group){
            if (m.name.includes(group)) {
              m.parent = Harp[group]
              m.material = Harp[group + '_material']
            }
          })
          m.position.x = x
          m.position.y = -8
          m.position.z = z
          m.enableEdgesRendering();
          m.edgesWidth = 66;
          m.edgesColor =  new BABYLON.Color4(0, 0, 0, 0.66)
          m.receiveShadows = true
          Harp.shadowGenerator.getShadowMap().renderList.push(m)
        })

        resolve()
      })
    })
  }
  Harp.importNothing = function() {
    return new Promise((resolve, reject) => {
      //wait 1 second
      setTimeout(() => {

        resolve()
      }, 1000)
    })
  }
  Harp.importBathroom = function(sku, side) {
    return new Promise((resolve, reject) => {
      let x, z
      z = -(((window.recipe.depth * 12) / 2) - 6)
      if (side === 'R') {
        x = (((window.recipe.length * 12) / 2) - 6)
      }
      if (side === 'L') {
        x = -(((window.recipe.length * 12) / 2) - 6)
      }
      BABYLON.SceneLoader.ImportMeshAsync('', '/assets/models/summit/interior/', sku + '-' + side + '.obj', scene).then((result) => {
        result.meshes.forEach(function (m) {
          Harp.interiorContainer.meshes.push(m)

          Harp.finishGroups.forEach(function (group) {
            if (m.name.includes(group)) {
              m.parent = Harp[group]
              m.material = Harp[group + '_material']
            }
          })
          m.position.x = x
          m.position.y = -8
          m.position.z = z
          m.enableEdgesRendering();
          m.edgesWidth = 66;
          m.edgesColor =  new BABYLON.Color4(0, 0, 0, 0.66)
          m.receiveShadows = true
          Harp.shadowGenerator.getShadowMap().renderList.push(m);

        })

        resolve()
      })
    })
  }

  Harp.importKitchen = function(sku, side) {
    return new Promise((resolve, reject) => {
      let x, z
      z = -(((window.recipe.depth * 12) / 2) - 6)
      if (side === 'R') {
        x = (((window.recipe.length * 12) / 2) - 6)
      }
      if (side === 'L') {
        x = -(((window.recipe.length * 12) / 2) - 6)
      }
      if (sku == 'KIT-MED') {
        if (side === 'L') {
          z = 0 - ((window.recipe.depth * 12) / 2) + 72
        } else {
          z = 0 - ((window.recipe.depth * 12) / 2)
        }
      }

      BABYLON.SceneLoader.ImportMeshAsync('', '/assets/models/summit/interior/', sku + '-' + side + '.obj', scene).then((result) => {

        result.meshes.forEach(function (m) {

          Harp.interiorContainer.meshes.push(m)

          Harp.finishGroups.forEach(function (group) {
            if (m.name.includes(group)) {
              m.parent = Harp[group]
              m.material = Harp[group + '_material']
            }
          })
          m.position.x = x
          m.position.y = -14
          m.position.z = z

          if(sku == 'KIT-MED') {
            if (side === 'L') {
              m.rotation.y = BABYLON.Tools.ToRadians(90)
            }
            if (side === 'R') {

            }
          }

          m.enableEdgesRendering();
          m.edgesWidth = 66;
          m.edgesColor =  new BABYLON.Color4(0, 0, 0, 0.66)

        })


        resolve()
      })
    })
  }

  Harp.importInteriorLayout = function (sku) {
    return new Promise((resolve, reject) => {
      Harp.lifestyle.setEnabled(true)
      if (Harp.interiorContainer) {
        Harp.interiorContainer.dispose()
      }
      Harp.interiorContainer = new BABYLON.AssetContainer(scene)

      if (sku === 'shell-only') {

        Harp.lifestyle.setEnabled(false);
        Harp.floor_material.diffuseTexture = new BABYLON.Texture(Harp.textures.concrete)
        if (Harp.interiorContainer) {
          Harp.interiorContainer.dispose()
        }
        resolve();
      }


      if (sku == 'lifestyle') {
        Harp.importNothing()
          .then(() => {
            resolve();
          });
      }

      if (sku == 'model-1' || sku == 'model-2' || sku == 'model-3' || sku == 'model-4') {
        Harp.importAduKit(sku, Harp.config.depth, Harp.config.length)
      }

      if (sku === 'BED-R-MM' || sku === '2BED-R-MM') {
        Harp.importBedroomKit(sku, 'R')
          .then(() => {
            resolve();
          });
      } else if (sku === 'BED-L-MM' || sku === '2BED-L-MM') {
        Harp.importBedroomKit(sku, 'L')
          .then(() => {
            resolve();
          });
      }


      if (sku === 'KIT-MM-R') {

        Harp.importKitchen('KIT-MED', 'R')
          .then(() => {
            Harp.importBathroom('BAT-MED', 'R')
              .then(() => {
                resolve();
              });
          });
      }

      if (sku === 'KIT-MM-L') {
        //Harp.importKitchen('KIT-MED', 'L')
        //Harp.importBathroom('BAT-MED', 'L')
        Harp.importKitchen('KIT-MED', 'L')
          .then(() => {
            Harp.importBathroom('BAT-MED', 'L')
              .then(() => {
                resolve();
              });
          });
      }


      if (sku === 'KIT-SM-R') {
        //Harp.importKitchen('KIT-MIN', 'R')
        //Harp.importBathroom('BAT-MED', 'R')
        Harp.importKitchen('KIT-MIN', 'R')
          .then(() => {
            Harp.importBathroom('BAT-MED', 'R')
              .then(() => {
                resolve();
              });
          });
      }

      if (sku === 'KIT-SM-L') {
        //Harp.importKitchen('KIT-MIN', 'L')
        //Harp.importBathroom('BAT-MED', 'L')
        Harp.importKitchen('KIT-MIN', 'L')
          .then(() => {
            Harp.importBathroom('BAT-MED', 'L')
              .then(() => {
                resolve();
              });
          });
      }
      if (sku === 'BAT-MED-R') {
        //Harp.importBathroom('BAT-MED', 'R')
        Harp.importBathroom('BAT-MED', 'R')
          .then(() => {
            resolve();
          });
      }
      if (sku === 'BAT-MED-L') {
        //Harp.importBathroom('BAT-MED', 'L')
        Harp.importBathroom('BAT-MED', 'L')
          .then(() => {
            resolve();
          });
      }
    })
  }

  //Screenshot tool *********
  Harp.pushScreenshot = async function () {
    Harp.screenshotData = {config_uid: 'test' || null}
    const response = fetch('/api/screenshot', {
      method: 'POST',
      body: JSON.stringify(Harp.screenshotData),
      headers: {
        'Content-Type': 'application/json'
      }
    })
    return true
  }

  Harp.convertPngToJpegBase64 = function(pngBase64, jpegQuality = 0.8) {
    return new Promise((resolve, reject) => {
      // Step 1: Decode the Base64 PNG String
      const binaryString = window.atob(pngBase64.split(',')[1]);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      // Step 2: Convert to Blob
      const blob = new Blob([bytes], { type: 'image/png' });

      // Step 3: Create an Image Element
      const img = new Image();
      img.onload = () => {
        // Step 4: Draw Image on Canvas
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);

        // Step 5: Convert Canvas to JPEG
        const jpegBase64 = canvas.toDataURL('image/jpeg', jpegQuality);

        // Step 6: Cleanup
        URL.revokeObjectURL(img.src);

        resolve(jpegBase64);
      };
      img.onerror = () => {
        reject(new Error('Error loading image'));
      };
      img.src = URL.createObjectURL(blob);
    });
  }






  Harp.generateInteriorShot = function () {
    BABYLON.Tools.CreateScreenshotUsingRenderTarget(engine, Harp.topCamera, { width: 1200, height: 900 })
  }

  Harp.delay = function(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  Harp.takeScreenshot = async function (camera, elementId) {
    //if no recipe, return
    if (!window.recipe) {
      return
    } 

    if (elementId === 'interior-screenshot-data') {
      Harp.roofContainer.removeAllFromScene()
      await Harp.delay(100)
    }
   
    if(recipe.model === 'summit-1000') {
      let originalRadius = camera.radius
      camera.radius = 615
    }

    return new Promise(async (resolve, reject) => {
      try {
        const data = await new Promise((innerResolve) => {
          BABYLON.Tools.CreateScreenshotUsingRenderTarget(engine, camera, {width: 1200, height: 900}, innerResolve);
        });

        if (data) {
          const jpegBase64 = await Harp.convertPngToJpegBase64(data);
          document.getElementById(elementId).value = jpegBase64;
          resolve();
        } else {
          reject(new Error("Failed to capture screenshot"));
        }

        if (recipe.model === 'summit-1000') {
          camera.radius = originalRadius
        }
      } catch (error) {
        console.error(error);
        reject(new Error("Failed to capture screenshot"));
    }
  });
};


  Harp.createRecipe = function (config) {

    return true;
  }

  //Default routine  **********
  Harp.useRecipe = function (config = null) {
    // Use the globally stored scene
    Harp.resetScene(Harp.scene);

    if (config) {
      let model = config.model
      let useCase = config.useCase
      let size = config.size
      let depth = config.depth
      let length = config.length
      let exteriorOrientation = config.exteriorOrientation

      window.recipe = {
        "model": model,
        "useCase": useCase,
        "size": null,
        "depth": null,
        "length": null,
        "interior": null,
        "front": {"obj": null, "width": 0, "x": 0, "y": -9, "z": 0},
        "back": {"obj": null, "width": 0, "x": 0, "y": -9, "z": 0},
        "left": {"obj": null, "width": 0, "x": 0, "y": -9, "z": 0},
        "right": {"obj": null, "width": 0, "x": 0, "y": -9, "z": 0}
      }

      window.recipe.depth = depth
      window.recipe.length = length
      window.recipe.area = depth * length
      window.recipe.size = size
      window.recipe.exteriorOrientation = exteriorOrientation

      //set default recipe interior to lifestyle,
      window.recipe.interior = 'lifestyle'

      let backXOffset = 0
      let frontXOffset = 0
      let backZOffset = 0
      let frontZOffset = 0
      let leftXOffset = 0
      let rightXOffset = 0
      let leftZOffset = 0
      let rightZOffset = 0

      if(model === 'summit') {
        backXOffset = -6
        frontXOffset = 6
        backZOffset = 0
        frontZOffset = 0

        leftXOffset = 1
        rightXOffset = -1
        if (size == '16x22' || size == '18x22') {
          backXOffset = -10
        }
      }

      if(model === 'portland') {
        backXOffset = 0
        frontXOffset = 0
        backZOffset = 0.5
        frontZOffset = -0.5

        leftXOffset = 0.5
        rightXOffset = -0.5
        leftZOffset = 6
        rightZOffset = -6
      }

      if(model === 'signature') {
        backXOffset = -(length * 12)+4
        frontXOffset = 4
        backZOffset = 0.5
        frontZOffset = 0

        leftXOffset = 0.5
        rightXOffset = -0.5
        leftZOffset = 0
        rightZOffset = 0
      }

      window.recipe.front.width = length * 12
      window.recipe.front.x = -((length * 12) / 2) + frontXOffset
      window.recipe.front.z = ((depth * 12) / 2) + frontZOffset

      window.recipe.back.width = length * 12
      window.recipe.back.x = ((length * 12) / 2) + backXOffset
      window.recipe.back.z = -((depth * 12) / 2) + backZOffset

      window.recipe.left.width = depth * 12
      window.recipe.left.x = -((length * 12) / 2) + leftXOffset
      window.recipe.left.z = -((depth* 12) / 2) + leftZOffset

      window.recipe.right.width = depth * 12
      window.recipe.right.x = ((length * 12) / 2) + rightXOffset
      window.recipe.right.z = ((depth* 12) / 2) + rightZOffset
    }

    if(config.model === 'noc') {
      //set default orientation to left (for noc/aspect)
      //window.recipe.exteriorOrientation = config.smallHomeOrientation === 'R' ? 'right' : 'left';
      //if exteriorOrientation is not set in recipe then try to read config, set it to left, unless config sets it to right
      //otherwise use the recipe exteriorOrientation
      if (!window.recipe.exteriorOrientation) {
        window.recipe.exteriorOrientation = config.smallHomeOrientation === 'R' ? 'right' : 'left';

      }
      Harp.createRoof()
      Harp.createFoundation()
      Harp.createFlooring()
      Harp.createSmallHome()
      Harp.hideRoof()
    } else if(config.model == 'summit-1000' || config.model == 'summit-800' || config.model == 'summit-680' || config.model == 'summit-608' || config.model == 'summit-476' || config.model == 'summit-440' || config.model == 'summit-308') {
      Harp.createRoof()
      Harp.createFoundation()
      Harp.createFlooring()
      Harp.importSummitNxModel()
      Harp.hideRoof()
    } else {
      Harp.createRoof()
      Harp.createFoundation()
      Harp.createFlooring()
      Harp.createInterior()
      Harp.sides.forEach(function (side) {
        if (window[side]) {
          window[side].dispose()
        } else {
          window[side] = new BABYLON.AssetContainer(scene)
        }
        Harp.importAndPositionPanel(side, window.recipe[side].obj)
      })
    }
    return true
  }

  //Harp.loadDefaultRecipe()
  return scene
}

Harp = {
  elevationsLoaded: 0,
  roofVisible: true,
  sides: ['front', 'back', 'left', 'right'],
  colors: {
    'pink': 'rgb(255, 20, 255)',
    'night-gray': 'rgb(103, 105, 107)',
    'boothbay-blue': 'rgb(115, 126, 130)',
    'mountain-sage': 'rgb(91, 96, 64)',
    'iron-gray': 'rgb(82, 86, 84)',
    'pearl-gray': 'rgb(177, 178, 176)',
    'arctic-white': 'rgb(235, 236, 238)',
    'countrylane-red': 'rgb(110, 57, 41)',
    'rich-espresso': 'rgb(91, 87, 82)',
    'timber-bark': 'rgb(122, 114, 93)',
    'cobble-stone': 'rgb(201, 196, 180)',
    'heathered-moss': 'rgb(148, 144, 109)',
    'factory-primed-white': 'rgb(245, 245, 245)',
    'electric-lime': 'rgb(142, 195, 16)',
    'relentless-olive': 'rgb(110, 116, 59)',
    'tricorn-black': 'rgb(45, 45, 46)',
    'yam': 'rgb(197, 114, 58)',
    'naval': 'rgb(47, 61, 75)',
    'fireworks': 'rgb(215, 57, 48)',
    'forsythia': 'rgb(252, 210, 0)',
    'studio-shed-bronze': 'rgb(32, 26, 24)',
    'ebony': 'rgb(32, 32, 33)',
    'pebble-gray': 'rgb(140, 130, 110)',
    'unfinished-eaves': 'rgb(222, 222, 222)',
    'unfinished-trim': 'rgb(245, 245, 245)',
    'natural-stain': 'rgb(178, 120, 59)',
    'charwood-stain': 'rgb(75, 60, 48)',
    'cedar-plank': 'rgb(169, 107, 69)',
    'cedar-shake': 'rgb(169, 107, 69)',
    //'glass': 'rgb(168, 204, 215)',
    //lighter blue glass buy 25%
    'glass': 'rgb(210, 230, 240)',

    'roof-metal': 'rgb(155, 158, 158)',
    'aluminum': 'rgb(155, 158, 158)',
    'appliance': 'rgb(207, 212, 217)',
    'satin-nickel': 'rgb(181, 182, 181)',
    'black': 'rgb(0, 0, 0)',
    'matte-black': 'rgb(0, 0, 0)',
    'white': 'rgb(255, 255, 255)',
    'fixture': 'rgb(26, 126, 126)',
    'white-shaker': 'rgb(245, 241, 238)',
    'grey-shaker': 'rgb(161, 161, 159)',
    'high-gloss-white-flat': 'rgb(242, 242, 239)'
  },
  shadowGroups: [],
  furnitureGroups: [
    'i_island',
    'ii_dining_area_more_storage',
    'ii_dining_area_more_living',
    'G_1_furniture',
    'G_2_furniture',
  ],
  optionableGroups: [
    'G_1_more_living',
    'G_2_more_storage',
    'a_more_operable_more_living',
    'a_more_operable_more_storage',
    'b_more_glass_more_living',
    'b_more_glass_more_storage',
    'c_most_glass',
    'G_1_more_closet',
    'G_2_kitchen_window',
    'G_3_kitchen_door',
    'a_double_door',
    'b_single_door',
    'ii_bedroom_window',
    'i_bedroom_door',
    'G_1_larger_living',
    'G_2_larger_kitchen_pantry',
    'G_3_larger_kitchen_entry',
    'a_bedroom_window',
    'b_bedroom_door',
    'G_1_ii_kitchen_door',
    'G_1_i_kitchen_window',
    'G_2_ii_kitchen_door',
    'G_2_i_kitchen_window',
    'G_3_ii_kitchen_door',
    'G_3_i_kitchen_window',
  ],
  materialGroups: [
    'wood_texture',
    'wood_texture_metal',
    'wood_texture_trims',
    'wood_texture_metal_trims',
    'block_siding',
    'block_siding_color',
    'block_siding_fastener',
    'block_siding_trims',
    'block_siding_metal',
    'block_siding_metal_color',
    'block_siding_metal_fastener',
    'block_siding_metal_trims',
    'plank_siding',
    'plank_siding_trims',
    'plank_siding_color',
    'plank_trims',
    'plank_trim',
    'plank_siding_metal',
    'plank_siding_metal_trims',
    'plank_siding_metal_color',
    'trim_color',
    'accent_color',
    'metal_wainscot',
    'metal_wainscot1',
    'lifestyle',
    'lumber',
    'sheathing',
    'framing',
    'Interior',
    'glass',
    'door_color',
    'roof_fascia',
    'roof_eave',
    'roof_metal',
    'eave_plywood',
    'eave_rafter',
    'window_exterior',
    'awning',
    'pergola',
  ],
  finishGroups: [
    'bathroom_floor',
    'glass',
    'mirror',
    'shower_door_trim',
    'shower_door_glass',
    'appliance',
    'counter',
    'countertop',
    'cabinet',
    'white',
    'black',
    'fixture',
    'i_island',
    'ii_dining_area',
    'G_1_furniture',
    'G_2_furniture',
    'couch',
  ],
  textures: {
    'wood': '/assets/textures/wood.jpg',
    'concrete': '/assets/textures/concrete.jpg',
    'base-lap': '/assets/textures/base_lap.png',
    'cedar-plank': '/assets/textures/cedar-plank.jpg',
    'cedar-shake': '/assets/textures/cedar-shake.jpg',
    'ashlar-oak': '/assets/textures/ashlar-oak.jpg',
    'sandcastle-oak': '/assets/textures/sandcastle-oak.jpg',
    'fawn-chestnut': '/assets/textures/fawn-chestnut.jpg',
    'knotted-chestnut': '/assets/textures/knotted-chestnut.jpg',
    'natural-hickory': '/assets/textures/natural-hickory.jpg',
    'fumed-hickory': '/assets/textures/fumed-hickory.jpg',
    'cedar-chestnut': '/assets/textures/cedar-chestnut.jpg',
    'licorice': '/assets/textures/licorice.jpg',
    'abyss': '/assets/textures/abyss.jpg',
    'poetry-grey': '/assets/textures/poetry-grey.jpg',
    'yuri-grey': '/assets/textures/yuri-grey.jpg',
    'silverstone': '/assets/textures/silverstone.jpg',
    'merino-grey': '/assets/textures/merino-grey.jpg',
    'gothic-arch': '/assets/textures/gothic-arch.jpg',
    'ice-fog': '/assets/textures/ice-fog.jpg',
    'stone-grey': '/assets/textures/stone-grey.jpg',
  },
  setGroupStain(group, code) {
    const rgb = code.substring(4, code.length - 1).replace(/ /g, '').split(',');
    const color = BABYLON.Color3.FromInts(...rgb);

    const childMeshes = Harp[group].getChildMeshes(false);
    for (const mesh of childMeshes) {
      mesh.material.diffuseColor = color;
    }
  },
  setGroupColor(group, code) {
    const rgb = code.substring(4, code.length - 1).replace(/ /g, '').split(',');
    const color = BABYLON.Color3.FromInts(...rgb);
    const childMeshes = Harp[group].getChildMeshes();

    for (const mesh of childMeshes) {
      mesh.material.diffuseColor = color;
    }
  },
  loadDefaultRecipe: function (model = null) {
    /*window.recipe = {
      "model": "summit",
      "size": "18x38",
      "depth": 18,
      "length": 38,
      "shell_base_price": 70276,
      "roof": {"obj": "18x38-STV", "x": 0, "y": -9, "z": 0},
      "floor": {"width": 456, "height": 12, "depth": 216, "x": 228, "y": -9, "z": 108},
      "front": {"obj": "FL38-72L-W2CL-D72C-W2CR", "width": 456, "x": -222, "y": -9, "z": 108},
      "back": {"obj": "BT18x38-36CLL", "width": 456, "x": 222, "y": -9, "z": -108},
      "left": {"obj": "LT18-18C-18R", "width": 216, "x": -227, "y": -9, "z": -107.5},
      "right": {"obj": "RT18-W2L-36C", "width": 216, "x": 227, "y": -9, "z": 107.5}
    }*/

   window.recipe = {
    "model": "summit",
    "size": "18x38",
    "depth": 18,
    "length": 38,
    "interior": "KIT-MED-L",
     "front": {"obj": "FL38-72L-W2CL-D72C-W2CR", "width": 456, "x": -222, "y": -9, "z": 108},
     "back": {"obj": "BT18x38-36CLL", "width": 456, "x": 222, "y": -9, "z": -108},
     "left": {"obj": "LT18-18C-18R", "width": 216, "x": -227, "y": -9, "z": -107.5},
     "right": {"obj": "RT18-W2L-36C", "width": 216, "x": 227, "y": -9, "z": 107.5}
  };



    Harp.useRecipe()
  },
  hideRoof: function () {
      if (Harp.roofContainer) {
          Harp.roofContainer.meshes.forEach(function (mesh) {
              mesh.visibility = 0; // Make mesh invisible
          });
          Harp.roofVisible = false;
      }
  },
  showRoof: function () {
      if (Harp.roofContainer) {
          Harp.roofContainer.meshes.forEach(function (mesh) {
              mesh.visibility = 1; // Make mesh visible
          });
          Harp.roofVisible = true;
      }
  },
  setCameraSide: function (side, camera) {
    if (side === 'exterior') {
      if (camera.beta < BABYLON.Tools.ToRadians(60)) {
        camera.spinTo('beta', BABYLON.Tools.ToRadians(80), 50)
      }
    }
    if (side === 'interior') {
      camera.spinTo('alpha', BABYLON.Tools.ToRadians(45), 50)
      camera.spinTo('beta', BABYLON.Tools.ToRadians(30), 50)
    }
    if (side === 'front') {
      camera.spinTo('alpha', Math.PI / 2, 50)
      camera.spinTo('beta', Math.PI / 2, 50)
    }
    if (side === 'back') {
      camera.spinTo('alpha', -Math.PI / 2, 50)
      camera.spinTo('beta', Math.PI / 2, 50)
    }
    if (side === 'left') {
      camera.spinTo('alpha', Math.PI, 50)
      camera.spinTo('beta', Math.PI / 2, 50)
    }
    if (side === 'right') {
      camera.spinTo('alpha', 0, 50)
      camera.spinTo('beta', Math.PI / 2, 50)
    }
    if (side === 'top') {
      camera.spinTo('alpha', Math.PI / 2, 150)
      camera.spinTo('beta', 0, 150)
    }
    if (side === 'frontCorner') {
      camera.spinTo('alpha', BABYLON.Tools.ToRadians(120), 50)
      camera.spinTo('beta', BABYLON.Tools.ToRadians(90), 50)
    }
    if (side === 'backCorner') {
      camera.spinTo('alpha', BABYLON.Tools.ToRadians(300), 50)
      camera.spinTo('beta', BABYLON.Tools.ToRadians(90), 50)
    }
    if (side === 'leftCorner') {
      camera.spinTo('alpha', BABYLON.Tools.ToRadians(210), 50)
      camera.spinTo('beta', BABYLON.Tools.ToRadians(90), 50)
    }
    if (side === 'rightCorner') {
      camera.spinTo('alpha', BABYLON.Tools.ToRadians(30), 50)
      camera.spinTo('beta', BABYLON.Tools.ToRadians(90), 50)
    }
  },
  init: function () {
    Harp.materialGroups.forEach(function (group) {
      Harp[group].setEnabled(false)
    })
    Harp.furnitureGroups.forEach(function (group) {
      Harp[group].setEnabled(false)
    })
    Harp.optionableGroups.forEach(function (group) {
      Harp[group].setEnabled(false)
    })
    Harp['appliance'].setEnabled(true);

    Harp['counter'].setEnabled(true);
    Harp['cabinet'].setEnabled(true);
    Harp['white'].setEnabled(true);
    Harp['black'].setEnabled(true);
    Harp['fixture'].setEnabled(true);
    Harp['bathroom_floor'].setEnabled(true);
    Harp['glass'].setEnabled(true)
    Harp['trim_color'].setEnabled(true)
    Harp['accent_color'].setEnabled(true)
    Harp['window_exterior'].setEnabled(true)
    Harp['lumber'].setEnabled(true)
    Harp['door_color'].setEnabled(true)
    Harp['roof_eave'].setEnabled(true)
    Harp['roof_fascia'].setEnabled(true)
    Harp['roof_metal'].setEnabled(true)
    Harp['framing'].setEnabled(true)
    Harp['Interior'].setEnabled(true)
    Harp['sheathing'].setEnabled(true)
    Harp['eave_rafter'].setEnabled(true)
    Harp['eave_plywood'].setEnabled(true)

    Harp.setGroupColor('glass', Harp.colors['glass'])
    Harp.glass_material.alpha = 0.25




    let woodTexture = new BABYLON.Texture(Harp.textures['wood'])
    woodTexture.uScale = woodTexture.vScale = 0.015
    woodTexture.specular = 5
    Harp.setGroupColor('lumber', Harp.colors['white'])
    Harp.lumber_material.diffuseTexture = woodTexture

    Harp.setGroupColor('eave_rafter', Harp.colors['natural-stain'])
    Harp.eave_rafter_material.diffuseTexture = woodTexture

    Harp.setGroupColor('eave_plywood', Harp.colors['natural-stain'])
    Harp.eave_plywood_material.diffuseTexture = woodTexture


    Harp.setGroupColor('appliance', Harp.colors['appliance'])

    Harp.setGroupColor('sheathing', Harp.colors['arctic-white'])
    Harp.sheathing_material.diffuseTexture = new BABYLON.Texture(Harp.textures['wood'])
    Harp.sheathing_material.diffuseTexture.uScale = 0.01
    Harp.sheathing_material.diffuseTexture.vScale = 0.01
    Harp.sheathing_material.specularPower = 50
    Harp.setGroupColor('framing', Harp.colors['white'])
    Harp.framing_material.diffuseTexture = new BABYLON.Texture(Harp.textures['wood'])
    Harp.framing_material.diffuseTexture.uScale = 0.01
    Harp.framing_material.diffuseTexture.vScale = 0.01
    Harp.framing_material.specularColor = new BABYLON.Color3(0, 0, 0)
    Harp.framing_material.specularPower = 0


    Harp.setGroupColor('Interior', Harp.colors['black'])
    Harp.Interior_material.diffuseTexture = new BABYLON.Texture(Harp.textures['wood'])
    Harp.Interior_material.diffuseTexture.uScale = 0.01
    Harp.Interior_material.diffuseTexture.vScale = 0.01
    Harp.Interior_material.specularColor = new BABYLON.Color3(0, 0, 0)
    Harp.Interior_material.specularPower = 0

    Harp.metal_wainscot_material.specularPower = 4
    Harp.metal_wainscot1_material.specularPower = 4

    Harp.lifestyle_material.diffuseColor = new BABYLON.Color3(0.9, 0.9, 0.9); // Light gray
    Harp.lifestyle_material.specularPower = 10

    Harp.trim_color_material.specularPower = 10
    Harp.accent_color_material.specularPower = 20
    Harp.window_exterior_material.specularPower = 30
    Harp.plank_trim_material.specularPower = 5
    Harp.plank_siding_trims_material.specularPower = 5
    Harp.plank_siding_metal_trims_material.specularPower = 5
    Harp.plank_trims_material.specularPower = 5
    Harp.block_siding_trims_material.specularPower = 5
    Harp.block_siding_metal_trims_material.specularPower = 5
    Harp.roof_metal_material.specularPower = 20
    Harp.roof_metal_material.specularColor = new BABYLON.Color3(0.33, 0.33, 0.33)

    Harp.appliance_material.specularColor = new BABYLON.Color3(0, 0, 0)

    Harp.black_material.specularColor = new BABYLON.Color3(0, 0, 0)
    Harp.white_material.specularColor = new BABYLON.Color3(0, 0, 0)
    Harp.fixture_material.specularColor = new BABYLON.Color3(0, 0, 0)

  }
}

Harp.resetScene = function(scene) {
    console.log('🔄 Resetting the scene... Hold on to your hats! 🎩✨')
    
    if (!scene) {
        console.warn('⚠️ No scene provided to resetScene');
        return;
    }

    // Dispose of all asset containers and small home containers
    if (Harp.roofContainer) Harp.roofContainer.dispose();
    if (Harp.foundationContainer) Harp.foundationContainer.dispose();
    if (Harp.flooringContainer) Harp.flooringContainer.dispose();
    if (Harp.smallHomeContainer) Harp.smallHomeContainer.dispose();

    if (Harp.summitNxContainer_Common) Harp.summitNxContainer_Common.dispose();
    if (Harp.summitNxContainer_Base) Harp.summitNxContainer_Base.dispose();
    if (Harp.summitNxContainer_Option) Harp.summitNxContainer_Option.dispose(); 
    
    while (Harp.scene.meshes.length) {
      const mesh = Harp.scene.meshes[0]
      mesh.dispose()
    }

    // Reset containers
    Harp.roofContainer = new BABYLON.AssetContainer(scene);
    Harp.foundationContainer = new BABYLON.AssetContainer(scene);
    Harp.flooringContainer = new BABYLON.AssetContainer(scene);

    Harp.smallHomeContainer = new BABYLON.AssetContainer(scene);
    Harp.summitNxContainer_Common = new BABYLON.AssetContainer(scene);
    Harp.summitNxContainer_Base = new BABYLON.AssetContainer(scene);
    Harp.summitNxContainer_Option = new BABYLON.AssetContainer(scene);
};

window.addEventListener('DOMContentLoaded', () => {
    // Create scene and store it on Harp object
    Harp.scene = createScene();
    
    Harp.scene.executeWhenReady(function () {
        Harp.init()
        window.dispatchEvent(new CustomEvent('harpReady'))
        engine.resize()

        if(document.getElementById('canvas-render')) {
            engine.registerView(document.getElementById('canvas-render'), Harp.renderCamera)
        }

        if(document.getElementById('canvas-size')) {
            engine.inputElement = document.getElementById("canvas-size");
            engine.registerView(document.getElementById('canvas-size'), Harp.defaultCamera)
        }

        if(document.getElementById('canvas-interior-kit')) {
            engine.registerView(document.getElementById('canvas-interior-kit'), Harp.topCamera)
        }

        if(document.getElementById('canvas-exterior-finishes')) {
            engine.registerView(document.getElementById('canvas-exterior-finishes'), Harp.exteriorCamera)
        }

        if(document.getElementById('canvas-elevations')) {
            engine.registerView(document.getElementById('canvas-elevations'), Harp.elevationCamera)
        }

        if(document.getElementById('canvas-summary')) {
            engine.registerView(document.getElementById('canvas-summary'), Harp.summaryCamera)
        }
    })

    Harp.scene.registerBeforeRender(() => {
        Harp.summaryCamera.alpha += 0.001;
    })

    engine.runRenderLoop(function () {
        if (Harp.scene.activeCamera) {
            Harp.scene.render();
        }
    })

    window.addEventListener('resize', function () {
        engine.resize()
    })

    window.addEventListener('resetScene', function () {
        Harp.scene.meshes.forEach(function(mesh) {
            mesh.dispose()
        })
    })

    Harp.scene.clearColor = Harp.skyColor
    Harp.scene.fogEnabled = true;
    Harp.scene.fogMode = BABYLON.Scene.FOGMODE_EXP2;
    Harp.scene.fogDensity = 0.0005;
    Harp.scene.fogColor = Harp.scene.clearColor.clone();
})
