# Stage 1: Build
FROM node:22.17.0-alpine3.21 AS builder
WORKDIR /src/app

# Copy package files and Prisma schema first
COPY package*.json ./
COPY prisma ./prisma

# Install all dependencies (including devDependencies)
RUN npm install

# Copy remaining files
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build the application
RUN npm run build

# Stage 2: Production
FROM node:22.17.0-alpine3.21
WORKDIR /src/app

# Copy production files
COPY --from=builder /src/app/.next ./.next
COPY --from=builder /src/app/node_modules ./node_modules
COPY --from=builder /src/app/package*.json ./
COPY --from=builder /src/app/public ./public
COPY --from=builder /src/app/prisma ./prisma 

# Install only production dependencies
RUN npm ci --omit=dev && npm cache clean --force

ENV PORT=3000
ENV NODE_ENV=production
EXPOSE 3000

CMD ["npm", "run", "start"]

# # uses node version 22 as our base image
# FROM node:22.17.0-alpine3.21

# WORKDIR /src/app

# # 1. copy package.json and package-lock.json
# COPY package*.json ./
# COPY prisma ./prisma

# # 2. install dependencies
# RUN npm install

# # 3. copy all files
# COPY . .

# # 4. generate prisma client
# RUN npx prisma generate

# # set port environment variable
# ENV NEXTAUTH_SECRET=kXEcI49WCMm6XrJr+Gt0/uJER/pqBAqmLOO+Z3N5dao=
# ENV DATABASE_URL=prisma+postgres://accelerate.prisma-data.net/?api_key=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhcGlfa2V5IjoiMDFKWEZNM0g0MU1SSDVCQTNORUhBRjJXNTEiLCJ0ZW5hbnRfaWQiOiI4Mzc2YjNiYTYyNTgwMzc5Nzk4MjQzOWYwZDg0Y2Q0MjVmNmIyMzI1Njc2YWI0ZjgwYmRjYmRhYjA3Nzg1MWMwIiwiaW50ZXJuYWxfc2VjcmV0IjoiNzk5OTAxZDEtODdmMi00YmVmLThmOWQtODM5ZWQ2ODNhNzkwIn0.MuvYjWAaPbx5RbDIlyKPi_rwf2h8oub58LGjyMu_SKI
# ENV PORT=3000

# # expose port
# EXPOSE 3000

# # start the app
# CMD ["npm", "run", "dev"]