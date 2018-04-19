FROM python:alpine3.7
ENV SECRET_KEY=changeme
ENV IMAGESERVER_SECRET=changeme
RUN apk --no-cache add \
    linux-headers \
    postgresql-dev\
    gcc\
    python3-dev\
    musl-dev

RUN mkdir /code
WORKDIR /code
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

RUN mkdir -p /hav/archive &&\
    mkdir /hav/incoming &&\
    mkdir /hav/webassets &&\
    mkdir /hav/static &&\
    mkdir -p /frontend/build &&\
    mkdir -p /frontend/src/assets


ENV INCOMING_FILES_ROOT=/hav/incoming
ENV HAV_ARCHIVE_PATH=/hav/archive
ENV WEBASSET_ROOT=/hav/webassets
ENV STATIC_ROOT=/hav/static

RUN python manage.py collectstatic --noinput

CMD ["python", "manage.py", "check"]
