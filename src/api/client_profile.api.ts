import Router from 'koa-router';
import { Op, WhereAttributeHash } from 'sequelize';
import { getTimeZone } from '../helpers/timezone.helper';
import {
  ClientProfile,
  ClientProfileAttributes,
} from '../models/client_profile.model';
import { TeddyRequestContext } from './types';

export const clientProfileAPI = new Router();

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
  } = ctx.request.body as Partial<ClientProfileAttributes>;

  if (
    !email ||
    !full_name ||
    !phone ||
    !address_street ||
    !address_city ||
    !address_state ||
    !address_postal_code
  ) {
    throw Error('Missing required fields!');
  }
  const created_by_user_id = user.id;

  const timezone = await getTimeZone(address_city, address_state);

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

export async function queryClientProfiles(ctx: TeddyRequestContext) {
  if (!ctx.user) {
    ctx.status = 401;
    return;
  }
  const user = ctx.user;

  const { name } = ctx.request.query;

  const where: WhereAttributeHash<ClientProfileAttributes> = {
    created_by_user_id: user.id,
  };

  if (name) {
    where.full_name = {
      [Op.like]: `%${name}%`,
    };
  }

  const profiles = await ClientProfile.findAll({
    where,
    order: [['created_at', 'DESC']],
    limit: 20,
  });

  console.log(`Found: ${profiles.length}`);

  ctx.status = 200;
  ctx.body = profiles;
}

clientProfileAPI.get('/', queryClientProfiles);
