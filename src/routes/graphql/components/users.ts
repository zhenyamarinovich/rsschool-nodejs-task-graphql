import { FastifyInstance } from 'fastify';
import { GraphQLID, GraphQLList } from 'graphql';

import { userType } from '../types/users';

export const getAllUsers = {
  type: new GraphQLList(userType),
  resolve: async (
    _: any,
    args: Record<string, string>,
    fastify: FastifyInstance
  ) => {
    return await fastify.db.users.findMany();
  },
};

export const getUserById = {
  type: userType,
  args: {
    id: { type: GraphQLID },
  },
  resolve: async (
    _: any,
    args: Record<string, string>,
    fastify: FastifyInstance
  ) => {
    const userById = await fastify.db.users.findOne({
      key: 'id',
      equals: args.id,
    });

    if (userById === null) {
      throw fastify.httpErrors.notFound('User is not founded!');
    }
    return userById;
  },
};
