import type { MutableRefObject, Ref } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment } from '@react-three/drei';
import type { SelectionState } from '../../../../domain/types';
import { CortexCore } from './scene/CortexCore';
import { OutputPanel } from './scene/OutputPanel';
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

        <CortexCore selections={selections} />
        <OutputPanel
          prompt={prompt}
          onRandomize={onRandomize}
          onCopy={onCopy}
          selections={selections}
          onSelect={onSelect}
        />
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
