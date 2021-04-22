import mailgun from 'mailgun-js';
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

export const resetPasswordTemplate = (
  HOST_DOMAIN: string,
  verification_token: string,
) =>
  wrap(`
<h2 style="margin-top: 0;">Reset password</h2>
<div>
  To reset your password,
  <a href="${HOST_DOMAIN}/reset_password/${verification_token}">click here</a>.
</div>`);

export const verifyEmailTemplate = (
  HOST_DOMAIN: string,
  verification_token: string,
) =>
  wrap(`
<h2 style="margin-top: 0;">Verify your email</h2>
<div>
    To verify your email,
    <a href="${HOST_DOMAIN}/api/auth/verify_email?token=${verification_token}">
      click here
    </a>.
</div>`);
