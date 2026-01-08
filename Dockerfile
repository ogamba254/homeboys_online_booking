# Dockerfile for Homeboys Swift Backend

FROM node:18-alpine
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install --production
COPY . .
COPY ../frontend ./frontend
ENV NODE_ENV=production
EXPOSE 3000
CMD ["node", "src/index.js"]






