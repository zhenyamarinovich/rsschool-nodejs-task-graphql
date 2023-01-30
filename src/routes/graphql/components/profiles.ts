import { FastifyInstance } from 'fastify';
import { GraphQLID, GraphQLList } from 'graphql';
import { REGEX } from '../constants';
import {
  typeCreateProfile,
  profileType,
  typeUpdateProfile,
} from '../types/profiles';

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
    const user = await fastify.db.profiles.findOne({
      key: 'id',
      equals: args.id,
    });

    if (user) {
      return user;
    }
    throw fastify.httpErrors.notFound();
  },
};

export const createProfile = {
  type: profileType,
  args: {
    data: { type: typeCreateProfile },
  },
  resolve: async (
    _: any,
    { data }: { data: any },
    fastify: FastifyInstance
  ) => {
    const memberType = await fastify.db.memberTypes.findOne({
      key: 'id',
      equals: data.memberTypeId,
    });

    if (memberType === null) {
      throw fastify.httpErrors.notFound();
    }

    if (REGEX.test(data.userId) === false) {
      throw fastify.httpErrors.badRequest();
    }

    const profile = await fastify.db.profiles.findOne({
      key: 'userId',
      equals: data.userId,
    });

    if (profile) {
      throw fastify.httpErrors.badRequest();
    }

    const updatedProfile = await fastify.db.profiles.create(data);

    return updatedProfile;
  },
};

export const updateProfile = {
  type: profileType,
  args: {
    id: { type: GraphQLID },
    data: { type: typeUpdateProfile },
  },
  resolve: async (
    _: any,
    { id, data }: { id: string; data: any },
    fastify: FastifyInstance
  ) => {
    if (REGEX.test(id) === false) {
      throw fastify.httpErrors.badRequest();
    }

    const profile = await fastify.db.profiles.findOne({
      key: 'id',
      equals: id,
    });

    if (profile === null) {
      throw fastify.httpErrors.badRequest();
    }

    const updatedProfile = await fastify.db.profiles.change(id, data);

    return updatedProfile;
  },
};
