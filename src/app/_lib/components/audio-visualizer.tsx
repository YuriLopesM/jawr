'use client';

import { useEffect, useRef } from 'react';
import { useAudioAnalyser } from '@/hooks';
import { useRadioContext } from './radio-provider';

const MIN_BAR_HEIGHT_PX = 2;

type Props = {
  className?: string;
  bars?: number;
  height?: number;
  barWidth?: number;
  gap?: number;
};

type AccentColors = {
  accent: string;
  accentAlt: string;
};

function readAccentColors(): AccentColors {
  const styles = getComputedStyle(document.documentElement);
  return {
    accent: styles.getPropertyValue('--dk-accent').trim() || '#ffffff',
    accentAlt: styles.getPropertyValue('--dk-accent-alt').trim() || '#888888',
  };
}

function syncCanvasResolution(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) {
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

export function AudioVisualizer({ className, bars = 32, height = 48, barWidth, gap = 2 }: Props) {
  const { audioRef, playing } = useRadioContext();
  const { analyserRef, dataRef } = useAudioAnalyser(audioRef, playing);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    syncCanvasResolution(canvas, ctx);
    const observer = new ResizeObserver(() => syncCanvasResolution(canvas, ctx));
    observer.observe(canvas);

    function draw() {
      if (!canvas || !ctx) return;
      const rect = canvas.getBoundingClientRect();
      const w = rect.width;
      const h = rect.height;
      ctx.clearRect(0, 0, w, h);

      const analyser = analyserRef.current;
      const data = dataRef.current;
      if (!analyser || !data || !playing) {
        rafRef.current = requestAnimationFrame(draw);
        return;
      }

      analyser.getByteFrequencyData(data);

      const { accent, accentAlt } = readAccentColors();
      const bw = barWidth ?? (w - gap * (bars - 1)) / bars;
      const totalW = bw * bars + gap * (bars - 1);
      const offsetX = barWidth ? Math.max(0, w - totalW) : 0;

      const gradient = ctx.createLinearGradient(0, h, 0, 0);
      gradient.addColorStop(0, accent);
      gradient.addColorStop(1, accentAlt);
      ctx.fillStyle = gradient;

      // Log-spaced 40Hz-16kHz with per-band peak — matches human pitch perception and preserves transients.
      const sampleRate = analyser.context.sampleRate;
      const binHz = sampleRate / (analyser.fftSize);
      const minHz = 40;
      const maxHz = 16000;
      const minBin = Math.max(1, Math.floor(minHz / binHz));
      const maxBin = Math.min(data.length - 1, Math.ceil(maxHz / binHz));
      const logMin = Math.log(minBin);
      const logMax = Math.log(maxBin);

      for (let i = 0; i < bars; i++) {
        const startBin = Math.floor(Math.exp(logMin + (logMax - logMin) * (i / bars)));
        const endBin = Math.max(startBin + 1, Math.floor(Math.exp(logMin + (logMax - logMin) * ((i + 1) / bars))));
        let peak = 0;
        for (let j = startBin; j < endBin; j++) {
          const v = data[j] || 0;
          if (v > peak) peak = v;
        }
        const barH = Math.max(MIN_BAR_HEIGHT_PX, (peak / 255) * h);
        ctx.fillRect(offsetX + i * (bw + gap), h - barH, bw, barH);
      }

      rafRef.current = requestAnimationFrame(draw);
    }

    rafRef.current = requestAnimationFrame(draw);

    return () => {
      observer.disconnect();
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [analyserRef, dataRef, playing, bars, barWidth, gap]);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{ width: '100%', height }}
      aria-hidden
    />
  );
}
