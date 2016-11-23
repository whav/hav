FROM python:3.5
ENV PYTHONUNBUFFERED 1
VOLUME /code
VOLUME /build
ADD /backend/requirements.txt /code/
ADD /backend/requirements-dev.txt /code/
WORKDIR /code
RUN pip install -U pip
RUN pip install -r requirements.txt
RUN pip install -r requirements-dev.txt
