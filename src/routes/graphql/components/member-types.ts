import { FastifyInstance } from 'fastify';
import { GraphQLList, GraphQLString } from 'graphql';

import { memberType } from '../types/member-types';

export const getAllMemberTypes = {
  type: new GraphQLList(memberType),
  resolve: async (
    _: any,
    args: Record<string, string>,
    fastify: FastifyInstance
  ) => {
    return await fastify.db.memberTypes.findMany();
  },
};

export const getMemberTypeById = {
  type: memberType,
  args: {
    id: { type: GraphQLString },
  },
  resolve: async (
    _: any,
    args: Record<string, string>,
    fastify: FastifyInstance
  ) => {
    const memberTypeById = await fastify.db.memberTypes.findOne({
      key: 'id',
      equals: args.id,
    });

    if (memberTypeById === null) {
      throw fastify.httpErrors.notFound('Member type is not founded!');
    }

    return memberTypeById;
  },
};
