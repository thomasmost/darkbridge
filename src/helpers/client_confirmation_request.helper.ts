import { format } from 'date-fns-tz';
import { Appointment } from '../models/appointment.model';
import { ClientProfile } from '../models/client_profile.model';
import { ClientConfirmationRequest } from '../models/client_confirmation_request.model';
import { User } from '../models/user.model';
import { orderEmail } from '../task';
import {
  clientConfirmationRequestTemplate,
  clientConfirmationRequestWithoutPaymentDetailsNeededTemplate,
  constructEmail,
  SendEmailPayload,
} from './email.helper';
import { kirk } from './log.helper';

export const issueClientConfirmationRequest = async (
  current_user: User,
  client_profile_id: string,
  appointment_id: string,
) => {
  kirk.info('Issuing a new client setup request', {
    client_profile_id,
    appointment_id,
  });

  const profilePromise = ClientProfile.findByPk(client_profile_id);
  const appointmentPromise = Appointment.findByPk(appointment_id);

  const [profile, appointment] = await Promise.all([
    profilePromise,
    appointmentPromise,
  ]);

  if (!profile) {
    throw Error(
      'Tried to issue a client set up request for a client that does not exist',
    );
  }
  if (!appointment) {
    throw Error(
      'Tried to issue a client set up request for an appointment that does not exist',
    );
  }

  if (!process.env.HOST_DOMAIN) {
    kirk.error('Missing HOST_DOMAIN in config');
    return;
  }

  const email_sent_to = profile.email;

  const request = await ClientConfirmationRequest.create({
    appointment_id,
    client_profile_id,
    email_sent_to,
  });

  if (profile.primary_payment_method_id) {
    // already have a payment method
    const emailData: SendEmailPayload = {
      to: email_sent_to,
      subject: 'Confirm your appointment',
      html: constructEmail(
        clientConfirmationRequestWithoutPaymentDetailsNeededTemplate,
        {
          verification_token: request.verification_token,
          appointment_date_and_time: `${format(
            new Date(appointment.datetime_local),
            'LLLL do',
          )} at ${format(new Date(appointment.datetime_local), 'h:mm a')}`,
          client_name: profile.given_name,
          service_provider_name: `${current_user.given_name} ${current_user.family_name}`,
          with_company: current_user.contractor_profile?.company_name
            ? `with ${current_user.contractor_profile?.company_name} `
            : '',
        },
      ),
      text: `Confirm your appointment by entering your payment info through our 
      secure portal by visiting ${process.env.HOST_DOMAIN}/api/client_confirmation/confirm/${request.verification_token}`,
    };

    await orderEmail(emailData);
    return;
  }

  const emailData: SendEmailPayload = {
    to: email_sent_to,
    subject: 'Confirm your appointment',
    html: constructEmail(clientConfirmationRequestTemplate, {
      verification_token: request.verification_token,
      appointment_date_and_time: `${format(
        new Date(appointment.datetime_local),
        'LLLL do',
      )} at ${format(new Date(appointment.datetime_local), 'h:mm a')}`,
      client_name: profile.given_name,
      service_provider_name: `${current_user.given_name} ${current_user.family_name}`,
      with_company: current_user.contractor_profile?.company_name
        ? `with ${current_user.contractor_profile?.company_name} `
        : '',
    }),
    text: `Confirm your appointment by entering your payment info through our 
      secure portal at ${process.env.HOST_DOMAIN}/e/client_confirmation/${request.verification_token}`,
  };

  await orderEmail(emailData);
};
