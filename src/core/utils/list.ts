export const isFirstOne = <T>(value: T, index: number, array: T[]) =>
  array.indexOf(value) === index;

export const fromEntries = <K extends PropertyKey, V>(
  entries: Iterable<readonly [K, V]>,
): Record<K, V | undefined> =>
  Object.fromEntries(entries) as Record<K, V | undefined>;
