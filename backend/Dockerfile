# syntax=docker/dockerfile:1
FROM node:22.23.2-bookworm-slim AS dependencies
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM dependencies AS build
COPY prisma ./prisma
RUN npx prisma generate

FROM build AS migration
COPY . .
RUN groupadd --system nodeapp && useradd --system --gid nodeapp nodeapp \
  && mkdir -p /data && chown -R nodeapp:nodeapp /app /data
USER nodeapp
CMD ["npx", "prisma", "migrate", "deploy"]

FROM node:22.23.2-bookworm-slim AS production
ENV NODE_ENV=production
WORKDIR /app
RUN groupadd --system nodeapp && useradd --system --gid nodeapp nodeapp
COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force
COPY --from=build /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=build /app/node_modules/@prisma/client ./node_modules/@prisma/client
COPY . .
RUN mkdir -p /data && chown -R nodeapp:nodeapp /app /data
USER nodeapp
EXPOSE 3001
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:3001/ready').then(r=>{if(!r.ok)process.exit(1)}).catch(()=>process.exit(1))"
CMD ["node", "index.js"]
