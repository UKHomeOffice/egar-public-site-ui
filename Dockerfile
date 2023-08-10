FROM quay.io/ukhomeofficedigital/egar-node-8:latest

RUN apk update \
    && apk upgrade --update-cache --available \
    && apk add curl

RUN mkdir -p /public-site/ && \
    mkdir -p /var/log/nodejs/ && \
    touch /var/log/nodejs/app.log

COPY src/app /public-site/app
COPY src/common /public-site/common
COPY src/locales /public-site/locales
COPY src/public /public-site/public
COPY src/test /public-site/test
COPY src/gruntfile.js /public-site/
COPY src/server.js /public-site/
COPY src/start.js /public-site/
COPY src/package.json /public-site/

RUN chown -R node /public-site/ && \
    chown -R node /var/log/nodejs/

USER 1000

EXPOSE 3000

WORKDIR /public-site/

#RUN npm install
RUN npm install --production
RUN npm update
CMD ["node", "start"]
