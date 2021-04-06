import { Op, WhereAttributeHash } from 'sequelize';
import {
  body,
  request,
  summary,
  prefix,
  query,
  securityAll,
  tagsAll,
  responses,
  operation,
  middlewaresAll,
  path,
} from '@callteddy/koa-swagger-decorator';

import { AuthenticatedRequestContext } from './types';
import {
  ClientProfile,
  ClientProfileAttributes,
  ClientProfileCreationAttributes,
  ClientProfileModel,
} from '../models/client_profile.model';
import { createClientProfileForServiceProvider } from '../helpers/client_profile.helper';
import {
  arrayOf,
  baseCodes,
  swaggerRefFromModel,
} from '../helpers/swagger.helper';
import { authUser } from './middlewares';
import { NotFoundError } from '../helpers/error.helper';

type BodyParameter = {
  type: 'string' | 'integer';
  description: string;
  required?: boolean;
};

const postParams: Record<
  keyof Omit<
    ClientProfileCreationAttributes,
    | 'created_by_user_id'
    | 'coordinates'
    | 'timezone'
    | 'timezone_offset'
    | 'id'
    | 'created_at'
  >,
  BodyParameter
> = {
  email: {
    type: 'string',
    required: true,
    description: 'the contact email address',
  },
  phone: {
    type: 'string',
    required: true,
    description: 'the contact phone number',
  },
  given_name: {
    type: 'string',
    required: true,
    description: "the client's first name",
  },
  family_name: {
    type: 'string',
    required: true,
    description: "the client's last name",
  },
  address_street: {
    type: 'string',
    required: true,
    description: 'the street address for the client',
  },
  address_city: {
    type: 'string',
    required: true,
    description: "the city of the client's primary address",
  },
  address_state: {
    type: 'string',
    required: true,
    description: "the state of client's primary address",
  },
  address_postal_code: {
    type: 'string',
    required: true,
    description: "the postal code for the client's primary address",
  },
};

@prefix('/client_profile')
@securityAll([{ token: [] }])
@middlewaresAll(authUser)
@tagsAll(['clientProfile'])
export class ClientProfileAPI {
  @request('post', '')
  @operation('apiClientProfile_create')
  @summary('create a new client profile')
  @body(postParams)
  @responses({
    200: {
      description: 'Success',
      schema: swaggerRefFromModel(ClientProfileModel),
    },
    401: {
      description: 'Unauthorized',
    },
  })
  public static async addClientProfile(ctx: AuthenticatedRequestContext) {
    const user = ctx.user;

    const {
      email,
      given_name,
      family_name,
      phone,
      address_street,
      address_city,
      address_state,
      address_postal_code,
    } = ctx.request.body as ClientProfileCreationAttributes;

    const created_by_user_id = user.id;

    const profile = await createClientProfileForServiceProvider(
      created_by_user_id,
      email,
      given_name,
      family_name,
      phone,
      address_street,
      address_city,
      address_state,
      address_postal_code,
      true,
    );

    ctx.status = 200;
    ctx.body = profile;
  }

  @request('get', '')
  @operation('apiClientProfile_query')
  @summary(
    'query the client profiles by name partial, typically during appointment creation',
  )
  @query({
    name: {
      type: 'string',
    },
  })
  @responses({
    200: {
      description: 'Success',
      schema: arrayOf(ClientProfileModel),
    },
    401: {
      description: 'Unauthorized',
    },
  })
  public static async queryClientProfiles(ctx: AuthenticatedRequestContext) {
    const user = ctx.user;

    const { name } = ctx.request.query;

    const where: WhereAttributeHash<ClientProfileAttributes> = {
      created_by_user_id: user.id,
    };

    if (name) {
      (where as { [Op.or]: WhereAttributeHash<ClientProfileAttributes> })[
        Op.or
      ] = {
        given_name: {
          [Op.like]: `%${name}%`,
        },
        family_name: {
          [Op.like]: `%${name}%`,
        },
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

  @request('get', '/{id}')
  @operation('apiClientProfile_getById')
  @summary('get a single client profile by primary key')
  @path({
    id: { type: 'string', required: true, description: 'id' },
  })
  @responses({
    200: {
      description: 'Success',
      schema: swaggerRefFromModel(ClientProfileModel),
    },
    ...baseCodes([401, 404]),
  })
  public static async getClientById(ctx: AuthenticatedRequestContext) {
    const { id } = ctx.validatedParams;
    const client = await ClientProfile.findByPk(id);
    ctx.body = client;
  }

  @request('put', '/{id}')
  @operation('apiClientProfile_update')
  @summary('update a client profile')
  @path({
    id: {
      type: 'string',
      required: true,
      description: 'id of the client profile',
    },
  })
  @body(postParams)
  @responses({
    200: {
      description: 'Success',
      schema: swaggerRefFromModel(ClientProfileModel),
    },
    401: {
      description: 'Unauthorized',
    },
  })
  public static async updateClientProfile(ctx: AuthenticatedRequestContext) {
    const user = ctx.user;

    const {
      email,
      given_name,
      family_name,
      phone,
      address_street,
      address_city,
      address_state,
      address_postal_code,
    } = ctx.request.body as ClientProfileCreationAttributes;

    const { id } = ctx.validatedParams;
    const clientProfile = await ClientProfile.findByPk(id);

    if (!clientProfile || clientProfile.created_by_user_id !== user.id) {
      throw new NotFoundError(
        `Tried to update a client profile that doesn't exist`,
      );
    }

    clientProfile.given_name = given_name;
    clientProfile.family_name = family_name;
    clientProfile.phone = phone;
    clientProfile.email = email;
    clientProfile.address_street = address_street;
    clientProfile.address_city = address_city;
    clientProfile.address_state = address_state;
    clientProfile.address_postal_code = address_postal_code;

    await clientProfile.save();
    ctx.status = 200;
    ctx.body = clientProfile;
  }
}
