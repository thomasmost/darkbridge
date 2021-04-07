import fs from 'fs';
import util from 'util';
import path from 'path';
import React from 'react';
import ReactDOMServer from 'react-dom/server';
import { isRedirect, ServerLocation } from '@reach/router';
import { SemiAuthenticatedRequestContext } from './api/types';

function setPublicConfigInScript() {
  // whitelisted env variables
  const { NODE_ENV, STRIPE_PUBLIC_KEY } = process.env;
  const publicConfig = {
    env: {
      NODE_ENV,
      STRIPE_PUBLIC_KEY,
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
  ApplicationRoot: (props: { isMobile: boolean }) => JSX.Element,
  bundleFilename: string,
) {
  if (!ctx.req.url) {
    ctx.status = 400;
    return;
  }
  const isMobile = ctx.userAgent.isMobile;
  try {
    const app = ReactDOMServer.renderToString(
      <ServerLocation url={ctx.req.url}>
        <ApplicationRoot isMobile={isMobile} />
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
        'background-color: white;',
        'background-color: #101042;',
      );
    }

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
