const { ApolloServer, ApolloError } = require('apollo-server');
const typeDefs = require('./typedefs');
const resolvers = require('./resolvers');
const { createToken, getUserFromToken } = require('./auth');
const db = require('./db');

const server = new ApolloServer({
  typeDefs,
  resolvers,
  formatError(e) {
    console.log(e);
    // sentry errors, filter through error type, instead of logging all erros
    return new ApolloError(e);
  },
  context({ req, connection }) {
    const context = { ...db };
    if (connection) {
      return { ...context, ...connection.context };
    }

    const token = req.headers.authorization;
    const user = getUserFromToken(token);
    return { ...context, user, createToken };
  },
  subscriptions: {
    onConnect(params) {
      const token = params.authorization;
      const user = getUserFromToken(token);
      return { user };
    },
  },
});

server.listen(4000).then(({ url }) => {
  console.log(`🚀 Server ready at ${url}`);
});
