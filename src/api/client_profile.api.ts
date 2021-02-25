import { Op, WhereAttributeHash } from 'sequelize';
import {
  body,
  request,
  summary,
  prefix,
  tags,
  query,
} from '@callteddy/koa-swagger-decorator';

import { TeddyRequestContext } from './types';
import {
  ClientProfile,
  ClientProfileAttributes,
  ClientProfileCreationAttributes,
} from '../models/client_profile.model';
import { getTimeZone } from '../helpers/timezone.helper';

const ClientProfileTag = tags(['clientProfile']);

type BodyParameter = {
  type: 'string' | 'number';
  description: string;
};

const postParams: Record<
  keyof Omit<
    ClientProfileCreationAttributes,
    'created_by_user_id' | 'timezone' | 'id' | 'created_at'
  >,
  BodyParameter
> = {
  email: {
    type: 'string',
    description: 'the contact email address',
  },
  phone: {
    type: 'string',
    description: 'the contact phone number',
  },
  full_name: {
    type: 'string',
    description: "the client's full name",
  },
  address_street: {
    type: 'string',
    description: 'the street address for the client',
  },
  address_city: {
    type: 'string',
    description: "the city of the client's primary address",
  },
  address_state: {
    type: 'string',
    description: "the state of client's primary address",
  },
  address_postal_code: {
    type: 'string',
    description: "the postal code for the client's primary address",
  },
};

@prefix('/client_profile')
export class ClientProfileAPI {
  @ClientProfileTag
  @request('post', '')
  @summary('create a new client profile')
  @body(postParams)
  public static async addClientProfile(ctx: TeddyRequestContext) {
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

  @ClientProfileTag
  @request('get', '')
  @summary(
    'query the client profiles by name partial, typically during appointment creation',
  )
  @query({
    name: {
      type: 'string',
    },
  })
  public static async queryClientProfiles(ctx: TeddyRequestContext) {
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
}
