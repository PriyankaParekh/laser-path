import React from "react";
import CustomAvatar from "./CustomAvatar";

const AvatarExamples = () => {
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

  return (
    <>
      {avatarStyles.map((style, index) => (
        <CustomAvatar
          key={index}
          avatarStyle={style}
          position={{ x: index * 3, y: 0, z: 0 }} // Space avatars 3 units apart
        />
      ))}
    </>
  );
};

export default AvatarExamples;
