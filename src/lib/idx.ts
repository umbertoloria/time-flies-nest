type IdxItem = {
  id: number | string;
};

export const createIdxItemsAndIds = <T extends IdxItem>(items: T[]) => {
  const res = items.reduce(
    (res, item) => {
      res.idx[item.id] = item;
      res.ids.add(item.id);
      return res;
    },
    {
      idx: {} as Record<T['id'], T | undefined>,
      ids: new Set<T['id']>(),
    },
  );
  return {
    idx: res.idx,
    ids: [...res.ids],
  };
};
