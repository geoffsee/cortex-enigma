import { ContactShadows } from '@react-three/drei';

export function ReflectiveFloor() {
  return (
    <group position={[0, -4.4, 0]}>
      {/* Mirror floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[120, 120]} />
        <meshStandardMaterial color="#02020a" roughness={0.08} metalness={0.95} />
      </mesh>
      {/* TRON grid lines */}
      <gridHelper args={[80, 60, '#a020f0', '#00d4ff']} position={[0, 0.005, 0]} />
      <ContactShadows resolution={1024} scale={24} blur={2.2} opacity={0.55} far={10} color="#000000" />
    </group>
  );
}
