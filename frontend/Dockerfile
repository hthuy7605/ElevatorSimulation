FROM node:22.23.2
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm
RUN pnpm install
COPY . .
EXPOSE 5173
CMD ["pnpm","run","dev"]