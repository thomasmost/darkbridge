import Koa from 'koa';
import { User } from '../models/user.model';

export interface TeddyRequestContext extends Koa.ParameterizedContext {
  user?: User;
}

export interface AuthenticatedRequestContext extends TeddyRequestContext {
  user: User;
}
