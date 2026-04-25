import { ImageResponse } from 'next/og';

interface IconImageOptions {
  size: number;
  fontSize: number;
  letterSpacing: number;
}

export function renderIconImage({ size, fontSize, letterSpacing }: IconImageOptions) {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#030712',
          color: '#f9fafb',
          fontSize,
          fontWeight: 700,
          letterSpacing,
        }}
      >
        j.
      </div>
    ),
    { width: size, height: size }
  );
}
