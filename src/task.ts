import AWS from 'aws-sdk';

const lambda = new AWS.Lambda({
  region: 'us-east-1',
});

const params = {
  FunctionName: 'worker-staging',
  InvokeArgs: JSON.stringify({
    greeting: 'hello',
  }),
};

export async function assignTask() {
  await lambda.invokeAsync(params).promise();
}
