FROM ghcr.io/puppeteer/puppeteer:23.9.0

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

CMD ["node", "server.js"]
