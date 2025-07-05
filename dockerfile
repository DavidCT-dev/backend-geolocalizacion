FROM node:18-slim as builder

RUN apt-get update && apt-get install -y python3 g++ make && rm -rf /var/lib/apt/lists/*
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .              
COPY .env ./          
RUN npm run build

FROM node:18-slim as production

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/.env ./   

EXPOSE 3000
CMD ["node", "dist/main.js"]
