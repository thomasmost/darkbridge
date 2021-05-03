import AWS from 'aws-sdk';
import { SendEmailPayload } from './helpers/email.helper';
import { kirk } from './helpers/log.helper';

const lambda = new AWS.Lambda({
  region: 'us-east-1',
});

type Task = 'send_email' | 'ping';

export async function assignTask(task: Task, data: unknown) {
  const params = {
    FunctionName: 'worker-staging',
    InvokeArgs: JSON.stringify({
      task,
      data,
    }),
  };
  await lambda.invokeAsync(params).promise();
}

export async function orderEmail(data: SendEmailPayload) {
  kirk.info('Ordering an email to the worker lambda');
  if (process.env.NODE_ENV === 'test') {
    return;
  }
  return assignTask('send_email', data);
}
