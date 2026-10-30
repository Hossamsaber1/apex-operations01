FROM node:22-alpine AS runtime
WORKDIR /app
COPY --chown=node:node package.json ./
COPY --chown=node:node src/ ./src/
RUN rm -rf \
      /usr/local/lib/node_modules/npm \
      /usr/local/lib/node_modules/corepack \
      /opt/yarn-v* \
    && rm -f \
      /usr/local/bin/npm \
      /usr/local/bin/npx \
      /usr/local/bin/corepack \
      /usr/local/bin/yarn \
      /usr/local/bin/yarnpkg \
    && mkdir -p /data \
    && chown node:node /data
USER node
ENV NODE_ENV=production
EXPOSE 3000 4000
CMD ["node", "src/api.js"]
