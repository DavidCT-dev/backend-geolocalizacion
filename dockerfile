# Usa Node oficial LTS
FROM node:18-alpine

# Crear carpeta app
WORKDIR /app

# Copiar package.json y package-lock.json
COPY package*.json ./

# Instalar dependencias sin las devDependencies
RUN npm install --omit=dev --legacy-peer-deps

# Copiar el resto del código
COPY . .

# Construir el proyecto NestJS
RUN npm run build

# Exponer el puerto
EXPOSE 3000

# Comando para iniciar la app
CMD ["node", "dist/main"]
