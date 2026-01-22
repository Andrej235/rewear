export type LastElement<T extends string[]> = T extends [infer L, ...infer R]
  ? R extends [string, ...string[]]
    ? LastElement<R>
    : L
  : never;
