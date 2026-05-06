import { useEffect, useState } from 'react';
import { useThree } from '@react-three/fiber';
import { EffectComposer, Bloom, Noise, Vignette } from '@react-three/postprocessing';

export function SceneEffects({ enabled }: { enabled: boolean }) {
  const gl = useThree((state) => state.gl);
  const [isStableContext, setIsStableContext] = useState(false);

  useEffect(() => {
    const canvas = gl.domElement;
    const updateStability = () => {
      const context = gl.getContext();
      const notLost = typeof context?.isContextLost === 'function' ? !context.isContextLost() : Boolean(context);
      setIsStableContext(Boolean(context && notLost));
    };

    const onLost = () => setIsStableContext(false);
    const onRestored = () => updateStability();

    updateStability();
    canvas.addEventListener('webglcontextlost', onLost);
    canvas.addEventListener('webglcontextrestored', onRestored);

    return () => {
      canvas.removeEventListener('webglcontextlost', onLost);
      canvas.removeEventListener('webglcontextrestored', onRestored);
    };
  }, [gl]);

  if (!enabled || !isStableContext) return null;

  return (
    <EffectComposer>
      <Bloom luminanceThreshold={1} mipmapBlur intensity={1.5} radius={0.4} />
      <Noise opacity={0.05} />
      <Vignette eskil={false} offset={0.1} darkness={1.1} />
    </EffectComposer>
  );
}
