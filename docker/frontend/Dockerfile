FROM node:carbon
VOLUME /code
VOLUME /dist
WORKDIR /code
COPY /frontend/package.json /code/
COPY /frontend/yarn.lock /code/
RUN yarn install

