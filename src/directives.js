const {
  SchemaDirectiveVisitor,
  AuthenticationError,
} = require('apollo-server');
const { defaultFieldResolver, GraphQLString } = require('graphql');
const { formatDate } = require('./utils');

class DateFormatDirective extends SchemaDirectiveVisitor {
  visitFieldDefinition(field) {
    const { resolve = defaultFieldResolver } = field;
    const { format: schemaFormat } = this.args;
    field.args.push({
      name: 'format',
      type: GraphQLString,
    });

    field.resolve = async (root, { format, ...rest }, ctx, info) => {
      const date = await resolve.call(this, root, rest, ctx, info);
      return formatDate(date, format || schemaFormat);
    };

    field.type = GraphQLString;
  }
}

class AuthenticationDirective extends SchemaDirectiveVisitor {
  visitFieldDefinition(field) {
    const { resolve = defaultFieldResolver } = field;
    field.resolve = async (root, args, ctx, info) => {
      if (!ctx.user) {
        throw new AuthenticationError('💩 not authorized');
      }
      return resolve(root, args, ctx, info);
    };
  }
}

class AuthorizationDirective extends SchemaDirectiveVisitor {
  visitFieldDefinition(field) {
    const { resolve = defaultFieldResolver } = field;
    const { role } = this.args;

    field.resolve = async (root, args, ctx, info) => {
      if (!ctx.user.role !== role) {
        throw new AuthenticationError('💩 wrong role bruh');
      }
      return resolve(root, args, ctx, info);
    };
  }
}

module.exports = {
  DateFormatDirective,
  AuthenticationDirective,
  AuthorizationDirective,
};
