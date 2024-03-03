import { FastifyPluginAsyncJsonSchemaToTs } from '@fastify/type-provider-json-schema-to-ts';
import { idParamSchema } from '../../utils/reusedSchemas';
import {
  createUserBodySchema,
  changeUserBodySchema,
  subscribeBodySchema,
} from './schemas';
import type { UserEntity } from '../../utils/DB/entities/DBUsers';

const plugin: FastifyPluginAsyncJsonSchemaToTs = async (
  fastify
): Promise<void> => {
  fastify.get('/', async function (request, reply): Promise<UserEntity[]> {
    const users = await fastify.db.users.findMany();

    if (users) {
      return users;
    }
    throw fastify.httpErrors.notFound();
  });

  fastify.get(
    '/:id',
    {
      schema: {
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<UserEntity> {
      const { id } = request.params;
      const user = await fastify.db.users.findOne({ key: 'id', equals: id });

      if (user) {
        return user;
      }
      throw fastify.httpErrors.notFound();
    }
  );

  fastify.post(
    '/',
    {
      schema: {
        body: createUserBodySchema,
      },
    },
    async function (request, reply): Promise<UserEntity> {
      const { body } = request;

      if (body) {
        return await fastify.db.users.create(body);
      }
      throw fastify.httpErrors.badRequest();
    }
  );

  fastify.delete(
    '/:id',
    {
      schema: {
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<UserEntity> {
      const { id } = request.params;
      const user = await fastify.db.users.findOne({ key: 'id', equals: id });
      const users = await fastify.db.users.findMany({
        key: 'subscribedToUserIds',
        inArray: id,
      });

      const posts = await fastify.db.posts.findMany({
        key: 'userId',
        equals: id,
      });
      posts.forEach(async (post) => await fastify.db.posts.delete(post.id));

      const profiles = await fastify.db.profiles.findMany({
        key: 'userId',
        equals: id,
      });
      profiles.forEach(
        async (profile) => await fastify.db.profiles.delete(profile.id)
      );

      const filteredUsers = users.map((user) => {
        user.subscribedToUserIds = user.subscribedToUserIds.filter(
          (userId) => userId !== id
        );
        return user;
      });

      filteredUsers.forEach(
        async (user) => await fastify.db.users.change(user.id, user)
      );

      if (user) {
        return await fastify.db.users.delete(id);
      }
      throw fastify.httpErrors.badRequest();
    }
  );

  fastify.post(
    '/:id/subscribeTo',
    {
      schema: {
        body: subscribeBodySchema,
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<UserEntity> {
      const subscribeId = request.params.id;
      const { userId } = request.body;

      const user = await fastify.db.users.findOne({
        key: 'id',
        equals: userId,
      });

      if (user) {
        user.subscribedToUserIds.push(subscribeId);
        return await fastify.db.users.change(userId, user);
      }
      throw fastify.httpErrors.badRequest();
    }
  );

  fastify.post(
    '/:id/unsubscribeFrom',
    {
      schema: {
        body: subscribeBodySchema,
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<UserEntity> {
      const subscribeId = request.params.id;
      const { userId } = request.body;

      const user = await fastify.db.users.findOne({
        key: 'id',
        equals: userId,
      });

      if (user) {
        const isSubscribeUser = user.subscribedToUserIds.find(
          (userId) => userId === subscribeId
        );
        if (isSubscribeUser) {
          user.subscribedToUserIds = user.subscribedToUserIds.filter(
            (userId) => userId !== subscribeId
          );
          return await fastify.db.users.change(userId, user);
        }
      }
      throw fastify.httpErrors.badRequest();
    }
  );

  fastify.patch(
    '/:id',
    {
      schema: {
        body: changeUserBodySchema,
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<UserEntity> {
      const { id } = request.params;
      const { body } = request;

      const user = await fastify.db.users.findOne({ key: 'id', equals: id });

      if (user) {
        return await fastify.db.users.change(id, body);
      }
      throw fastify.httpErrors.badRequest();
    }
  );
};

export default plugin;
