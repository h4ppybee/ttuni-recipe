import { Camera, RefreshCw, Trash2 } from 'lucide-react';
import { useRef } from 'react';
import { IconButton } from './ui/IconButton';

interface PhotoPickerProps {
  previewUrl?: string;
  busy: boolean;
  onPick: (file: File) => void;
  onRemove: () => void;
}

export function PhotoPicker({ previewUrl, busy, onPick, onRemove }: PhotoPickerProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const open = () => inputRef.current?.click();

  return (
    <div className="relative aspect-[4/3] w-full overflow-hidden rounded-card bg-surface-soft">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        hidden
        onChange={(e) => {
          const file = e.target.files?.[0];
          e.target.value = '';
          if (file) {
            onPick(file);
          }
        }}
      />
      {previewUrl && <img src={previewUrl} alt="레시피 사진" className="h-full w-full object-cover" />}
      {!previewUrl && (
        <button type="button" onClick={open} disabled={busy} className="flex h-full w-full flex-col items-center justify-center gap-2 text-muted">
          <Camera size={32} strokeWidth={2} />
          <span className="text-body-md">{busy ? '사진을 준비하고 있어요' : '사진 추가하기'}</span>
        </button>
      )}
      {previewUrl && (
        <div className="absolute right-2 top-2 flex gap-1 rounded-pill bg-surface-card">
          <IconButton label="사진 바꾸기" onClick={open} disabled={busy}>
            <RefreshCw size={20} strokeWidth={2} />
          </IconButton>
          <IconButton label="사진 빼기" onClick={onRemove} disabled={busy}>
            <Trash2 size={20} strokeWidth={2} />
          </IconButton>
        </div>
      )}
    </div>
  );
}
