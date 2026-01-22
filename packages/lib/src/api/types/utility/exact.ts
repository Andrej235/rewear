export type Exact<T, Shape> = [T] extends [Shape]
  ? Exclude<keyof T, keyof Shape> extends never
    ? T
    : never
  : never;
