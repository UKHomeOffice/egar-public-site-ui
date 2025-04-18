FROM node:22-alpine3.21 AS development

RUN apk update \
    && apk upgrade --update-cache --available \
    && apk add curl

RUN mkdir -p /public-site/ && \
    mkdir -p /var/log/nodejs/ && \
    touch /var/log/nodejs/app.log

COPY src /public-site

RUN chown -R node /public-site/ && \
    chown -R node /var/log/nodejs/

USER 1000

EXPOSE 3000

WORKDIR /public-site/

RUN npm i

FROM development AS production

WORKDIR /public-site/

RUN npm ci --omit dev

CMD ["node", "start"]
