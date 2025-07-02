# ---------- ETAPA 1: build ----------
FROM node:18-slim as builder

RUN apt-get update && apt-get install -y python3 g++ make && rm -rf /var/lib/apt/lists/*
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

# ---------- ETAPA 2: producción ----------
FROM node:18-slim as production

WORKDIR /app

# Solo copia lo necesario para correr
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# Copia el código compilado desde la etapa anterior
COPY --from=builder /app/dist ./dist

# Copia cualquier otra cosa necesaria para runtime (como .env o archivos estáticos)
COPY --from=builder /app/.env ./

EXPOSE 3000
CMD ["node", "dist/main.js"]
