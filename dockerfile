FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install --omit=dev --legacy-peer-deps

COPY . .

RUN npm run build:tsc

EXPOSE 3000

CMD ["node", "dist/main"]
