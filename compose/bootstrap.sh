#!/bin/bash
docker-compose exec django python manage.py migrate --noinput
docker-compose exec django python manage.py createsuperuser

