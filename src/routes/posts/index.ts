import { FastifyPluginAsyncJsonSchemaToTs } from '@fastify/type-provider-json-schema-to-ts';
import { idParamSchema } from '../../utils/reusedSchemas';
import { createPostBodySchema, changePostBodySchema } from './schema';
import type { PostEntity } from '../../utils/DB/entities/DBPosts';

const plugin: FastifyPluginAsyncJsonSchemaToTs = async (
  fastify
): Promise<void> => {
  fastify.get('/', async function (request, reply): Promise<PostEntity[]> {
    const posts = await fastify.db.posts.findMany();

    if (posts) {
      return posts;
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
    async function (request, reply): Promise<PostEntity> {
      const { id } = request.params;

      const post = await fastify.db.posts.findOne({ key: 'id', equals: id });

      if (post) {
        return post;
      }
      throw fastify.httpErrors.notFound();
    }
  );

  fastify.post(
    '/',
    {
      schema: {
        body: createPostBodySchema,
      },
    },
    async function (request, reply): Promise<PostEntity> {
      const { body } = request;

      if (body) {
        return await fastify.db.posts.create(body);
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
    async function (request, reply): Promise<PostEntity> {
      const { id } = request.params;

      const post = await fastify.db.posts.findOne({ key: 'id', equals: id });
      if (post) {
        return await fastify.db.posts.delete(id);
      }
      throw fastify.httpErrors.badRequest();
    }
  );

  fastify.patch(
    '/:id',
    {
      schema: {
        body: changePostBodySchema,
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<PostEntity> {
      const { id } = request.params;
      const { body } = request;

      const post = await fastify.db.posts.findOne({ key: 'id', equals: id });

      if (post) {
        return await fastify.db.posts.change(id, body);
      }
      throw fastify.httpErrors.badRequest();
    }
  );
};

export default plugin;
