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

export const createGroupedItemsAndIds = <
  T extends Record<PropertyKey, any>,
  K extends keyof T,
>(
  items: T[],
  key: K,
) => {
  const res = items.reduce(
    (acc, item) => {
      const keyValue = item[key];
      if (!acc.idx[keyValue]) {
        acc.idx[keyValue] = [];
      }
      acc.idx[keyValue].push(item);
      acc.ids.add(keyValue);
      return acc;
    },
    {
      idx: {} as Record<T[K], T[] | undefined>,
      ids: new Set<T[K]>(),
    },
  );
  return {
    idx: res.idx,
    ids: [...res.ids],
  };
};
