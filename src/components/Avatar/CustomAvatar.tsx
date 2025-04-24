import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

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
  ];

  // Create robot avatar
  const createRobotAvatar = (bodyColor: string, accessoryColor: string) => {
    const group = new THREE.Group();

    // Robot Head
    const headGeometry = new THREE.BoxGeometry(0.8, 0.8, 0.8);
    const headMaterial = new THREE.MeshStandardMaterial({
      color: bodyColor,
      metalness: 0.8,
      roughness: 0.2,
    });
    const head = new THREE.Mesh(headGeometry, headMaterial);
    head.position.y = 2;

    // Robot Eyes
    const eyeGeometry = new THREE.SphereGeometry(0.1, 16, 16);
    const eyeMaterial = new THREE.MeshPhongMaterial({
      color: accessoryColor,
      emissive: accessoryColor,
      emissiveIntensity: 0.5,
    });

    const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    leftEye.position.set(-0.2, 2, 0.4);

    const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    rightEye.position.set(0.2, 2, 0.4);

    // Robot Body
    const bodyGeometry = new THREE.CylinderGeometry(0.4, 0.5, 1.5, 8);
    const body = new THREE.Mesh(bodyGeometry, headMaterial);
    body.position.y = 1;

    // Robot Arms
    const armGeometry = new THREE.BoxGeometry(0.25, 0.8, 0.25);
    const leftArm = new THREE.Mesh(armGeometry, headMaterial);
    leftArm.position.set(-0.65, 1.2, 0);

    const rightArm = new THREE.Mesh(armGeometry, headMaterial);
    rightArm.position.set(0.65, 1.2, 0);

    // Robot Legs
    const legGeometry = new THREE.BoxGeometry(0.25, 0.8, 0.25);
    const leftLeg = new THREE.Mesh(legGeometry, headMaterial);
    leftLeg.position.set(-0.3, 0.4, 0);

    const rightLeg = new THREE.Mesh(legGeometry, headMaterial);
    rightLeg.position.set(0.3, 0.4, 0);

    group.add(
      head,
      leftEye,
      rightEye,
      body,
      leftArm,
      rightArm,
      leftLeg,
      rightLeg
    );
    return group;
  };

  // Create human avatar
  const createHumanAvatar = (bodyColor: string, accessoryColor: string) => {
    const group = new THREE.Group();

    // Human Head
    const headGeometry = new THREE.SphereGeometry(0.5, 32, 32);
    const headMaterial = new THREE.MeshStandardMaterial({
      color: bodyColor,
      roughness: 0.7,
    });
    const head = new THREE.Mesh(headGeometry, headMaterial);
    head.position.y = 2;

    // Hair
    const hairGeometry = new THREE.SphereGeometry(
      0.54,
      32,
      32,
      0,
      Math.PI * 2,
      0,
      Math.PI / 2
    );
    const hairMaterial = new THREE.MeshStandardMaterial({
      color: accessoryColor,
      roughness: 1,
    });
    const hair = new THREE.Mesh(hairGeometry, hairMaterial);
    hair.position.y = 2.1;

    // Body
    const bodyGeometry = new THREE.CylinderGeometry(0.3, 0.5, 1.5, 32);
    const body = new THREE.Mesh(bodyGeometry, headMaterial);
    body.position.y = 1;

    // Arms
    const armGeometry = new THREE.CylinderGeometry(0.15, 0.15, 1, 32);
    const leftArm = new THREE.Mesh(armGeometry, headMaterial);
    leftArm.position.set(-0.75, 1.25, 0);
    leftArm.rotation.z = Math.PI / 4;

    const rightArm = new THREE.Mesh(armGeometry, headMaterial);
    rightArm.position.set(0.75, 1.25, 0);
    rightArm.rotation.z = -Math.PI / 4;

    // Legs
    const legGeometry = new THREE.CylinderGeometry(0.2, 0.2, 1, 32);
    const leftLeg = new THREE.Mesh(legGeometry, headMaterial);
    leftLeg.position.set(-0.3, 0.25, 0);

    const rightLeg = new THREE.Mesh(legGeometry, headMaterial);
    rightLeg.position.set(0.3, 0.25, 0);

    group.add(head, hair, body, leftArm, rightArm, leftLeg, rightLeg);
    return group;
  };

  // Create alien avatar
  const createAlienAvatar = (bodyColor: string, accessoryColor: string) => {
    const group = new THREE.Group();

    // Alien Head (elongated)
    const headGeometry = new THREE.SphereGeometry(0.4, 32, 32);
    const headMaterial = new THREE.MeshStandardMaterial({
      color: bodyColor,
      metalness: 0.3,
      roughness: 0.7,
    });
    const head = new THREE.Mesh(headGeometry, headMaterial);
    head.scale.y = 1.5;
    head.position.y = 2.2;

    // Large Alien Eyes
    const eyeGeometry = new THREE.SphereGeometry(0.15, 32, 32);
    const eyeMaterial = new THREE.MeshStandardMaterial({
      color: accessoryColor,
      metalness: 0.8,
      roughness: 0.2,
    });

    const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    leftEye.scale.y = 1.5;
    leftEye.position.set(-0.2, 2.2, 0.3);

    const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    rightEye.scale.y = 1.5;
    rightEye.position.set(0.2, 2.2, 0.3);

    // Slender Body
    const bodyGeometry = new THREE.CylinderGeometry(0.2, 0.4, 1.8, 32);
    const body = new THREE.Mesh(bodyGeometry, headMaterial);
    body.position.y = 1;

    // Thin Arms
    const armGeometry = new THREE.CylinderGeometry(0.08, 0.08, 1.2, 32);
    const leftArm = new THREE.Mesh(armGeometry, headMaterial);
    leftArm.position.set(-0.6, 1.3, 0);
    leftArm.rotation.z = Math.PI / 6;

    const rightArm = new THREE.Mesh(armGeometry, headMaterial);
    rightArm.position.set(0.6, 1.3, 0);
    rightArm.rotation.z = -Math.PI / 6;

    // Thin Legs
    const legGeometry = new THREE.CylinderGeometry(0.1, 0.1, 1.2, 32);
    const leftLeg = new THREE.Mesh(legGeometry, headMaterial);
    leftLeg.position.set(-0.2, 0.3, 0);

    const rightLeg = new THREE.Mesh(legGeometry, headMaterial);
    rightLeg.position.set(0.2, 0.3, 0);

    group.add(
      head,
      leftEye,
      rightEye,
      body,
      leftArm,
      rightArm,
      leftLeg,
      rightLeg
    );
    return group;
  };

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
