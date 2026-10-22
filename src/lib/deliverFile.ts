export type DeliverResult = 'shared' | 'downloaded' | 'cancelled';

const REVOKE_DELAY_MS = 60_000;

export function canShareFile(file: File): boolean {
  return typeof navigator.canShare === 'function' && navigator.canShare({ files: [file] });
}

export function downloadFile(blob: Blob, fileName: string): DeliverResult {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), REVOKE_DELAY_MS);
  return 'downloaded';
}

// 사용자 탭 직후에 불러야 한다. 파일은 미리 만들어 둔다(spec 8절).
// navigator.share 호출 전에는 반드시 canShareFile로 공유 가능 여부를 먼저 확인해야 한다.
export async function shareFile(file: File): Promise<DeliverResult> {
  try {
    await navigator.share({ files: [file] });
    return 'shared';
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      return 'cancelled';
    }
    if (error instanceof DOMException && error.name === 'NotAllowedError') {
      return downloadFile(file, file.name);
    }
    throw error;
  }
}
