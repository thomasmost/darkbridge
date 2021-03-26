import Koa from 'koa';
import { User } from '../models/user.model';

export interface SemiAuthenticatedRequestContext
  extends Koa.ParameterizedContext {
  user?: User;
}

export interface AuthenticatedRequestContext
  extends SemiAuthenticatedRequestContext {
  user: User;
}
