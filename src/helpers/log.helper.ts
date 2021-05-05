import Koa from 'koa';
import { Logger } from 'tslog';
import { asyncLocalStorage } from '../node_hooks';
import { SemiAuthenticatedRequestContext } from '../api/types';
import { UserAgentContext } from 'koa-useragent';

interface StatusedError extends Error {
  status?: number;
}

const kirk = new Logger({
  name: 'Server',
  type: process.env.NODE_ENV === 'development' ? 'pretty' : 'json',
  requestId: (): string => {
    return asyncLocalStorage.getStore()?.request_id as string;
  },
});

const logRequest = (
  ctx: SemiAuthenticatedRequestContext & UserAgentContext,
  error?: StatusedError,
) => {
  const method = ctx.request.method;
  const url = ctx.request.url;
  let status = ctx.response.status;
  if (error) {
    status = error.status || 500;
  }
  // const status_text = ctx.response.message;

  const request_id = asyncLocalStorage.getStore()?.request_id as string;
  const user_id = ctx.user?.id || 'undefined';
  const { browser, version, os, platform } = ctx.userAgent;

  const ordered_params: Record<string, string | number> = {
    method,
    url,
    status,
  };

  const named_params: Record<string, string | number> = {
    request_id,
    browser,
    version,
    os,
    platform,
    user_id,
  };

  if (error) {
    named_params.error = error.message;
  }
  if (!error && url === '/healthz') {
    // don't log successful health checks
    return;
  }

  let log_line = error ? 'REQUEST ERRORED:' : 'REQUEST COMPLETE:';
  const ordered_keys = Object.keys(ordered_params);
  for (const key of ordered_keys) {
    log_line += ` ${ordered_params[key]}`;
  }
  const named_keys = Object.keys(named_params);
  for (const key of named_keys) {
    log_line += ` ${key}=${named_params[key]},`;
  }
  kirk.info(log_line);
};

const requestLogger = async (
  ctx: SemiAuthenticatedRequestContext & UserAgentContext,
  next: Koa.Next,
) => {
  try {
    await next();
  } catch (err) {
    logRequest(ctx, err);
    throw err;
  }
  logRequest(ctx);
};

export { kirk, requestLogger };
