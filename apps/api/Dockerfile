# vim:ft=dockerfile

FROM node:20-bullseye-slim

RUN mkdir /app && chown -R node:node /app
WORKDIR /app
USER node

COPY package*.json .

RUN npm ci --omit=dev && npm cache clean --force

COPY --chown=node:node . /app

RUN npm run build:api

EXPOSE 5000
CMD ["npm", "run", "start:api"]
