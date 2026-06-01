const SHARE_URL = 'https://jawr.org';

function prefersNativeShare(): boolean {
  return (
    typeof navigator !== 'undefined' &&
    typeof window !== 'undefined' &&
    'share' in navigator &&
    window.matchMedia('(pointer: coarse)').matches
  );
}

// Fallback for insecure contexts (e.g. served over a LAN IP) where the async
// Clipboard API is unavailable.
function copyViaTextarea(value: string): boolean {
  try {
    const textarea = document.createElement('textarea');
    textarea.value = value;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    const copied = document.execCommand('copy');
    document.body.removeChild(textarea);
    return copied;
  } catch {
    return false;
  }
}

/**
 * Shares `text` via the native share sheet on touch devices, or copies it to
 * the clipboard on desktop. Resolves to `true` when the content was copied
 * (so callers can show a "copied" hint), `false` when it was shared natively
 * or the action failed.
 */
export async function shareOrCopy(text: string): Promise<boolean> {
  if (prefersNativeShare()) {
    try {
      await navigator.share({ text, url: SHARE_URL });
      return false;
    } catch {
      // cancelled or unsupported — fall through to clipboard
    }
  }
  const payload = `${text}\n${SHARE_URL}`;
  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(payload);
      return true;
    } catch {
      // permission/insecure-context failure — fall through to textarea
    }
  }
  return copyViaTextarea(payload);
}
