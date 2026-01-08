# Dockerfile for Homeboys Swift Backend
FROM node:18-alpine
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
ENV NODE_ENV=production
EXPOSE 10000
CMD ["node", "src/index.js"]




