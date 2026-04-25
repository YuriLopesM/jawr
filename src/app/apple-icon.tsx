import { renderIconImage } from './_lib/icon-image';

export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

export default function AppleIcon() {
  return renderIconImage({ size: 180, fontSize: 110, letterSpacing: -6 });
}
