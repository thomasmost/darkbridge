import bodyParser from 'koa-bodyparser';
import dotenv from 'dotenv';
import Koa from 'koa';
import path from 'path';
import Router from 'koa-router';
import serveStatic from 'koa-static';
import { createHttpTerminator } from 'http-terminator';

import request from 'request';

// Initialize constants
dotenv.config();
const port = process.env.PORT ? parseInt(process.env.PORT) : 80;
const NODE_ENV = process.env.NODE_ENV;
console.log(`NODE_ENV: ${NODE_ENV}`);

import { doMath } from './api/do_math';
import App from './client/App';
import {
  login,
  register,
  tokenFromAuthorizationHeader,
  verifyEmail,
} from './api/auth.api';
import { consumeToken } from './helpers/auth_token.helper';
import { ssr } from './ssr';
import { SemiAuthenticatedRequestContext } from './api/types';

const app = new Koa();
const router = new Router();
const api = new Router();

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

api.post('/register', register);
api.get('/verify_email', verifyEmail);
api.post('/login', login);
api.get(
  '/current_user',
  (ctx) => (ctx.body = (ctx as SemiAuthenticatedRequestContext).user),
);

api.get('/do_math', (ctx) => {
  const { x, y } = ctx.request.query;
  ctx.body = doMath(x, y);
});

api.get('/test_crash', () => {
  process.exit(1);
});

api.get('/get_secret_var', (ctx) => {
  ctx.body = {
    var: process.env.EXAMPLE_SECRET_VARIABLE || 'None Found',
  };
});

api.get('/get_public_var', (ctx) => {
  ctx.body = {
    var: process.env.EXAMPLE_PUBLIC_VARIABLE || 'None Found',
  };
});

router.use('/api', api.routes(), api.allowedMethods());

// Wildcard Route
router.get(/\//, async (ctx) => {
  if (!ctx.req.url) {
    ctx.status = 400;
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
