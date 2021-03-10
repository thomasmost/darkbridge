import { sequelize } from '../sequelize';
import { ClientProfile } from '../models/client_profile.model';
import { getTimeZone, getGeocodingForAddress } from './location.helper';

export const createClientProfileForServiceProvider = async (
  created_by_user_id: string,
  email: string,
  full_name: string,
  phone: string,
  address_street: string,
  address_city: string,
  address_state: string,
  address_postal_code: string,
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
    full_name,
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

  return (await ClientProfile.findByPk(profile.id)) as ClientProfile;
};
