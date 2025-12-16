// Avatar3DIntegrationService.js
// Handles integration of Three.js 3D avatar with Bella video avatar system

import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

class Avatar3DIntegrationService {
  constructor() {
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.controls = null;
    this.avatarModel = null;
    this.mixer = null;
    this.actions = {};
    this.clock = new THREE.Clock();
    this.container = null;
    this.isInitialized = false;
    
    // 3D avatar configuration
    this.config = {
      modelPath: '/models/bella-avatar-3d.gltf',
      scale: 1.5,
      position: { x: 0, y: 0, z: 0 },
      lighting: {
        ambientIntensity: 0.6,
        directionalIntensity: 0.8,
        directionalPosition: [5, 10, 5]
      }
    };
  }

  async initialize(containerElement, options = {}) {
    try {
      this.container = containerElement;
      Object.assign(this.config, options);
      
      // Setup scene, camera, renderer
      this.setupScene();
      this.setupLighting();
      this.setupCamera();
      this.setupRenderer();
      this.setupControls();
      
      // Load 3D model
      await this.loadAvatarModel();
      
      // Setup animations
      this.setupAnimations();
      
      // Start animation loop
      this.animate();
      
      this.isInitialized = true;
      return true;
    } catch (error) {
      console.error('Error initializing Avatar3DIntegrationService:', error);
      return false;
    }
  }

