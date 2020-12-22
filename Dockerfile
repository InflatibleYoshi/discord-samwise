FROM node:12
WORKDIR /usr/src
COPY package.json .
RUN npm install
COPY . .
RUN apt update && apt add build-base dumb-init curl
RUN curl -LJO https://github.com/channable/vaultenv/releases/download/v0.13.1/vaultenv-0.13.1.deb
RUN apt install ./vaultenv-0.13.1.deb
CMD [ "node", "index.js" ]
EXPOSE 443/tcp