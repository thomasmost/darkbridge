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
