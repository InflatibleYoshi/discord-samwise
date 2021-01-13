FROM arm64v8/node:15.5.1-alpine3.10
WORKDIR /usr/src
COPY package.json .
RUN npm install
COPY . .
CMD [ "node", "index.js" ]
EXPOSE 443/tcp