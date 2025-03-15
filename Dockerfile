FROM node:18-alpine3.18

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

#RUN npm install
RUN npm ci --omit dev
CMD ["node", "start"]
