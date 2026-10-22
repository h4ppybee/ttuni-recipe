const pad = (n: number) => String(n).padStart(2, '0');

export function yyyymmdd(date: Date): string {
  return `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}`;
}

export function formatDate(epochMs: number): string {
  const d = new Date(epochMs);
  return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일`;
}
