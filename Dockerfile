FROM node:12 as theme

WORKDIR /code/backend/apps/theme/

# Link up the required build files
COPY ./backend/apps/theme/package.json ./backend/apps/theme/package-lock.json ./
RUN npm ci

# now copy the backend folder where the django
# templates live
WORKDIR /code/backend/

# copy the whole source folder
COPY ./backend .

WORKDIR /code/backend/apps/theme/

ENV NODE_ENV "production"
RUN npm run build


FROM python:3.9-buster
ENV PYTHONUNBUFFERED 1

RUN apt-get update && \
    apt-get upgrade -y && \
    apt-get install -y libpq-dev gcc ffmpeg libimage-exiftool-perl libvips-dev ufraw-batch && \
    apt-get autoremove && \
    apt-get autoclean

# Create appropriate directories set env variables pointing to them
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
PYTHONPATH=/venv/lib/python3.9/site-packages

RUN ["mkdir", "-p", "/archive/incoming", "/archive/hav", "/archive/whav", "/archive/webassets/", "/archive/uploads", "/hav/.localhistory/bash", "/hav/.localhistory/ipython"]

# copy the frontend files
WORKDIR /hav/backend/apps/theme/
COPY --from=theme /code/backend/apps/theme/static ./static


# install all the python stuff
RUN curl -sSL https://raw.githubusercontent.com/python-poetry/poetry/master/install-poetry.py | python -

WORKDIR /hav/backend
COPY backend/pyproject.toml backend/poetry.lock ./
RUN ~/.local/bin/poetry --version
RUN ~/.local/bin/poetry export --format requirements.txt --without-hashes --dev -o requirements.txt
RUN python -m venv /venv
RUN /venv/bin/pip install -r requirements.txt


# Copy all backend files
COPY ./backend .

RUN ["/venv/bin/python", "manage.py", "collectstatic", "--no-input"]

WORKDIR /hav

CMD ["/venv/bin/daphne", "-p", "8000",  "-b", "0.0.0.0",  "hav.asgi:application"]