  setupScene() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x222222);
    this.scene.fog = new THREE.Fog(0x222222, 100, 1000);
  }

  setupLighting() {
    // Ambient light
    const ambientLight = new THREE.AmbientLight(
      0xffffff,
      this.config.lighting.ambientIntensity
    );
    this.scene.add(ambientLight);
    
    // Directional light (sun-like)
    const directionalLight = new THREE.DirectionalLight(
      0xffffff,
      this.config.lighting.directionalIntensity
    );
    const [x, y, z] = this.config.lighting.directionalPosition;
    directionalLight.position.set(x, y, z);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    this.scene.add(directionalLight);
    
    // Point light for accent
    const pointLight = new THREE.PointLight(0x87ceeb, 0.5);
    pointLight.position.set(-5, 5, 5);
    this.scene.add(pointLight);
  }

  setupCamera() {
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;
    
    this.camera = new THREE.PerspectiveCamera(
      75,
      width / height,
      0.1,
      1000
    );
    this.camera.position.z = 2.5;
  }

  setupRenderer() {
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      preserveDrawingBuffer: true
    });
    
    this.renderer.setSize(
      this.container.clientWidth,
      this.container.clientHeight
    );
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFShadowShadowMap;
    
    this.container.appendChild(this.renderer.domElement);
    
    // Handle window resize
    window.addEventListener('resize', () => this.onWindowResize());
  }

  setupControls() {
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.enableZoom = true;
    this.controls.enablePan = false;
    this.controls.autoRotate = false;
    this.controls.minDistance = 1;
    this.controls.maxDistance = 5;
  }

  async loadAvatarModel() {
    return new Promise((resolve, reject) => {
      const loader = new GLTFLoader();
      
      loader.load(
        this.config.modelPath,
        (gltf) => {
          this.avatarModel = gltf.scene;
          this.avatarModel.scale.set(
            this.config.scale,
            this.config.scale,
            this.config.scale
          );
          this.avatarModel.position.set(
            this.config.position.x,
            this.config.position.y,
            this.config.position.z
          );
          
          // Setup animations
          if (gltf.animations.length > 0) {
            this.mixer = new THREE.AnimationMixer(this.avatarModel);
            
            gltf.animations.forEach((clip) => {
              this.actions[clip.name] = this.mixer.clipAction(clip);
            });
          }
          
          this.scene.add(this.avatarModel);
          resolve();
        },
        (progress) => {
          const percentComplete = (progress.loaded / progress.total) * 100;
          this.onModelLoadProgress(percentComplete);
        },
        (error) => {
          console.error('Error loading avatar model:', error);
          reject(error);
        }
      );
    });
  }

  setupAnimations() {
    // Initialize animation states
    Object.keys(this.actions).forEach((actionName) => {
      this.actions[actionName].stop();
    });
  }

  playAnimation(animationName, options = {}) {
    try {
      const action = this.actions[animationName];
      if (!action) {
        console.warn(`Animation '${animationName}' not found`);
        return false;
      }
      
      const {
        loop = THREE.LoopRepeat,
        clampWhenFinished = false,
        timeScale = 1,
        duration = action.getClip().duration
      } = options;
      
      // Stop all other animations
      Object.keys(this.actions).forEach((key) => {
        if (key !== animationName) {
          this.actions[key].stop();
        }
      });
      
      action.loop = loop;
      action.clampWhenFinished = clampWhenFinished;
      action.timeScale = timeScale;
      action.reset();
      action.play();
      
      return true;
    } catch (error) {
      console.error('Error playing animation:', error);
      return false;
    }
  }

  stopAnimation(animationName) {
    const action = this.actions[animationName];
    if (action) {
      action.stop();
      return true;
    }
    return false;
  }

  updateAvatarExpression(emotion, intensity = 1) {
    try {
      // Map emotion to morph target or animation
      const expressionMap = {
        joy: { animation: 'smile', blend: 0.5 },
        sadness: { animation: 'sadFace', blend: 0.4 },
        anger: { animation: 'angryFace', blend: 0.6 },
        surprise: { animation: 'surpriseFace', blend: 0.7 },
        fear: { animation: 'fearFace', blend: 0.6 },
        disgust: { animation: 'disgustFace', blend: 0.5 },
        neutral: { animation: 'idle', blend: 0.0 }
      };
      
      const expression = expressionMap[emotion] || expressionMap.neutral;
      
      if (expression.animation && this.actions[expression.animation]) {
        this.playAnimation(expression.animation, {
          timeScale: intensity,
          loop: THREE.LoopOnce,
          clampWhenFinished: true
        });
      }
      
      return true;
    } catch (error) {
      console.error('Error updating avatar expression:', error);
      return false;
    }
  }

  updateAvatarGesture(gesture, duration = 2) {
    try {
      const gestureMap = {
        wave: 'waveGesture',
        nod: 'nodGesture',
        headShake: 'headShakeGesture',
        point: 'pointGesture',
        thumbsUp: 'thumbsUpGesture',
        thinking: 'thinkingGesture'
      };
      
      const animationName = gestureMap[gesture];
      if (animationName && this.actions[animationName]) {
        this.playAnimation(animationName, {
          loop: THREE.LoopOnce,
          clampWhenFinished: true,
          duration
        });
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error updating avatar gesture:', error);
      return false;
    }
  }

  rotateAvatarToFace(targetX, targetY) {
    try {
      if (this.avatarModel) {
        // Calculate rotation to face target
        const vector = new THREE.Vector3(targetX, targetY, 0);
        this.avatarModel.lookAt(vector);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error rotating avatar:', error);
      return false;
    }
  }

  setAvatarVisibility(visible) {
    if (this.avatarModel) {
      this.avatarModel.visible = visible;
      return true;
    }
    return false;
  }

  updateCameraPosition(x, y, z) {
    this.camera.position.set(x, y, z);
    this.camera.lookAt(0, 0, 0);
  }

  animate() {
    requestAnimationFrame(() => this.animate());
    
    const delta = this.clock.getDelta();
    
    // Update mixer
    if (this.mixer) {
      this.mixer.update(delta);
    }
    
    // Update controls
    if (this.controls) {
      this.controls.update();
    }
    
    // Render scene
    this.renderer.render(this.scene, this.camera);
  }

  onWindowResize() {
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;
    
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  onModelLoadProgress(progress) {
    // Emit progress event
    if (this.container) {
      this.container.dispatchEvent(
        new CustomEvent('modelLoadProgress', { detail: { progress } })
      );
    }
  }

  dispose() {
    try {
      if (this.renderer) {
        this.renderer.dispose();
      }
      if (this.controls) {
        this.controls.dispose();
      }
      if (this.container && this.renderer) {
        this.container.removeChild(this.renderer.domElement);
      }
      window.removeEventListener('resize', () => this.onWindowResize());
      this.isInitialized = false;
    } catch (error) {
      console.error('Error disposing Avatar3DIntegrationService:', error);
    }
  }
}

export default new Avatar3DIntegrationService();
