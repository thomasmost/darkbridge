import Koa from 'koa';
import { AuthenticationError } from '../helpers/error.helper';
import { SemiAuthenticatedRequestContext } from './types';

export const userAuthenticated = async (
  ctx: SemiAuthenticatedRequestContext,
  next: Koa.Next,
) => {
  if (!ctx.user) {
    throw new AuthenticationError(
      'Only logged in users may access the invoice api',
    );
  }
  return next();
};

export const authUser = [userAuthenticated];
