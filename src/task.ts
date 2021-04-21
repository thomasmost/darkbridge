import AWS from 'aws-sdk';
import { SendEmailPayload } from './helpers/email.helper';

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
  return assignTask('send_email', data);
}
