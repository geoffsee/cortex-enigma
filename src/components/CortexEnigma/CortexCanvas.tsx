import { Canvas, useFrame } from '@react-three/fiber';
import {
  OrbitControls,
  PerspectiveCamera,
  Environment,
  Float,
  MeshDistortMaterial,
  Text,
  ContactShadows,
  PointMaterial,
  Points,
} from '@react-three/drei';
import { EffectComposer, Bloom, Noise, Vignette } from '@react-three/postprocessing';
import { useState, useRef, useMemo, forwardRef } from 'react';
import * as THREE from 'three';
import { CATEGORIES } from '../../data/categories';

type SelectionState = {
  [key: string]: string;
  foundation: string;
};

type OrbitHandle = { reset: () => void } | null;

type Props = {
  selections: SelectionState;
  onSelect: (cat: string, val: string) => void;
  prompt: string;
  onRandomize: () => void;
  onCopy: () => void;
  autoRotate: boolean;
  effectsEnabled: boolean;
  orbitRef: React.MutableRefObject<OrbitHandle>;
};

export default function CortexCanvas({
  selections,
  onSelect,
  prompt,
  onRandomize,
  onCopy,
  autoRotate,
  effectsEnabled,
  orbitRef,
}: Props) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: '#030308' }}>
      <Canvas shadows gl={{ antialias: false, stencil: false, depth: true }}>
        <PerspectiveCamera makeDefault position={[0, 0.4, 10]} fov={55} />
        <OrbitControls
          ref={orbitRef as unknown as React.Ref<never>}
          enableZoom={true}
          enablePan={false}
          target={[0, 0, 0]}
          maxPolarAngle={Math.PI / 1.5}
          minPolarAngle={Math.PI / 3}
          maxAzimuthAngle={Math.PI / 4}
          minAzimuthAngle={-Math.PI / 4}
          autoRotate={autoRotate}
          autoRotateSpeed={0.6}
        />

        <Scene
          selections={selections}
          onSelect={onSelect}
          prompt={prompt}
          onRandomize={onRandomize}
          onCopy={onCopy}
        />

        <ambientLight intensity={0.12} />
        <pointLight position={[10, 10, 10]} intensity={2} color="#8800ff" />
        <pointLight position={[-10, -5, 5]} intensity={1.2} color="#00d4ff" />
        <pointLight position={[0, 6, 6]} intensity={1.4} color="#00ffff" />
        <pointLight position={[0, -3, 6]} intensity={1.0} color="#ff33cc" />

        <Environment preset="night" />
        <fog attach="fog" args={['#030308', 12, 28]} />

        {effectsEnabled && (
          <EffectComposer>
            <Bloom luminanceThreshold={1} mipmapBlur intensity={1.5} radius={0.4} />
            <Noise opacity={0.05} />
            <Vignette eskil={false} offset={0.1} darkness={1.1} />
          </EffectComposer>
        )}
      </Canvas>
    </div>
  );
}

function Scene({ selections, onSelect, prompt, onRandomize, onCopy }: {
  selections: SelectionState,
  onSelect: (cat: string, val: string) => void,
  prompt: string,
  onRandomize: () => void,
  onCopy: () => void
}) {
  const coreRef = useRef<THREE.Group>(null!);

  return (
    <>
      <CortexCore ref={coreRef} selections={selections} />

      {/* Analog synth control surface */}
      <OutputPanel
        prompt={prompt}
        onRandomize={onRandomize}
        onCopy={onCopy}
        selections={selections}
        onSelect={onSelect}
      />

      {/* Environment elements */}
      <BackgroundStars />
      <ReflectiveFloor />
    </>
  );
}

const CortexCore = forwardRef(({ selections }: { selections: SelectionState }, ref: React.ForwardedRef<THREE.Group>) => {
  const meshRef = useRef<THREE.Mesh>(null!);
  const activeCount = Object.values(selections).filter(Boolean).length;

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    meshRef.current.rotation.x = time * 0.2;
    meshRef.current.rotation.y = time * 0.3;
    meshRef.current.scale.setScalar(1 + Math.sin(time * 2) * 0.05 + activeCount * 0.08);
  });

  return (
    <group ref={ref} position={[0, 0.7, 0]}>
      <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
        <mesh ref={meshRef}>
          <sphereGeometry args={[1.1, 64, 64]} />
          <MeshDistortMaterial
            color="#a020f0"
            emissive="#a020f0"
            emissiveIntensity={2 + activeCount * 2}
            distort={0.4}
            speed={2}
            roughness={0}
            metalness={1}
          />
        </mesh>
      </Float>
      <pointLight intensity={10 + activeCount * 5} distance={20} color="#a020f0" />

      {/* Internal volumetric glow effect using point sprites */}
      <CoreGlow activeCount={activeCount} />
    </group>
  );
});

