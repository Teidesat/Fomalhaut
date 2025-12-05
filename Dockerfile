FROM node:22-bullseye

WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar dependencias
RUN npm ci

# Copiar código fuente
COPY . .

# Compilar la aplicación
RUN npm run build

# Servir con un servidor simple
RUN npm install -g serve

EXPOSE 20001

CMD ["serve", "-s", "dist", "-l", "20001"]