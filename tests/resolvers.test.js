const resolvers = require('../src/resolvers');

const findMany = () => {
  return ['helo'];
};
describe('resolvers', () => {
  test('feed', () => {
    const result = resolvers.Query.feed(null, null, {
      models: {
        Post: {
          findMany,
        },
      },
    });
    expect(result).toHaveLength(1);
  });
});
