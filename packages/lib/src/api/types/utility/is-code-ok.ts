export type IsCodeOk<Code> = Code extends `2${number}${infer U}`
  ? U extends `${number}${number}`
    ? never
    : Code
  : never;
