# vim:ft=dockerfile

FROM node:20-bullseye-slim

RUN mkdir /app && chown -R node:node /app
WORKDIR /app
USER node

COPY package*.json .

RUN npm ci --omit=dev && npm cache clean --force

COPY --chown=node:node . /app

RUN npm run build:web

# COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
# COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

EXPOSE 3000
CMD ["npm", "run", "start:web"]
