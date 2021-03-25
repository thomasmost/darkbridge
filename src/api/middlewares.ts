import Koa from 'koa';
import { AuthenticationError } from '../helpers/error.helper';
import { TeddyRequestContext } from './types';

export const userAuthenticated = (ctx: TeddyRequestContext, next: Koa.Next) => {
  if (!ctx.user) {
    throw new AuthenticationError(
      'Only logged in users may access the invoice api',
    );
  }
  next();
};

export const authUser = [userAuthenticated];
