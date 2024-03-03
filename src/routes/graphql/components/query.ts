import { GraphQLObjectType } from 'graphql';

import { getUserById, getAllUsers } from './users';
import { getMemberTypeById, getAllMemberTypes } from './member-types';
import { getPostById, getAllPosts } from './posts';
import { getProfileById, getAllProfiles } from './profiles';

export const Query = new GraphQLObjectType({
  name: 'Query',
  fields: {
    getAllMemberTypes,
    getMemberTypeById,
    getAllPosts,
    getPostById,
    getUserById,
    getAllUsers,
    getAllProfiles,
    getProfileById,
  },
});
