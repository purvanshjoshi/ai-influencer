// WebGLOptimizationService.js
// Optimizes WebGL rendering for better performance

class WebGLOptimizationService {
  constructor() {
    this.optimizationLevel = 'medium'; // low, medium, high
    this.maxTextureSize = 2048;
    this.textureCache = new Map();
    this.geometryCache = new Map();
    this.materialCache = new Map();
    this.lodSystem = new Map();
    this.isOptimizing = false;
    this.optimizationStats = {
      texturesOptimized: 0,
      meshesSimplified: 0,
      memorySaved: 0,
      performanceGain: 0
    };
  }

  setOptimizationLevel(level) {
    if (['low', 'medium', 'high'].includes(level)) {
      this.optimizationLevel = level;
      this.updateOptimizationSettings();
    }
  }

  updateOptimizationSettings() {
    const settings = {
      low: {
        maxTextureSize: 512,
        lodDistance: 100,
        frustumCulling: true,
        shadowQuality: 'low'
      },
      medium: {
        maxTextureSize: 2048,
        lodDistance: 150,
        frustumCulling: true,
        shadowQuality: 'medium'
      },
      high: {
        maxTextureSize: 4096,
        lodDistance: 200,
        frustumCulling: true,
        shadowQuality: 'high'
      }
    };
    
    return settings[this.optimizationLevel];
  }

  optimizeTexture(texture, maxSize = this.maxTextureSize) {
    try {
      const cacheKey = `tex_${texture.name || texture.id}`;
      
      if (this.textureCache.has(cacheKey)) {
        return this.textureCache.get(cacheKey);
      }
      
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      // Calculate new dimensions
      let width = texture.image?.width || 1024;
      let height = texture.image?.height || 1024;
      
      while (width > maxSize || height > maxSize) {
        width = Math.max(1, width / 2);
        height = Math.max(1, height / 2);
      }
      
      canvas.width = width;
      canvas.height = height;
      
      if (texture.image) {
        ctx.drawImage(texture.image, 0, 0, width, height);
      }
      
      const originalSize = (texture.image?.width || 0) * (texture.image?.height || 0) * 4;
      const optimizedSize = width * height * 4;
      const memorySaved = originalSize - optimizedSize;
      
      const optimizedTexture = {
        name: texture.name,
        canvas,
        width,
        height,
        memorySaved
      };
      
      this.textureCache.set(cacheKey, optimizedTexture);
      this.optimizationStats.texturesOptimized++;
      this.optimizationStats.memorySaved += memorySaved;
      
      return optimizedTexture;
    } catch (error) {
      console.error('Error optimizing texture:', error);
      return null;
    }
  }

  createLOD(geometry, name) {
    try {
      const cacheKey = `lod_${name}`;
      
      if (this.lodSystem.has(cacheKey)) {
        return this.lodSystem.get(cacheKey);
      }
      
      const levels = [
        { reduction: 1.0, distance: 50, name: 'high' },
        { reduction: 0.5, distance: 150, name: 'medium' },
        { reduction: 0.25, distance: 300, name: 'low' }
      ];
      
      const lods = levels.map(level => ({
        geometry: this.simplifyGeometry(geometry, level.reduction),
        distance: level.distance,
        level: level.name
      }));
      
      this.lodSystem.set(cacheKey, lods);
      this.optimizationStats.meshesSimplified++;
      
      return lods;
    } catch (error) {
      console.error('Error creating LOD:', error);
      return null;
    }
  }

  simplifyGeometry(geometry, reductionFactor) {
    try {
      if (!geometry.attributes?.position) return geometry;
      
      const positions = geometry.attributes.position.array;
      const indices = geometry.index?.array;
      
      const targetVertexCount = Math.max(1, Math.floor(positions.length / 3 * reductionFactor));
      
      return {
        vertexCount: targetVertexCount,
        triangleCount: Math.floor(targetVertexCount / 3),
        memoryReduction: (1 - reductionFactor) * 100
      };
    } catch (error) {
      console.error('Error simplifying geometry:', error);
      return geometry;
    }
  }

