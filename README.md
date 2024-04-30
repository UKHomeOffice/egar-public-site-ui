## Submit a GAR

## Requirements
- docker and docker compose.
- `.env.dev` (ask a developer to give you them).

## Run the application

1. Git clone the `data-access-api` repo in the same folder.
Run the following:
```sh
docker compose up -d --build
```

This should build both the data-access-api and egar-public-site-ui.

On development:
- To see updated on the frontend, just reload the page.

## Unit tests

Run the following
```sh
docker exec  -it node sh
# get into the node container
npm run test
```

## Access the database

Run the following:
```sh
docker exec -it database sh
# get into the node container shell
psql -U user -d egar
# RUN you sql commands after wards
```

