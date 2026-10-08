export interface AsyncResourceState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  updatedAt: Date | null;
}
