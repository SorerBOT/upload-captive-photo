export const getParamsFormat = (params: any[]) => {
  if (!params || params.length === 0) {
    return '';
  }
  return params.map((x, i) => `$${i + 1}`).join(', ');
};
