import mailgun from 'mailgun-js';
import { html } from './html';
import { kirk } from './log.helper';

const DOMAIN = process.env.MAILGUN_DOMAIN;
const API_KEY = process.env.MAILGUN_API_KEY;
const NODE_ENV = process.env.NODE_ENV;

export type SendEmailPayload = {
  to: string;
  subject: string;
  text?: string;
  html?: string;
  'h:X-Mailgun-Variables'?: Record<string, string>;
};

export const sendEmail = async (data: SendEmailPayload) => {
  if (!DOMAIN || !API_KEY) {
    kirk.warn(`Missing Mailgun Config:
Add a MAILGUN_DOMAIN, MAILGUN_API_KEY, and DEV_EMAIL to start testing the email integration
    `);
    return;
  }

  if (NODE_ENV === 'test') {
    // console.log(`Skip emails in tests`);
    return;
  }

  const mg = mailgun({ apiKey: API_KEY, domain: DOMAIN });

  const from =
    NODE_ENV === 'production'
      ? 'Teddy <notifications@callteddy.com>'
      : `Teddy (${NODE_ENV}) <${NODE_ENV}@callteddy.com>`;

  const payload = {
    ...data,
    from,
  };
  if (process.env.DEV_EMAIL) {
    kirk.warn(`Overriding with DEV_EMAIL: ${process.env.DEV_EMAIL}`);
    payload.to = process.env.DEV_EMAIL;
    payload.subject = `DEV: ${payload.subject}`;
    payload.text = `Originally sent to ${data.to}...\n\n ${data.text}`;
    payload.html = `<strong>Originally sent to ${data.to}...</strong>
      <hr />
      ${data.html}`;
  }

  return new Promise((resolve, reject) => {
    mg.messages().send(payload, (err, body) => {
      if (err) {
        return reject(err);
      }
      return resolve(body);
    });
  });
};

const header = `<div style="background-color: #101042; padding: 20px; margin-top: 20px; border-top-left-radius: 10px; border-top-right-radius: 10px;">
  <img style="height: 60px; margin: auto; display: block;" src="https://staging.callteddy.com/logo_light.png" />
</div>`;

/*
  <img style="height: 20px; display: inline-block;" src="https://staging.callteddy.com/logo_light.png" />
*/

const footer = `<footer style="margin-top: 40px; color: #999; font-size: .9em;">
  © 2021 Teddy Labs, Inc. •
  <a style="color: #999; text-decoration: none;" href="mailto:support@callteddy.com">Contact Support</a>
</footer>`;

const wrap = (template: string) =>
  `<div style="background-color: #daedfd; padding: 20px;">
    <div style="max-width: 600px; margin: auto;">
      ${header}
      <div style="background-color: white; padding: 20px; margin-bottom: 20px; border-bottom-left-radius: 10px; border-bottom-right-radius: 10px;">
        ${template}
        ${footer}
      </div>
    </div>
  </div>`;

export function constructEmail<T extends string>(
  templateFn: (
    ...values: (Record<T, string | number> & Record<'HOST_DOMAIN', string>)[]
  ) => string,
  values: Omit<Record<T, string | number>, 'HOST_DOMAIN'>,
) {
  if (!process.env.HOST_DOMAIN) {
    kirk.error('Missing host domain in config');
    throw Error('Missing host domain');
  }
  const data: Record<T, string | number> & Record<'HOST_DOMAIN', string> = {
    ...values,
    HOST_DOMAIN: process.env.HOST_DOMAIN,
  } as Record<T, string | number> & Record<'HOST_DOMAIN', string>;
  const bodyContents = templateFn(data);
  return wrap(bodyContents);
}

export const testEmailTemplate = html`<h2 style="margin-top: 0;">Test Email</h2>
  <div>
    Well done, you've received a test email! It's ${'date'} The host domain is
    ${'HOST_DOMAIN'}, and your name is ${'user_name'}
  </div>`;

