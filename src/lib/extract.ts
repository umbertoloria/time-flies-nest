export const getValuesFromList = <T, K extends keyof T>(
  list: T[],
  key: K,
): T[K][] => list.map((item) => item[key]);

export const excludeDuplicates = <T>(list: T[]): T[] => [...new Set(list)];

export const getIds = <T>(list: Array<{ id: T }>) =>
  excludeDuplicates(getValuesFromList(list, 'id'));

/* // First draft
export const getUniqueValuesFromList = <T, K extends keyof T>(
  list: T[],
  key: K,
): T[K][] => [...new Set(list.map((item) => item[key]))];
*/
