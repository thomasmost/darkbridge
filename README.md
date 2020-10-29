# Fargate Action Demo
Proof of concept for CI/CD with Docker, Node, and AWS Fargate

![Code Quality](https://github.com/thomasmost/darkbridge/workflows/Code%20Quality/badge.svg)
![Last Deploy](https://github.com/thomasmost/darkbridge/workflows/Deploy%20to%20Demo%20Environment/badge.svg)

# Resources
Based on... 

* https://aws.amazon.com/blogs/opensource/github-actions-aws-fargate/
* https://itnext.io/run-your-containers-on-aws-fargate-c2d4f6a47fda
* https://medium.com/@ariklevliber/aws-fargate-from-start-to-finish-for-a-nodejs-app-9a0e5fbf6361
* https://docs.aws.amazon.com/AmazonECS/latest/userguide/create-application-load-balancer.html

## Creating a Container Registry

```bash
aws ecr create-repository --repository-name demo_registry --region us-east-1
```
## Set up a Fargate service

Register the task definition:

```bash
aws ecs register-task-definition --region us-east-1 --cli-input-json file://$HOME/darkbridge/task-def.json
```

## Create an ECS cluster:

```bash
aws ecs create-cluster --region us-east-1 --cluster-name default
```

## Create a Fargate service:

**Note that you have to associate the load balancer with the service at the time of the service creation**

```bash
aws ecs create-service --region us-east-1 --service-name darkbridge-service-staging --task-definition darkbridge-task-staging:1 --desired-count 2 --launch-type "FARGATE" --network-configuration "awsvpcConfiguration={subnets=[ [[private-subnet1]],[[public-subnet1]],[[private-subnet2]],[[public-subnet2]] ],securityGroups=[ [[security-group]] ]}" --load-balancers "targetGroupArn=[[arn]], containerName=darkbridge-container, containerPort=80"
```

## Working with Environment Variables
1. Go to the AWS Secrets Manager
2. Add an 'Other' > 'Plaintext' Secret
3. Name it TEST_SECRET_VARIABLE and replace the arn in task-def.json
4. Add the SecretsManagerReadWrite policy to your task-def's executionRole

See: https://docs.aws.amazon.com/AmazonECS/latest/developerguide/specifying-sensitive-data-secrets.html

## Gotchas

* Make sure the security group has an HTTP inbound rule set to 0.0.0.0 to allow public access
* The ALB must be created and the target group specified before the service is created (see above)
* The cluster name should probably not be 'default' going forward...
* Similarly the app in the task definition file, the alb, and so on should be named better.
* By default, Fargate containers are limited to 200 MiB of memory; running the server with ts-node for example creates an unstable service since ts-node compiles to memory -- it's much better to compile to disk for production.
* RE: ENV VARIABLES, Fargate only supports secrets that are a single value, not the JSON or key value secrets. So choose OTHER when creating the secret and just put a single text value there.

## Testing the Docker Image Locally

* Build the image
```bash
docker build -t [tag_name] .
```

* Launch the image in the background, exposing port 80
```bash
docker run -d -p 80:80 [tag_name]
```

* Navigate to `localhost` in your browser

## Connecting to RDS

See [Database Management](/docs/DatabaseManagement.md)

## Up Next

- [x] ~Connecting to RDS~
- [ ] Connecting to S3
- [x] ~Continuous integration tests run on push~
- [ ] Sourcemaps for production error monitoring
- [ ] Use the image output from the staging deploy for the prod deploy