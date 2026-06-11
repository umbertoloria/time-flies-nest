export const createIdxItemsAndIds = <
  T extends Record<PropertyKey, any>,
  K extends keyof T,
>(
  items: T[],
  key: K,
) => {
  const res = items.reduce(
    (acc, item) => {
      const keyValue = item[key];
      acc.idx[keyValue] = item;
      acc.ids.add(keyValue);
      return acc;
    },
    {
      idx: {} as Record<T[K], T | undefined>,
      ids: new Set<T[K]>(),
    },
  );
  return {
    idx: res.idx,
    ids: [...res.ids],
  };
};
