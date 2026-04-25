import { renderIconImage } from './_lib/icon-image';

export const size = { width: 512, height: 512 };
export const contentType = 'image/png';

export default function IconLarge() {
  return renderIconImage({ size: 512, fontSize: 320, letterSpacing: -16 });
}
