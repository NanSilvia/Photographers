# Comments are provided throughout this file to help you get started.
# If you need more help, visit the Dockerfile reference guide at
# https://docs.docker.com/go/dockerfile-reference/

# Want to help us make this template better? Share your feedback here: https://forms.gle/ybq9Krt8jtBL3iCk7

ARG NODE_VERSION=22.14.0

FROM node:${NODE_VERSION}-alpine AS build

WORKDIR /app

# Download dependencies as a separate step to take advantage of Docker's caching.
# Leverage a cache mount to /root/.npm to speed up subsequent builds.
# Leverage a bind mounts to package.json and package-lock.json to avoid having to copy them into
# into this layer.
COPY . .
RUN npm i && npm run build

FROM node:${NODE_VERSION}-alpine
WORKDIR /app
# Use production node environment by default.
COPY package.json .
RUN npm install --production

COPY --from=build /app/dist ./dist

# Expose the port that the application listens on.
EXPOSE 5000