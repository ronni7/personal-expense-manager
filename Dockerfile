# ---------- Build ----------
FROM node:22-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

RUN npm run build


# ---------- Runtime ----------
FROM nginx:alpine

RUN apk del --no-network \
  nginx-module-acme \
  nginx-module-geoip \
  nginx-module-image-filter \
  nginx-module-njs \
  nginx-module-xslt

COPY nginx.conf /etc/nginx/conf.d/default.conf

COPY --from=build /app/dist/personal-expense-manager/browser /usr/share/nginx/html
