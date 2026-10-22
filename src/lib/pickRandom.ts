export function pickRandom<T extends { id: string }>(
  candidates: T[],
  excludeId?: string,
  rng: () => number = Math.random,
): T | undefined {
  if (candidates.length === 0) {
    return undefined;
  }
  const pool = candidates.length > 1 ? candidates.filter((c) => c.id !== excludeId) : candidates;
  return pool[Math.floor(rng() * pool.length)];
}
