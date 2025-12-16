/**
 * Avatar3DComponent.jsx
 * 3D Avatar component for advanced visual representation (Phase 7)
 */

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

const Avatar3DComponent = ({ emotion = 'neutral', isAnimating = false }) => {
  const containerRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const meshRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!containerRef.current) return;

    // Initialize Three.js scene
    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xeeeeee);
    sceneRef.current = scene;

    // Camera setup
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.z = 5;
    cameraRef.current = camera;

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6);
    directionalLight.position.set(5, 10, 5);
    scene.add(directionalLight);

    // Create avatar geometry
    const geometry = new THREE.IcosahedronGeometry(2, 4);
    const material = new THREE.MeshPhongMaterial({
      color: 0x3498db,
      emissive: 0x111111,
      shininess: 100
    });
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);
    meshRef.current = mesh;

    // Add face features
    const eyeGeometry = new THREE.SphereGeometry(0.3, 16, 16);
    const eyeMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
    
    const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    leftEye.position.set(-1, 1, 1.8);
    scene.add(leftEye);

    const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    rightEye.position.set(1, 1, 1.8);
    scene.add(rightEye);

    // Iris
    const irisGeometry = new THREE.SphereGeometry(0.15, 8, 8);
    const irisMaterial = new THREE.MeshBasicMaterial({ color: 0x8b4513 });
    
    const leftIris = new THREE.Mesh(irisGeometry, irisMaterial);
    leftIris.position.set(-1, 1, 2.1);
    scene.add(leftIris);

    const rightIris = new THREE.Mesh(irisGeometry, irisMaterial);
    rightIris.position.set(1, 1, 2.1);
    scene.add(rightIris);

    setIsLoading(false);

    // Animation loop
    let animationId;
    const animate = () => {
      animationId = requestAnimationFrame(animate);

      if (meshRef.current) {
        // Slow rotation
        meshRef.current.rotation.x += 0.001;
        meshRef.current.rotation.y += 0.002;

        // Emotion-based scaling
        if (isAnimating) {
          const scale = 1 + Math.sin(Date.now() / 500) * 0.05;
          meshRef.current.scale.set(scale, scale, scale);
        } else {
          meshRef.current.scale.set(1, 1, 1);
        }
      }

      renderer.render(scene, camera);
    };
    animate();

    // Handle window resize
    const handleResize = () => {
      const newWidth = containerRef.current?.clientWidth || width;
      const newHeight = containerRef.current?.clientHeight || height;
      
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationId);
      renderer.dispose();
      if (containerRef.current?.contains(renderer.domElement)) {
        containerRef.current.removeChild(renderer.domElement);
      }
    };
  }, [isAnimating]);

  return (
    <div
      ref={containerRef}
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#f5f5f5',
        borderRadius: '12px',
        overflow: 'hidden'
      }}
    >
      {isLoading && <div>Loading 3D Avatar...</div>}
    </div>
  );
};

export default Avatar3DComponent;
