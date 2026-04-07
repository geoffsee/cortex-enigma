import { Canvas, useFrame } from '@react-three/fiber';
import { 
  OrbitControls, 
  PerspectiveCamera, 
  Environment, 
  Float, 
  MeshDistortMaterial, 
  Text, 
  MeshTransmissionMaterial, 
  ContactShadows, 
  PointMaterial,
  Points,
  QuadraticBezierLine
} from '@react-three/drei';
import { EffectComposer, Bloom, Noise, Vignette } from '@react-three/postprocessing';
import { useState, useRef, useMemo, forwardRef } from 'react';
import * as THREE from 'three';
import { CATEGORIES } from '../../data/categories';

const TIER_1 = ["MEDIUM", "METHOD", "SUBJECT", "STYLE"];
const TIER_2 = ["ELEMENTS", "FUNCTION", "CONTEXT", "HISTORY"];

interface SelectionState {
  [key: string]: string;
}

export default function CortexTwister() {
  const [selections, setSelections] = useState<SelectionState>({
    MEDIUM: "", METHOD: "", SUBJECT: "", STYLE: "",
    ELEMENTS: "", FUNCTION: "", CONTEXT: "", HISTORY: "",
  });

  const prompt = useMemo(() => {
    return [
      selections.HISTORY,
      selections.STYLE,
      selections.ELEMENTS,
      selections.FUNCTION,
      selections.SUBJECT,
      selections.MEDIUM,
      selections.METHOD ? `made via ${selections.METHOD}` : "",
      selections.CONTEXT ? `in a ${selections.CONTEXT} context` : "",
    ].filter(Boolean).join(", ");
  }, [selections]);

  const handleSelect = (category: string, value: string) => {
    setSelections(prev => ({
      ...prev,
      [category]: prev[category] === value ? "" : value
    }));
  };

  const randomize = () => {
    const newSelections: SelectionState = {};
    Object.keys(CATEGORIES).forEach(cat => {
      const options = CATEGORIES[cat];
      newSelections[cat] = options[Math.floor(Math.random() * options.length)];
    });
    setSelections(newSelections);
  };

  const copyToClipboard = () => {
    if (prompt) navigator.clipboard.writeText(prompt);
  };

  return (
    <div style={{ width: '100vw', height: '100vh', background: '#050505' }}>
      <Canvas shadows gl={{ antialias: false, stencil: false, depth: true }}>
        <PerspectiveCamera makeDefault position={[0, 0, 10]} fov={45} />
        <OrbitControls 
          enableZoom={true} 
          enablePan={false} 
          maxPolarAngle={Math.PI / 1.5} 
          minPolarAngle={Math.PI / 2.5}
          maxAzimuthAngle={Math.PI / 4}
          minAzimuthAngle={-Math.PI / 4}
        />
        
        <Scene 
          selections={selections} 
          onSelect={handleSelect} 
          prompt={prompt} 
          onRandomize={randomize} 
          onCopy={copyToClipboard} 
        />
        
        <ambientLight intensity={0.1} />
        <pointLight position={[10, 10, 10]} intensity={2} color="#8800ff" />
        <pointLight position={[-10, -5, 5]} intensity={1} color="#0088ff" />
        
        <Environment preset="night" />
        <fog attach="fog" args={['#050505', 10, 25]} />

        <EffectComposer>
          <Bloom luminanceThreshold={1} mipmapBlur intensity={1.5} radius={0.4} />
          <Noise opacity={0.05} />
          <Vignette eskil={false} offset={0.1} darkness={1.1} />
        </EffectComposer>
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
      
      {/* Tier 1 - Primary interaction (closest) */}
      <PanelGroup 
        categories={TIER_1} 
        tier={1} 
        radius={7} 
        selections={selections} 
        onSelect={onSelect} 
        arcWidth={110}
        coreRef={coreRef}
      />
      
      {/* Tier 2 - Secondary interaction (recessed) */}
      <PanelGroup 
        categories={TIER_2} 
        tier={2} 
        radius={9} 
        selections={selections} 
        onSelect={onSelect} 
        arcWidth={130}
        coreRef={coreRef}
      />

      {/* Tier 3 - Output */}
      <OutputPanel prompt={prompt} onRandomize={onRandomize} onCopy={onCopy} />

      {/* Environment elements */}
      <BackgroundStars />
      <ReflectiveFloor />
    </>
  );
}

