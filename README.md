<p align="center">
  <img width="200" height="100" src="/darkbridge.png">
</p>
<h1 align="center">Darkbridge</h1>

An opinionated infrastructure-forward modern web template built for continuous integration and delivery; using Docker, AWS Fargate, and NodeJS

![Code Quality](https://github.com/thomasmost/darkbridge/workflows/Code%20Quality/badge.svg)
![Deploy to Staging](https://github.com/thomasmost/darkbridge/workflows/Deploy%20to%20Staging/badge.svg)
![Deploy to Production](https://github.com/thomasmost/darkbridge/workflows/Deploy%20to%20Production/badge.svg)

# Resources
Created in part with reference to the following guides:

* https://aws.amazon.com/blogs/opensource/github-actions-aws-fargate/
* https://itnext.io/run-your-containers-on-aws-fargate-c2d4f6a47fda
* https://medium.com/@ariklevliber/aws-fargate-from-start-to-finish-for-a-nodejs-app-9a0e5fbf6361
* https://docs.aws.amazon.com/AmazonECS/latest/userguide/create-application-load-balancer.html

# Why
This is kind of a big question. Fundamentally, though, I think that 90% of tutorials, templates, and 'get started' guides only ever take you about half the way there (if that!) and as a relative newcomer to scalable, production-quality infrastructure, I could have really benefited from a guide like this one.

For a more detailed breakdown, see this [piece-by-piece rationale](/docs/Why.md).

# Development
Here's what to expect.

## Tech Stack
* Served by NodeJS using the Koa framework
* Rendered by React
* Styled with Emotion
* Tested with Jest
* Linted, prettified, and written in highly safe and readable TypeScript
* Packaged into a Docker image on deploy

**Note that you do not need Docker installed to run the application in development,** but you will likely want to have it eventually to customize your containers.

## Getting Started in Development

1. Clone the repository
2. Run `npm install`
3. Make a copy of the `template.env` file provided and rename it as your local `.env` file (this lets you connect to your local MySQL server)
4. Create a `demodb` schema and run the `demodb.sql` file against your local MySQL server
5. Run `npm run dev` to start the development servers and begin hacking

## Debugging
One of the most critical pieces of development is easily being able to step through code. **At this time, debugging Darkbridge projects is sub-optimal** (see [Todos](#Todos)); ideally you'd be able to attach to the running server process. Currently you have to stop the server (`pm2 stop server`) and then run the `Launch Debug Server` configuration from VS Code's debug menu (configured in the [launch.json](/.vscode/launch.json) file) in order to step through the server code.

## Next Steps
When you're ready to deploy your application to a 'production-like' staging environment, follow the steps below ([Infrastructure](#Infrastructure)) to set up AWS resources for that environment (you will need to repeat these steps for your production environment). Once the resources are available, configure the necessary environment variables as secrets in the AWS Secrets Manager and replace the `[[arn]]` fields in your `task-def-staging.json` file.

Test the deploy by going to your GitHub repository and navigating to **Actions** > **Deploy to Staging** > **Run workflow** and hitting the green button to run the workflow.

Once you've verified that your manual deploys are working, I'd recommend changing the run condition in `.github/workflow/deploy_staging.yml` to run the staging deploy on every push to the `main` branch. **The production deploy trigger should always be manual.**

# Infrastructure
You will need the aws command line tool installed to execute these steps.

## Create a Container Registry

```bash
aws ecr create-repository --repository-name darkbridge_registry --region us-east-1
```
## Set up a Fargate service

Register the task definition:

```bash
aws ecs register-task-definition --region us-east-1 --cli-input-json file://$HOME/darkbridge/task-def-staging.json
```

## Create an ECS cluster

```bash
aws ecs create-cluster --region us-east-1 --cluster-name darkbridge-staging
```

## Create a Fargate service

**Note that you have to associate the load balancer with the service at the time of the service creation**

```bash
aws ecs create-service --region us-east-1 --service-name darkbridge-service-staging --task-definition darkbridge-task-staging:1 --desired-count 2 --launch-type "FARGATE" --network-configuration "awsvpcConfiguration={subnets=[ [[private-subnet1]],[[public-subnet1]],[[private-subnet2]],[[public-subnet2]] ],securityGroups=[ [[security-group]] ]}" --load-balancers "targetGroupArn=[[arn]], containerName=darkbridge-container, containerPort=80"
```

## Working with Environment Variables
1. Go to the AWS Secrets Manager
2. Add an 'Other' > 'Plaintext' Secret
3. Name it EXAMPLE_SECRET_VARIABLE and replace the arn in task-def.json
4. Add the SecretsManagerReadWrite policy to your task-def's executionRole

See: https://docs.aws.amazon.com/AmazonECS/latest/developerguide/specifying-sensitive-data-secrets.html

## Gotchas

* Make sure the security group has an HTTP inbound rule set to 0.0.0.0 to allow public access
* The ALB must be created and the target group specified before the service is created (see above)
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

# Todos

- [x] ~Connecting to RDS~
- [ ] Connecting to S3
- [ ] Optional connecting to Mailgun
- [x] ~Continuous integration tests run on push~
- [ ] Sourcemaps for production error monitoring
- [ ] Use the image output from the staging deploy for the prod deploy
- [ ] Allow attaching to the server process for debugging
