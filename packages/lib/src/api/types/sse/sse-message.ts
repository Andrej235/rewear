export type SseMessage<T> = {
  type: "message";
  data: T;
};
