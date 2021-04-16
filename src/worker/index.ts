import { sendEmail, SendEmailPayload } from '../helpers/email.helper';

export const handler = async (event: {
  task: string;
  data: unknown;
}): Promise<void> => {
  console.log('Hello World!');
  if (!event.task) {
    throw Error('Expected a task');
  }
  if (event.task === 'send_email') {
    const data = event.data as SendEmailPayload;
    await sendEmail(data);
  }
  // const response = JSON.stringify(event, null, 2);
  // return response;
};