const CortexCore = forwardRef(({ selections }: { selections: SelectionState }, ref: any) => {
  const meshRef = useRef<THREE.Mesh>(null!);
  const activeCount = Object.values(selections).filter(Boolean).length;
  
  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    meshRef.current.rotation.x = time * 0.2;
    meshRef.current.rotation.y = time * 0.3;
    meshRef.current.scale.setScalar(1 + Math.sin(time * 2) * 0.05 + activeCount * 0.08);
  });

  return (
    <group ref={ref} position={[0, 0, 0]}>
      <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
        <mesh ref={meshRef}>
          <sphereGeometry args={[1.2, 64, 64]} />
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
      p[i * 3] = (Math.random() - 0.5) * 2.5;
      p[i * 3 + 1] = (Math.random() - 0.5) * 2.5;
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

function PanelGroup({ categories, radius, selections, onSelect, arcWidth, coreRef }: any) {
  return (
    <group>
      {categories.map((cat: string, i: number) => {
        const total = categories.length;
        const angle = ((i / (total - 1)) - 0.5) * (arcWidth * Math.PI / 180);
        const x = Math.sin(angle) * radius;
        const z = Math.cos(angle) * radius - radius;
        const y = 0;

        return (
          <UIPanel 
            key={cat}
            category={cat}
            position={[x, y, z]}
            rotation={[0, -angle, 0]}
            options={CATEGORIES[cat]}
            selectedOption={selections[cat]}
            onSelect={(val: string) => onSelect(cat, val)}
            coreRef={coreRef}
          />
        );
      })}
    </group>
  );
}

function UIPanel({ category, position, rotation, options, selectedOption, onSelect, coreRef }: any) {
  const [hovered, setHovered] = useState(false);
  const panelRef = useRef<THREE.Group>(null!);
  
  useFrame(() => {
    const targetZ = hovered ? 0.3 : 0;
    panelRef.current.position.z = THREE.MathUtils.lerp(panelRef.current.position.z, targetZ, 0.1);
  });

  return (
    <group position={position} rotation={rotation}>
      <group ref={panelRef}>
        <Float speed={1.5} rotationIntensity={0.05} floatIntensity={0.1}>
          {/* Panel Background - Subtly curved cylinder segment for better XR readability */}
          <mesh 
            onPointerOver={() => setHovered(true)} 
            onPointerOut={() => setHovered(false)}
          >
            <cylinderGeometry args={[10, 10, 4.5, 32, 1, true, -Math.PI / 2 - 0.14, 0.28]} />
            <MeshTransmissionMaterial
              backside
              samples={16}
              thickness={0.2}
              roughness={0.1}
              transmission={0.9}
              ior={1.3}
              chromaticAberration={0.05}
              anisotropy={0.1}
              clearcoat={1}
              attenuationDistance={0.5}
              attenuationColor="#ffffff"
              color={hovered ? "#222" : "#0a0a0a"}
            />
          </mesh>
          
          {/* Border Glow */}
          <mesh position={[0, 0, -0.01]}>
            <planeGeometry args={[2.85, 4.55]} />
            <meshBasicMaterial color="#a020f0" transparent opacity={hovered ? 0.2 : 0.05} />
          </mesh>
          
          {/* Category Label */}
          <Text
            position={[0, 2, 0.05]}
            fontSize={0.2}
            color="white"
            anchorX="center"
            anchorY="middle"
            letterSpacing={0.1}
          >
            {category}
          </Text>

          {/* Options */}
          <group position={[0, 1.5, 0.1]}>
            {options.map((option: string, i: number) => (
              <OptionItem 
                key={option}
                label={option}
                position={[0, -i * 0.35, 0]}
                isSelected={selectedOption === option}
                onClick={() => onSelect(option)}
              />
            ))}
          </group>
        </Float>
      </group>

      {/* Animated Connection to Core */}
      {selectedOption && <Connection coreRef={coreRef} />}
    </group>
  );
}

function OptionItem({ label, position, isSelected, onClick }: any) {
  const [hovered, setHovered] = useState(false);
  const meshRef = useRef<THREE.Group>(null!);

  useFrame(() => {
    const targetZ = isSelected ? 0.2 : (hovered ? 0.1 : 0);
    meshRef.current.position.z = THREE.MathUtils.lerp(meshRef.current.position.z, targetZ, 0.2);
  });
  
  return (
    <group ref={meshRef} position={position} onClick={(e) => { e.stopPropagation(); onClick(); }}>
      <mesh onPointerOver={() => setHovered(true)} onPointerOut={() => setHovered(false)}>
        <planeGeometry args={[2.5, 0.3]} />
        <meshStandardMaterial 
          transparent 
          opacity={isSelected ? 0.4 : (hovered ? 0.2 : 0.05)} 
          color={isSelected ? "#a020f0" : "white"} 
          emissive={isSelected ? "#a020f0" : "#000"}
          emissiveIntensity={isSelected ? 2 : 0}
        />
      </mesh>
      <Text
        position={[0, 0, 0.02]}
        fontSize={0.14}
        color={isSelected ? "white" : (hovered ? "white" : "#ccc")}
        anchorX="center"
        anchorY="middle"
      >
        {label.toUpperCase()}
      </Text>
      {isSelected && (
        <mesh position={[-1.2, 0, 0.02]}>
           <boxGeometry args={[0.04, 0.2, 0.04]} />
           <meshStandardMaterial color="#a020f0" emissive="#a020f0" emissiveIntensity={5} />
        </mesh>
      )}
    </group>
  );
}

function Connection({ coreRef }: { coreRef: any }) {
  const lineRef = useRef<any>(null!);
  const [targetPos] = useState(() => new THREE.Vector3(0, 0, 0));

  useFrame((state) => {
    if (coreRef.current) {
      targetPos.setFromMatrixPosition(coreRef.current.matrixWorld);
    }
    const time = state.clock.getElapsedTime();
    if (lineRef.current) {
       lineRef.current.material.dashOffset = -time * 2;
    }
  });

  return (
    <QuadraticBezierLine
      ref={lineRef}
      start={[0,0,0]} // Local to panel
      end={new THREE.Vector3().copy(targetPos).applyMatrix4(new THREE.Matrix4().copy(lineRef.current?.parent?.matrixWorld || new THREE.Matrix4()).invert())}
      mid={[0, 2, -2]}
      color="#a020f0"
      lineWidth={1}
      transparent
      opacity={0.5}
      dashed
      dashScale={5}
      dashSize={0.5}
      gapSize={0.2}
    />
  );
}

function OutputPanel({ prompt, onRandomize, onCopy }: { prompt: string, onRandomize: () => void, onCopy: () => void }) {
  return (
    <group position={[0, -3.5, 3]} rotation={[-Math.PI / 10, 0, 0]}>
      <Float speed={1} rotationIntensity={0.05} floatIntensity={0.1}>
        <mesh>
          <planeGeometry args={[8, 2]} />
          <MeshTransmissionMaterial
            thickness={0.2}
            roughness={0.2}
            transmission={0.9}
            color="#000"
            metalness={0.5}
          />
        </mesh>
        
        {/* Glow edge */}
        <mesh position={[0, 0, -0.01]}>
           <planeGeometry args={[8.1, 2.1]} />
           <meshBasicMaterial color="#0088ff" transparent opacity={0.1} />
        </mesh>

        <Text
          position={[0, 0.6, 0.1]}
          fontSize={0.12}
          color="#888"
          anchorX="center"
          letterSpacing={0.2}
        >
          GENERATED PROMPT
        </Text>
        <Text
          position={[0, -0.1, 0.1]}
          fontSize={0.18}
          maxWidth={7.5}
          textAlign="center"
          color="white"
          anchorX="center"
        >
          {prompt || "SELECT OPTIONS TO GENERATE A PROMPT..."}
        </Text>

        <group position={[0, -1.2, 0.1]}>
           <ActionButton label="RANDOMIZE" position={[-1.5, 0, 0]} onClick={onRandomize} />
           <ActionButton label="COPY TO CLIPBOARD" position={[1.5, 0, 0]} onClick={onCopy} disabled={!prompt} />
        </group>
      </Float>
    </group>
  );
}

function ActionButton({ label, position, onClick, disabled }: any) {
  const [hovered, setHovered] = useState(false);
  return (
    <group position={position} onClick={(e) => { e.stopPropagation(); if (!disabled) onClick(); }}>
       <mesh onPointerOver={() => setHovered(true)} onPointerOut={() => setHovered(false)}>
          <planeGeometry args={[2.5, 0.4]} />
          <meshStandardMaterial 
            color={disabled ? "#222" : (hovered ? "#333" : "#111")} 
            transparent 
            opacity={0.8}
            metalness={0.8}
            roughness={0.2}
          />
       </mesh>
       <mesh position={[0, 0, -0.01]}>
          <planeGeometry args={[2.55, 0.45]} />
          <meshBasicMaterial color={disabled ? "#111" : "#a020f0"} transparent opacity={hovered ? 0.8 : 0.3} />
       </mesh>
       <Text
          position={[0, 0, 0.05]}
          fontSize={0.12}
          color={disabled ? "#444" : "white"}
          anchorX="center"
          anchorY="middle"
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
      p[i * 3] = (Math.random() - 0.5) * 50;
      p[i * 3 + 1] = (Math.random() - 0.5) * 50;
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
    <group position={[0, -6, 0]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[100, 100]} />
        <meshStandardMaterial 
          color="#050505" 
          roughness={0.05} 
          metalness={0.9}
        />
      </mesh>
      <ContactShadows resolution={1024} scale={20} blur={2} opacity={0.5} far={10} color="#000000" />
    </group>
  );
}
