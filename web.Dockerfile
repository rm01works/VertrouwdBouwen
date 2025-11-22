# vim:ft=dockerfile

FROM node:20-bullseye-slim

RUN mkdir /app 
WORKDIR /app

COPY package.json package-lock.json . 
COPY apps/web/package.json ./apps/web/package.json

RUN npm ci && npm cache clean --force

COPY apps/web/ ./apps/web
COPY packages/ ./packages

ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}

RUN npm run build:web

EXPOSE 3000
CMD ["node", "apps/web/.next/standalone/apps/web/server.js"]
