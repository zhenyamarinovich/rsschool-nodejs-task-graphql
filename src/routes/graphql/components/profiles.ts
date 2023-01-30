import { FastifyInstance } from 'fastify';
import { GraphQLID, GraphQLList } from 'graphql';
import { profileType } from '../types/profiles';

export const getAllProfiles = {
  type: new GraphQLList(profileType),
  resolve: async (
    _: any,
    args: Record<string, string>,
    fastify: FastifyInstance
  ) => {
    return await fastify.db.profiles.findMany();
  },
};

export const getProfileById = {
  type: profileType,
  args: {
    id: { type: GraphQLID },
  },
  resolve: async (
    _: any,
    args: Record<string, string>,
    fastify: FastifyInstance
  ) => {
    const profileById = await fastify.db.profiles.findOne({
      key: 'id',
      equals: args.id,
    });

    if (profileById === null) {
      throw fastify.httpErrors.notFound('Profile is not founded!');
    }

    return profileById;
  },
};
