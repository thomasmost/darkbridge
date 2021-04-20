import bodyParser from 'koa-bodyparser';
import cors from '@koa/cors';
import dotenv from 'dotenv';
dotenv.config();
const { NODE_ENV, STRIPE_PUBLIC_KEY } = process.env;
// todo(thomas) obnoxious typescript error during SSR
// note that this is specifically a problem with ts-node;
// all the more reason to stop using it
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(global as any).config = {
  env: {
    NODE_ENV,
    STRIPE_PUBLIC_KEY,
  },
};
import Koa from 'koa';
import path from 'path';
import Router from 'koa-router';
import serveStatic from 'koa-static';
import { userAgent } from 'koa-useragent';

import { createHttpTerminator } from 'http-terminator';

import request from 'request';

import { api } from './api';

// Initialize constants
const port = process.env.PORT ? parseInt(process.env.PORT) : 80;
console.log(`NODE_ENV: ${NODE_ENV}`);

import { AuthenticationError, BadRequestError } from './helpers/error.helper';
import { AuthToken } from './models/auth_token.model';
import { consumeToken } from './helpers/auth_token.helper';
import { SemiAuthenticatedRequestContext } from './api/types';
import { ssr } from './ssr';
import { tokenFromAuthorizationHeader, tokenFromCookies } from './api/auth.api';
import App from './client/apps/App';
import OnboardingApp from './client/apps/OnboardingApp';
import UnauthorizedApp from './client/apps/UnauthorizedApp';

const app = new Koa();
app.use(userAgent);
app.use(cors({ credentials: true }));
const router = new Router();

// this route needs to precede our wildcard route so that we can correctly get the application bundle
if (NODE_ENV === 'development') {
  async function pipeRequestToDevServer(ctx: Koa.ParameterizedContext) {
    console.log(ctx.req.url);
    const stream = request('http://localhost:8080' + ctx.req.url);
    ctx.body = ctx.req.pipe(stream);
  }
  // These rules are necessary to route requests for the application bundle
  // to our webpack-dev-server
  router.get('/build/app.js', pipeRequestToDevServer);
  router.get('/build/unauthorized_app.js', pipeRequestToDevServer);
  router.get('/build/onboarding_app.js', pipeRequestToDevServer);
}

// Error Handler
app.use(async (ctx, next) => {
  try {
    await next();
  } catch (err) {
    if (err instanceof BadRequestError) {
      ctx.status = 400;
      ctx.body = err.message;
      return;
    }
    throw err;
  }
});

app.use(async (ctx: SemiAuthenticatedRequestContext, next) => {
  let tokenId = tokenFromAuthorizationHeader(ctx);
  if (!tokenId) {
    tokenId = tokenFromCookies(ctx);
  }
  if (tokenId) {
    try {
      ctx.user = await consumeToken(tokenId);
    } catch (err) {
      if (err instanceof AuthenticationError) {
        ctx.cookies.set('teddy_web_token', null);
      }
    }
  }
  await next();
});

app.use(async (ctx: SemiAuthenticatedRequestContext, next) => {
  if (ctx.user && ctx.url === '/login') {
    ctx.redirect('/');
    return;
  }
  await next();
});

router.get('/healthz', async (ctx) => {
  await AuthToken.findOne({
    order: ['created_at'],
    logging: false,
  });
  ctx.status = 200;
});

router.use('/api', api.routes(), api.allowedMethods());

router.get(/\/onboarding/, async (ctx: SemiAuthenticatedRequestContext) => {
  if (!ctx.user) {
    ctx.redirect('/login');
  }
  await ssr(ctx, OnboardingApp, 'onboarding_app.js');
});

// Wildcard Route
router.get(/\//, async (ctx: SemiAuthenticatedRequestContext) => {
  if (ctx.req.url && ctx.req.url.split('.').length > 1) {
    // file request
    return;
  }
  if (!ctx.req.url) {
    ctx.status = 400;
    return;
  }
  if (!ctx.user) {
    await ssr(ctx, UnauthorizedApp, 'unauthorized_app.js');
    return;
  }
  await ssr(ctx, App, 'app.js');
});

app.use(serveStatic(path.resolve('./public')));

app.use(bodyParser());

app.use(router.routes()).use(router.allowedMethods());

const server = app.listen(port, undefined, undefined, () => {
  console.log(`Listening on port ${port}`);
});

const terminator = createHttpTerminator({ server });

// Shutdown Behavior

process.on('message', async function (message) {
  if (message === 'shutdown') {
    console.log('Received shutdown message');
    await terminator.terminate();
    console.log('Shutdown complete!');
    process.exit(0);
  }
});

process.on('SIGINT', async function () {
  console.log('Received SIGINT');
  await terminator.terminate();
  console.log('Shutdown complete!');
  process.exit(0);
});
