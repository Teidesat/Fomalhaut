FROM node:15.9.0-buster-slim

# Install system requirements
RUN apt update  \
    && apt install --yes \
        build-essential \
        libcairo2-dev \
        libgif-dev \
        libjpeg-dev \
        libpango1.0-dev \
        librsvg2-dev \
        python3 \
    && apt clean

# Set the working directory
COPY . /app
WORKDIR /app

# Install nodejs requirements
RUN npm install

# Set the default start command
CMD ["npm", "run", "serve"]
