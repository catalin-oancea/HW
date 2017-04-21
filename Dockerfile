FROM node:6.5.0

RUN npm install nodemon -g

COPY package.json /app/package.json

COPY server.js /app

WORKDIR /app

EXPOSE 5000
