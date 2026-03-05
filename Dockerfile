### temporary buildstage container for frontend themes
FROM node:24-trixie-slim AS theme

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


### setup basic updated and cleaned stage for reuse in build and the actual output image
FROM python:3.11-slim-trixie AS python_base
ENV PYTHONUNBUFFERED 1

# upgrade install build-time deps
RUN apt-get update && \
    apt-get upgrade -y && \
    apt-get install -y libpq-dev && \
	apt-get autoremove -y


#### temporary buildstage for building and installing all backend dependencies
FROM python_base AS backend_deps
RUN apt-get install -y gcc git pipx

# install poetry and poetry-plugin-export
RUN pipx install poetry
RUN pipx inject poetry poetry-plugin-export

WORKDIR /build/
# Check Poetry version so we got it in the buildlogs
RUN ~/.local/bin/poetry --version
# copy projects backend dependency devinitions into the container
COPY pyproject.toml poetry.lock ./
# export to requirements.txt
RUN ~/.local/bin/poetry export --format requirements.txt --without-hashes --with dev -o requirements.txt
# setup new python venv and install all deps via pip
RUN python -m venv /venv
RUN /venv/bin/pip install -r requirements.txt



### actual HAV container
FROM python_base

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

# install basic deps for running KAAMA
RUN apt-get install -y ffmpeg libimage-exiftool-perl libvips-dev dcraw && \
    apt-get autoremove -y && \
	apt-get clean && \
	rm -r /var/lib/apt/lists/*lz4

WORKDIR /code/
# setup venv and copy installed deps from backend_deps buildstage
RUN python -m venv /venv
COPY --from=backend_deps /venv/ /venv/

# copy the frontend files
WORKDIR /code/hav/apps/theme/
COPY --from=theme /code/hav/apps/theme/static ./static


# Copy all backend files from the local src dir into the container
WORKDIR /code/
COPY ./src/hav ./hav
COPY manage.py .

# collect the project's static files
RUN ["/venv/bin/python", "manage.py", "collectstatic", "--no-input"]

# and finally run kaama
CMD ["/venv/bin/daphne", "-p", "8000",  "-b", "0.0.0.0",  "hav.conf.asgi:application"]
