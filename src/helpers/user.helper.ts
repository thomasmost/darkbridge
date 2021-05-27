import { User } from '../models/user.model';
import { kirk } from './log.helper';
import { StripeHelper } from './stripe.helper';

export async function validateAndUpdateUserStripeConnection(user: User) {
  const user_id = user.id;
  kirk.info('validateAndUpdateUserStripeConnection', { user_id });
  if (!user.stripe_express_account_id) {
    return user;
  }

  const response = await StripeHelper.getAccountDetails(
    user.stripe_express_account_id,
  );

  if (response.error || !response.account) {
    kirk.error(
      'Error validating user stripe connection',
      response.error || { err: 'account undefined' },
    );
    return user;
  }
  const { account } = response;
  const { charges_enabled, details_submitted } = account;

  kirk.info('validateAndUpdateUserStripeConnection', {
    user_id,
    charges_enabled,
    details_submitted,
  });

  user.stripe_charges_enabled = charges_enabled;
  user.stripe_details_submitted = details_submitted;
  await user.save();
  return user;
}
