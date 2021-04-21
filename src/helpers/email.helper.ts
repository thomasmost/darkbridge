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
    payload.html = `<strong>Originally sent to ${data.to}...</strong><hr/>\n\n ${data.html}`;
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
