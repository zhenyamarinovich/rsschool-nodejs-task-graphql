import { FastifyInstance } from 'fastify';
import { GraphQLID, GraphQLList, GraphQLNonNull } from 'graphql';

import {
  userType,
  typeCreateUser,
  typeUpdateUser,
  typeSubscribeToUser,
  typeUnsubscribeFromUserData,
} from '../types/users';

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
    const user = await fastify.db.users.findOne({
      key: 'id',
      equals: args.id,
    });

    if (user) {
      return user;
    }
    throw fastify.httpErrors.notFound();
  },
};

export const createUser = {
  type: userType,
  args: {
    data: { type: typeCreateUser },
  },
  resolve: async (
    _: any,
    { data }: { data: any },
    fastify: FastifyInstance
  ) => {
    const user = await fastify.db.users.create(data);
    return user;
  },
};

export const updateUser = {
  type: userType,
  args: {
    id: { type: new GraphQLNonNull(GraphQLID) },
    data: { type: typeUpdateUser },
  },
  resolve: async (
    _: any,
    { id, data }: { id: string; data: any },
    fastify: FastifyInstance
  ) => {
    const user = await fastify.db.users.findOne({
      key: 'id',
      equals: id,
    });

    if (user) {
      const updatedUser = await fastify.db.users.change(id, data);
      return updatedUser;
    }
    throw fastify.httpErrors.badRequest();
  },
};

export const subscribeToUser = {
  type: userType,
  args: {
    data: { type: typeSubscribeToUser },
  },
  resolve: async (
    _: any,
    { data }: { data: Record<string, string> },
    fastify: FastifyInstance
  ) => {
    const subscribeTo = await fastify.db.users.findOne({
      key: 'id',
      equals: data.id,
    });

    const subscribeUser = await fastify.db.users.findOne({
      key: 'id',
      equals: data.userId,
    });

    if (subscribeTo === null || subscribeUser === null) {
      throw fastify.httpErrors.notFound();
    }

    subscribeUser.subscribedToUserIds = [
      ...subscribeUser.subscribedToUserIds,
      data.id,
    ];

    const user = await fastify.db.users.change(data.userId, {
      subscribedToUserIds: [...subscribeUser.subscribedToUserIds],
    });

    return user;
  },
};

export const unsubscribeFromUser = {
  type: userType,
  args: {
    data: { type: typeUnsubscribeFromUserData },
  },
  resolve: async (
    _: any,
    { data }: { data: Record<string, string> },
    fastify: FastifyInstance
  ) => {
    const user = await fastify.db.users.findOne({
      key: 'id',
      equals: data.id,
    });

    if (user === null) {
      throw fastify.httpErrors.notFound();
    }

    const subscribe = await fastify.db.users.findOne({
      key: 'id',
      equals: data.userId,
    });

    if (subscribe === null) {
      throw fastify.httpErrors.notFound();
    }

    if (!subscribe.subscribedToUserIds.includes(data.id)) {
      throw fastify.httpErrors.badRequest();
    }

    const filteredData = subscribe.subscribedToUserIds.filter(
      (id) => id !== data.id
    );

    const updatedData = await fastify.db.users.change(data.userId, {
      subscribedToUserIds: filteredData,
    });

    return updatedData;
  },
};
