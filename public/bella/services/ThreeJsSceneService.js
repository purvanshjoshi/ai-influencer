// Three.js Scene Service for Bella 3D Avatar
// Handles scene initialization, glTF model loading, lighting, camera setup

class ThreeJsSceneService {
  constructor(canvas) {
    this.canvas = canvas;
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.avatarModel = null;
    this.mixer = null;
    this.clock = null;
    this.controls = null;
  }

  async initialize() {
    try {
      this.setupScene();
      this.setupCamera();
      this.setupRenderer();
      this.setupLighting();
      this.setupControls();
      this.clock = new THREE.Clock();
      console.log('Three.js scene initialized successfully');
      return true;
    } catch (error) {
      console.error('Failed to initialize Three.js scene:', error);
      return false;
    }
  }

  setupScene() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x667eea);
    this.scene.fog = new THREE.Fog(0x667eea, 100, 1000);
  }

  setupCamera() {
    const width = this.canvas.clientWidth;
    const height = this.canvas.clientHeight;
    this.camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    this.camera.position.set(0, 1.6, 1.5);
    this.camera.lookAt(0, 1, 0);
  }

  setupRenderer() {
    this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas, antialias: true });
    this.renderer.setSize(this.canvas.clientWidth, this.canvas.clientHeight);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.shadowMap.enabled = true;
  }

  setupLighting() {
    // Ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    this.scene.add(ambientLight);

    // Directional light
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(5, 10, 7);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;
    this.scene.add(dirLight);
  }

  setupControls() {
    if (typeof OrbitControls !== 'undefined') {
      this.controls = new OrbitControls(this.camera, this.renderer.domElement);
      this.controls.enableDamping = true;
      this.controls.dampingFactor = 0.05;
      this.controls.target.set(0, 1, 0);
    }
  }

  async loadGLTFModel(modelPath) {
    try {
      // Loader would be instantiated
      console.log('Loading glTF model from:', modelPath);
      // this.avatarModel = await loader.load(modelPath);
      // this.scene.add(this.avatarModel);
      return this.avatarModel;
    } catch (error) {
      console.error('Failed to load glTF model:', error);
      throw error;
    }
  }

  animate() {
    requestAnimationFrame(() => this.animate());
    const delta = this.clock.getDelta();
    if (this.mixer) this.mixer.update(delta);
    if (this.controls) this.controls.update();
    this.renderer.render(this.scene, this.camera);
  }

  getScene() { return this.scene; }
  getCamera() { return this.camera; }
  getRenderer() { return this.renderer; }
  getAvatarModel() { return this.avatarModel; }

  dispose() {
    if (this.renderer) this.renderer.dispose();
    if (this.controls) this.controls.dispose();
  }
}

export default ThreeJsSceneService;
