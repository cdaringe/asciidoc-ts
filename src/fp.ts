export const pipe = <T>(...fns: Array<(arg: T) => T>) => (arg: T) =>
  fns.reduce((acc, fn) => fn(acc), arg);
