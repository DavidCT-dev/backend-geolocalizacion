# FROM node:18-slim as builder

# RUN apt-get update && apt-get install -y python3 g++ make && rm -rf /var/lib/apt/lists/*
# WORKDIR /app

# COPY package.json package-lock.json ./
# RUN npm ci

# COPY . .              
# COPY .env ./          
# RUN npm run build

# FROM node:18-slim as production

# WORKDIR /app

# COPY package.json package-lock.json ./
# RUN npm ci --omit=dev

# COPY --from=builder /app/dist ./dist
# COPY --from=builder /app/.env ./   

# EXPOSE 3000
# CMD ["node", "dist/main.js"]


FROM node:18-slim as builder

# ✅ Agregar herramientas necesarias para mongodump
RUN apt-get update && \
    apt-get install -y python3 g++ make curl gnupg && \
    curl -fsSL https://www.mongodb.org/static/pgp/server-6.0.asc | gpg --dearmor -o /usr/share/keyrings/mongodb-server.gpg && \
    echo "deb [ arch=amd64 signed-by=/usr/share/keyrings/mongodb-server.gpg ] https://repo.mongodb.org/apt/debian bullseye/mongodb-org/6.0 main" | tee /etc/apt/sources.list.d/mongodb-org-6.0.list && \
    apt-get update && \
    apt-get install -y mongodb-database-tools && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
COPY .env ./
RUN npm run build

FROM node:18-slim as production

# También instalar mongodump aquí si quieres usarlo en producción
RUN apt-get update && \
    apt-get install -y curl gnupg && \
    curl -fsSL https://www.mongodb.org/static/pgp/server-6.0.asc | gpg --dearmor -o /usr/share/keyrings/mongodb-server.gpg && \
    echo "deb [ arch=amd64 signed-by=/usr/share/keyrings/mongodb-server.gpg ] https://repo.mongodb.org/apt/debian bullseye/mongodb-org/6.0 main" | tee /etc/apt/sources.list.d/mongodb-org-6.0.list && \
    apt-get update && \
    apt-get install -y mongodb-database-tools && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/.env ./

EXPOSE 3000
CMD ["node", "dist/main.js"]
