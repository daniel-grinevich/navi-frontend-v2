FROM node:24-alpine AS build
WORKDIR /app

ARG VITE_ENVIRONMENT=production
ARG VITE_BASE_URL
ARG VITE_OAUTH_ENABLED=false
ARG VITE_STRIPE_PUBLISHABLE_KEY

COPY package.json pnpm-lock.yaml ./
RUN corepack enable && pnpm install --frozen-lockfile

COPY . .
RUN VITE_ENVIRONMENT=$VITE_ENVIRONMENT \
    VITE_BASE_URL=$VITE_BASE_URL \
    VITE_OAUTH_ENABLED=$VITE_OAUTH_ENABLED \
    VITE_STRIPE_PUBLISHABLE_KEY=$VITE_STRIPE_PUBLISHABLE_KEY \
    pnpm run build

FROM nginx:alpine
COPY compose/production/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
