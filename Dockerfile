FROM node:12 as admin-ui

WORKDIR /code/

# Link up the required build files
COPY ./frontend/admin/package.json ./frontend/admin/yarn.lock ./admin/

WORKDIR /code/admin/
RUN yarn install --production=false
COPY ./frontend/admin .
RUN yarn build

FROM node:12 as django-styles

WORKDIR /code/frontend/django-styles/

# Link up the required build files
COPY ./frontend/django-styles/package.json ./frontend/django-styles/package-lock.json ./
RUN npm install

# now copy the backend folder where the django
# templates live
WORKDIR /code
# copy the whole source folder
COPY . .
RUN ls -lah

WORKDIR /code/frontend/django-styles/

ENV NODE_ENV "production"
RUN npm run build


FROM node:12 as theme

WORKDIR /code/frontend/theme/

# Link up the required build files
COPY ./frontend/theme/package.json ./frontend/theme/package-lock.json ./
RUN npm ci

# now copy the backend folder where the django
# templates live
WORKDIR /code
# copy the whole source folder
COPY . .
RUN ls -lah

WORKDIR /code/frontend/theme/

ENV NODE_ENV "production"
RUN npm run build


FROM python:3.8-buster
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
POETRY_VERSION=1.1.3 \
PYTHONPATH=/venv/lib/python3.8/site-packages

RUN ["mkdir", "-p", "/archive/incoming", "/archive/hav", "/archive/whav", "/archive/webassets/", "/archive/uploads", "/hav/.localhistory/bash", "/hav/.localhistory/ipython"]

# copy the frontend files
WORKDIR /hav/frontend
COPY --from=admin-ui /code/admin/build ./admin/build

# copy the npm generated styles
COPY --from=django-styles /code/frontend/django-styles/build ./django-styles/build

# copy the npm generated styles
COPY --from=theme /code/frontend/theme/dist ./theme/dist


# install all the python stuff
RUN pip install -U poetry==$POETRY_VERSION

WORKDIR /hav/backend
COPY backend/pyproject.toml backend/poetry.lock ./
RUN poetry --version
RUN poetry export --format requirements.txt --without-hashes --dev -o requirements.txt
RUN python -m venv /venv
RUN /venv/bin/pip install -r requirements.txt


# Copy all backend files
COPY ./backend .

RUN ["/venv/bin/python", "manage.py", "collectstatic", "--no-input"]

WORKDIR /hav

CMD ["/venv/bin/daphne", "-p", "8000",  "-b", "0.0.0.0",  "hav.asgi:application"]
