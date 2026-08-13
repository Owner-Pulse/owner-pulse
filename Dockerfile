
FROM node:22-alpine AS builder

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .

ARG VITE_BASE_URL
ARG VITE_AUTH_TOKEN_NAME
ARG VITE_TIME_OUT

ENV VITE_BASE_URL=${VITE_BASE_URL}
ENV VITE_AUTH_TOKEN_NAME=${VITE_AUTH_TOKEN_NAME}
ENV VITE_TIME_OUT=${VITE_TIME_OUT}

RUN npm run build




FROM node:22-alpine AS runtime

ENV NODE_ENV=production
WORKDIR /app
RUN npm install --global serve@14.2.6 \
    && npm cache clean --force

COPY --from=builder --chown=node:node /app/dist ./dist

USER node

EXPOSE 3000

HEALTHCHECK \
    --interval=30s \
    --timeout=5s \
    --start-period=10s \
    --retries=3 \
    CMD wget -qO- http://127.0.0.1:3000/ >/dev/null || exit 1

CMD ["serve", "-s", "dist", "-l", "3000"]