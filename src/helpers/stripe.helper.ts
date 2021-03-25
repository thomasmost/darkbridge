// import Koa from 'koa';
import Stripe from 'stripe';
import { TeddyRequestContext } from '../api/types';
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2020-08-27',
});

export abstract class StripeHelper {
  public static async onboardUser(ctx: TeddyRequestContext) {
    const user = ctx.user;
    if (!user) {
      ctx.status = 401;
      return;
    }
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

  public static async refreshUser(ctx: TeddyRequestContext) {
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
