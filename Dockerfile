# ─── Dev: hot-reload com volume mount ────────────────────────
FROM node:20-alpine

WORKDIR /app

# Instala dependências primeiro (camada cacheável)
COPY package*.json ./
RUN npm install

# Copia o restante do código
# (em dev, o volume no docker-compose sobrescreve isso — mas
#  é útil para o primeiro build e para CI)
COPY . .

EXPOSE 3000

# O comando real vem do docker-compose: "npm run dev"
CMD ["npm", "run", "dev"]
