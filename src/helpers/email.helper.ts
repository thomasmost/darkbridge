import mailgun from 'mailgun-js';

const DOMAIN = process.env.MAILGUN_DOMAIN;
const API_KEY = process.env.MAILGUN_API_KEY;

type SendEmailPayload = {
  to: string;
  subject: string;
  text?: string;
  html?: string;
  'h:X-Mailgun-Variables'?: Record<string, string>;
};

export const sendEmail = async (data: SendEmailPayload) => {
  if (!DOMAIN || !API_KEY) {
    console.log(`Missing Mailgun Config:
Add a MAILGUN_DOMAIN, MAILGUN_API_KEY, and DEV_EMAIL to start testing the email integration
    `);
    return;
  }

  const mg = mailgun({ apiKey: API_KEY, domain: DOMAIN });

  const payload = {
    ...data,
    from: 'Teddy <notifications@callteddy.com>',
  };
  if (process.env.DEV_EMAIL) {
    console.log(`Overriding with DEV_EMAIL: ${process.env.DEV_EMAIL}`);
    payload.to = process.env.DEV_EMAIL;
    payload.subject = `DEV: ${payload.subject}`;
    payload.text = `Originally sent to ${data.to}...\n\n ${data.text}`;
    payload.html = `Originally sent to ${data.to}...\n\n ${data.html}`;
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
