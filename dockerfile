FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

# Instalar dependencias incluyendo @nestjs/cli (ahora en "dependencies")
RUN npm install --omit=dev --legacy-peer-deps

COPY . .

RUN npm run build

EXPOSE 3000

CMD ["node", "dist/main"]
