<p align="center">
  <img width="284" height="100" src="/public/logo.png">
</p>
<h1 align="center">Teddy Web</h1>

The core api, server, and web client for the Teddy application

![Code Quality](https://github.com/callteddy/web/workflows/Code%20Quality/badge.svg)
![Deploy to Staging](https://github.com/callteddy/web/workflows/Deploy%20to%20Staging/badge.svg)
![Deploy to Production](https://github.com/callteddy/web/workflows/Deploy%20to%20Production/badge.svg)

# Dependencies

This repository is known to work with the following:

- node `12.16.3`
- npm `7.5.2`
- mysql `8.0.20`

# Development

An overview for new contributors; for the rationale behind some of the architecture choices [check out the 'Why' doc](/docs/Why.md).

## Tech Stack

- Served by NodeJS using the Koa framework
- Rendered by React
- Styled with Emotion
- Tested with Jest
- Linted, Prettified, and written in TypeScript
- Packaged into a Docker image on deploy

**Note that you do not need Docker installed to run the application in development,** but you will likely want to have it eventually to customize your containers.

## Getting Started in Development

1. Clone the repository
2. Run `npm install`
3. Make a copy of the `template.env` file provided and rename it as your local `.env` file (this lets you connect to your local MySQL server)
4. Create a `teddy` schema and run the `teddy.sql` file against your local MySQL server
5. Run `npm run dev` to start the development servers and begin hacking

## Debugging

One of the most critical pieces of development is easily being able to step through code. There are two ways to step through the server code:

1. Attach to the currently running process, by running the `Attach to Server` configuration from VS Code's debug menu. _This doesn't seem to work reliably; see Todos._
2. Stop the server (`pm2 stop server`) and then run the `Launch Debug Server` configuration from VS Code's debug menu (configured in the [launch.json](/.vscode/launch.json) file) in order to step through the server code.

## Development Conventions

A brief list of development conventions for new contributors.

1. **Avoid Merges** We strongly prefer to pull and rebase, as this makes for a cleaner commit history. If it's helpful, consiser **aliasing the pull --rebase** comand like so: `git config --global alias.pr 'pull --rebase'`... to the same end, feature branches should be **squashed.**
2. **Tag your Commits** The emoji tags at the beginning of each commit message aren't just frivolous; it's also helpful to think about categorizing your commits clearly. We don't need to be _too_ strict about this just yet, but here are some good exmaples:

- :memo: _memo_ documentation
- :shirt: _shirt_ commits dedicated to delinting
- :beetle: _beetle_ bug fixes
- :pancakes: _pancakes_ for SQL schema changes
- :calendar: _calendar_ relating to the calendar feature of the application
- :hammer: _hammer_ I typically use this for configuration/build changes, erego...
- :wrench: _wrench_ let's use the wrench emoji for job flow commits

## Next Steps

When you're ready to deploy your application to a 'production-like' staging environment, follow the steps below ([Infrastructure](#Infrastructure)) to set up AWS resources for that environment (you will need to repeat these steps for your production environment). Once the resources are available, configure the necessary environment variables as secrets in the AWS Secrets Manager and replace the `[[arn]]` fields in your `task-def-staging.json` file.

Test the deploy by going to your GitHub repository and navigating to **Actions** > **Deploy to Staging** > **Run workflow** and hitting the green button to run the workflow.

Once you've verified that your manual deploys are working, I'd recommend changing the run condition in `.github/workflow/deploy_staging.yml` to run the staging deploy on every push to the `main` branch. **The production deploy trigger should always be manual.**

# Deploys

Currently, every push to the `main` branch triggers a deploymen to the Fargate staging environment, while production deploys are manually triggered. For much more detailed guidance on deploys, see [Deploys.md](/docs/Deploys.md).

For a more detailed breakdown of the AWS resources required to make this work, see below:

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

Now register the task definition:

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
aws ecs create-service --region us-east-1 --service-name teddy-web-service-staging --task-definition teddy-web-task-staging:1 --desired-count 2 --launch-type "FARGATE" --network-configuration "awsvpcConfiguration={subnets=[ [[subnet-publicid1]], [[subnet-publicid2]] ],securityGroups=[ [[sg]] ]}" --load-balancers "targetGroupArn=[[arn]], containerName=teddy-web-container-staging, containerPort=80" --cluster teddy-web-cluster-staging --output json
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

# Todos

- [x] ~Connecting to RDS~
- [x] ~Allow attaching to the server process for debugging~
- [x] ~Optional connecting to Mailgun~
- [x] ~Continuous integration tests run on push~
- [x] ~Use the image output from the staging deploy for the prod deploy~
- [ ] Connecting to S3
- [ ] Sourcemaps for production error monitoring
- [ ] Debugging by attaching to the existing process needs to be more reliable
