FROM node:10

WORKDIR /hav/frontend/
COPY . .
RUN yarn install
RUN yarn build
CMD [ "yarn", "start" ]
