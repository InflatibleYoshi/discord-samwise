FROM node:12
WORKDIR /usr/src
COPY package*.json ./
RUN npm ci --only=production
COPY . .
CMD [ "node", "index.js" ]
