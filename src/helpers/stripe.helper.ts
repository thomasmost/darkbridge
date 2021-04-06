// import Koa from 'koa';
import Stripe from 'stripe';
import { AuthenticatedRequestContext } from '../api/types';
import { ClientProfile } from '../models/client_profile.model';
import { NotFoundError } from './error.helper';
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2020-08-27',
});

export type StripeAddress = {
  city: string;
  state: string;
  country: string;
  line1: string;
  line2?: string;
  postal_code: string;
};

export abstract class StripeHelper {
  public static async onboardUser(ctx: AuthenticatedRequestContext) {
    const user = ctx.user;
    try {
      const account = await stripe.accounts.create({ type: 'express' });
      user.stripe_express_account_id = account.id;

      await user.save();

      const origin = `${ctx.headers.origin}`;
      const accountLinkURL = await generateAccountLink(account.id, origin);
      ctx.body = { url: accountLinkURL };
    } catch (err) {
      ctx.status = 500;
      ctx.message = err.message;
    }
  }

  public static async refreshUser(ctx: AuthenticatedRequestContext) {
    const user = ctx.user;
    if (!user) {
      ctx.status = 401;
      return;
    }
    if (!user.stripe_express_account_id) {
      ctx.redirect('/');
      return;
    }
    try {
      const { stripe_express_account_id } = user;
      const origin = `https://${ctx.headers.host}`;

      const accountLinkURL = await generateAccountLink(
        stripe_express_account_id,
        origin,
      );
      ctx.redirect(accountLinkURL);
    } catch (err) {
      ctx.status = 500;
      ctx.message = err.message;
    }
  }

  public static async createCustomer(
    name: string,
    email: string,
    phone: string,
    address: StripeAddress,
    teddy_client_profile_id: string,
    teddy_user_id: string | null,
  ) {
    const customer = await stripe.customers.create({
      name,
      email,
      phone,
      address,
      metadata: {
        teddy_client_profile_id,
        teddy_user_id,
      },
    });
    console.log('Customer successfully created with id: ', customer.id);
    return customer;
  }

  public static async getCustomerPaymentSetupIntent(client_profile_id: string) {
    const client_profile = await ClientProfile.findByPk(client_profile_id);

    if (!client_profile) {
      throw new NotFoundError();
    }

    return stripe.setupIntents.create({
      customer: client_profile.stripe_customer_id,
    });
  }
}

function generateAccountLink(accountID: string, origin: string) {
  return stripe.accountLinks
    .create({
      type: 'account_onboarding',
      account: accountID,
      refresh_url: `${origin}/api/stripe/refresh`,
      return_url: `${origin}/onboarding/complete`,
    })
    .then((link) => link.url);
}
