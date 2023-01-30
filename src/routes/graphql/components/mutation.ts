import { GraphQLObjectType } from 'graphql';

import { updateMemberType } from './member-types';
import { createPost, updatePost } from './posts';
import { createProfile, updateProfile } from './profiles';
import {
  createUser,
  subscribeToUser,
  unsubscribeFromUser,
  updateUser,
} from './users';

export const Mutation = new GraphQLObjectType({
  name: 'Mutation',
  fields: {
    updateMemberType: updateMemberType,
    createUser: createUser,
    updateUser: updateUser,
    createPost: createPost,
    updatePost: updatePost,
    subscribeToUser: subscribeToUser,
    unsubscribeFromUser: unsubscribeFromUser,
    createProfile: createProfile,
    updateProfile: updateProfile,
  },
});
