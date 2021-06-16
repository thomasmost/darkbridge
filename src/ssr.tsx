import fs from 'fs';
import util from 'util';
import path from 'path';
import React from 'react';
import ReactDOMServer from 'react-dom/server';
import { isRedirect, ServerLocation } from '@reach/router';
import { SemiAuthenticatedRequestContext } from './api/types';
// import { kirk } from './helpers/log.helper';

function setPublicConfigInScript() {
  // whitelisted env variables
  const { NODE_ENV } = process.env;
  const publicConfig = {
    env: {
      NODE_ENV,
    },
  };
  return `
<script>
  window.config = ${JSON.stringify(publicConfig)};
</script>
`;
}

export async function ssr(
  ctx: SemiAuthenticatedRequestContext,
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
    // kirk.info(`Rendering to: ${path.resolve('./views/index.html')}`);
    const indexFile = path.resolve('./views/index.html');
    const indexHtml = await util.promisify(fs.readFile)(indexFile, 'utf8');

    return (ctx.body = indexHtml.replace(
      '<div id="root"></div>',
      `${setPublicConfigInScript()}
  <div id="root">${app}</div>
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
