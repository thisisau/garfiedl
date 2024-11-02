export type RecursiveArray<T> = Array<T | RecursiveArray<T>>;
export type ClassArray = RecursiveArray<string | undefined | false | null>;