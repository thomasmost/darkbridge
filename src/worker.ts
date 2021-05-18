import { sendEmail, SendEmailPayload } from './helpers/email.helper';
import { kirk } from './helpers/log.helper';

export const handler = async (event: {
  task: string;
  data: unknown;
}): Promise<void> => {
  if (!event.task) {
    kirk.error('Received event without task:', event);
    throw Error('Expected a task');
  }
  kirk.info(event.task);
  if (event.task === 'send_email') {
    const data = event.data as SendEmailPayload;
    kirk.info('Sending...', {
      subject: data.subject,
    });
    await sendEmail(data);
  }
  // const response = JSON.stringify(event, null, 2);
  // return response;
};