export const resetPasswordTemplate = html`<h2 style="margin-top: 0;">
    Reset password
  </h2>
  <div>
    To reset your password,
    <a href="${'HOST_DOMAIN'}/reset_password/${'verification_token'}"
      >click here</a
    >.
  </div>`;

export const verifyEmailTemplate = html`<h2 style="margin-top: 0;">
    Verify your email
  </h2>
  <div>
    To verify your email,
    <a
      href="${'HOST_DOMAIN'}/api/auth/verify_email?token=${'verification_token'}"
    >
      click here </a
    >.
  </div>`;

export const clientConfirmationRequestTemplate = html` <h2
    style="margin-top: 0;"
  >
    Confirm your appointment
  </h2>
  <div style="margin-bottom: 20px; font-size: 1.2em;">Hi ${'client_name'},</div>
  <div style="margin-bottom: 20px; font-size: 1.2em;">
    ${'service_provider_name'} ${'with_company'}has scheduled a service
    appointment for ${'appointment_date_and_time'}.
  </div>
  <div style="margin-bottom: 20px; font-size: 1.2em;">
    Please confirm your appointment by entering your payment information through
    our secure portal.
  </div>
  <div style="margin: 20px 0; font-size: 1.2em;">
    <a
      href="${'HOST_DOMAIN'}/e/client_portal/${'verification_token'}/setup"
      style="padding: 10px; border-radius: 5px; background-color: #45A3F7; color: white; text-decoration: none;"
    >
      Confirm appointment
    </a>
  </div>
  <div style="margin: 20px 0; font-size: 1.2em;">
    Doesn't look right? You can cancel
    <a href="${'HOST_DOMAIN'}/e/client_portal/${'verification_token'}/cancel"
      >here</a
    >. You may also
    <a
      href="${'HOST_DOMAIN'}/e/client_portal/${'verification_token'}/confirm_wo_payment"
    >
      confirm without payment details</a
    >
    if you plan to pay by cash or check.
  </div>`;

// this name is... rough
export const clientConfirmationRequestWithoutPaymentDetailsNeededTemplate = html` <h2
    style="margin-top: 0;"
  >
    Confirm your appointment
  </h2>
  <div style="margin-bottom: 20px; font-size: 1.2em;">Hi ${'client_name'},</div>
  <div style="margin-bottom: 20px; font-size: 1.2em;">
    ${'service_provider_name'} ${'with_company'}has scheduled a service
    appointment for ${'appointment_date_and_time'}.
  </div>
  <div style="margin-bottom: 20px; font-size: 1.2em;">
    We already have your card on file! Please confirm your appointment below:
  </div>
  <div style="margin: 20px 0; font-size: 1.2em;">
    <a
      href="${'HOST_DOMAIN'}/api/client_confirmation/confirm/${'verification_token'}"
      style="padding: 10px; border-radius: 5px; background-color: #45A3F7; color: white; text-decoration: none;"
    >
      Confirm appointment
    </a>
  </div>
  <div style="margin: 20px 0;">
    Doesn't look right? You can cancel
    <a href="${'HOST_DOMAIN'}/e/client_portal/${'verification_token'}/cancel"
      >here</a
    >.
  </div>`;

export const clientPaymentRequestTemplate = html` <h2 style="margin-top: 0;">
    Enter your payment details
  </h2>
  <div style="margin-bottom: 20px; font-size: 1.2em;">Hi ${'client_name'},</div>
  <div style="margin-bottom: 20px; font-size: 1.2em;">
    ${'service_provider_name'} ${'with_company'} has created an invoice of
    $${'invoice_total'} for your appointment on ${'appointment_date_and_time'}.
  </div>
  <div style="margin-bottom: 20px; font-size: 1.2em;">
    Please enter your payment information through our secure portal.
  </div>
  <div style="margin: 20px 0; font-size: 1.2em;">
    <a
      href="${'HOST_DOMAIN'}/e/client_portal/${'verification_token'}/setup"
      style="padding: 10px; border-radius: 5px; background-color: #45A3F7; color: white; text-decoration: none;"
    >
      Pay now
    </a>
  </div>`;
