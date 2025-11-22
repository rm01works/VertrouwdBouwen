# vim:ft=dockerfile

FROM node:20-bullseye-slim

RUN mkdir /app 
WORKDIR /app

COPY package.json package-lock.json . 
COPY apps/api/package.json ./apps/api/package.json

RUN npm ci --omit=dev && npm cache clean --force

COPY apps/api/prisma ./apps/api/prisma
RUN npm run db:generate --workspace=apps/api

COPY apps/api/ ./apps/api
COPY packages/ ./packages

RUN npm run build:api

EXPOSE 5000
CMD ["npm", "run", "start:api"]
