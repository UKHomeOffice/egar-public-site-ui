## Submit a GAR (sGAR)

## Development setup

See [the development setup guide](docs/setup.md) for prerequisites, environment configuration, project dependencies, local startup, tooling installation, and verification.

## Generate airport codes data (airport_codes.json)

The airport codes used by the app are generated from a CSV file.

- To add or update an airport code: edit `src/common/app_data/airport_codes.csv`.
- Then run the Node script below to regenerate `src/common/app_data/airport_codes.json`.

```sh
# From the project root
node scripts/generate_airport_codes.js
```

Notes:
- Do not manually edit `src/common/app_data/airport_codes.json`; it is derived from the CSV.
- The generator enforces sorting and normalisation and will overwrite the JSON file.
- The resulting JSON includes an additional `value` field (priority: IATA > ICAO > first otherCode).
- when filling the airport_codes.csv, the "otherCodes" column should hold a comma separated list of airport codes that don't match IATA or ICAO.

|name| ICAO                                          | IATA                                         | OtherCode                                   | crownDependency                        | designated                       | british                     | label                  | Comment |
|---|-----------------------------------------------|----------------------------------------------|---------------------------------------------|----------------------------------------|----------------------------------|-----------------------------|------------------------|---|
|Kautokeino Air Base| ENKA                                          | QKX                                          |                                             | FALSE                                  | FALSE                            | FALSE                       | Kautokeino Air Base (QKX / ENKA) | ICAO/IATA aircodes|
 |Bedwell Hey Farm Ely Rd| | | E201| FALSE| TRUE| TRUE| Bedwell Hey Farm Ely Rd| Not IATA/ICAO airfield|

## Access the database

Run the following to access the database so you can run SQL commands. 
```sh
docker exec -it database sh

# Log into postgres with the following command
psql -U user -d egar
# RUN you sql commands after wards
```

## Mock clamav
- To use the mock clamav container, you need to specific the following environment variables in the `.env.dev`:
```sh
CLAMAV_BASE=http://mock-clamav
CLAMAV_PORT=8080
```

## Other repositories

In general you don't need to run `gateway-api` and `data-integr-cbp`, unless:

- You want to mock submitting a GAR to CBP.
- If you are mocking a flight from a foreign country to the UK and need check their UPT status.

## Structure of app

- Files are organised to match route path, e.g. ./app/garfile/manifest --> http://localhost:3000/garfile/manifest.
    - Occasionally, the route path may deviate from this rule e.g. upload gar spreadsheet is under `./api/uploadgar` rather than `./garfile/garupload`.
- GET and POST request handlers are separated out in `get.controller.js` and `post.controller.js`.
- `./test` file structure roughly maps the `./app` file structure e.g. test/garfile/garupload/get.controller.test.js` is the test for `./app/garfile/garupload/get.controller.js`.
- `public` folders contains frontend scripts, stylesheets and html that is sent to the user.
- `locales` contains text used in the app.
- `common` contains common functionalty used in app.


## Managing Token Generation Exclusion

In order to prevent unnecessary generation of token, we added an exclusion list. This list holds the path patterns for routes 
that don't use CSRF tokens. This was introduced as part of the ticket [sGAR: CSRF
](https://jira.bics-collaboration.homeoffice.gov.uk/browse/NMSW-3970).

The list is maintained in this file `src/common/config/csrfExclusionList.js`
