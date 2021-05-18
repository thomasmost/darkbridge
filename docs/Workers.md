# Workers

This document provides guidance on setting up and connecting to secure staging/production workers on AWS Lambda.

## Environment Variables

For each environment (staging and prod, for example) you will need a new IAM Role and User with corresponding API keys. The public AWS_ACCESS_KEY_ID can be added to the task definition directly, the secret AWS_SECRET_ACCESS_KEY should be stored in AWS Secrets Manager (see [Working with Environment Variables](/docs/Infrastructure.md#Working_with_Environment_Variables))

## Setting up a Worker

1. Create a new Lambda instance in AWS Lambda

2. Link the new Lambda to the worker_dependencies layer (currently deployed separately)

3. Create a new GitHub Actions workflow for deploying to the lambda (TODO: flesh this out)

4. Run the deploy to push code to the new lambda

5. Ensure that the necessary Environment Variables are configured on the lambda (e.g. MAILGUN_API_KEY)

6. Copy the Lambda ARN to configure the security policy next...

## Connecting to a Worker

1. Select the appropriate IAM role for the enviornment (e.g. "Prod_Fargate_Server")

2. Add a new policy in the visual editor to support invoking the lambda by its ARN
