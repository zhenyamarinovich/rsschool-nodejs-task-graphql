import { FastifyInstance } from 'fastify';
import {
  GraphQLID,
  GraphQLInputObjectType,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLOutputType,
  GraphQLString,
} from 'graphql';

import { UserEntity } from '../../../utils/DB/entities/DBUsers';
import { memberType } from './member-types';
import { postType } from './posts';
import { profileType } from './profiles';

const userType: GraphQLOutputType = new GraphQLObjectType({
  name: 'userType',
  fields: () => ({
    id: { type: GraphQLID },
    firstName: { type: GraphQLString },
    lastName: { type: GraphQLString },
    email: { type: GraphQLString },
    subscribedToUserIds: {
      type: new GraphQLList(GraphQLString),
    },
    profile: {
      type: profileType,
      async resolve(
        parent: UserEntity,
        args: Record<string, string>,
        fastify: FastifyInstance
      ) {
        const profile = await fastify.db.profiles.findOne({
          key: 'userId',
          equals: parent.id,
        });
        return profile;
      },
    },
    posts: {
      type: new GraphQLList(postType),
      async resolve(
        parent: UserEntity,
        args: Record<string, string>,
        fastify: FastifyInstance
      ) {
        const posts = await fastify.db.posts.findMany({
          key: 'userId',
          equals: parent.id,
        });
        return posts;
      },
    },
    memberType: {
      type: memberType,
      async resolve(
        parent: UserEntity,
        args: Record<string, string>,
        fastify: FastifyInstance
      ) {
        const profile = await fastify.db.profiles.findOne({
          key: 'userId',
          equals: parent.id,
        });
        if (profile === null) {
          throw fastify.httpErrors.notFound('Profile is not founded!');
        }
        const memberType = await fastify.db.memberTypes.findOne({
          key: 'id',
          equals: profile.memberTypeId,
        });
        return memberType;
      },
    },
    userSubscribedTo: {
      type: new GraphQLList(userType),
      async resolve(
        parent: UserEntity,
        args: Record<string, string>,
        fastify: FastifyInstance
      ) {
        const users = await fastify.db.users.findMany({
          key: 'subscribedToUserIds',
          inArray: parent.id,
        });
        return users;
      },
    },
    subscribedToUser: {
      type: new GraphQLList(userType),
      async resolve(
        parent: UserEntity,
        args: Record<string, string>,
        fastify: FastifyInstance
      ) {
        const subscribes = Promise.all(
          parent.subscribedToUserIds.map(async (subscribeId) => {
            const subscribe = await fastify.db.users.findOne({
              key: 'id',
              equals: subscribeId,
            });
            return subscribe;
          })
        );

        return subscribes;
      },
    },
  }),
});

const typeCreateUser = new GraphQLInputObjectType({
  name: 'createUserData',
  fields: {
    firstName: { type: new GraphQLNonNull(GraphQLString) },
    lastName: { type: new GraphQLNonNull(GraphQLString) },
    email: { type: new GraphQLNonNull(GraphQLString) },
  },
});

const typeUpdateUser = new GraphQLInputObjectType({
  name: 'updateUserData',
  fields: {
    firstName: { type: new GraphQLNonNull(GraphQLString) },
    lastName: { type: new GraphQLNonNull(GraphQLString) },
    email: { type: new GraphQLNonNull(GraphQLString) },
  },
});

const typeSubscribeToUser = new GraphQLInputObjectType({
  name: 'subscribeToUserData',
  fields: {
    userId: { type: new GraphQLNonNull(GraphQLID) },
    id: { type: new GraphQLNonNull(GraphQLID) },
  },
});

const typeUnsubscribeFromUserData = new GraphQLInputObjectType({
  name: 'unsubscribeFromUserData',
  fields: {
    userId: { type: new GraphQLNonNull(GraphQLID) },
    id: { type: new GraphQLNonNull(GraphQLID) },
  },
});

export {
  userType,
  typeCreateUser,
  typeUpdateUser,
  typeSubscribeToUser,
  typeUnsubscribeFromUserData,
};
