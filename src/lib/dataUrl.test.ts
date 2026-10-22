import { describe, expect, it } from 'vitest';
import { blobToDataUrl, dataUrlToBlob } from './dataUrl';

describe('dataUrl', () => {
  it('Blob을 data URL로 바꾸고 다시 같은 바이트의 Blob으로 되돌린다', async () => {
    const bytes = new Uint8Array(70000).map((_, i) => i % 256);
    const blob = new Blob([bytes], { type: 'image/jpeg' });
    const url = await blobToDataUrl(blob);
    expect(url.startsWith('data:image/jpeg;base64,')).toBe(true);
    const back = dataUrlToBlob(url);
    expect(back.type).toBe('image/jpeg');
    expect(new Uint8Array(await back.arrayBuffer())).toEqual(bytes);
  });

  it('형식이 틀리면 오류를 던진다', () => {
    expect(() => dataUrlToBlob('hello')).toThrow('BAD_DATA_URL');
  });
});
