# Stage 1: Build the frontend
FROM node:20 AS build
WORKDIR /app
COPY . .
RUN npm ci && npm run build

# Stage 2: Serve with nginx
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY photographers.conf /etc/nginx/conf.d/default.conf
EXPOSE 80 443
CMD ["nginx", "-g", "daemon off;"]
