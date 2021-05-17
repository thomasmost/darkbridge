# Infrastructure

You will need the aws command line tool installed to execute these steps.

## Create a Container Registry

```bash
aws ecr create-repository --repository-name teddy-web-ecr --region us-east-1
```

## Set up a Fargate service

These first three steps are necessary for the GitHub Actions workflow to succeed.

Ensure that the `ecsTaskExecutionRole` role is available and can be assumed by the GitHub workflow as [described here](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/task_execution_IAM_role.html).

1. Create a role (if it does not already exist) called `ecsTaskExecutionRole` with the `AmazonECSTaskExecutionRolePolicy` policy
2. Also add the `SecretsManagerReadWrite` policy
3. Replace the trust relationship with the following:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "",
      "Effect": "Allow",
      "Principal": {
        "Service": "ecs-tasks.amazonaws.com"
      },
      "Action": "sts:AssumeRole"
    }
  ]
}
```

Now register the task definition. **Note that you will need to add an `image` attribute under the `containerDefinition` with a temporary value (e.g. "temp") for the registration to succeed.** Delete this attribute after registering the task-definition, it will be filled in during deploys.

```bash
aws ecs register-task-definition --region us-east-1 --cli-input-json file://$HOME/teddy/task-def-staging.json
```

## Create an ECS cluster

```bash
aws ecs create-cluster --region us-east-1 --cluster-name teddy-web-cluster-staging
```

## Create a Fargate service

Make sure to specify the cluster for your service

**Also note that you have to associate the load balancer with the service at the time of the service creation**

E.g.

```bash
aws ecs create-service --region us-east-1 --service-name teddy-web-service-staging --task-definition teddy-web-task-staging:1 --desired-count 2 --launch-type "FARGATE" --network-configuration "awsvpcConfiguration={subnets=[ [[subnet-private-id1]], [[subnet-private-id2]] ],securityGroups=[ [[sg]] ]}" --load-balancers "targetGroupArn=[[arn]], containerName=teddy-web-container-staging, containerPort=80" --cluster teddy-web-cluster-staging --output json
```

## Working with Environment Variables

1. Go to the AWS Secrets Manager
2. Add an 'Other' > 'Plaintext' Secret
3. Name it EXAMPLE_SECRET_VARIABLE and replace the arn in task-def.json
4. Add the SecretsManagerReadWrite policy to your task-def's executionRole

See: https://docs.aws.amazon.com/AmazonECS/latest/developerguide/specifying-sensitive-data-secrets.html

## Gotchas

- Make sure the security group has an HTTP inbound rule set to 0.0.0.0 to allow public access
- The ALB must be created and the target group specified before the service is created (see above)
- Similarly the app in the task definition file, the alb, and so on should be named better.
- By default, Fargate containers are limited to 200 MiB of memory; running the server with ts-node for example creates an unstable service since ts-node compiles to memory -- it's much better to compile to disk for production.
- RE: ENV VARIABLES, Fargate only supports secrets that are a single value, not the JSON or key value secrets. So choose OTHER when creating the secret and just put a single text value there.
- Fargate **services** (see [creating the service](#create-a-fargate-service)) deployed to public subnets need to explicitly be told to expose a public IP address in order to connect to the internet and pull their container images from the registry. This can result in a `CannotPullContainerError`. **WARNING: this is a poor security practice in any case and should not be used for production setups** (see below).
- Fargate services deployed to _private_ subnets don't need the assignPublicIp property to be included, but they will need a NAT gateway to allow for outbound traffic and an Application Load Balancer for inbound traffic. **This is the recommended practice for production-security setups.**
- You may want to add an `--output json` flag to the ends of your aws CLI commands depending on your configuration
- For a production-quality environment, the Fargate cluster should be deployed to **private subnets only**. The Fargate cluster should have its own security group accepting HTTP traffic from the load balancer, and the load balancer should have an outbound rule allowing HTTP traffic to the Fargate security group.

## Testing the Docker Image Locally

- Build the image

```bash
docker build -t [tag_name] .
```

- Launch the image in the background, exposing port 80

```bash
docker run -d -p 80:80 [tag_name]
```

- Navigate to `localhost` in your browser

## Connecting to RDS

See [Database Management](/docs/DatabaseManagement.md)

## Connecting to a Worker

See [Workers](/docs/Workers.md)
