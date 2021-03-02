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

- node `14.16.0`
- npm `6.14.11`
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
- :bear: _bear_ for a Smart*Bear* for Swagger docs (had to)

## Next Steps

When you're ready to deploy your application to a 'production-like' staging environment, follow the steps below ([Infrastructure](#Infrastructure)) to set up AWS resources for that environment (you will need to repeat these steps for your production environment). Once the resources are available, configure the necessary environment variables as secrets in the AWS Secrets Manager and replace the `[[arn]]` fields in your `task-def-staging.json` file.

Test the deploy by going to your GitHub repository and navigating to **Actions** > **Deploy to Staging** > **Run workflow** and hitting the green button to run the workflow.

Once you've verified that your manual deploys are working, I'd recommend changing the run condition in `.github/workflow/deploy_staging.yml` to run the staging deploy on every push to the `main` branch. **The production deploy trigger should always be manual.**

# Deploys

Currently, every push to the `main` branch triggers a deploymen to the Fargate staging environment, while production deploys are manually triggered. For much more detailed guidance on deploys, see [Deploys.md](/docs/Deploys.md).

For a more detailed breakdown of the AWS resources required to make this work, see below:

# Infrastructure

The application is deployed by GitHub to AWS Fargate, and currently uses RDS for its database. We'll likely use S3 in the near future.

For details see [Infrastructure.md](/docs/Infrastructure.md).

# Todos

- [x] ~Connecting to RDS~
- [x] ~Allow attaching to the server process for debugging~
- [x] ~Optional connecting to Mailgun~
- [x] ~Continuous integration tests run on push~
- [x] ~Use the image output from the staging deploy for the prod deploy~
- [ ] Connecting to S3
- [ ] Sourcemaps for production error monitoring
- [ ] Debugging by attaching to the existing process needs to be more reliable
