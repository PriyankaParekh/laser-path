"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { FontLoader } from "three/examples/jsm/loaders/FontLoader";
import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry";
import { useNavigate } from "react-router-dom";
import { createJokerAvatar } from "../Avatar/custom-avatars-use-case";

type LaserType =
  | "right-to-left"
  | "left-to-right"
  | "top-to-bottom"
  | "bottom-to-top";

interface LaserLine {
  mesh: THREE.Group;
  startPoint: { x: number; y: number; z: number };
  endPoint: { x: number; y: number; z: number };
  speed: { x: number; z: number };
  type: LaserType;
}

const SurfaceWithUser = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const userRef = useRef<THREE.Group | null>(null);
  const gridRef = useRef<THREE.Object3D | null>(null);
  const linesRef = useRef<LaserLine[]>([]);
  const arenaFloorRef = useRef<THREE.Mesh | null>(null);
  const wallsRef = useRef<THREE.Group | null>(null);

  const raycasterRef = useRef<THREE.Raycaster>(new THREE.Raycaster());
  const mouseRef = useRef<THREE.Vector2>(new THREE.Vector2());
  const userPositionRef = useRef<{ x: number; y: number; z: number }>({
    x: 0,
    y: 0,
    z: 0,
  });
  const [isKeyPressedAllowed, setIskeyPressedAllowed] = useState<any>(true);
  const timerMeshRef = useRef<any>(null);
  const currentLineCountRef = useRef<number>(0);
  const [score, setScore] = useState<number>(0);
  const [hasWon, setHasWon] = useState<boolean>(false);

  const particlesRef = useRef<THREE.Points | null>(null);
  const isUserAliveRef = useRef<boolean>(true);
  const [isUserAlive, setIsUserAlive] = useState<any>(true);
  const navigate = useNavigate();

  // Add these refs to track active lasers
  const activeLaserTypesRef = useRef<Set<LaserType>>(new Set());
  const hasReachedEndRef = useRef<Set<LaserType>>(new Set());

  // Particle System for Burning Effect
  const createParticleSystem = (position: THREE.Vector3) => {
    const particleCount = 1000;
    const particles = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      particles[i * 3] = position.x + (Math.random() - 0.5) * 2;
      particles[i * 3 + 1] = position.y + Math.random() * 3;
      particles[i * 3 + 2] = position.z + (Math.random() - 0.5) * 2;

      // Color gradient from red to yellow
      colors[i * 3] = Math.random(); // R
      colors[i * 3 + 1] = Math.random() * 0.5; // G
      colors[i * 3 + 2] = 0; // B
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(particles, 3));
    geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
      size: 0.1,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
    });

    const points = new THREE.Points(geometry, material);
    return points;
  };

  const startBurningAnimation = (position: THREE.Vector3) => {
    if (!sceneRef.current || !isUserAliveRef.current) return;

    isUserAliveRef.current = false;
    setIsUserAlive(false);

    if (userRef.current) {
      sceneRef.current.remove(userRef.current);
    }

    const particles = createParticleSystem(position);
    sceneRef.current.add(particles);
    particlesRef.current = particles;

    // Fade out animation
    let opacity = 1;
    const fadeOut = () => {
      if (opacity <= 0 || !particlesRef.current) {
        if (sceneRef.current && particlesRef.current) {
          sceneRef.current.remove(particlesRef.current);
        }
        return;
      }

      opacity -= 0.02;
      if (particlesRef.current.material instanceof THREE.PointsMaterial) {
        particlesRef.current.material.opacity = opacity;
      }

      // Animate particles moving upward
      const positions = particlesRef.current.geometry.attributes.position.array;
      for (let i = 0; i < positions.length; i += 3) {
        positions[i + 1] += 0.05; // Y position
        positions[i] += (Math.random() - 0.5) * 0.1; // X position
        positions[i + 2] += (Math.random() - 0.5) * 0.1; // Z position
      }
      particlesRef.current.geometry.attributes.position.needsUpdate = true;

      requestAnimationFrame(fadeOut);
    };

    fadeOut();
  };

  const checkCollision = () => {
    if (!userRef.current || !isUserAliveRef.current) return;

    const userPosition = new THREE.Vector3(
      userPositionRef.current.x,
      userPositionRef.current.y,
      userPositionRef.current.z
    );

    for (const line of linesRef.current) {
      const startPoint = new THREE.Vector3(
        line.startPoint.x,
        line.startPoint.y,
        line.startPoint.z
      );
      const endPoint = new THREE.Vector3(
        line.endPoint.x,
        line.endPoint.y,
        line.endPoint.z
      );

      // Calculate distance from user to line segment
      const line3 = new THREE.Line3(startPoint, endPoint);
      const closestPoint = new THREE.Vector3();
      line3.closestPointToPoint(userPosition, true, closestPoint);

      const distance = userPosition.distanceTo(closestPoint);

      if (distance < 0.8) {
        // Collision threshold
        startBurningAnimation(userPosition);
        setIskeyPressedAllowed(false);
        break;
      }
    }
  };

  const makeLine = (scene: THREE.Scene | null) => {
    const GRID_SIZE = 10;

    // Helper function to create a new laser line
    const createLaserLine = (type: LaserType) => {
      let startPoint, endPoint, speed;

      switch (type) {
        case "right-to-left":
          startPoint = { x: GRID_SIZE, y: 0.5, z: -GRID_SIZE };
          endPoint = { x: GRID_SIZE, y: 0.5, z: GRID_SIZE };
          speed = { x: -0.1, z: 0 };
          break;

        case "left-to-right":
          startPoint = { x: -GRID_SIZE, y: 0.5, z: -GRID_SIZE };
          endPoint = { x: -GRID_SIZE, y: 0.5, z: GRID_SIZE };
          speed = { x: 0.1, z: 0 };
          break;

        case "top-to-bottom":
          startPoint = { x: -GRID_SIZE, y: 0.5, z: -GRID_SIZE };
          endPoint = { x: GRID_SIZE, y: 0.5, z: -GRID_SIZE };
          speed = { x: 0, z: 0.1 };
          break;

        case "bottom-to-top":
          startPoint = { x: -GRID_SIZE, y: 0.5, z: GRID_SIZE };
          endPoint = { x: GRID_SIZE, y: 0.5, z: GRID_SIZE };
          speed = { x: 0, z: -0.1 };
          break;
      }

      const thickLine = createThickLine(startPoint, endPoint, 0xff0055);
      scene?.add(thickLine);

      return {
        mesh: thickLine,
        startPoint,
        endPoint,
        speed,
        type,
      };
    };

    // Create new lasers based on which ones should be active
    if (!activeLaserTypesRef.current.has("right-to-left")) {
      activeLaserTypesRef.current.add("right-to-left");
      linesRef.current.push(createLaserLine("right-to-left"));
    }

    if (
      hasReachedEndRef.current.has("right-to-left") &&
      !activeLaserTypesRef.current.has("left-to-right")
    ) {
      activeLaserTypesRef.current.add("left-to-right");
      linesRef.current.push(createLaserLine("left-to-right"));
    }

    if (
      hasReachedEndRef.current.has("left-to-right") &&
      !activeLaserTypesRef.current.has("top-to-bottom")
    ) {
      activeLaserTypesRef.current.add("top-to-bottom");
      linesRef.current.push(createLaserLine("top-to-bottom"));
    }

    if (
      hasReachedEndRef.current.has("top-to-bottom") &&
      !activeLaserTypesRef.current.has("bottom-to-top")
    ) {
      activeLaserTypesRef.current.add("bottom-to-top");
      linesRef.current.push(createLaserLine("bottom-to-top"));
    }
  };

  function createThickLine(startPoint: any, endPoint: any, color = 0xff0055) {
    const curve = new THREE.LineCurve3(
      new THREE.Vector3(startPoint.x, startPoint.y, startPoint.z),
      new THREE.Vector3(endPoint.x, endPoint.y, endPoint.z)
    );

    const thickness = 0.2; // Consistent thickness for the laser
    const tubeGeometry = new THREE.TubeGeometry(curve, 20, thickness, 8, false);
    const sphereGeometry = new THREE.SphereGeometry(thickness * 2, 16, 16);

    // Enhanced laser material with glow effect
    const material = new THREE.MeshPhongMaterial({
      color: color,
      shininess: 100,
      specular: 0xffffff,
      emissive: color,
      emissiveIntensity: 0.5,
    });

    const tubeMesh = new THREE.Mesh(tubeGeometry, material);
    const startSphere = new THREE.Mesh(sphereGeometry, material);
    const endSphere = new THREE.Mesh(sphereGeometry, material);

    startSphere.position.set(startPoint.x, startPoint.y, startPoint.z);
    endSphere.position.set(endPoint.x, endPoint.y, endPoint.z);

    const lineGroup = new THREE.Group();
    lineGroup.add(tubeMesh);
    lineGroup.add(startSphere);
    lineGroup.add(endSphere);

    return lineGroup;
  }

  const animateLines = () => {
    if (!sceneRef.current) return;

    const GRID_SIZE = 10;

    // Update each laser's position
    linesRef.current.forEach((line) => {
      sceneRef.current!.remove(line.mesh);

      // Reset laser position when it reaches the end
      switch (line.type) {
        case "right-to-left":
          if (line.startPoint.x <= -GRID_SIZE) {
            line.startPoint.x = GRID_SIZE;
            line.endPoint.x = GRID_SIZE;
            hasReachedEndRef.current.add("right-to-left");
            makeLine(sceneRef.current); // Try to spawn next laser
            currentLineCountRef.current += 1;
            setScore(currentLineCountRef.current);
          }
          break;
        case "left-to-right":
          if (line.startPoint.x >= GRID_SIZE) {
            line.startPoint.x = -GRID_SIZE;
            line.endPoint.x = -GRID_SIZE;
            hasReachedEndRef.current.add("left-to-right");
            makeLine(sceneRef.current);
            currentLineCountRef.current += 1;
            setScore(currentLineCountRef.current);
          }
          break;
        case "top-to-bottom":
          if (line.startPoint.z >= GRID_SIZE) {
            line.startPoint.z = -GRID_SIZE;
            line.endPoint.z = -GRID_SIZE;
            hasReachedEndRef.current.add("top-to-bottom");
            makeLine(sceneRef.current); // Try to spawn next laser
            currentLineCountRef.current += 1;
            setScore(currentLineCountRef.current);
          }
          break;
        case "bottom-to-top":
          if (line.startPoint.z <= -GRID_SIZE) {
            line.startPoint.z = GRID_SIZE;
            line.endPoint.z = GRID_SIZE;
            hasReachedEndRef.current.add("bottom-to-top");
            currentLineCountRef.current += 1;
            setScore(currentLineCountRef.current);
          }
          break;
      }

      // Update positions
      line.startPoint.x += line.speed.x;
      line.endPoint.x += line.speed.x;
      line.startPoint.z += line.speed.z;
      line.endPoint.z += line.speed.z;

      // Create new line with updated position
      const newLine = createThickLine(line.startPoint, line.endPoint, 0xff0055);
      sceneRef?.current?.add(newLine);
      line.mesh = newLine;
    });
  };

  // Create arena walls
  const createArenaWalls = (scene: THREE.Scene, size: number) => {
    const wallGroup = new THREE.Group();
    const wallHeight = 3;
    const wallThickness = 0.5;

    // Wall material with holographic effect
    const wallMaterial = new THREE.MeshPhongMaterial({
      color: 0x00ffff,
      transparent: true,
      opacity: 0.3,
      shininess: 100,
      specular: 0xffffff,
      side: THREE.DoubleSide,
    });

    // Create four walls
    const wallGeometry = new THREE.BoxGeometry(
      size * 2 + wallThickness,
      wallHeight,
      wallThickness
    );

    // North wall
    const northWall = new THREE.Mesh(wallGeometry, wallMaterial);
    northWall.position.set(0, wallHeight / 2, -size - wallThickness / 2);
    wallGroup.add(northWall);

    // South wall
    const southWall = new THREE.Mesh(wallGeometry, wallMaterial);
    southWall.position.set(0, wallHeight / 2, size + wallThickness / 2);
    wallGroup.add(southWall);

    // East wall
    const eastWallGeometry = new THREE.BoxGeometry(
      wallThickness,
      wallHeight,
      size * 2 + wallThickness
    );
    const eastWall = new THREE.Mesh(eastWallGeometry, wallMaterial);
    eastWall.position.set(size + wallThickness / 2, wallHeight / 2, 0);
    wallGroup.add(eastWall);

    // West wall
    const westWall = new THREE.Mesh(eastWallGeometry, wallMaterial);
    westWall.position.set(-size - wallThickness / 2, wallHeight / 2, 0);
    wallGroup.add(westWall);

    // Add pulsing animation to walls
    const pulseWalls = () => {
      const time = Date.now() * 0.001;
      wallGroup.children.forEach((wall, index) => {
        if (
          wall instanceof THREE.Mesh &&
          wall.material instanceof THREE.MeshPhongMaterial
        ) {
          wall.material.opacity = 0.2 + Math.sin(time + index * 0.5) * 0.1;
          wall.material.emissiveIntensity =
            0.5 + Math.sin(time + index * 0.5) * 0.2;
        }
      });
      requestAnimationFrame(pulseWalls);
    };
    pulseWalls();

    scene.add(wallGroup);
    return wallGroup;
  };

  // Create floor with hexagonal pattern
  const createArenaFloor = (scene: THREE.Scene, size: number) => {
    // Create a canvas for the floor texture
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext("2d");

    if (ctx) {
      // Fill background
      ctx.fillStyle = "#000000";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw hexagonal grid pattern
      ctx.strokeStyle = "#00ff88";
      ctx.lineWidth = 2;

      const hexSize = 40;
      const rows = Math.ceil(canvas.height / (hexSize * 1.5)) + 1;
      const cols = Math.ceil(canvas.width / (hexSize * Math.sqrt(3))) + 1;

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const x = c * hexSize * Math.sqrt(3);
          const y = r * hexSize * 1.5;
          const offset = (r % 2) * ((hexSize * Math.sqrt(3)) / 2);

          ctx.beginPath();
          for (let i = 0; i < 6; i++) {
            const angle = ((2 * Math.PI) / 6) * i;
            const hx = x + offset + hexSize * Math.cos(angle);
            const hy = y + hexSize * Math.sin(angle);
            if (i === 0) ctx.moveTo(hx, hy);
            else ctx.lineTo(hx, hy);
          }
          ctx.closePath();
          ctx.stroke();
        }
      }

      // Add glow to the lines
      ctx.shadowColor = "#00ff88";
      ctx.shadowBlur = 10;
      ctx.stroke();
    }

    // Create texture from canvas
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(2, 2);

    // Create floor material with the texture
    const floorMaterial = new THREE.MeshStandardMaterial({
      map: texture,
      roughness: 0.5,
      metalness: 0.8,
      emissive: 0x003311,
      emissiveIntensity: 0.2,
    });

    // Create floor mesh
    const floorGeometry = new THREE.CircleGeometry(size, 64);
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    floor.name = "arenaFloor";

    scene.add(floor);
    return floor;
  };

  useEffect(() => {
    if (!mountRef.current) return;

    // Initialize scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Initialize camera
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.set(0, 10, 15);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    // Initialize renderer
    let renderer: any;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
      });
      renderer.setSize(window.innerWidth, window.innerHeight);
    } catch (error) {
      console.error("WebGL Renderer failed:", error);
      alert("Your browser or device does not support WebGL.");
    }
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setClearColor(0x000000, 1);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    mountRef.current.innerHTML = "";
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Create futuristic arena floor
    const arenaFloor = createArenaFloor(scene, 10);
    arenaFloorRef.current = arenaFloor;

    // Create arena walls
    const walls = createArenaWalls(scene, 10);
    wallsRef.current = walls;

    // Add grid helper for reference (more subtle)
    const gridHelper = new THREE.GridHelper(20, 20, 0x004422, 0x001100);
    gridHelper.position.y = 0.01; // Slightly above floor to prevent z-fighting
    scene.add(gridHelper);
    gridRef.current = gridHelper;

    // Add lights
    // Ambient light
    const ambientLight = new THREE.AmbientLight(0x111111);
    scene.add(ambientLight);

    // Main directional light
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.5);
    directionalLight.position.set(5, 10, 5);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 1024;
    directionalLight.shadow.mapSize.height = 1024;
    scene.add(directionalLight);

    // Add point lights at corners for dramatic effect
    const createPointLight = (x: number, z: number, color: number) => {
      const light = new THREE.PointLight(color, 1, 15);
      light.position.set(x, 2, z);
      scene.add(light);

      // Add subtle animation to the light
      const animate = () => {
        const time = Date.now() * 0.001;
        light.intensity = 1 + Math.sin(time) * 0.3;
        requestAnimationFrame(animate);
      };
      animate();

      return light;
    };

    createPointLight(8, 8, 0x00ffff);
    createPointLight(-8, 8, 0xff00ff);
    createPointLight(8, -8, 0xff00ff);
    createPointLight(-8, -8, 0x00ffff);

    // Add spotlight following the player
    const spotlight = new THREE.SpotLight(0xffffff, 2, 20, Math.PI / 6, 0.5, 1);
    spotlight.position.set(0, 10, 0);
    spotlight.castShadow = true;
    scene.add(spotlight);

    // Add fog for atmosphere
    scene.fog = new THREE.FogExp2(0x000000, 0.03);

    let isJumping = false;
    let jumpStartTime = 0;

    const clock = new THREE.Clock();

    function jump() {
      if (!isJumping) {
        isJumping = true;
        jumpStartTime = clock.getElapsedTime();
      }
    }

    function updateUserJump() {
      if (isJumping) {
        const elapsedTime = clock.getElapsedTime() - jumpStartTime;
        const jumpDuration = 1.5; // Total jump duration
        const jumpHeight = 3; // Max jump height

        if (elapsedTime < jumpDuration) {
          // Smooth jump using sine wave interpolation
          const progress = elapsedTime / jumpDuration;
          const y = jumpHeight * Math.sin(Math.PI * progress);
          userPositionRef.current.y = y; // Update position
        } else {
          userPositionRef.current.y = 0; // Reset to ground
          isJumping = false; // End jump
        }
      }
    }

    const timerScene = new THREE.Scene();
    const timerCamera = new THREE.OrthographicCamera(
      -window.innerWidth / 2,
      window.innerWidth / 2,
      window.innerHeight / 2,
      -window.innerHeight / 2,
      1,
      1000
    );
    timerCamera.position.z = 100;
    const fontLoader = new FontLoader();
    fontLoader.load(
      "https://threejs.org/examples/fonts/helvetiker_regular.typeface.json",
      (font) => {
        const createTimerText = (time: number): THREE.Group => {
          const minutes = Math.floor(time / 60);
          const remainingSeconds = time % 60;
          const timeString = `${minutes
            .toString()
            .padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`;

          if (minutes === 0 && remainingSeconds === 0) {
            if (isUserAliveRef.current) {
              setHasWon(true);
              setIskeyPressedAllowed(false);
            }
          }

          const group = new THREE.Group();

          // Create the circular box (cyan border, dark background)
          const boxGeometry = new THREE.CircleGeometry(50, 64);
          const borderMaterial = new THREE.MeshBasicMaterial({
            color: 0x00ffff,
          });

          const borderMesh = new THREE.Mesh(boxGeometry, borderMaterial);

          // Inner dark circle for background with slight transparency
          const innerCircleGeometry = new THREE.CircleGeometry(45, 64);
          const backgroundMaterial = new THREE.MeshBasicMaterial({
            color: 0x000033,
            transparent: true,
            opacity: 0.8,
          });
          const innerCircleMesh = new THREE.Mesh(
            innerCircleGeometry,
            backgroundMaterial
          );

          innerCircleMesh.position.set(0, 0, 0.1);
          borderMesh.add(innerCircleMesh);

          const textGeometry = new TextGeometry(timeString, {
            font: font,
            size: 15,
            depth: 1,
          });
          const textMaterial = new THREE.MeshBasicMaterial({ color: 0x00ffff });
          const textMesh = new THREE.Mesh(textGeometry, textMaterial);

          textGeometry.computeBoundingBox();
          if (textGeometry.boundingBox) {
            const textWidth =
              textGeometry.boundingBox.max.x - textGeometry.boundingBox.min.x;
            const textHeight =
              textGeometry.boundingBox.max.y - textGeometry.boundingBox.min.y;
            textMesh.position.set(-textWidth / 2, -textHeight / 2, 0.2);
          }

          group.add(borderMesh);
          group.add(textMesh);

          group.position.set(
            window.innerWidth / 2 - 100,
            window.innerHeight / 2 - 100,
            0
          );

          return group;
        };

        let timerMesh = createTimerText(60);
        timerScene.add(timerMesh);
        timerMeshRef.current = timerMesh;

        let countdownTime = 60;
        const timerInterval = setInterval(() => {
          if (countdownTime > 0 && isUserAliveRef.current && !hasWon) {
            countdownTime -= 1;
            timerScene.remove(timerMeshRef.current);
            timerMesh = createTimerText(countdownTime);
            timerScene.add(timerMesh);
            timerMeshRef.current = timerMesh;
          } else {
            clearInterval(timerInterval);
          }
        }, 1000);

        return () => clearInterval(timerInterval);
      }
    );

    // User
    const joker = createJokerAvatar();
    joker.position.set(0, 0, 0);
    joker.castShadow = true;
    joker.receiveShadow = true;
    scene.add(joker);
    userRef.current = joker;

    // Initialize with just the first laser
    makeLine(scene);

    // Add particle effects around the arena
    const createAmbientParticles = () => {
      const particleCount = 500;
      const particles = new Float32Array(particleCount * 3);
      const colors = new Float32Array(particleCount * 3);

      for (let i = 0; i < particleCount; i++) {
        // Position particles in a circular pattern around the arena
        const radius = 10 + Math.random() * 5;
        const angle = Math.random() * Math.PI * 2;
        const height = Math.random() * 5;

        particles[i * 3] = Math.cos(angle) * radius;
        particles[i * 3 + 1] = height;
        particles[i * 3 + 2] = Math.sin(angle) * radius;

        // Cyan/purple color scheme
        colors[i * 3] = 0; // R
        colors[i * 3 + 1] = Math.random() * 0.5 + 0.5; // G (cyan to purple)
        colors[i * 3 + 2] = Math.random() * 0.5 + 0.5; // B (cyan to purple)
      }

      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute(
        "position",
        new THREE.BufferAttribute(particles, 3)
      );
      geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

      const material = new THREE.PointsMaterial({
        size: 0.05,
        vertexColors: true,
        transparent: true,
        opacity: 0.7,
      });

      const points = new THREE.Points(geometry, material);
      scene.add(points);

      // Animate particles
      const animateParticles = () => {
        const positions = points.geometry.attributes.position.array;
        const time = Date.now() * 0.0005;

        for (let i = 0; i < positions.length; i += 3) {
          const idx = i / 3;
          const angle = time + idx * 0.01;
          positions[i] += Math.sin(angle) * 0.01;
          positions[i + 1] += Math.cos(angle) * 0.005;
          positions[i + 2] += Math.sin(angle * 0.5) * 0.01;
        }

        points.geometry.attributes.position.needsUpdate = true;
        requestAnimationFrame(animateParticles);
      };

      animateParticles();
    };

    createAmbientParticles();

    const handleKeyDown = (event: KeyboardEvent) => {
      const RADIUS = 10;
      if (isKeyPressedAllowed) {
        const newPosition = { ...userPositionRef.current };
        const moveDistance = 0.1;

        if (event.key === "ArrowRight") {
          newPosition.x = Math.min(newPosition.x + moveDistance, RADIUS);
        } else if (event.key === "ArrowLeft") {
          newPosition.x = Math.max(newPosition.x - moveDistance, -RADIUS);
        } else if (event.key === "ArrowUp") {
          newPosition.z = Math.max(newPosition.z - moveDistance, -RADIUS);
        } else if (event.key === "ArrowDown") {
          newPosition.z = Math.min(newPosition.z + moveDistance, RADIUS);
        } else if (event.key === " ") {
          jump();
        }

        // Ensure the player stays within the circular boundary
        const distanceFromCenter = Math.sqrt(
          newPosition.x * newPosition.x + newPosition.z * newPosition.z
        );
        if (distanceFromCenter > RADIUS) {
          const angle = Math.atan2(newPosition.z, newPosition.x);
          newPosition.x = RADIUS * Math.cos(angle);
          newPosition.z = RADIUS * Math.sin(angle);
        }

        userPositionRef.current = newPosition;
      }
    };

    const handleMouseMove = (event: MouseEvent) => {
      if (!mountRef.current || !sceneRef.current || !cameraRef.current) return;

      const rect = mountRef.current.getBoundingClientRect();
      mouseRef.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouseRef.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycasterRef.current.setFromCamera(mouseRef.current, cameraRef.current);
      const intersects = raycasterRef.current.intersectObjects([
        scene.getObjectByName("arenaFloor")!,
      ]);

      const isHovering = intersects.length > 0;
      if (isHovering) {
        scene.rotation.y = mouseRef.current.x * 0.3;
        scene.rotation.x = mouseRef.current.y * 0.3;
      } else {
        scene.rotation.y = 0;
        scene.rotation.x = 0;
      }
    };

    const handleMouseLeave = () => {
      if (sceneRef.current) {
        scene.rotation.x = 0;
        scene.rotation.y = 0;
      }
    };

    const handleResize = () => {
      if (!cameraRef.current || !rendererRef.current) return;

      const width = window.innerWidth;
      const height = window.innerHeight;
      cameraRef.current.aspect = width / height;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(width, height);
    };

    const animate = () => {
      if (
        !userRef.current ||
        !rendererRef.current ||
        !sceneRef.current ||
        !cameraRef.current
      )
        return;

      requestAnimationFrame(animate);

      if (isUserAliveRef.current) {
        userRef.current.position.x = userPositionRef.current.x;
        userRef.current.position.y = userPositionRef.current.y;
        userRef.current.position.z = userPositionRef.current.z;

        // Update spotlight to follow player
        spotlight.position.set(
          userPositionRef.current.x,
          10,
          userPositionRef.current.z
        );
        spotlight.target = userRef.current;

        checkCollision();
      }

      animateLines();
      updateUserJump();

      rendererRef.current.render(sceneRef.current, cameraRef.current);
      rendererRef.current.autoClear = false;
      rendererRef.current.clearDepth();
      rendererRef.current.render(timerScene, timerCamera);
      rendererRef.current.autoClear = true;
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("resize", handleResize);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseleave", handleMouseLeave);

    animate();

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseleave", handleMouseLeave);
      if (mountRef.current && rendererRef.current) {
        //eslint-disable-next-line
        mountRef.current.removeChild(renderer.domElement);
      }
      timerScene.clear();
      scene.clear();
    };
    //eslint-disable-next-line
  }, [hasWon]);

  useEffect(() => {
    if (!isUserAlive) {
      setTimeout(() => {
        navigate(`/exit?score=${score}`);
      }, 500);
    }
  }, [isUserAlive, navigate, score]);

  useEffect(() => {
    if (hasWon) {
      setTimeout(() => {
        navigate(`/exit?score=${score}&win=true`);
      }, 500);
    }
  }, [hasWon, navigate, score]);

  return (
    <div className="relative w-full h-screen">
      <div ref={mountRef} className="w-full h-full" />
      <div className="absolute top-4 left-4 text-white text-2xl font-bold">
        Score: {score}
      </div>
    </div>
  );
};

export default SurfaceWithUser;
