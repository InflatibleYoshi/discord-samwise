FROM node:12
WORKDIR /usr/src
COPY package.json .
RUN npm install
COPY . .

RUN apk update && apk add build-base dumb-init curl dpkg
RUN curl -LJO https://github.com/channable/vaultenv/releases/download/v0.13.1/vaultenv-0.13.1.deb
RUN dpkg -i vaultenv-0.13.1.deb

RUN if [ -z "${SAMWISE_BOT_TOKEN}" ]; then vaultenv --token "${VAULT_TOKEN}" --no-connect-tls --secrets-file ./vault.secrets; fi

EXPOSE 443/tcp