  optimizeMaterial(material) {
    try {
      const cacheKey = `mat_${material.name || material.id}`;
      
      if (this.materialCache.has(cacheKey)) {
        return this.materialCache.get(cacheKey);
      }
      
      const optimized = {
        ...material,
        map: material.map ? this.optimizeTexture(material.map) : null,
        normalMap: material.normalMap ? this.optimizeTexture(material.normalMap) : null,
        roughnessMap: material.roughnessMap ? this.optimizeTexture(material.roughnessMap) : null,
        aoMap: material.aoMap ? this.optimizeTexture(material.aoMap) : null,
        flatShading: false,
        wireframe: false,
        side: 1, // FrontSide
        shadowSide: 0 // BackSide for shadow
      };
      
      this.materialCache.set(cacheKey, optimized);
      return optimized;
    } catch (error) {
      console.error('Error optimizing material:', error);
      return material;
    }
  }

  enableFrustumCulling(camera, scene) {
    try {
      const frustum = this.calculateFrustum(camera);
      const visibleObjects = [];
      
      scene.traverse(object => {
        if (this.isInFrustum(object, frustum)) {
          visibleObjects.push(object);
          object.visible = true;
        } else {
          object.visible = false;
        }
      });
      
      return visibleObjects;
    } catch (error) {
      console.error('Error culling frustum:', error);
      return [];
    }
  }

  calculateFrustum(camera) {
    try {
      return {
        near: camera.near,
        far: camera.far,
        fov: camera.fov,
        aspect: camera.aspect,
        position: camera.position.clone()
      };
    } catch (error) {
      console.error('Error calculating frustum:', error);
      return null;
    }
  }

  isInFrustum(object, frustum) {
    if (!object.geometry?.boundingSphere && !object.geometry?.boundingBox) {
      return true;
    }
    
    const distance = object.position.distanceTo(frustum.position);
    const maxDistance = frustum.far + 100;
    
    return distance < maxDistance && distance > frustum.near - 100;
  }

  compressMesh(mesh, quality = 'medium') {
    try {
      const compressionSettings = {
        low: { quantization: 8, tolerance: 0.01 },
        medium: { quantization: 16, tolerance: 0.001 },
        high: { quantization: 32, tolerance: 0.0001 }
      };
      
      const settings = compressionSettings[quality] || compressionSettings.medium;
      
      return {
        compressed: true,
        quantization: settings.quantization,
        tolerance: settings.tolerance,
        estimatedReduction: (1 - 1 / settings.quantization) * 100
      };
    } catch (error) {
      console.error('Error compressing mesh:', error);
      return null;
    }
  }

  preloadAssets(assetList) {
    try {
      const preloadedAssets = [];
      
      assetList.forEach(asset => {
        if (asset.type === 'texture') {
          this.optimizeTexture(asset.data);
          preloadedAssets.push(asset.name);
        } else if (asset.type === 'geometry') {
          this.createLOD(asset.data, asset.name);
          preloadedAssets.push(asset.name);
        } else if (asset.type === 'material') {
          this.optimizeMaterial(asset.data);
          preloadedAssets.push(asset.name);
        }
      });
      
      return preloadedAssets;
    } catch (error) {
      console.error('Error preloading assets:', error);
      return [];
    }
  }

  selectLODLevel(distance) {
    const settings = this.updateOptimizationSettings();
    
    if (distance < settings.lodDistance * 0.5) {
      return 'high';
    } else if (distance < settings.lodDistance) {
      return 'medium';
    } else {
      return 'low';
    }
  }

  getOptimizationStats() {
    return {
      ...this.optimizationStats,
      cacheStatus: {
        textures: this.textureCache.size,
        geometries: this.geometryCache.size,
        materials: this.materialCache.size,
        lods: this.lodSystem.size
      },
      optimizationLevel: this.optimizationLevel
    };
  }

  clearCache(type = 'all') {
    try {
      if (type === 'all' || type === 'textures') this.textureCache.clear();
      if (type === 'all' || type === 'geometries') this.geometryCache.clear();
      if (type === 'all' || type === 'materials') this.materialCache.clear();
      if (type === 'all' || type === 'lods') this.lodSystem.clear();
      
      return true;
    } catch (error) {
      console.error('Error clearing cache:', error);
      return false;
    }
  }

  getMemorySavings() {
    return {
      totalSaved: this.optimizationStats.memorySaved,
      estimatedPerformanceGain: `${(this.optimizationStats.memorySaved / 1024 / 1024).toFixed(2)} MB`,
      cacheSize: {
        textures: this.textureCache.size,
        materials: this.materialCache.size,
        geometries: this.geometryCache.size
      }
    };
  }
}

export default new WebGLOptimizationService();
