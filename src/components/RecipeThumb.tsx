import { usePhotoUrl } from '../hooks/usePhotoUrl';

export function RecipeThumb({ photoId }: { photoId?: string }) {
  const url = usePhotoUrl(photoId, 'thumb');
  if (!url) {
    return (
      <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-control bg-primary-surface">
        <img src={`${import.meta.env.BASE_URL}icon-192.png`} alt="" className="h-10 w-10" />
      </div>
    );
  }
  return <img src={url} alt="" className="h-16 w-16 shrink-0 rounded-control object-cover" />;
}
