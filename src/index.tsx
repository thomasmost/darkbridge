import bodyParser from 'koa-bodyparser';
import dotenv from 'dotenv';
dotenv.config();
import fs from 'fs';
import util from 'util';
import Koa from 'koa';
import path from 'path';
import React from 'react';
import ReactDOMServer from 'react-dom/server';
import Router from 'koa-router';
import serveStatic from 'koa-static';
import { createHttpTerminator } from 'http-terminator';

import { isRedirect, ServerLocation } from '@reach/router';

import request from 'request';

import { api } from './api';

// Initialize constants
const port = process.env.PORT ? parseInt(process.env.PORT) : 80;
const NODE_ENV = process.env.NODE_ENV;
console.log(`NODE_ENV: ${NODE_ENV}`);

import App from './client/apps/App';
import { tokenFromCookies } from './api/auth.api';
import { consumeToken } from './helpers/auth_token.helper';
import UnauthorizedApp from './client/apps/UnauthorizedApp';
import { TeddyRequestContext } from './api/types';
import { AuthToken } from './models/auth_token.model';
import { AuthenticationError } from './helpers/error.helper';
import OnboardingApp from './client/apps/OnboardingApp';

const app = new Koa();
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

app.use(async (ctx: TeddyRequestContext, next) => {
  const tokenId = tokenFromCookies(ctx);
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

router.get('/healthz', async (ctx) => {
  await AuthToken.findOne({
    order: ['created_at'],
    logging: false,
  });
  ctx.status = 200;
});

router.use('/api', api.routes(), api.allowedMethods());

async function ssr(
  ctx: TeddyRequestContext,
  ApplicationRoot: () => JSX.Element,
  bundleFilename: string,
) {
  if (!ctx.req.url) {
    ctx.status = 400;
    return;
  }
  try {
    const app = ReactDOMServer.renderToString(
      <ServerLocation url={ctx.req.url}>
        <ApplicationRoot />
      </ServerLocation>,
    );
    console.log(`Rendering to: ${path.resolve('./views/index.html')}`);
    const indexFile = path.resolve('./views/index.html');
    let indexHtml = await util.promisify(fs.readFile)(indexFile, 'utf8');

    // This is a pretty silly special-case; probably the HTML view should be made an ejs or handlebars file
    if (
      bundleFilename === 'unauthorized_app.js' ||
      bundleFilename === 'onboarding_app.js'
    ) {
      // login/registration/onboarding has the dark-mode background
      indexHtml = indexHtml.replace(
        'background-color: #f9f9f9;',
        'background-color: #101042;',
      );
    }

    return (ctx.body = indexHtml.replace(
      '<div id="root"></div>',
      `<div id="root">${app}</div>
  <script src="/build/${bundleFilename}"></script>`,
    ));
  } catch (error) {
    if (isRedirect(error)) {
      ctx.redirect(error.uri);
    } else {
      throw error;
    }
  }
}

router.get(/\/onboarding/, async (ctx: TeddyRequestContext) => {
  if (!ctx.user) {
    ctx.redirect('/login');
  }
  await ssr(ctx, OnboardingApp, 'onboarding_app.js');
});

// Wildcard Route
router.get(/\//, async (ctx: TeddyRequestContext) => {
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

// console.log('terminating');

// terminator.terminate();
// console.log('terminated');
