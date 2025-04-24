import * as THREE from "three";

export const createAlienAvatar = (
  bodyColor: string,
  accessoryColor: string
) => {
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

export const createRobotAvatar = (
  bodyColor: string,
  accessoryColor: string
) => {
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

export const createHumanAvatar = (
  bodyColor: string,
  accessoryColor: string
) => {
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

export const createJokerAvatar = (
  bodyColor: string = "#9b59b6", // Default purple color
  accessoryColor: string = "#2ecc71" // Default green for hair
) => {
  const group = new THREE.Group();

  // Joker Head
  const headGeometry = new THREE.SphereGeometry(0.5, 32, 32);
  const headMaterial = new THREE.MeshStandardMaterial({
    color: bodyColor,
    roughness: 0.7,
  });
  const head = new THREE.Mesh(headGeometry, headMaterial);
  head.position.y = 2;

  // Joker's Cap
  const capGeometry = new THREE.ConeGeometry(0.6, 0.8, 32);
  const capMaterial = new THREE.MeshStandardMaterial({
    color: accessoryColor,
    roughness: 0.5,
  });
  const cap = new THREE.Mesh(capGeometry, capMaterial);
  cap.position.y = 2.65;
  cap.rotation.x = -0.2;

  // Red Nose
  const noseGeometry = new THREE.SphereGeometry(0.15, 16, 16);
  const noseMaterial = new THREE.MeshStandardMaterial({
    color: 0xff0000, // Red color for nose
    roughness: 0.3,
  });
  const nose = new THREE.Mesh(noseGeometry, noseMaterial);
  nose.position.set(0, 1.9, 0.45);

  // Joker Smile - curved line
  const smileGeometry = new THREE.TorusGeometry(0.25, 0.05, 16, 32, Math.PI);
  const smileMaterial = new THREE.MeshStandardMaterial({
    color: 0x000000,
  });
  const smile = new THREE.Mesh(smileGeometry, smileMaterial);
  smile.position.set(0, 1.7, 0.4);
  smile.rotation.x = -Math.PI / 2;

  // Body
  const bodyGeometry = new THREE.CylinderGeometry(0.3, 0.4, 1.5, 32);
  const body = new THREE.Mesh(bodyGeometry, headMaterial);
  body.position.y = 1;

  // Arms - these will be animated
  const armGeometry = new THREE.CylinderGeometry(0.12, 0.12, 1, 32);

  const leftArm = new THREE.Mesh(armGeometry, headMaterial);
  leftArm.position.set(-0.5, 1.25, 0);
  // Origin point for rotation at shoulder
  leftArm.geometry.translate(0, -0.4, 0);
  leftArm.name = "leftArm"; // Name for animation targeting

  const rightArm = new THREE.Mesh(armGeometry, headMaterial);
  rightArm.position.set(0.5, 1.25, 0);
  // Origin point for rotation at shoulder
  rightArm.geometry.translate(0, -0.4, 0);
  rightArm.name = "rightArm"; // Name for animation targeting

  // Legs
  const legGeometry = new THREE.CylinderGeometry(0.15, 0.15, 1, 32);
  const leftLeg = new THREE.Mesh(legGeometry, headMaterial);
  leftLeg.position.set(-0.25, 0.25, 0);

  const rightLeg = new THREE.Mesh(legGeometry, headMaterial);
  rightLeg.position.set(0.25, 0.25, 0);

  // Add everything to the group
  group.add(head, cap, nose, smile, body, leftArm, rightArm, leftLeg, rightLeg);

  // Setup animation for the joker's arms
  setupJokerAnimation(group);

  return group;
};

// Function to set up and start the animation
function setupJokerAnimation(jokerGroup: THREE.Group) {
  const leftArm = jokerGroup.getObjectByName("leftArm") as THREE.Mesh;
  const rightArm = jokerGroup.getObjectByName("rightArm") as THREE.Mesh;

  if (!leftArm || !rightArm) return;

  // Start values
  let time = 0;
  const armSpeed = 0.1;
  const armAmplitude = 0.5;

  // Animation function
  function animateJokerArms() {
    // Calculate arm movements using sine wave for smooth back-and-forth motion
    const leftArmRotation = Math.sin(time) * armAmplitude;
    const rightArmRotation = Math.sin(time + Math.PI) * armAmplitude; // Opposite movement

    // Apply rotations
    leftArm.rotation.x = leftArmRotation;
    rightArm.rotation.x = rightArmRotation;

    // Increment time
    time += armSpeed;

    // Continue animation loop
    requestAnimationFrame(animateJokerArms);
  }

  // Start the animation
  animateJokerArms();
}
