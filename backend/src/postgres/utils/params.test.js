const { getParamsFormat } = require('./params');

describe('params util', () => {
  it('empty params should return empty string', async () => {
    const result = getParamsFormat(null);
    expect(result).toEqual('');
  });

  it('list of params expected format', async () => {
    const result = getParamsFormat(['a', 'b', 'c', 'd']);
    expect(result).toEqual('$1, $2, $3, $4');
  });
});