function CoreGlow({ activeCount }: { activeCount: number }) {
  const points = useMemo(() => {
    const p = new Float32Array(100 * 3);
    for (let i = 0; i < 100; i++) {
      // eslint-disable-next-line react-hooks/purity
      p[i * 3] = (Math.random() - 0.5) * 2.5;
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

function OutputPanel({ prompt, onRandomize, onCopy, selections, onSelect }: {
  prompt: string,
  onRandomize: () => void,
  onCopy: () => void,
  selections: SelectionState,
  onSelect: (cat: string, val: string) => void,
}) {
  const categoryKeys = Object.keys(CATEGORIES);
  const knobSpacing = 0.92;
  const knobStartX = -((categoryKeys.length - 1) * knobSpacing) / 2;

  // Chassis dimensions
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
                label={cat}
                valueLabel={value}
                valueIndex={idx}
                optionCount={options.length}
                onClick={() => {
                  if (idx < 0) {
                    onSelect(cat, options[0]);
                  } else if (idx === options.length - 1) {
                    onSelect(cat, options[idx]); // toggles off
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
            GENERATED PROMPT
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
            {prompt || "— SELECT OPTIONS —"}
          </Text>
        </group>

        {/* Action buttons — bottom-right section */}
        <group position={[2.75, -0.85, 0.12]}>
          <SynthButton label="RND" position={[-0.55, 0, 0]} onClick={onRandomize} />
          <SynthButton label="CPY" position={[0.55, 0, 0]} onClick={onCopy} disabled={!prompt} />
        </group>

        {/* Decorative screws at corners */}
        {[
          [-W / 2 + 0.18, H / 2 - 0.18],
          [W / 2 - 0.18, H / 2 - 0.18],
          [-W / 2 + 0.18, -H / 2 + 0.18],
          [W / 2 - 0.18, -H / 2 + 0.18],
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

function Knob({ position, label, valueLabel, valueIndex, optionCount, onClick }: {
  position: [number, number, number],
  label: string,
  valueLabel: string,
  valueIndex: number,
  optionCount: number,
  onClick: () => void,
}) {
  const knobRef = useRef<THREE.Group>(null!);
  const [hovered, setHovered] = useState(false);

  // Map -1 (off) and 0..N-1 to angles from 7 o'clock down to 5 o'clock (300° sweep)
  const positionIndex = valueIndex + 1; // 0 = off, 1..N = options
  const totalSteps = optionCount; // sweep divided into N steps from off to last option
  const fraction = positionIndex / totalSteps;
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

function SynthButton({ label, position, onClick, disabled }: {
  label: string,
  position: [number, number, number],
  onClick: () => void,
  disabled?: boolean,
}) {
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

function BackgroundStars() {
  const points = useMemo(() => {
    const p = new Float32Array(500 * 3);
    for (let i = 0; i < 500; i++) {
      // eslint-disable-next-line react-hooks/purity
      p[i * 3] = (Math.random() - 0.5) * 50;
      // eslint-disable-next-line react-hooks/purity
      p[i * 3 + 1] = (Math.random() - 0.5) * 50;
      // eslint-disable-next-line react-hooks/purity
      p[i * 3 + 2] = (Math.random() - 0.5) * 50;
    }
    return p;
  }, []);

  return (
    <Points positions={points}>
      <PointMaterial
        transparent
        color="white"
        size={0.02}
        sizeAttenuation={true}
        depthWrite={false}
        opacity={0.3}
      />
    </Points>
  );
}

function ReflectiveFloor() {
  return (
    <group position={[0, -4.4, 0]}>
      {/* Mirror floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[120, 120]} />
        <meshStandardMaterial
          color="#02020a"
          roughness={0.08}
          metalness={0.95}
        />
      </mesh>
      {/* TRON grid lines */}
      <gridHelper
        args={[80, 60, '#a020f0', '#00d4ff']}
        position={[0, 0.005, 0]}
      />
      <ContactShadows resolution={1024} scale={24} blur={2.2} opacity={0.55} far={10} color="#000000" />
    </group>
  );
}