import { useMemo } from 'react';
import { Points, PointMaterial } from '@react-three/drei';

export function BackgroundStars() {
  const points = useMemo(() => {
    const p = new Float32Array(500 * 3);
    for (let i = 0; i < 500; i++) {
      // eslint-disable-next-line react-hooks/purity
      p[i * 3]     = (Math.random() - 0.5) * 50;
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
