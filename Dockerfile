FROM node:22-alpine AS runtime
WORKDIR /app
COPY --chown=node:node package.json ./
COPY --chown=node:node src/ ./src/
RUN mkdir -p /data && chown node:node /data
USER node
ENV NODE_ENV=production
EXPOSE 3000 4000
CMD ["node", "src/api.js"]
