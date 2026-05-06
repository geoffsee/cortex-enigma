import { useRef } from 'react';
import { Float, Text } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { DJTelemetry } from '../../../../../application/djCockpit';

export function EQModule({ telemetry }: { telemetry: DJTelemetry }) {
  const lowRef = useRef<THREE.Mesh>(null);
  const midRef = useRef<THREE.Mesh>(null);
  const highRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    const base = 0.5 + telemetry.crowdHeat * 0.12;
    if (lowRef.current) lowRef.current.scale.y = base + Math.sin(t * 2.1) * 0.25;
    if (midRef.current) midRef.current.scale.y = base + Math.sin(t * 2.8 + 0.7) * 0.25;
    if (highRef.current) highRef.current.scale.y = base + Math.sin(t * 3.6 + 1.4) * 0.25;
  });

  return (
    <group position={[4.95, -2.22, 3.05]} rotation={[-Math.PI / 9, 0, 0]}>
      <Float speed={0.9} rotationIntensity={0.01} floatIntensity={0.03}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[1.55, 1.7, 0.2]} />
          <meshStandardMaterial color="#0a0612" metalness={0.85} roughness={0.4} />
        </mesh>
        <mesh position={[0, 0.8, 0.11]}>
          <boxGeometry args={[1.55, 0.05, 0.03]} />
          <meshStandardMaterial color="#a020f0" emissive="#a020f0" emissiveIntensity={0.45} />
        </mesh>
        <Text position={[0, 0.58, 0.115]} fontSize={0.08} color="#d8a8ff" anchorX="center" anchorY="middle">
          EQ MODULE
        </Text>
        {[
          { label: 'LOW', x: -0.45, ref: lowRef },
          { label: 'MID', x: 0, ref: midRef },
          { label: 'HIGH', x: 0.45, ref: highRef },
        ].map((band) => (
          <group key={band.label} position={[band.x, 0.02, 0.11]}>
            <mesh position={[0, -0.06, 0]}>
              <boxGeometry args={[0.24, 0.85, 0.02]} />
              <meshBasicMaterial color="#1a1030" transparent opacity={0.9} />
            </mesh>
            <mesh ref={band.ref} position={[0, -0.24, 0.01]} scale={[1, 0.8, 1]}>
              <boxGeometry args={[0.16, 0.42, 0.02]} />
              <meshBasicMaterial color="#9d4edd" />
            </mesh>
            <Text position={[0, -0.62, 0.01]} fontSize={0.05} color="#8c7aa0" anchorX="center" anchorY="middle">
              {band.label}
            </Text>
          </group>
        ))}
      </Float>
    </group>
  );
}
