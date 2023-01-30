import { FastifyPluginAsyncJsonSchemaToTs } from '@fastify/type-provider-json-schema-to-ts';
import { graphql, validate, parse } from 'graphql';
import * as depthLimit from 'graphql-depth-limit';

import { schema } from './components/schema';
import { graphqlBodySchema } from './schema';
import { DEPTH_LIMIT } from './constants';

const plugin: FastifyPluginAsyncJsonSchemaToTs = async (
  fastify
): Promise<void> => {
  fastify.post(
    '/',
    {
      schema: {
        body: graphqlBodySchema,
      },
    },
    async function (request, reply) {
      if (!request.body.query) throw fastify.httpErrors.badRequest();

      const result = validate(schema, parse(request.body.query), [
        depthLimit(DEPTH_LIMIT),
      ]);

      if (result.length) {
        reply.send({ errors: result });
      }

      return await graphql({
        schema: schema,
        source: String(request.body.query),
        variableValues: request.body.variables,
        contextValue: fastify,
      });
    }
  );
};

export default plugin;
