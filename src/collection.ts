export const truthyValuesOrEmptyPojo = <T extends Record<string, any>>(
  it: T,
): T | {} => {
  for (const key in it) {
    const value = it[key];
    if (value || value === 0) {
      continue;
    }
    return {};
  }
  return it;
};
