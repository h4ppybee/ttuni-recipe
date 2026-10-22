import { useLiveQuery } from 'dexie-react-hooks';
import { useEffect, useState } from 'react';
import { recipeRepo } from '../db/recipeRepo';

export function useBlobUrl(blob: Blob | undefined): string | undefined {
  const [url, setUrl] = useState<string>();
  useEffect(() => {
    if (!blob) {
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
