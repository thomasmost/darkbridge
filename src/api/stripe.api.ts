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
import { Stripe } from 'stripe';

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

  @request('post', '/add_payment_method')
  @operation('apiStripe_addPaymentMethod')
  @summary('add a payment method to a client')
  @body({
    client_profile_id: {
      type: 'string',
      required: true,
      description: 'client profile id to set up',
    },
    setupIntent: swaggerRefFromDefinitionName('SuccessfulStripeSetupIntent'),
  })
  @responses({
    ...baseCodes([204, 401]),
  })
  public static async addPaymentMethod(ctx: AuthenticatedRequestContext) {
    const { client_profile_id, setupIntent } = ctx.request.body as {
      client_profile_id: string;
      setupIntent: Stripe.SetupIntent;
    };
    await StripeHelper.addPrimaryPaymentMethod(client_profile_id, setupIntent);
    ctx.status = 204;
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
