import { FastifyInstance } from 'fastify';
import { GraphQLID, GraphQLList } from 'graphql';

import { postType } from '../types/posts';

export const getAllPosts = {
  type: new GraphQLList(postType),
  resolve: async (
    _: any,
    args: Record<string, string>,
    fastify: FastifyInstance
  ) => {
    return await fastify.db.posts.findMany();
  },
};

export const getPostById = {
  type: postType,
  args: {
    id: { type: GraphQLID },
  },
  resolve: async (
    _: any,
    args: Record<string, string>,
    fastify: FastifyInstance
  ) => {
    const postById = await fastify.db.posts.findOne({
      key: 'id',
      equals: args.id,
    });

    if (postById === null) {
      throw fastify.httpErrors.notFound('Post is not founded!');
    }

    return postById;
  },
};
