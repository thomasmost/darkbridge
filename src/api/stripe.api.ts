import { AuthenticatedRequestContext } from './types';

import {
  request,
  summary,
  prefix,
  tagsAll,
  responses,
  securityAll,
  operation,
  middlewaresAll,
  body,
} from '@callteddy/koa-swagger-decorator';
import {
  baseCodes,
  swaggerRefFromDefinitionName,
} from '../helpers/swagger.helper';
import { StripeHelper } from '../helpers/stripe.helper';
import { authUser } from './middlewares';

@prefix('/stripe')
@securityAll([{ token: [] }])
@middlewaresAll(authUser)
@tagsAll(['stripe'])
export class StripeAPI {
  @request('post', '/onboard')
  @operation('apiStripe_onboard')
  @summary('onboards currently logged in user with Stripe Express account')
  @responses({
    200: {
      description: 'Success',
      schema: swaggerRefFromDefinitionName('StripeAccountResponse'),
    },
    ...baseCodes([401]),
  })
  public static async onboardUser(ctx: AuthenticatedRequestContext) {
    return StripeHelper.onboardUser(ctx);
  }

  @request('post', '/setup_intent')
  @operation('apiStripe_createSetupIntent')
  @summary(
    'creates a setup intent with stripe and returns a sensitive client_secret',
  )
  @body({
    client_profile_id: {
      type: 'string',
      required: true,
      description: 'client profile id to set up',
    },
  })
  @responses({
    200: {
      description: 'Success',
      schema: swaggerRefFromDefinitionName('StripeClientSecretResponse'),
    },
    ...baseCodes([401]),
  })
  public static async createSetupIntent(ctx: AuthenticatedRequestContext) {
    const { client_profile_id } = ctx.request.body;
    const setupIntent = await StripeHelper.getCustomerPaymentSetupIntent(
      client_profile_id,
    );
    const { client_secret } = setupIntent;
    ctx.body = {
      client_secret,
    };
  }

  @request('get', '/public_key')
  @operation('apiStripe_getPublicKey')
  @summary('Fetches our public key for interacting with the Stripe API')
  @responses({
    200: {
      description: 'Success',
      schema: swaggerRefFromDefinitionName('StripePublicKeyResponse'),
    },
    ...baseCodes([401]),
  })
  public static async getPublicKey(ctx: AuthenticatedRequestContext) {
    const { STRIPE_PUBLIC_KEY } = process.env;
    ctx.status = 200;
    ctx.body = {
      STRIPE_PUBLIC_KEY,
    };
  }

  @request('get', '/refresh')
  @operation('apiStripe_refresh')
  @summary('refreshes and redirects to the express account url')
  @responses({
    ...baseCodes([302, 401]),
  })
  public static async refresh(ctx: AuthenticatedRequestContext) {
    return StripeHelper.refreshUser(ctx);
  }
}
