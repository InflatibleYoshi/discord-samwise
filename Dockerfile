FROM node:12
WORKDIR /usr/src
COPY package.json .
RUN npm install
COPY . .
CMD [ "node", "index.js" ]
EXPOSE 443/tcp