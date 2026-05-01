import { RefObject, useEffect, useRef } from 'react';

const FFT_SIZE = 2048;
const SMOOTHING = 0.8;

type AnalyserState = {
  context: AudioContext;
  analyser: AnalyserNode;
  source: MediaElementAudioSourceNode;
};

type WindowWithWebkit = Window & { webkitAudioContext?: typeof AudioContext };

type AnalyserData = Uint8Array<ArrayBuffer>;

const cache = new WeakMap<HTMLAudioElement, AnalyserState>();

function createAnalyserState(audio: HTMLAudioElement): AnalyserState | null {
  const Ctor = window.AudioContext || (window as WindowWithWebkit).webkitAudioContext;
  if (!Ctor) return null;
  try {
    const context = new Ctor();
    const source = context.createMediaElementSource(audio);
    const analyser = context.createAnalyser();
    analyser.fftSize = FFT_SIZE;
    analyser.smoothingTimeConstant = SMOOTHING;
    source.connect(analyser);
    analyser.connect(context.destination);
    return { context, analyser, source };
  } catch {
    // createMediaElementSource throws if audio is already attached or stream is opaque (CORS).
    return null;
  }
}

// Returns refs (not state) so the consumer's render loop reads frequency data
// each frame without triggering React re-renders.
export function useAudioAnalyser(
  audioRef: RefObject<HTMLAudioElement | null>,
  active: boolean,
) {
  const dataRef = useRef<AnalyserData | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);

  useEffect(() => {
    if (!active) return;
    const audio = audioRef.current;
    if (!audio) return;

    let cancelled = false;

    let state = cache.get(audio);
    if (!state) {
      const created = createAnalyserState(audio);
      if (!created) return;
      state = created;
      cache.set(audio, state);
    }
    if (cancelled) return;

    analyserRef.current = state.analyser;
    dataRef.current = new Uint8Array(state.analyser.frequencyBinCount) as AnalyserData;
    if (state.context.state === 'suspended') {
      state.context.resume().catch(() => {});
    }

    return () => {
      cancelled = true;
    };
  }, [audioRef, active]);

  return { analyserRef, dataRef };
}
