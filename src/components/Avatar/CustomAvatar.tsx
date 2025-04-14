import React, { useEffect, useRef } from "react";
import * as THREE from "three";

interface AvatarProps {
  avatarStyle: {
    bodyColor: string;
    accessoryColor: string;
    type: any;
    scale?: number;
  };
  position?: { x: number; y: number; z: number };
}

const CustomAvatar = ({
  avatarStyle,
  position = { x: 0, y: 0, z: 0 },
}: AvatarProps) => {
  const avatarRef = useRef<THREE.Group | null>(null);

  const createRobotAvatar = (bodyColor: string, accessoryColor: string) => {
    const group = new THREE.Group();

    // Robot Head
    const headGeometry = new THREE.BoxGeometry(0.8, 0.8, 0.8);
    const headMaterial = new THREE.MeshPhongMaterial({
      color: bodyColor,
      //@ts-ignore
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

  const createHumanAvatar = (bodyColor: string, accessoryColor: string) => {
    const group = new THREE.Group();

    // Human Head
    const headGeometry = new THREE.SphereGeometry(0.5, 32, 32);
    const headMaterial = new THREE.MeshPhongMaterial({
      color: bodyColor,
      //@ts-ignore

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
    const hairMaterial = new THREE.MeshPhongMaterial({
      color: accessoryColor,
      //@ts-ignore

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

  const createAlienAvatar = (bodyColor: string, accessoryColor: string) => {
    const group = new THREE.Group();

    // Alien Head (elongated)
    const headGeometry = new THREE.SphereGeometry(0.4, 32, 32);
    const headMaterial = new THREE.MeshPhongMaterial({
      color: bodyColor,
      //@ts-ignore

      metalness: 0.3,
      roughness: 0.7,
    });
    const head = new THREE.Mesh(headGeometry, headMaterial);
    head.scale.y = 1.5;
    head.position.y = 2.2;

    // Large Alien Eyes
    const eyeGeometry = new THREE.SphereGeometry(0.15, 32, 32);
    const eyeMaterial = new THREE.MeshPhongMaterial({
      color: accessoryColor,
      //@ts-ignore

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
    if (avatarRef.current) {
      // Remove existing avatar if it exists
      const parent = avatarRef.current.parent;
      if (parent) {
        parent.remove(avatarRef.current);
      }
    }

    // Create new avatar based on style
    let avatar;
    switch (avatarStyle.type) {
      case "robot":
        avatar = createRobotAvatar(
          avatarStyle.bodyColor,
          avatarStyle.accessoryColor
        );
        break;
      case "human":
        avatar = createHumanAvatar(
          avatarStyle.bodyColor,
          avatarStyle.accessoryColor
        );
        break;
      case "alien":
        avatar = createAlienAvatar(
          avatarStyle.bodyColor,
          avatarStyle.accessoryColor
        );
        break;
      default:
        avatar = createHumanAvatar(
          avatarStyle.bodyColor,
          avatarStyle.accessoryColor
        );
    }

    // Apply scale if provided
    if (avatarStyle.scale) {
      avatar.scale.set(avatarStyle.scale, avatarStyle.scale, avatarStyle.scale);
    }

    // Set position
    avatar.position.set(position.x, position.y, position.z);

    avatarRef.current = avatar;
  }, [avatarStyle, position]);

  return null;
};

export default CustomAvatar;
