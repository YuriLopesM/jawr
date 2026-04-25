import { renderIconImage } from './_lib/icon-image';

export const size = { width: 192, height: 192 };
export const contentType = 'image/png';

export default function Icon() {
  return renderIconImage({ size: 192, fontSize: 120, letterSpacing: -6 });
}
