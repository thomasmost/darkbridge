# Deploys

This document provides a step-by-stop English account of what happens (to the best of my knowledge) on a deploy, some basic guidance regarding healthy deploys, and a list of gotchas/more intricate technical details that can be useful for troubleshooting and advanced configuration.

## Step-by-Step

For now, we'll focus on the staging deploy.

1. When the "Deploy to Staging" GitHub Workflow (`deploy_staging.yml`), we cancel previous deploys and simultaneously begin the next one.
2. The deploy job itself starts by checking out the code and logging into AWS's Elastic Container Registry (using credentials stored in GitHub secrets).
3. GitHub then builds the Docker image based on the Dockerfile and uploads it to the Container Registry.
4. A new task-definition is then created based on the template (`task-def-staging.json`) (including environment specific variables to pass to the Docker image) and this is submitted to AWS's Elastic Container Service.
5. Now for the big one: _Deploying the new task definition to Fargate._ **This is the most annoying step because the MOST stuff happens with the LEAST amount of information in the GitHub Actions console.** Slightly more information is presented in the ECS Events console, but it's still not great. I'll detail it to the best of my ability below:
   1. ECS generates new tasks for the service based on the new task-definition. These tasks each pull their Docker image, configure environment variables, and start up the Docker image exposing port 80. **A failure at this step indicates either a networking failure (can't connect to the container registry) or a problem with the code itself.**
   2. Once the new tasks have successfully started, they aren't yet added to the Load Balancer, and the two previous tasks continue running as the 'Active' deployment. The Load Balancer will "health-check" the new tasks before adding them to the pool.
   3. The health check is configurable in the load balancer's target group. By default, it's a GET request to `/` that expects a `200` code back. Both the acceptable codes and the url are configurable. A common convention is to add a `/healthz` endpoint that returns 200 if everything is working properly; in our case we may want that to ping the database so that we can confirm not only the server being up but also that we can successfully connect to RDS.
   4. After the health threshold is passed (by default, 5 consecutive successful health checks; we've changed this to 3), the new targets are registered with the load balancer and the previous targets (the running tasks from the previous successful deployment) begin **draining.** This means the load balancer stops sending them new requests, but they have a **deregistration delay** during which they can complete any pending requests. By default, the deregistration delay is 300 seconds. **We've changed this to 120 seconds,** which means we're committing to keeping our web requests snappy (reliably under 2 minutes).
   5. Once the deregistration delay is passed and the old targets drained, they are deregistered and removed from the Fargate service. The deploy is now complete!

## Guidance

Below, some tips on configuring/troubleshooting the deploy.

### Target Groups

Target groups are the connective tissue between the Application Load Balancer (ALB) and the Fargate service itself. From the target group, you can configure the **health check**, or what qualifies a valid service, as well as the **deregistraion delay** (see step 5.4 above) and other fun stuff like the load balancing algorithm and client 'stickiness' (binding a particular session to a particular server; we do not do this).

### Errors

`(service teddy-web-service-staging) (port 80) is unhealthy in (target-group arn:aws:elasticloadbalancing:us-east-1:786903541329:targetgroup/teddy-web-tg-staging/32980889e634ed73) due to (reason Health checks failed with these codes: [302]`

The 302 code indicates the health check received an invalid code; in this case the failure was caused by a server redirect from `/`.
