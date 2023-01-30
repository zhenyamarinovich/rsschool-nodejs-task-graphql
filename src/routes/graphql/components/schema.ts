import { GraphQLSchema } from 'graphql';

import { Query } from './query';
import { Mutation } from './mutation';

export const schema = new GraphQLSchema({
  query: Query,
  mutation: Mutation,
});
