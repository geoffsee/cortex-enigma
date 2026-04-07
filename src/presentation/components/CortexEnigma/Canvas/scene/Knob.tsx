import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import * as THREE from 'three';

type KnobProps = {
  position: [number, number, number];
  label: string;
  valueLabel: string;
  valueIndex: number;
  optionCount: number;
  onClick: () => void;
};

export function Knob({ position, label, valueLabel, valueIndex, optionCount, onClick }: KnobProps) {
  const knobRef = useRef<THREE.Group>(null!);
  const [hovered, setHovered] = useState(false);

  // Map -1 (off) and 0..N-1 to angles from 7 o'clock to 5 o'clock (300° sweep)
  const positionIndex = valueIndex + 1; // 0 = off, 1..N = options
  const fraction = positionIndex / optionCount;
  const targetAngle = (5 / 6 - fraction * (10 / 6)) * Math.PI;

  useFrame(() => {
    if (knobRef.current) {
      knobRef.current.rotation.z = THREE.MathUtils.lerp(
        knobRef.current.rotation.z,
        targetAngle,
        0.18
      );
    }
  });

  const isOn = valueIndex >= 0;

  return (
    <group position={position}>
      {/* Recessed mounting ring */}
      <mesh position={[0, 0, -0.01]}>
        <ringGeometry args={[0.34, 0.44, 32]} />
        <meshStandardMaterial
          color={isOn ? "#a020f0" : "#1a1018"}
          emissive={isOn ? "#a020f0" : "#000"}
          emissiveIntensity={isOn ? 0.7 : 0}
          metalness={0.85}
          roughness={0.3}
        />
      </mesh>

      {/* Tick marks around the knob */}
      {Array.from({ length: optionCount + 1 }).map((_, i) => {
        const a = (5 / 6 - (i / optionCount) * (10 / 6)) * Math.PI;
        const tx = -Math.sin(a) * 0.48;
        const ty = Math.cos(a) * 0.48;
        const lit = i <= positionIndex && isOn;
        return (
          <mesh key={i} position={[tx, ty, 0]} rotation={[0, 0, a]}>
            <boxGeometry args={[0.018, 0.06, 0.005]} />
            <meshStandardMaterial
              color="#555"
              emissive={lit ? "#a020f0" : "#000"}
              emissiveIntensity={lit ? 2 : 0}
            />
          </mesh>
        );
      })}

      {/* Rotating knob group */}
      <group ref={knobRef}>
        {/* Knob cylinder body */}
        <mesh
          rotation={[Math.PI / 2, 0, 0]}
          onPointerOver={() => setHovered(true)}
          onPointerOut={() => setHovered(false)}
          onClick={(e) => { e.stopPropagation(); onClick(); }}
          castShadow
        >
          <cylinderGeometry args={[0.32, 0.34, 0.2, 32]} />
          <meshStandardMaterial
            color={hovered ? "#3a2a40" : "#1a1018"}
            metalness={0.92}
            roughness={0.28}
          />
        </mesh>
        {/* Knurled top cap */}
        <mesh position={[0, 0, 0.1]}>
          <circleGeometry args={[0.32, 32]} />
          <meshStandardMaterial
            color={hovered ? "#4a3550" : "#251830"}
            metalness={0.88}
            roughness={0.42}
          />
        </mesh>
        {/* Indicator pointer */}
        <mesh position={[0, 0.22, 0.11]}>
          <boxGeometry args={[0.04, 0.16, 0.02]} />
          <meshStandardMaterial
            color="#fff"
            emissive={isOn ? "#ff77ff" : "#888"}
            emissiveIntensity={isOn ? 4 : 0.6}
          />
        </mesh>
      </group>

      {/* Label below */}
      <Text
        position={[0, -0.62, 0.01]}
        fontSize={0.085}
        color="#9b7bb0"
        anchorX="center"
        anchorY="middle"
        letterSpacing={0.12}
      >
        {label}
      </Text>

      {/* Value above */}
      {isOn && (
        <Text
          position={[0, 0.62, 0.01]}
          fontSize={0.062}
          color="#e0b0ff"
          anchorX="center"
          anchorY="middle"
          letterSpacing={0.06}
        >
          {valueLabel.toUpperCase()}
        </Text>
      )}
    </group>
  );
}
