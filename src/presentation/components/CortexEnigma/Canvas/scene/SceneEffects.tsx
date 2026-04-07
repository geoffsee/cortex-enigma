import { EffectComposer, Bloom, Noise, Vignette } from '@react-three/postprocessing';

export function SceneEffects({ enabled }: { enabled: boolean }) {
  if (!enabled) return null;
  return (
    <EffectComposer>
      <Bloom luminanceThreshold={1} mipmapBlur intensity={1.5} radius={0.4} />
      <Noise opacity={0.05} />
      <Vignette eskil={false} offset={0.1} darkness={1.1} />
    </EffectComposer>
  );
}
