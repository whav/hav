# Development setup using docker and docker-compose

Please make sure that both docker and docker install are available on your system.

Then running

```docker-compose up```

inside the projects root folder should be enough to bootstrap a
development environment.


## Load a database dump

Copy a database dump of the  whav's database to the
folder `./docker/mounts/db_dumps/`

Assuming that the dumps filename is `whav.dump` execute the following command:

```
docker-compose exec whav_db pg_restore -U whav -O -x -1 -d whav /db_dumps/whav.dump
```
