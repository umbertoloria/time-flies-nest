FROM oven/bun:alpine
WORKDIR /usr/src/app

COPY package.json bun.lock ./

RUN bun install --frozen-lockfile

COPY . .

RUN DATABASE_URL=postgresql://mock:mock@localhost:5432/mock bun run build

ENV NODE_ENV=production
EXPOSE 8663

CMD ["bun", "run", "start"]
