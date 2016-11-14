FROM python:3.5
ENV PYTHONUNBUFFERED 1
RUN mkdir /code
WORKDIR /code
ADD ./backend/ /code/
RUN pip install -U pip
RUN pip install -r requirements.txt
RUN pip install -r requirements-dev.txt
RUN python manage.py runserver
