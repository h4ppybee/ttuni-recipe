export type DeliverResult = 'shared' | 'downloaded' | 'cancelled';

export function canShareFile(file: File): boolean {
  return typeof navigator.canShare === 'function' && navigator.canShare({ files: [file] });
}

export function downloadFile(blob: Blob, fileName: string): DeliverResult {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  return 'downloaded';
}

// 사용자 탭 직후에 불러야 한다. 파일은 미리 만들어 둔다(spec 8절).
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
