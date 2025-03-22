// src/components/ui/avatar.tsx
import React from "react";

interface AvatarProps {
  src: string;
  alt: string;
  size?: string;
}

const Avatar: React.FC<AvatarProps> = ({ src, alt, size = "40px" }) => {
  return (
    <img
      src={src}
      alt={alt}
      style={{ width: size, height: size, borderRadius: "50%" }}
    />
  );
};

export { Avatar };
