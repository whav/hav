# Here be development documentation

*Write me...*

## Running locally

After setting up your development environment (poetry install, npm install etc) we can now start 
the services required to get the app running.

### Django services

Move to the backend folder in the project directory and execute the following steps (twice - per terminal)

```bash
cd backend/
poetry shell # activate the virtual environment
```

Running the django dev server:
 
```bash
DEBUG=True ./manage.py runserver
```

For archiving the uploaded assets we also need to run the workers:

```bash
DEBUG=True ./manage.py rqworker default webassets archive
```


### Image server

Currently I always run the image server via docker compose, YMMV:

```bash
docker-compose uup imaginary
```

### Frontend builds

```bash
cd frontend/admin
yarn hmr
```

```bash
cd frontend/cms
yarn dev
```



