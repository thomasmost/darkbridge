import Router from 'koa-router';
import { UserAttributes } from '../models/user.model';
import { TeddyRequestContext } from './types';

export const userAPI = new Router();

export async function updateSelf(ctx: TeddyRequestContext) {
  if (!ctx.user) {
    ctx.status = 401;
    return;
  }

  const { phone, given_name, family_name } = ctx.request
    .body as Partial<UserAttributes>;
  const user = ctx.user;

  if (phone) {
    user.phone = phone;
  }
  if (given_name) {
    user.given_name = given_name;
  }
  if (family_name) {
    user.family_name = family_name;
  }

  await user.save();

  ctx.status = 204;
}

userAPI.put('/self', updateSelf);
