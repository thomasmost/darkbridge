# Why
This document tries to explain why certain technologies/design decisions were chosen for this project. Take them or leave them, but it wouldn't be an opinionated template without opinions.

## Why NodeJS
While I'm not going to debate the benefits of [polyglot programming](https://www.thoughtworks.com/radar/techniques/polyglot-programming), there are clear advantages to using a single language when presenting a unified end-to-end application. Nothing particularly demanding is happening in this application (yet), so there is no real downside to using a shared syntax from back to front. If you wanted to introduce ML or data science on the back-end, though, I'd suggest writing an entirely new service in Python or Rust.

## Why TypeScript
I just sang the praises of JavaScript, but JavaScript doesn't come with static typing. Anyone who's been coding long enough knows that compiler-time type-checking is a game changer in terms of long-term stability, maintenance, and developer experience. It's no wonder that more than half of the JavaScript community said they [would use it again](https://2019.stateofjs.com/javascript-flavors/typescript/) in 2019's State of JS survey.

## Why Koa
Koa 2 fully embraced the more modern and readable `async/await` style of NodeJS, while still maintaining a multi-year pedigree bested only by Express.

## Why React
After a brief challenger round with Vue.js in 2018, React reclaimed its spot at the top of the front-end framework food chain in [2019's State of JS](https://2019.stateofjs.com/) survey. React is mature, fast, and focused, with an unrivaled developer community. As if that weren't enough, the joining of JSX, Emotion, and TypeScript is extremely powerful.

## Why Emotion
Unlike JSS, you can write real, valid CSS with Emotion (inside JavaScript template literals) and still benefit from the neat encapsulation of component-scoped styles. Plus, at least in VS Code, you get sophisticated linting that helps you write the RIGHT CSS from the get-go.

## Why Docker
Docker lets us keep the application code itself quite portable, so that if (for example) you wanted to deploy your app to Azure instead of AWS, you'd only have to switch out the deploy workflows in `.github/workflows` and modify the infrastructure setup to ditch Fargate for Azure Container Instances or AKS, and RDS, etc. in favor of Azure resources. Docker containers carry their configuration with them, for the most part, so you can reliably deploy one to any container hosting environment without too many headaches (I won't say 'none' though).

## Why AWS
AWS remains the gold standard of cloud computing; it would be obtuse to start anywhere else. If you're looking to do something similar with Azure, they have a list of resources on their GitHub actions here: https://azure.github.io/actions/

## Why Continuous Integration
This is also kind of a big question! The short version is that merging code from many developers and running automated quality assurance tests against that code is one of the most scalable approaches to enterprise-class development, and that by making and testing many small changes many times per day, we can better isolate bugs and optimize for the time to fix rather than for the time between failures. While this isn't the right approach for *every* application, it's a sensible default unless you're writing military-grade software. If lives hang in the balance, longer development and QA cycles may be called for. But if your organization can afford to be relatively fault-tolerant, continuous integration and delivery is probably right for you.
