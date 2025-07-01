# Usa una imagen oficial ligera de Node.js
FROM node:18-slim

# Instala herramientas necesarias para compilar dependencias nativas
RUN apt-get update && apt-get install -y python3 g++ make && rm -rf /var/lib/apt/lists/*

# Establece el directorio de trabajo
WORKDIR /app

# Copia los archivos de dependencias
COPY package.json package-lock.json ./

# Instala dependencias solo de producción
RUN npm ci --omit=dev

# Copia el resto del proyecto
COPY . .

# Compila la aplicación NestJS
RUN npm run build

# Expone el puerto (asegúrate de que en tu main.ts uses process.env.PORT)
EXPOSE 3000

# Inicia la app compilada
CMD ["node", "dist/main.js"]
