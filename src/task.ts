import AWS from 'aws-sdk';

const lambda = new AWS.Lambda({
  region: 'us-east-1',
});

const params = {
  FunctionName: 'worker-staging',
  InvokeArgs: JSON.stringify({
    task: 'send_email',
    data: {
      from: 'staging@callteddy.com',
      to: 'tomismore@gmail.com',
      subject: 'Hello',
      html: '<h1>Hello there</h1>',
    },
  }),
};

export async function assignTask() {
  await lambda.invokeAsync(params).promise();
}
