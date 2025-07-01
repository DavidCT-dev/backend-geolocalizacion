# Establece la versión de Node.js
ARG NODE_VERSION=18.12.1

# Usa una imagen base ligera de Node.js
FROM node:${NODE_VERSION}-slim AS base

# Establece el directorio de trabajo dentro del contenedor
WORKDIR /app

# Copia los archivos de configuración de dependencias
COPY package.json package-lock.json ./

# Instala las dependencias con manejo de conflictos
RUN npm install --legacy-peer-deps

# Copia el resto del código fuente
COPY . .

# Compila la aplicación (si aplica)
RUN npm run build

# Expone el puerto
EXPOSE 3000

# Comando para ejecutar
CMD [ "npm", "run", "start:dev" ]
