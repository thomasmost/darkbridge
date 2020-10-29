FROM node:12.18.3 as build
LABEL Author="Thomas Constantine Moore <hello@>"

VOLUME /reports

# COPY scripts/test.sh /usr/local/bin/test.sh
# RUN chmod +x /usr/local/bin/test.sh

ENTRYPOINT ["npm", "start"]

ENV CI=true
EXPOSE 80

WORKDIR /application
COPY package.json package-lock.json webpack.config.ts webpack.server.ts tsconfig.json pm2.prod.yml /application/
RUN npm ci
COPY src /application/src
COPY views /application/views
COPY public /application/public

# Stage 1: Build
RUN npx webpack --config webpack.config.ts
RUN npx webpack --config webpack.server.ts

# Stage 2: Copy Built Artifacts
FROM node:12.18.3
# Prevent dpkg errors
ENV TERM=xterm-256color

# Set mirrors to US
RUN sed -i "s/http:\/\/archive./http:\/\/us.archive./g" /etc/apt/sources.list

ENTRYPOINT ["npm", "start"]

ENV NODE_ENV=production
EXPOSE 80

WORKDIR /application
COPY --from=build /application/package-lock.json /application/package.json /application/pm2.prod.yml /application/
RUN npm ci
COPY --from=build /application/dist /application/dist 
COPY --from=build /application/public /application/public 
COPY --from=build /application/views/index.html /application/views/index.html
