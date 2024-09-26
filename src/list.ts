export const normalizeDepth = <
  T extends {
    depth: number;
  },
>(items: T[]): T[] => {
  const commonDepth = Math.min(...items.map((it) => it.depth));
  if (commonDepth > 1) {
    items.forEach((it) => it.depth -= commonDepth);
  }
  return items;
};
