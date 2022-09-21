import { firebaseApp } from './firebaseApp';

export const validateUser = async (authorization: string | undefined) => {
  if (!authorization) {
    throw new Error('Must specifiy authorization');
  }

  if (!authorization.startsWith('Bearer ')) {
    throw new Error('Invalid token');
  }

  return await firebaseApp
    .auth()
    .verifyIdToken(authorization.substring(7, authorization.length));
};
