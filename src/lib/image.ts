const FULL_SIDE = 1280;
const THUMB_SIDE = 320;
const QUALITY = 0.8;

function toJpeg(bitmap: ImageBitmap, maxSide: number): Promise<Blob> {
  const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    return Promise.reject(new Error('CANVAS_UNAVAILABLE'));
  }
  ctx.drawImage(bitmap, 0, 0, width, height);
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        // 인코딩이 끝났으니(성공이든 실패든) 캔버스가 들고 있던 픽셀 메모리를 바로 비운다.
        canvas.width = 0;
        canvas.height = 0;
        if (!blob) {
          reject(new Error('ENCODE_FAILED'));
          return;
        }
        resolve(blob);
      },
      'image/jpeg',
      QUALITY,
    );
  });
}

export async function makePhotoBlobs(file: File): Promise<{ full: Blob; thumb: Blob }> {
  const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' });
  try {
    return { full: await toJpeg(bitmap, FULL_SIDE), thumb: await toJpeg(bitmap, THUMB_SIDE) };
  } finally {
    bitmap.close();
  }
}
