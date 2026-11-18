# 1. IMMAGINE BASE: Usiamo Node.js 20 su una distribuzione Linux snella (Debian slim)
FROM node:20-slim

# 2. DIPENDENZE DI SISTEMA: Prisma ha bisogno di OpenSSL per le operazioni crittografiche
RUN apt-get update -y && apt-get install -y openssl

# 3. DIRECTORY DI LAVORO: Creiamo la cartella /app dentro il container Linux
WORKDIR /app

# 4. CACHE DELLE DIPENDENZE: Copiamo prima solo package.json e package-lock.json
# Perché? Così Docker non riscarica tutti i pacchetti se modifichiamo solo il codice di server.js!
COPY package*.json ./

# 5. INSTALLAZIONE: Installiamo le dipendenze pulite dentro il container Linux
RUN npm install

# 6. PRISMA ENGINE: Copiamo lo schema e generiamo il client Prisma per Linux
COPY prisma ./prisma/
RUN npx prisma generate

# 7. CODICE SORGENTE: Copiamo tutto il resto dei file (esclusi quelli in .dockerignore)
COPY . .

# 8. PORTA: Indichiamo che il container comunicherà sulla porta 3000
EXPOSE 3000

# 9. COMANDO DI AVVIO: L'istruzione che accende il server all'avvio del container
CMD ["node", "server.js"]
