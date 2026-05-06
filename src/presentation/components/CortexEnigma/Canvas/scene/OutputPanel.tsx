import { Float, Text } from '@react-three/drei';
import { CATEGORIES } from '../../../../../domain/categories';
import type { SelectionState } from '../../../../../domain/types';
import { DJ_CATEGORY_LABELS, type DJTelemetry } from '../../../../../application/djCockpit';
import { Knob } from './Knob';
import { SynthButton } from './SynthButton';

type OutputPanelProps = {
  prompt: string;
  onRandomize: () => void;
  onCopy: () => void;
  selections: SelectionState;
  onSelect: (cat: string, val: string) => void;
  telemetry: DJTelemetry;
};

export function OutputPanel({ prompt, onRandomize, onCopy, selections, onSelect, telemetry }: OutputPanelProps) {
  const categoryKeys = Object.keys(CATEGORIES);
  const knobSpacing = 0.92;
  const knobStartX = -((categoryKeys.length - 1) * knobSpacing) / 2;

  const W = 8.6;
  const H = 2.5;

  return (
    <group position={[0, -2.4, 3.2]} rotation={[-Math.PI / 9, 0, 0]}>
      <Float speed={0.8} rotationIntensity={0.02} floatIntensity={0.04}>
        {/* Faceplate body — brushed metal chassis */}
        <mesh castShadow receiveShadow>
          <boxGeometry args={[W, H, 0.22]} />
          <meshStandardMaterial color="#0a0612" metalness={0.85} roughness={0.4} />
        </mesh>

        {/* Top + bottom glow rails */}
        <mesh position={[0, H / 2 - 0.06, 0.13]}>
          <boxGeometry args={[W, 0.06, 0.04]} />
          <meshStandardMaterial
            color="#a020f0"
            emissive="#a020f0"
            emissiveIntensity={0.55}
            metalness={0.9}
            roughness={0.2}
          />
        </mesh>
        <mesh position={[0, -H / 2 + 0.06, 0.13]}>
          <boxGeometry args={[W, 0.06, 0.04]} />
          <meshStandardMaterial
            color="#a020f0"
            emissive="#a020f0"
            emissiveIntensity={0.55}
            metalness={0.9}
            roughness={0.2}
          />
        </mesh>

        {/* Brand silkscreen */}
        <Text
          position={[-W / 2 + 0.25, H / 2 - 0.18, 0.12]}
          fontSize={0.1}
          color="#d8a8ff"
          anchorX="left"
          anchorY="middle"
          letterSpacing={0.2}
        >
          CORTEX·ENIGMA
        </Text>
        <Text
          position={[W / 2 - 0.25, H / 2 - 0.18, 0.12]}
          fontSize={0.07}
          color="#5a4060"
          anchorX="right"
          anchorY="middle"
          letterSpacing={0.18}
        >
          MODEL CTX-8
        </Text>

        {/* Knob row */}
        <group position={[0, 0.42, 0.12]}>
          {categoryKeys.map((cat, i) => {
            const x = knobStartX + i * knobSpacing;
            const options = CATEGORIES[cat];
            const value = selections[cat];
            const idx = value ? options.indexOf(value) : -1;
            return (
              <Knob
                key={cat}
                position={[x, 0, 0]}
                label={DJ_CATEGORY_LABELS[cat] ?? cat}
                valueLabel={value}
                valueIndex={idx}
                optionCount={options.length}
                onClick={() => {
                  if (idx < 0) {
                    onSelect(cat, options[0]);
                  } else if (idx === options.length - 1) {
                    onSelect(cat, options[idx]);
                  } else {
                    onSelect(cat, options[idx + 1]);
                  }
                }}
              />
            );
          })}
        </group>

        {/* Display screen — bottom-left section */}
        <group position={[-1.85, -0.85, 0.12]}>
          {/* Bezel */}
          <mesh position={[0, 0, -0.005]}>
            <planeGeometry args={[4.3, 0.7]} />
            <meshStandardMaterial color="#0a0510" metalness={0.7} roughness={0.4} />
          </mesh>
          {/* Screen */}
          <mesh>
            <planeGeometry args={[4.15, 0.58]} />
            <meshStandardMaterial
              color="#01040a"
              emissive="#001428"
              emissiveIntensity={0.7}
              metalness={0.3}
              roughness={0.7}
            />
          </mesh>
          {/* Inner glow */}
          <mesh position={[0, 0, 0.001]}>
            <planeGeometry args={[4.15, 0.58]} />
            <meshBasicMaterial color="#0088ff" transparent opacity={0.06} />
          </mesh>
          <Text
            position={[-2.0, 0.21, 0.01]}
            fontSize={0.055}
            color="#0aa6ff"
            anchorX="left"
            anchorY="middle"
            letterSpacing={0.2}
          >
            DJ RECOMMENDATION
          </Text>
          <Text
            position={[0, -0.04, 0.01]}
            fontSize={0.085}
            maxWidth={3.95}
            textAlign="center"
            color="#7fd0ff"
            anchorX="center"
            anchorY="middle"
          >
            {`${telemetry.recommendation}${prompt ? ` | ${prompt}` : ''}` || "— ARM NEXT TRANSITION —"}
          </Text>
        </group>

        {/* Action buttons — bottom-right section */}
        <group position={[2.75, -1.1, 0.12]}>
          <SynthButton label="RND" position={[-0.55, 0, 0]} onClick={onRandomize} />
          <SynthButton label="CPY" position={[0.55, 0, 0]} onClick={onCopy} disabled={!prompt} />
        </group>

        {/* Decorative screws at corners */}
        {[
          [-W / 2 + 0.18,  H / 2 - 0.18],
          [ W / 2 - 0.18,  H / 2 - 0.18],
          [-W / 2 + 0.18, -H / 2 + 0.18],
          [ W / 2 - 0.18, -H / 2 + 0.18],
        ].map(([sx, sy], i) => (
          <group key={i} position={[sx, sy, 0.12]}>
            <mesh>
              <cylinderGeometry args={[0.05, 0.05, 0.025, 16]} />
              <meshStandardMaterial color="#777" metalness={0.95} roughness={0.3} />
            </mesh>
            <mesh position={[0, 0, 0.015]} rotation={[Math.PI / 2, 0, Math.PI / 4]}>
              <boxGeometry args={[0.08, 0.012, 0.005]} />
              <meshStandardMaterial color="#222" metalness={0.5} roughness={0.6} />
            </mesh>
          </group>
        ))}
      </Float>
    </group>
  );
}
