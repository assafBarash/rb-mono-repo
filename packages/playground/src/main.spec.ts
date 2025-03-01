import { main } from './main';

describe('playground', () => {
  test('should say hello', async () => {
    const result = await main().catch((e) => console.log(e));

    expect(result).toEqual({ name: 'John', age: 42 });
  });
});
