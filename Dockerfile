FROM node:20
WORKDIR /usr/src/app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build:prisma
RUN npm run build

ENV NODE_ENV=production
EXPOSE 8663
CMD ["node", "dist/main"]
