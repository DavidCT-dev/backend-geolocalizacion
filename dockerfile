# Usa Node oficial LTS
FROM node:20-alpine

# Crear carpeta app
WORKDIR /app

# Copiar package.json y package-lock.json para instalar dependencias
COPY package*.json ./

# Instalar dependencias
RUN npm install --production --legacy-peer-deps

# Copiar el resto de la app
COPY . .

# Construir el proyecto NestJS
RUN npm run build

# Puerto que exponemos
EXPOSE 3000

# Comando para iniciar la app en producción
CMD ["node", "dist/main"]
