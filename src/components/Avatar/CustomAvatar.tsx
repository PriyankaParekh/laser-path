import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import {
  createAlienAvatar,
  createHumanAvatar,
  createJokerAvatar,
  createRobotAvatar,
} from "./custom-avatars-use-case";

const AvatarExamples = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  const avatarStyles = [
    {
      bodyColor: "#4A90E2",
      accessoryColor: "#50E3C2",
      type: "robot",
      scale: 1,
    },
    {
      bodyColor: "#F5A623",
      accessoryColor: "#4A4A4A",
      type: "human",
      scale: 1,
    },
    {
      bodyColor: "#7ED321",
      accessoryColor: "#9013FE",
      type: "alien",
      scale: 1,
    },
    {
      bodyColor: "#9b59b6",
      accessoryColor: "#2ecc71",
      type: "joker",
      scale: 1,
    },
  ];

  useEffect(() => {
    if (!mountRef.current) return;

    // Initialize scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#f0f0f0");
    sceneRef.current = scene;

    // Initialize camera
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.set(0, 2, 10);
    cameraRef.current = camera;

    // Initialize renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Add orbit controls for better interaction
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;

    // Add lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 5, 5);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 1024;
    directionalLight.shadow.mapSize.height = 1024;
    scene.add(directionalLight);

    // Add a ground plane for better perspective
    const groundGeometry = new THREE.PlaneGeometry(20, 20);
    const groundMaterial = new THREE.MeshStandardMaterial({
      color: 0xcccccc,
      side: THREE.DoubleSide,
      roughness: 0.8,
    });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = Math.PI / 2;
    ground.position.y = -0.5;
    ground.receiveShadow = true;
    scene.add(ground);

    // Create and add avatars to the scene
    avatarStyles.forEach((style, index) => {
      let avatar;
      switch (style.type) {
        case "robot":
          avatar = createRobotAvatar(style.bodyColor, style.accessoryColor);
          break;
        case "human":
          avatar = createHumanAvatar(style.bodyColor, style.accessoryColor);
          break;
        case "alien":
          avatar = createAlienAvatar(style.bodyColor, style.accessoryColor);
          break;
        case "joker":
          avatar = createJokerAvatar();
          break;
        default:
          avatar = createHumanAvatar(style.bodyColor, style.accessoryColor);
      }

      if (avatar) {
        // Apply scale if provided
        if (style.scale) {
          avatar.scale.set(style.scale, style.scale, style.scale);
        }

        // Position the avatar
        avatar.position.set(index * 3 - 3, 0, 0); // Center the avatars

        // Enable shadows
        avatar.traverse((object) => {
          if (object instanceof THREE.Mesh) {
            object.castShadow = true;
            object.receiveShadow = true;
          }
        });

        scene.add(avatar);
      }
    });

    // Animation loop
    const animate = () => {
      if (!sceneRef.current || !cameraRef.current || !rendererRef.current)
        return;

      animationFrameRef.current = requestAnimationFrame(animate);

      // Update controls
      controls.update();

      rendererRef.current.render(sceneRef.current, cameraRef.current);
    };

    animate();

    // Handle window resize
    const handleResize = () => {
      if (!cameraRef.current || !rendererRef.current) return;

      cameraRef.current.aspect = window.innerWidth / window.innerHeight;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener("resize", handleResize);

    // Cleanup
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }

      if (rendererRef.current && mountRef.current) {
        mountRef.current.removeChild(rendererRef.current.domElement);
      }

      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <div ref={mountRef} style={{ width: "100%", height: "100vh" }}>
      {/* Three.js will render here */}
    </div>
  );
};

export default AvatarExamples;
