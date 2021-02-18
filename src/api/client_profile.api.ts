import Router from 'koa-router';
import {
  ClientProfile,
  ClientProfileAttributes,
} from '../models/client_profile.model';
import { TeddyRequestContext } from './types';

export const clientProfileAPI = new Router();

// eslint-disable-next-line sonarjs/cognitive-complexity
export async function addClientProfile(ctx: TeddyRequestContext) {
  if (!ctx.user) {
    ctx.status = 401;
    return;
  }
  const user = ctx.user;

  const {
    email,
    full_name,
    phone,
    address_street,
    address_city,
    address_state,
    address_postal_code,
    timezone,
  } = ctx.request.body as Partial<ClientProfileAttributes>;

  if (
    !email ||
    !full_name ||
    !phone ||
    !address_street ||
    !address_city ||
    !address_state ||
    !address_postal_code ||
    !timezone
  ) {
    throw Error('Missing required fields!');
  }
  const created_by_user_id = user.id;

  const profile = await ClientProfile.create({
    created_by_user_id,
    email,
    phone,
    full_name,
    address_street,
    address_city,
    address_state,
    address_postal_code,
    timezone,
  });

  ctx.status = 200;
  ctx.body = profile;
}

clientProfileAPI.post('/', addClientProfile);
