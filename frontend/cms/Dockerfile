FROM node:12

WORKDIR /code/

# Link up the required build files
COPY ./package.json ./yarn.lock ./


RUN yarn install --production=false
COPY ./ .
RUN yarn run next build
CMD yarn run next start -H 0.0.0.0 -p 3000
