import bcrypt from 'bcrypt';
import crypto from 'crypto';
import dotenv from 'dotenv';
import faker from 'faker';

dotenv.config();
import { User } from '../src/models/user.model';
import { ClientProfile } from '../src/models/client_profile.model';
import { Invoice } from '../src/models/invoice.model';
import { InvoiceItem } from '../src/models/invoice_item.model';
import { timezones_by_utc_string } from '../src/data/timezones';
import { DateTimeHelper } from '../src/helpers/datetime.helper';
import { createAppointmentForClient } from '../src/helpers/appointment.helper';
import { createClientProfileForServiceProvider } from '../src/helpers/client_profile.helper';
import { format, startOfWeek } from 'date-fns';
import { Appointment } from '../src/models/appointment.model';
import { AppointmentPriority } from '../src/shared/enums';

const CLIENTS_PER_USER = 10;
const DAYS_OF_APPOINTMENTS = 30;

const timeConfigurations = [
  ['13:30:00', '16:00:00'],
  ['10:30:00', '12:00:00', '15:00:00'],
  ['10:30:00', '12:00:00', '15:00:00', '17:00:00'],
];
const summaries = [
  'fix door',
  'leaky faucet',
  'leaky drainpipe',
  'flooded basement',
  'sparking wire',
  'flashing lights',
  'broken fan',
  'broken AC',
  'no heat',
];
const americanTimezones = [
  // 'America/Anchorage',
  // 'America/Los_Angeles',
  // 'America/Vancouver',
  // 'America/Creston',
  // 'America/Dawson_Creek',
  // 'America/Hermosillo',
  // 'America/Phoenix',
  // 'America/Denver',
  // 'America/Chicago',
  // 'America/North_Dakota/Beulah',
  // 'America/North_Dakota/Center',
  // 'America/North_Dakota/New_Salem',
  // 'America/Detroit',
  'America/New_York',
  'America/Toronto',
];

async function createUsers() {
  const users = [
    {
      email: 'tomismore@gmail.com',
      password: 'thomas',
      given_name: 'Thomas',
      family_name: 'Moore',
    },
    {
      email: 'electrical@callteddy.com',
      password: 'testing',
    },
    {
      email: 'plumbing@callteddy.com',
      password: 'testing',
    },
    {
      email: 'hvac@callteddy.com',
      password: 'testing',
    },
    {
      email: 'carpentry@callteddy.com',
      password: 'testing',
    },
  ];

  const promises = [];
  for (const user of users) {
    const { email, password, family_name, given_name } = user;
    const password_salt = crypto.randomBytes(16).toString();

    const seasoned_password = `${password_salt}:${password}`;

    const password_hash = await bcrypt.hash(seasoned_password, 12);

    promises.push(
      User.create({
        email,
        password_hash,
        password_salt,
        family_name: family_name || faker.name.lastName(),
        given_name: given_name || faker.name.firstName(),
      }),
    );
  }
  return Promise.all(promises);
}

async function createClients(created_by_user_id: string) {
  const promises = [];
  for (let i = 0; i < CLIENTS_PER_USER; i++) {
    const timezone =
      americanTimezones[Math.floor(Math.random() * americanTimezones.length)];
    const static_timezone = timezones_by_utc_string[timezone];
    if (!static_timezone) {
      console.log('Could not find static timezone for ', timezone);
    }
    // const timezone_offset = static_timezone?.offset || 0;
    const email = faker.internet.email();
    const name = faker.name.findName();
    const given_name = name.split(' ')[0];
    const family_name = name.split(' ')[1];
    const phone = faker.phone.phoneNumber();
    const address_street = faker.address.streetAddress();
    const address_city = faker.address.city();
    const address_state = faker.address.state();
    const address_postal_code = faker.address.zipCode();

    promises.push(
      createClientProfileForServiceProvider(
        created_by_user_id,
        email,
        given_name,
        family_name,
        phone,
        address_street,
        address_city,
        address_state,
        address_postal_code,
      ),
    );
  }
  return Promise.all(promises);
}

async function createAppointmentsForUser(
  user_id: string,
  clients: ClientProfile[],
) {
  const firstDate = startOfWeek(new Date());
  const promises = [];
  for (let i = 0; i < DAYS_OF_APPOINTMENTS; i++) {
    const dateForAppointments = DateTimeHelper.add(firstDate, i, 'days');
    const datePartial = format(dateForAppointments, 'yyyy-MM-dd');
    const promise = createAppointmentsForUserDay(user_id, clients, datePartial);
    promises.push(promise);
  }
  return Promise.all(promises);
}

async function createAppointmentsForUserDay(
  user_id: string,
  clients: ClientProfile[],
  date: string,
) {
  const promises = [];
  const appointmentsForDay =
    timeConfigurations[Math.floor(Math.random() * timeConfigurations.length)];
  for (let i = 0; i < appointmentsForDay.length; i++) {
    const apptTime = appointmentsForDay[i];
    const randomClient = clients[Math.floor(Math.random() * clients.length)];
    const datetimeLocal = date + ' ' + apptTime;
    const randomSummary =
      summaries[Math.floor(Math.random() * summaries.length)];
    const randomPriority = AppointmentPriority.P2;
    const randomDuration = 60;
    const promise = createAppointmentForClient(
      true,
      user_id,
      randomClient.id,
      datetimeLocal,
      randomDuration,
      randomPriority,
      randomSummary,
    ).catch((err) => {
      console.log('Creating an appointment failed due to:');
      console.log(err);
    });
    promises.push(promise);
  }
  return Promise.all(promises);
}

async function truncate() {
  await User.destroy({ truncate: true });
  await ClientProfile.destroy({ truncate: true });
  await Appointment.destroy({ truncate: true });
  await Invoice.destroy({ truncate: true });
  await InvoiceItem.destroy({ truncate: true });
}

async function main() {
  await truncate();
  const users = await createUsers();
  for (const user of users) {
    const clients = await createClients(user.id);
    await createAppointmentsForUser(user.id, clients);
  }
}

main();
