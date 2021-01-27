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

import { ServerLocation } from '@reach/router';

import request from 'request';

import { api } from './api';

// Initialize constants
const port = process.env.PORT ? parseInt(process.env.PORT) : 80;
const NODE_ENV = process.env.NODE_ENV;
console.log(`NODE_ENV: ${NODE_ENV}`);

import App from './client/App';
import { tokenFromAuthorizationHeader } from './api/auth.api';
import { consumeToken } from './helpers/auth_token.helper';

const app = new Koa();
const router = new Router();

// this route needs to precede our wildcard route so that we can correctly get the application bundle
if (NODE_ENV === 'development') {
  // This rule is necessary to route requests for the application bundle
  // to our webpack-dev-server
  router.get('/build/app.js', async function (ctx) {
    console.log(ctx.req.url);
    const stream = request('http://localhost:8080' + ctx.req.url);
    ctx.body = ctx.req.pipe(stream);
  });
}

app.use(async (ctx, next) => {
  const { headers } = ctx.request;
  const authHeader = headers['authorization'];
  if (authHeader) {
    const tokenId = tokenFromAuthorizationHeader(authHeader);
    ctx.user = await consumeToken(tokenId);
  }
  await next();
});

router.use('/api', api.routes(), api.allowedMethods());

// Wildcard Route
router.get(/\//, async (ctx) => {
  if (!ctx.req.url) {
    ctx.status = 400;
    return;
  }
  const app = ReactDOMServer.renderToString(
    <ServerLocation url={ctx.req.url}>
      <App />
    </ServerLocation>,
  );

  console.log(path.resolve('./views/index.html'));
  const indexFile = path.resolve('./views/index.html');
  const data = await util.promisify(fs.readFile)(indexFile, 'utf8');

  return (ctx.body = data.replace(
    '<div id="root"></div>',
    `<div id="root">${app}</div>
<script src="/build/app.js"></script>`,
  ));
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
