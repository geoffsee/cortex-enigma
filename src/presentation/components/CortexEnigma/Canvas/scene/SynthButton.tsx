import { useState } from 'react';
import { Text } from '@react-three/drei';

type SynthButtonProps = {
  label: string;
  position: [number, number, number];
  onClick: () => void;
  disabled?: boolean;
};

export function SynthButton({ label, position, onClick, disabled }: SynthButtonProps) {
  const [hovered, setHovered] = useState(false);
  const [pressed, setPressed] = useState(false);

  return (
    <group position={position}>
      {/* Recessed housing */}
      <mesh position={[0, 0, -0.02]}>
        <boxGeometry args={[1.05, 0.6, 0.06]} />
        <meshStandardMaterial color="#0a0610" metalness={0.7} roughness={0.5} />
      </mesh>
      {/* Button cap */}
      <mesh
        position={[0, 0, pressed ? 0.04 : 0.07]}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => { setHovered(false); setPressed(false); }}
        onPointerDown={() => setPressed(true)}
        onPointerUp={() => setPressed(false)}
        onClick={(e) => { e.stopPropagation(); if (!disabled) onClick(); }}
        castShadow
      >
        <boxGeometry args={[0.88, 0.44, 0.1]} />
        <meshStandardMaterial
          color={disabled ? "#222" : (hovered ? "#3a2045" : "#1a0a22")}
          emissive={disabled ? "#000" : "#a020f0"}
          emissiveIntensity={disabled ? 0 : (hovered ? 1.2 : 0.4)}
          metalness={0.7}
          roughness={0.35}
        />
      </mesh>
      <Text
        position={[0, 0, pressed ? 0.1 : 0.13]}
        fontSize={0.11}
        color={disabled ? "#444" : "white"}
        anchorX="center"
        anchorY="middle"
        letterSpacing={0.18}
      >
        {label}
      </Text>
    </group>
  );
}
