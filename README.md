## Submit a GAR

## Prerequisites
- Clone the `data-access-api`repo in the same parent folder and set up environment variables as explained in the `data-access-api` READMe.md.

## Requirements
- docker and docker compose.
- `.env.dev` (ask a developer to give you them).

## Run the application

1. Run the following:
```sh
docker compose up -d --build
```

This should build both the `data-access-api` and `egar-public-site-ui`.

- To see changes on the frontend, just reload the page.

## Unit tests

Run the below to access the node container, which will have all the installed dependencies, so you can run the npm test script.
```sh
docker exec  -it node sh

# Now run the test script
npm run test
```

## Access the database

Run the following to access the database so you can run SQL commands. 
```sh
docker exec -it database sh

# Log into postgres with the following command
psql -U user -d egar
# RUN you sql commands after wards
```

## Other repositories

In general you don't need to run `gateway-api` and `data-integr-cbp`, unless:

- You want to mock submitting a GAR to CBP 
- If you are mocking a flight from a foreign country to the UK and need check their UPT status

## Structure of app

- Files are organisation to match route path, e.g. ./app/garfile/manifest --> http://localhost:3000/garfile/manifest.
    - Occasionally, the route path may deviate e.g. upload gar spreadsheet is under `./api/uploadgar` rather than `./garfile/garupload`.
- get and post are separated out in get.controller.js and post.controller.js.
- `./test` file structure roughly maps the `./app`.
- `public` folders cotnains frontend scripts, stylesheets and html sent to the user.
- `locales` contains text used in the app, `common` contains common functionalty.