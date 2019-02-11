FROM node:10 as build-stage

WORKDIR /code/
COPY ./frontend/package.json frontend/yarn.lock ./
RUN yarn install
COPY ./frontend ./
RUN yarn build

FROM python:3.7.1-stretch
ENV PYTHONUNBUFFERED 1

RUN apt-get update && \
    apt-get upgrade -y && \
    apt-get install -y libpq-dev gcc ffmpeg libimage-exiftool-perl libvips-dev && \
    apt-get autoremove && \
    apt-get autoclean

# Create appropriate directories set env variables pointing to them
ENV DEBUG=False \
INCOMING_FILES_ROOT=/archive/incoming \
HAV_ARCHIVE_PATH=/archive/hav \
WHAV_ARCHIVE_PATH=/archive/whav \
WEBASSET_ROOT=/archive/webassets \
DJANGO_SECRET_KEY=I_AM_VERY_UNSAFE \
IMAGINARY_SECRET=UNSAFE

RUN ["mkdir", "-p", "/archive/incoming", "/archive/hav", "/archive/whav", "/archive/webassets/"]


RUN pip install -U pipenv

WORKDIR /hav/frontend
COPY --from=build-stage /code/build ./build

WORKDIR /hav/backend
COPY backend/Pipfile backend/Pipfile.lock ./

RUN pipenv install --system && pipenv install --system --dev

# Copy all backend files
COPY ./backend .

RUN ["python", "manage.py", "collectstatic", "--no-input"]

WORKDIR /hav

CMD ["daphne", "-p", "8000",  "-b", "0.0.0.0",  "hav.asgi:application"]
