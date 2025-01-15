# Fomalhaut App
## Implemented with Vue Cli 
### by Fabio Bianchini Cano
----

## Project setup

- Option 1: install locally

   ### Install dependencies
   ```
   npm install
   ```
   
   ### Compiles and hot-reloads for development
   ```
   npm run serve
   ```
   
   ### Compiles and minifies for production
   ```
   npm run build
   ```
   
   ### Lints and fixes files
   ```
   npm run lint
   ```

- Option 2: run with docker

   ### Build the image
   ```
   docker build --file Dockerfile --tag fomalhaut-app:vue .
   ```
   
   ### Run the container
   ```
   docker compose up --detach && docker compose logs --follow
   ```
- Option 3: Run with server.js
   
   ### Install dependencies
   ```
   npm install
   ```
   ### Run the server "In a terminal you run the server"
   ```
   node server
   ```
   ### Run the app "In other terminal you run the app"
   ```
   npm run serve
   ```
- Data will be shown at logsview just to test that is working, this will change in the future.

## Customize configuration
See [Configuration Reference](https://cli.vuejs.org/config/).
