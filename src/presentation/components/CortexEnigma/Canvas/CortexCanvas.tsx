import type { MutableRefObject, Ref } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment } from '@react-three/drei';
import * as THREE from 'three';
import type { SelectionState } from '../../../../domain/types';
import type { DJTelemetry } from '../../../../application/djCockpit';
import { CortexCore } from './scene/CortexCore';
import { OutputPanel } from './scene/OutputPanel';
import { EQModule } from './scene/EQModule';
import { BackgroundStars } from './scene/BackgroundStars';
import { ReflectiveFloor } from './scene/ReflectiveFloor';
import { SceneEffects } from './scene/SceneEffects';

type OrbitHandle = { reset: () => void } | null;

type Props = {
  selections: SelectionState;
  onSelect: (cat: string, val: string) => void;
  prompt: string;
  onRandomize: () => void;
  onCopy: () => void;
  autoRotate: boolean;
  effectsEnabled: boolean;
  orbitRef: MutableRefObject<OrbitHandle>;
  telemetry: DJTelemetry;
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
  telemetry,
}: Props) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: '#030308' }}>
      <Canvas
        shadows
        dpr={[1, 1.5]}
        gl={{ antialias: false, alpha: false, stencil: false, depth: true }}
        style={{ background: '#030308' }}
        onCreated={({ gl, scene }) => {
          gl.setClearColor('#030308', 1);
          scene.background = new THREE.Color('#030308');
        }}
      >
        <color attach="background" args={['#030308']} />
        <PerspectiveCamera makeDefault position={[0, 0.55, 10.4]} fov={54} />
        <OrbitControls
          ref={orbitRef as unknown as Ref<never>}
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

        <CortexCore selections={selections} telemetry={telemetry} />
        <OutputPanel
          prompt={prompt}
          onRandomize={onRandomize}
          onCopy={onCopy}
          selections={selections}
          onSelect={onSelect}
          telemetry={telemetry}
        />
        <EQModule telemetry={telemetry} />
        <BackgroundStars />
        <ReflectiveFloor />

        <ambientLight intensity={0.12} />
        <pointLight position={[10, 10, 10]} intensity={2} color="#8800ff" />
        <pointLight position={[-10, -5, 5]} intensity={1.2} color="#00d4ff" />
        <pointLight position={[0, 6, 6]} intensity={1.4} color="#00ffff" />
        <pointLight position={[0, -3, 6]} intensity={1.0} color="#ff33cc" />

        <Environment preset="night" />
        <fog attach="fog" args={['#030308', 12, 28]} />

        <SceneEffects enabled={effectsEnabled} />
      </Canvas>
    </div>
  );
}
