import { useCallback, useEffect, useRef, useState } from 'react';
import { WebAudioAdapter } from '../../infrastructure/WebAudioAdapter';
import type { AudioScene } from '../../domain/generativeAudio';

export function useGenerativeAudio() {
  const adapterRef = useRef<WebAudioAdapter | null>(null);
  if (adapterRef.current === null) adapterRef.current = new WebAudioAdapter();
  const [supported] = useState(() => WebAudioAdapter.isSupported());
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => () => adapterRef.current?.stop(), []);

  const start = useCallback(
    async (scene: AudioScene) => {
      if (!supported) return;
      await adapterRef.current!.start(scene);
      setIsPlaying(true);
    },
    [supported],
  );

  const stop = useCallback(() => {
    adapterRef.current!.stop();
    setIsPlaying(false);
  }, []);

  const update = useCallback((scene: AudioScene) => {
    adapterRef.current!.update(scene);
  }, []);

  return { supported, isPlaying, start, stop, update };
}
