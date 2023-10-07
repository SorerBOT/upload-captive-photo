export const makeSingleton = <T>(creator: () => T): (() => T) => {
  let item: T | undefined;
  return () => {
    if (!item) {
      item = creator();
    }
    return item;
  };
};
