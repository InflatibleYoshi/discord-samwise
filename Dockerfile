FROM arm64v8/node:latest
WORKDIR /usr/src
COPY package.json .
RUN npm install
COPY . .
CMD [ "node", "index.js" ]
EXPOSE 443/tcp