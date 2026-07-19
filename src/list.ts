/**
 * Infer zero-based list depth from the order in which distinct markers occur.
 * Marker length is only conventional in AsciiDoc; changing the marker opens a
 * nested level and returning to an earlier marker closes levels above it.
 */
export const normalizeDepth = <T extends { marker: string }>(
  items: T[],
): Omit<T, "marker">[] => {
  const markerStack: string[] = [];
  return items.map(({ marker, ...item }) => {
    const existingDepth = markerStack.lastIndexOf(marker);
    const depth = existingDepth === -1 ? markerStack.length : existingDepth;
    if (existingDepth === -1) {
      markerStack.push(marker);
    } else {
      markerStack.splice(existingDepth + 1);
    }
    return { ...item, depth };
  });
};
