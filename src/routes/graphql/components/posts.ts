import { FastifyInstance } from 'fastify';
import { GraphQLID, GraphQLList, GraphQLNonNull } from 'graphql';

import { typeCreatePost, postType, typeUpdatePost } from '../types/posts';

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
    const post = await fastify.db.posts.findOne({
      key: 'id',
      equals: args.id,
    });

    if (post) {
      return post;
    }
    throw fastify.httpErrors.notFound();
  },
};

export const createPost = {
  type: postType,
  args: {
    data: { type: typeCreatePost },
  },
  resolve: async (
    _: any,
    { data }: { data: any },
    fastify: FastifyInstance
  ) => {
    const user = await fastify.db.users.findOne({
      key: 'id',
      equals: data.userId,
    });

    if (user) {
      const post = await fastify.db.posts.create(data);
      return post;
    }
    return fastify.httpErrors.badRequest();
  },
};

export const updatePost = {
  type: postType,
  args: {
    id: { type: new GraphQLNonNull(GraphQLID) },
    data: { type: typeUpdatePost },
  },
  resolve: async (
    _: any,
    { id, data }: { id: string; data: any },
    fastify: FastifyInstance
  ) => {
    const post = await fastify.db.posts.findOne({
      key: 'id',
      equals: id,
    });

    if (post) {
      const updatedPost = await fastify.db.posts.change(id, data);
      return updatedPost;
    }
    throw fastify.httpErrors.badRequest();
  },
};
