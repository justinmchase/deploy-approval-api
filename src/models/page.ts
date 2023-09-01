export type Page<T> = {
  offset: number;
  limit: number;
  total: number;
  results: T[];
}


export type PageArgs = {
  offset: number;
  limit: number;
}