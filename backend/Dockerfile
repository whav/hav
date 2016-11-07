FROM python:3.5
ENV PYTHONUNBUFFERED 1
RUN mkdir /code
WORKDIR /code
RUN pip install -r requirements.txt
RUN pip install -r requirements-dev.txt
ADD ./ /code/
