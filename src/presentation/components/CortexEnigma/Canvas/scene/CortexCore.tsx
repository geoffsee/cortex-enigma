import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float, MeshDistortMaterial, Points, PointMaterial } from '@react-three/drei';
import * as THREE from 'three';
import type { SelectionState } from '../../../../../domain/types';
import type { DJTelemetry } from '../../../../../application/djCockpit';

function CoreGlow({ activeCount }: { activeCount: number }) {
  const points = useMemo(() => {
    const p = new Float32Array(100 * 3);
    for (let i = 0; i < 100; i++) {
      // eslint-disable-next-line react-hooks/purity
      p[i * 3]     = (Math.random() - 0.5) * 2.5;
      // eslint-disable-next-line react-hooks/purity
      p[i * 3 + 1] = (Math.random() - 0.5) * 2.5;
      // eslint-disable-next-line react-hooks/purity
      p[i * 3 + 2] = (Math.random() - 0.5) * 2.5;
    }
    return p;
  }, []);

  return (
    <Points positions={points}>
      <PointMaterial
        transparent
        vertexColors={false}
        color="#e0b0ff"
        size={0.05 + activeCount * 0.01}
        sizeAttenuation={true}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </Points>
  );
}

export function CortexCore({ selections, telemetry }: { selections: SelectionState; telemetry: DJTelemetry }) {
  const meshRef = useRef<THREE.Mesh>(null!);
  const activeCount = Object.values(selections).filter(Boolean).length;
  const coreColor =
    telemetry.objective === "rain"
      ? "#d946ef"
      : telemetry.objective === "peak"
        ? "#c026d3"
        : "#a020f0";

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    meshRef.current.rotation.x = time * 0.2;
    meshRef.current.rotation.y = time * 0.3;
    meshRef.current.scale.setScalar(1 + Math.sin(time * 2) * 0.05 + activeCount * 0.08);
  });

  return (
    <group position={[0, 0.7, 0]}>
      <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
        <mesh ref={meshRef}>
          <sphereGeometry args={[1.1, 64, 64]} />
          <MeshDistortMaterial
            color={coreColor}
            emissive={coreColor}
            emissiveIntensity={2 + activeCount * 2 + telemetry.crowdHeat * 0.4}
            distort={0.4}
            speed={2}
            roughness={0}
            metalness={1}
          />
        </mesh>
      </Float>
      <pointLight intensity={10 + activeCount * 5} distance={20} color={coreColor} />
      <CoreGlow activeCount={activeCount} />
    </group>
  );
}
