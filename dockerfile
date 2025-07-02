# Usa una imagen oficial ligera de Node.js
FROM node:18-slim

# Instala herramientas necesarias para compilar dependencias nativas
RUN apt-get update && apt-get install -y python3 g++ make && rm -rf /var/lib/apt/lists/*

# Establece el directorio de trabajo
WORKDIR /app

# Copia los archivos de dependencias
COPY package.json package-lock.json ./

# ✅ Instala TODAS las dependencias (incluyendo dev) necesarias para compilar
RUN npm ci -f

# Copia el resto del proyecto
COPY . .

# Compila la aplicación NestJS
RUN npm run build

# ✅ Elimina dependencias de desarrollo después de compilar (opcional, para reducir tamaño)
RUN npm prune --omit=dev

# Expone el puerto (asegúrate de usar process.env.PORT en main.ts)
EXPOSE 3000

# Inicia la app compilada
CMD ["node", "dist/main.js"]
