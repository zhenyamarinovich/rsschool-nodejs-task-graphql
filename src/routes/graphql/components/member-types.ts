import { FastifyInstance } from 'fastify';
import { GraphQLList, GraphQLNonNull, GraphQLString } from 'graphql';

import { memberType, typeUpdateMemberType } from '../types/member-types';

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

    if (memberType) {
      return memberTypeById;
    }
    throw fastify.httpErrors.notFound();
  },
};

export const updateMemberType = {
  type: memberType,
  args: {
    id: { type: new GraphQLNonNull(GraphQLString) },
    data: { type: typeUpdateMemberType },
  },
  resolve: async (
    _: any,
    { id, data }: { id: string; data: any },
    fastify: FastifyInstance
  ) => {
    const memberType = await fastify.db.memberTypes.findOne({
      key: 'id',
      equals: id,
    });

    if (memberType) {
      const updatedMemberType = await fastify.db.memberTypes.change(id, data);
      return updatedMemberType;
    }
    throw fastify.httpErrors.badRequest();
  },
};
