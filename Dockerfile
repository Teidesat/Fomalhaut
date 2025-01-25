FROM node:22-bullseye

COPY . /app
WORKDIR /app

# Install node.js dependencies
RUN npm install
