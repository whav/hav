FROM nginx:mainline-alpine
RUN mkdir /assets
COPY ./backend/dist /assets
COPY ./docker/nginx/nginx.conf /etc/nginx/nginx.conf
EXPOSE 80




