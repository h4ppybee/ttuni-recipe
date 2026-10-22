import { useLiveQuery } from 'dexie-react-hooks';
import { useEffect, useState } from 'react';
import { recipeRepo } from '../db/recipeRepo';

export function useBlobUrl(blob: Blob | undefined): string | undefined {
  const [url, setUrl] = useState<string>();
  useEffect(() => {
    // object URL은 Blob으로 만드는 외부 리소스라 effect 안에서 만들고 해제해야 한다.
    if (!blob) {
      // oxlint-disable-next-line react/set-state-in-effect
      setUrl(undefined);
      return;
    }
    const next = URL.createObjectURL(blob);
    setUrl(next);
    return () => URL.revokeObjectURL(next);
  }, [blob]);
  return url;
}

export function usePhotoUrl(photoId: string | undefined, size: 'full' | 'thumb'): string | undefined {
  const photo = useLiveQuery(() => (photoId ? recipeRepo.getPhoto(photoId) : undefined), [photoId]);
  return useBlobUrl(photo?.[size]);
}
