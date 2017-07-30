FROM python:3.6.2
ENV PYTHONUNBUFFERED 1
VOLUME /code
VOLUME /dist
VOLUME /build
VOLUME /media:../mounts/incoming/
COPY /backend/requirements.txt /code/
COPY /backend/requirements-dev.txt /code/
WORKDIR /code
RUN pip install -U pip
RUN pip install -r requirements.txt
RUN pip install -r requirements-dev.txt
