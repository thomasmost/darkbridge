import { sequelize } from '../sequelize';
import { ClientProfile } from '../models/client_profile.model';
import { getTimeZone, getGeocodingForAddress } from './location.helper';
import { StripeAddress, StripeHelper } from './stripe.helper';

export const createClientProfileForServiceProvider = async (
  created_by_user_id: string,
  email: string,
  given_name: string,
  family_name: string,
  phone: string,
  address_street: string,
  address_city: string,
  address_state: string,
  address_postal_code: string,
  create_stripe_customer: boolean,
) => {
  const { timezone, timezone_offset } = await getTimeZone(
    address_city,
    address_state,
  );

  const { error, location } = await getGeocodingForAddress(
    address_street,
    address_city,
    address_state,
  );

  if (error || !location) {
    console.log('help');
    throw Error('Could not find this location, please try again later');
  }

  // const coordinates = {
  //   type: 'Point',
  //   coordinates: [location.lat, location.lng],
  // };

  const profile = await ClientProfile.create({
    created_by_user_id,
    email,
    phone,
    given_name,
    family_name,
    address_street,
    address_city,
    address_state,
    address_postal_code,
    timezone,
    timezone_offset,
  });

  await sequelize.query(
    `update client_profile set coordinates=ST_GeomFromText('POINT(${location.lat} ${location.lng})') WHERE id='${profile.id}'`,
  );

  if (create_stripe_customer) {
    const name = `${given_name} ${family_name}`;
    const address: StripeAddress = {
      city: address_city,
      state: address_state,
      country: 'US',
      line1: address_street,
      postal_code: address_postal_code,
    };
    const customer = await StripeHelper.createCustomer(
      name,
      email,
      phone,
      address,
      profile.id,
      null,
    );
    if (customer) {
      profile.stripe_customer_id = customer.id;
      await profile.save();
    }
  }

  return (await ClientProfile.findByPk(profile.id)) as ClientProfile;
};
