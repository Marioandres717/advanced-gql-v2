const gql = require('graphql-tag');
const { ApolloServer, PubSub } = require('apollo-server');

const pubsub = new PubSub();
const NEW_ITEM = 'NEW ITEM';

const typeDefs = gql`
  type User {
    id: ID!
    username: String
    createdAt: Int!
  }

  type Item {
    id: ID!
    task: String
  }

  type Settings {
    user: User
    theme: String
  }

  input NewSettingsInput {
    user: ID!
    theme: String!
  }

  type Query {
    me: User!
    settings(user: ID!): Settings!
  }

  type Mutation {
    settings(input: NewSettingsInput!): Settings!
    newItem(task: String): Item!
  }

  type Subscription {
    newItem: Item
  }
`;

const items = [];

const resolvers = {
  Query: {
    me() {
      return {
        id: 12,
        username: 'coder1234',
        createdAt: 1235646,
      };
    },
    settings(_, { user }) {
      return {
        user,
        theme: 'Dark',
      };
    },
  },
  Mutation: {
    settings(_, { input }) {
      return input;
    },
    newItem(_, { task }) {
      const item = { task };
      items.push({ item });
      pubsub.publish(NEW_ITEM, { newItem: item });
      return { item };
    },
  },
  Subscription: {
    newItem: {
      subscribe: () => pubsub.asyncIterator(NEW_ITEM),
    },
  },
  Settings: {
    user() {
      return {
        id: 12,
        username: 'coder1234',
        createdAt: 1235646,
      };
    },
  },
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context({ connection }) {
    if (connection) {
      return { ...connection.context };
    }
    return {};
  },
  subscriptions: {
    onConnect(connectionParams) {
      // handle auth here
    },
  },
});

server.listen().then(({ url }) => console.log(`server at: ${url}`));
