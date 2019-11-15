const gql = require('graphql-tag');
const {
  ApolloServer,
  PubSub,
  AuthenticationError,
  UserInputError,
  ApolloError,
  SchemaDirectiveVisitor,
} = require('apollo-server');
const { defaultFieldResolver, GraphQLString } = require('graphql');
const pubsub = new PubSub();
const NEW_ITEM = 'NEW ITEM';

class LogDirective extends SchemaDirectiveVisitor {
  visitFieldDefinition(field) {
    const resolver = field.resolve || defaultFieldResolver;

    // passing arguments to directive
    field.args.push({
      type: GraphQLString,
      name: 'message',
    });

    // arguments from directive
    field.resolve = (root, { message, ...rest }, ctx, info) => {
      const { message: schemaMessage } = this.args;
      console.log('🌩 hello ', message || schemaMessage);
      return resolver.apply(this, root, rest, ctx, info);
    };

    // field.type = GraphQLString // changing type of a field from directive
  }
  visitedType() {
    throw new Apollo('💩 not implemented 🐷 💓');
  }
}

const typeDefs = gql`
  directive @log(message: String = "my meesage") on FIELD_DEFINITION

  type User {
    id: ID! @log(message: "ID HERE")
    username: String
    createdAt: Int!
    error: String! @deprecated(reason: "IT HAPPENS")
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
  schemaDirectives: {
    log: LogDirective,
  },
});

server.listen().then(({ url }) => console.log(`server at: ${url}`));
