const PICK_KEY = 'ttuni-recipe:pick-selection';
const BACKUP_KEY = 'ttuni-recipe:last-backup-at';

function read(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function write(key: string, value: string): void {
  try {
    localStorage.setItem(key, value);
  } catch {
    // 편의 정보라 실패해도 무시한다.
  }
}

export function getPickSelection(): string[] {
  const raw = read(PICK_KEY);
  if (!raw) {
    return [];
  }
  try {
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((v): v is string => typeof v === 'string') : [];
  } catch {
    return [];
  }
}

export function setPickSelection(names: string[]): void {
  write(PICK_KEY, JSON.stringify(names));
}

export function getLastBackupAt(): number | undefined {
  const value = Number(read(BACKUP_KEY));
  return Number.isFinite(value) && value > 0 ? value : undefined;
}

export function setLastBackupAt(epochMs: number): void {
  write(BACKUP_KEY, String(epochMs));
}
