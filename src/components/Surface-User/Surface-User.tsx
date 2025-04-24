import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { FontLoader } from "three/examples/jsm/loaders/FontLoader";
import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry";
import { useNavigate } from "react-router-dom";

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
  const speedRef = useRef({ x: 0.05, z: 0.05 });
  const raycasterRef = useRef<THREE.Raycaster>(new THREE.Raycaster());
  const mouseRef = useRef<THREE.Vector2>(new THREE.Vector2());
  const userPositionRef = useRef<{ x: number; y: number; z: number }>({
    x: 0,
    y: 0,
    z: 0,
  });
  const [isKeyPressedAllowed, setIskeyPressedAllowed] = useState<any>(true);
  const timerMeshRef = useRef<any>(null);
  const currentLineCountRef = useRef<number>(1);
  const lastLaserDirectionRef = useRef<"left-to-right" | "right-to-left">(
    "left-to-right"
  );

  const particlesRef = useRef<THREE.Points | null>(null);
  const isUserAliveRef = useRef<boolean>(true);
  const [isUserAlive, setIsUserAlive] = useState<any>(true);
  const navigate = useNavigate();

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

  const makeLine = (scene: THREE.Scene, num: number) => {
    // Clear existing lines
    linesRef.current.forEach((line) => {
      scene.remove(line.mesh);
    });
    linesRef.current = [];

    const GRID_SIZE = 10;

    // Get the next laser type based on the current line count
    const getLaserType = (): LaserType => {
      const count = currentLineCountRef.current % 4;
      switch (count) {
        case 1:
          return "right-to-left";
        case 2:
          return "left-to-right";
        case 3:
          return "top-to-bottom";
        case 0:
          return "bottom-to-top";
        default:
          return "right-to-left";
      }
    };

    const laserType = getLaserType();

    // Configure laser based on type
    let startPoint, endPoint, speed;

    switch (laserType) {
      case "right-to-left":
        startPoint = { x: GRID_SIZE, y: 0, z: -GRID_SIZE };
        endPoint = { x: GRID_SIZE, y: 0, z: GRID_SIZE };
        speed = { x: -0.1, z: 0 };
        break;

      case "left-to-right":
        startPoint = { x: -GRID_SIZE, y: 0, z: -GRID_SIZE };
        endPoint = { x: -GRID_SIZE, y: 0, z: GRID_SIZE };
        speed = { x: 0.1, z: 0 };
        break;

      case "top-to-bottom":
        startPoint = { x: -GRID_SIZE, y: 0, z: -GRID_SIZE };
        endPoint = { x: GRID_SIZE, y: 0, z: -GRID_SIZE };
        speed = { x: 0, z: 0.1 };
        break;

      case "bottom-to-top":
        startPoint = { x: -GRID_SIZE, y: 0, z: GRID_SIZE };
        endPoint = { x: GRID_SIZE, y: 0, z: GRID_SIZE };
        speed = { x: 0, z: -0.1 };
        break;
    }

    const thickLine = createThickLine(startPoint, endPoint, 0xc30010);
    scene.add(thickLine);

    linesRef.current.push({
      mesh: thickLine,
      startPoint,
      endPoint,
      speed,
      type: laserType,
    });
  };

  function createThickLine(startPoint: any, endPoint: any, color = 0xff0000) {
    const curve = new THREE.LineCurve3(
      new THREE.Vector3(startPoint.x, startPoint.y, startPoint.z),
      new THREE.Vector3(endPoint.x, endPoint.y, endPoint.z)
    );

    const thickness = 0.2; // Consistent thickness for the laser
    const tubeGeometry = new THREE.TubeGeometry(curve, 20, thickness, 8, false);
    const sphereGeometry = new THREE.SphereGeometry(thickness * 2, 16, 16);
    const material = new THREE.MeshPhongMaterial({
      color: color,
      shininess: 100,
      specular: 0x444444,
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

  function randomIntFromInterval(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1) + min);
  }

  const animateLines = () => {
    if (!sceneRef.current) return;

    const linesToRemove: number[] = [];
    const GRID_SIZE = 10;

    linesRef.current.forEach((line, index) => {
      // Remove old line
      sceneRef.current!.remove(line.mesh);

      // Update positions based on laser type
      line.startPoint.x += line.speed.x;
      line.endPoint.x += line.speed.x;
      line.startPoint.z += line.speed.z;
      line.endPoint.z += line.speed.z;

      // Check if laser has reached its end position
      let shouldRemove = false;
      switch (line.type) {
        case "right-to-left":
          shouldRemove = line.startPoint.x < -GRID_SIZE;
          break;
        case "left-to-right":
          shouldRemove = line.startPoint.x > GRID_SIZE;
          break;
        case "top-to-bottom":
          shouldRemove = line.startPoint.z > GRID_SIZE;
          break;
        case "bottom-to-top":
          shouldRemove = line.startPoint.z < -GRID_SIZE;
          break;
      }

      if (shouldRemove) {
        linesToRemove.push(index);
      } else {
        // Create new line with updated position
        const newLine = createThickLine(
          line.startPoint,
          line.endPoint,
          0xfe347e
        );
        if (sceneRef.current) sceneRef.current.add(newLine);
        line.mesh = newLine;
      }
    });

    // Remove lines that are out of bounds
    linesToRemove.reverse().forEach((index) => {
      linesRef.current.splice(index, 1);
    });

    // If all lines are removed, create new lines
    if (linesRef.current.length === 0) {
      currentLineCountRef.current++;
      makeLine(sceneRef.current, 1); // Always spawn one laser at a time
    }
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
      renderer = new THREE.WebGLRenderer({ antialias: true });
      renderer.setSize(window.innerWidth, window.innerHeight);
    } catch (error) {
      console.error("WebGL Renderer failed:", error);
      alert("Your browser or device does not support WebGL.");
    }
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setClearColor(0x000000, 1);
    mountRef.current.innerHTML = "";
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Initialize scene setup in useEffect
    // Add grid with plane
    const gridHelper = new THREE.GridHelper(20, 20, 0x2cff05, 0x808080);
    const gridPlane = new THREE.Mesh(
      new THREE.PlaneGeometry(20, 20),
      new THREE.MeshBasicMaterial({
        color: 0x2cff05,
        transparent: true,
        opacity: 0.1,
      })
    );
    gridPlane.rotateX(-Math.PI / 2);
    gridPlane.name = "gridPlane";
    scene.add(gridHelper);
    scene.add(gridPlane);
    gridRef.current = gridHelper;

    // Add lights
    const ambientLight = new THREE.AmbientLight(0x404040);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 2.5);
    directionalLight.position.set(5, 5, 5);
    scene.add(directionalLight);

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
          console.log("hi");
          const minutes = Math.floor(time / 60);
          const remainingSeconds = time % 60;
          if (minutes === 0 && remainingSeconds === 0) {
            setIskeyPressedAllowed(false);
          }
          const timeString = `${minutes
            .toString()
            .padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`;

          const group = new THREE.Group();

          // Create the circular box (green border, white background)
          const boxGeometry = new THREE.CircleGeometry(50, 64); // Radius = 50, smooth edges
          const borderMaterial = new THREE.MeshBasicMaterial({
            color: 0x00ff00,
          }); // Green color for border

          const borderMesh = new THREE.Mesh(boxGeometry, borderMaterial);

          // Inner white circle for background
          const innerCircleGeometry = new THREE.CircleGeometry(45, 64); // Slightly smaller for border effect
          const backgroundMaterial = new THREE.MeshBasicMaterial({
            color: 0xffffff,
          }); // White background
          const innerCircleMesh = new THREE.Mesh(
            innerCircleGeometry,
            backgroundMaterial
          );

          // Position the inner circle slightly inward
          innerCircleMesh.position.set(0, 0, 0.1); // Ensures it's layered above the border
          borderMesh.add(innerCircleMesh);

          // Add text in the center of the circle
          const textGeometry = new TextGeometry(timeString, {
            font: font, // Ensure font is preloaded
            size: 15, // Text size
            depth: 1, // Flat text
          });
          const textMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 }); // Black text color
          const textMesh = new THREE.Mesh(textGeometry, textMaterial);

          // Center text in the circle
          textGeometry.computeBoundingBox();
          if (textGeometry.boundingBox) {
            const textWidth =
              textGeometry.boundingBox.max.x - textGeometry.boundingBox.min.x;
            const textHeight =
              textGeometry.boundingBox.max.y - textGeometry.boundingBox.min.y;
            textMesh.position.set(-textWidth / 2, -textHeight / 2, 0.2); // Center text
          }

          // Group the components together
          group.add(borderMesh);
          group.add(textMesh);

          // Position the timer box in the top right corner
          group.position.set(
            window.innerWidth / 2 - 100,
            window.innerHeight / 2 - 100,
            0
          ); // Adjust padding as needed

          return group;
        };

        let timerMesh = createTimerText(60); // Start with 1 minute (60 seconds)
        timerScene.add(timerMesh);
        timerMeshRef.current = timerMesh;

        // Update timer mesh when time changes
        const updateTimer = (time: number) => {
          if (timerMeshRef.current) {
            timerScene.remove(timerMeshRef.current);
            timerMeshRef.current = createTimerText(time);
            timerScene.add(timerMeshRef.current);
          }
        };

        // Countdown logic
        let countdownTime = 60; // Start with 1 minute (60 seconds)
        const timerInterval = setInterval(() => {
          if (countdownTime > 0) {
            countdownTime -= 1; // Decrement the time
            updateTimer(countdownTime);
          } else {
            clearInterval(timerInterval); // Stop the timer when it reaches 0
          }
        }, 1000);

        return () => clearInterval(timerInterval);
      }
    );

    // Add fog
    scene.fog = new THREE.Fog(0x000000, 40, 40);

    // Add user
    const material = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      metalness: 0.1,
      roughness: 0.5,
    });

    // User geometry
    const headGeometry = new THREE.SphereGeometry(0.5, 32, 32);
    const head = new THREE.Mesh(headGeometry, material);
    head.position.y = 2;

    const bodyGeometry = new THREE.CylinderGeometry(0.5, 0.5, 1.5, 32);
    const body = new THREE.Mesh(bodyGeometry, material);

    const armGeometry = new THREE.CylinderGeometry(0.15, 0.15, 1, 32);
    const leftArm = new THREE.Mesh(armGeometry, material);
    leftArm.position.set(-0.75, 1.25, 0);
    leftArm.rotation.z = Math.PI / 4;

    const rightArm = new THREE.Mesh(armGeometry, material);
    rightArm.position.set(0.75, 1.25, 0);
    rightArm.rotation.z = -Math.PI / 4;

    const legGeometry = new THREE.CylinderGeometry(0.2, 0.2, 1, 32);
    const leftLeg = new THREE.Mesh(legGeometry, material);
    leftLeg.position.set(-0.3, -0.75, 0);

    const rightLeg = new THREE.Mesh(legGeometry, material);
    rightLeg.position.set(0.3, -0.75, 0);

    const user = new THREE.Group();
    user.add(head, body, leftArm, rightArm, leftLeg, rightLeg);
    user.position.set(0, 0, 0);
    scene.add(user);
    userRef.current = user;

    makeLine(scene, 1);

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
        scene.getObjectByName("gridPlane")!,
      ]);

      const isHovering = intersects.length > 0;
      if (isHovering) {
        scene.rotation.y = mouseRef.current.x * 0.5;
        scene.rotation.x = mouseRef.current.y * 0.5;
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
        mountRef.current.removeChild(renderer.domElement);
      }
      timerScene.clear();
      scene.clear();
    };
  }, []);

  useEffect(() => {
    if (!isUserAlive) {
      setTimeout(() => {
        navigate(`/exit?score=${currentLineCountRef.current}`);
      }, 500);
    }
  }, [isUserAlive, navigate]);
  return (
    <div className="relative w-full h-screen">
      <div ref={mountRef} className="w-full h-full" />
    </div>
  );
};

export default SurfaceWithUser;
