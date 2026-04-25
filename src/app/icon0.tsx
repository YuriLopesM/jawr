import { ImageResponse } from 'next/og';

export const size = { width: 512, height: 512 };
export const contentType = 'image/png';

export default function IconLarge() {
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
          fontSize: 320,
          fontWeight: 700,
          letterSpacing: -16,
        }}
      >
        j.
      </div>
    ),
    { ...size }
  );
}
