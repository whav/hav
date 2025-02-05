FROM node:18-bullseye-slim as theme

WORKDIR /code/hav/apps/theme/

# Link up the required build files
COPY ./src/hav/apps/theme/package.json ./src/hav/apps/theme/package-lock.json ./
RUN npm ci

# now copy the backend folder where the django
# templates live
WORKDIR /code/hav/

# copy the whole source folder
COPY ./src/hav .

WORKDIR /code/hav/apps/theme/

ENV NODE_ENV "production"
RUN npm run build


FROM python:3.11-slim-bullseye
ENV PYTHONUNBUFFERED 1

RUN apt-get update && \
    apt-get upgrade -y && \
    apt-get install -y libpq-dev gcc ffmpeg libimage-exiftool-perl libvips-dev dcraw git && \
    apt-get autoremove && \
    apt-get autoclean

# Create appropriate directories and set env variables during build time
ENV DEBUG=False \
INCOMING_FILES_ROOT=/archive/incoming \
HAV_ARCHIVE_PATH=/archive/hav \
WHAV_ARCHIVE_PATH=/archive/whav \
WEBASSET_ROOT=/archive/webassets \
UPLOADS_ROOT=/archive/uploads \
DJANGO_MEDIA_ROOT=/archive/uploads \
DJANGO_SECRET_KEY=I_AM_VERY_UNSAFE \
BASHHOMEDIR=/hav/.localhistory/bash \
HISTFILE=$BASHHOMEDIR/.bash_history \
IPYTHONDIR=/hav/.localhistory/ipython \
IMAGINARY_SECRET=UNSAFE \
PYTHONPATH=/venv/lib/python3.11/site-packages

RUN ["mkdir", "-p", "/archive/incoming", "/archive/hav", "/archive/whav", "/archive/webassets/", "/archive/uploads", "/hav/.localhistory/bash", "/hav/.localhistory/ipython"]

# copy the frontend files
WORKDIR /code/hav/apps/theme/
COPY --from=theme /code/hav/apps/theme/static ./static

# install poetry
RUN curl -sSL https://install.python-poetry.org | python -

WORKDIR /code/
COPY pyproject.toml poetry.lock ./
RUN ~/.local/bin/poetry --version
# install poetry's export plugin explicitly for poetry v2 compatability
RUN ~/.local/bin/poetry self add poetry-plugin-export
RUN ~/.local/bin/poetry export --format requirements.txt --without-hashes --with dev -o requirements.txt
RUN python -m venv /venv
RUN /venv/bin/pip install -r requirements.txt

# remove build deps
RUN apt-get purge -y git && \
    apt-get autoremove -y && \
    apt-get autoclean -y

# Copy all backend files
COPY ./src/hav ./hav

COPY manage.py .

RUN ["/venv/bin/python", "manage.py", "collectstatic", "--no-input"]

CMD ["/venv/bin/daphne", "-p", "8000",  "-b", "0.0.0.0",  "hav.conf.asgi:application"]
