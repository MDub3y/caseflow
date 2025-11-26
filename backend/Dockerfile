FROM node:18-alpine AS builder

WORKDIR /app

# Install OpenSSL for build steps (Prisma generate)
RUN apk add --no-cache openssl libc6-compat

COPY package*.json ./
COPY prisma ./prisma/

RUN npm ci

COPY . .

RUN npx prisma generate
RUN npm run build

FROM node:18-alpine

WORKDIR /app

# Install OpenSSL for runtime (CRITICAL FIX)
RUN apk add --no-cache openssl libc6-compat

COPY package*.json ./
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules

EXPOSE 3001

CMD ["npm", "start"]