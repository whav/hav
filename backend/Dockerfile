FROM python:3
ENV PYTHONUNBUFFERED 1

RUN apt-get update && apt-get upgrade -y && apt-get install -y libpq-dev gcc && apt-get autoremove && apt-get autoclean
RUN pip install -U pipenv

WORKDIR /hav/
COPY Pipfile Pipfile.lock ./

RUN pipenv install --system
# Copy all backend files
COPY . .




