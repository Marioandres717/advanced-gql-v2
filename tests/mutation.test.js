const gql = require('graphql-tag');
const createTestServer = require('./helper');

const CREATE_POST = gql`
  mutation {
    createPost(input: { message: "Hello" }) {
      message
    }
  }
`;

describe('mutations', () => {
  test('createPost', async () => {
    const { mutate } = createTestServer({
      user: { id: 1 },
      models: {
        User: {
          createOne() {
            return {
              message: 'hello',
            };
          },
        },
      },
    });
    const res = await mutate({ query: CREATE_POST });
    expect(res).toMatchSnapshot();
  });
});
