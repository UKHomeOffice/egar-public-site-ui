# Submit a GAR Public Site UI

## Requirements
- docker
- docker-compose
- node
- npm
- your email added to GOV Notify Dev whitelist by repository administrator

## Development

The following depends on a `.env.dev` file in the root of this project with
the required environment variables. To obtain it please contact repository administrator.

This will start local instances of:
- Database (used for both Frontend and Backend)
- API (you need a local copy of `api` docker image loaded,
       please contact repository administrators to obtain it)
- ClamAV engine
- ClamAV REST API
- Frontend

Please note - due to security configuration, the following lines need to be
commented out for local development, but not committed back to the repository:
```
./src/server.js (lines 95-98):
  // app.use(csrf({cookie: {
  //   httpOnly: true,
  //   secure: true
  // }}));

./src/server.js (lines 103-106):
    // var token = req.csrfToken();
    // res.cookie('XSRF-TOKEN', token);
    //
    // res.locals.csrfToken = token;
```


To start clean:
```
docker-compose up --build -d
```
These steps will create 5 endpoints:
- http://localhost:5432 -> Database
- http://localhost:5000 -> API
- http://localhost:3310 -> ClamAV engine
- http://localhost:8080 -> ClamAV REST API
- http://localhost:3000 -> Node site


Once it's up, you need to:
- whitelist yourself in database:
```
for line in $(egrep -v "^#|^$" .env.dev); do export $line; done
docker exec -ti database sh -c "PGPASSWORD=${POSTGRES_PASSWORD} psql -U ${POSTGRES_USER} ${POSTGRES_DB}"
```

Once inside database REPL run these commands.
Don't forget to update your email address in the INSERT command:
```
CREATE TABLE "session" (
  "sid" varchar NOT NULL COLLATE "default",
	"sess" json NOT NULL,
	"expire" timestamp(6) NOT NULL
)
WITH (OIDS=FALSE);
ALTER TABLE "session" ADD CONSTRAINT "session_pkey" PRIMARY KEY ("sid") NOT DEFERRABLE INITIALLY IMMEDIATE;

INSERT INTO "WhiteList" ("email", "createdAt", "updatedAt") VALUES ('your@email.com', current_timestamp, current_timestamp);
```

To stop containers without cleaning data:
```
docker-compose stop
```

To start stopped containers:
```
docker-compose start
```

To apply your changes to Frontend only:
```
docker-compose stop node
docker-compose up --build -d node
```

To run unit tests you need to execute:
```
docker-compose exec -t node sh -c "cd test/ && npm test"

or

docker exec -it node sh
cd test && npm test
```

To remove containers, effectively cleaning all data:
```
docker-compose down
```

## Non Docker Usage
1. Set the required environment variables below.
2. Navigate to /src

```
npm install
node start
```

## Session Table Setup
This project is using `node-connect-pg-simple` for session storage.
This requires the session table to be setup in the postgres instance which
can be done by applying [this](https://github.com/voxpelli/node-connect-pg-simple/blob/master/table.sql) sql script

## Testing

```
cd src
npm test
```

## Linting
This repo is using the airbnb linting standards which are defined [here](https://github.com/airbnb/javascript).
An eslintrc file is provided in the root of this repo.
To use, please install the the ESLint plugin for your editor,
which will automatically pick up the config file.

## Gov Notify Environment Variables
| Variable                          | Description                         | Required |
| ---                               | ---                                 | ---      |
| NOTIFY_TOKEN_SECRET               | Token secret for gov notify         | True     |
| NOTIFY_API_KEY                    | API Key for gov notify              | True     |
| NOTIFY_GAR_CANCEL_TEMPLATE_ID     | Template id for GAR cancellation    | True     |
| NOTIFY_GAR_SUBMISSION_TEMPLATE_ID | Template id for GAR submission      | True     |
| NOTIFY_MFA_TEMPLATE_ID            | Template id for sending MFA token   | True     |
| NOTIFY_ACCOUNT_DELETE_TEMPLATE_ID | Template id for account deletion    | True     |
| NOTIFY_NOT_REGISTERED_TEMPLATE_ID | Template id for user not registered | True     |
| WHITELIST_REQUIRED                | Flag for checking email whitelist   | True     |

## API Related Environment Variables
| Variable            | Description                        | Required |
| ---                 | ---                                | ---      |
| API_VERSION         | Version of API being used          | True     |
| API_BASE            | Base url of API                    | True     |


## Application Environment Variables
| Variable                    | Description                           | Required |
| ---                         | ---                                   | ---      |
| BASE_URL                    | Base url of application               | True     |
| NODE_ENV                    | Code environment                      | False    |
| LOG_LEVEL                   | Application logging level (lowercase) | False    |
| CLAMAV_BASE                 | ClaMAV base uRL                       | True     |
| CLAMAV_PORT                 | CLAMAV port                           | True     |
| NODE_TLS_REJECT_UNAUTHORIZED| Ignore TLS verification               | True     |
| ENABLE_UNAVAILABLE_PAGE     | Show service unavailable page         | False    |

Please note: `BASE_URL` needs to be set in both Drone Secrets and Kube Secrets.

## Token Related Environment Variables
| Variable                      | Description                             | Required |
| ---                           | ---                                     | ---      |
| NOTIFY_MFA_TOKEN_LENGTH       | Length of MFA token to generate         | False    |
| NOTIFY_MFA_TOKEN_TTL          | Time (minutes) a MFA token is valid for | True     |
| NOTIFY_MFA_TOKEN_MAX_ATTEMPTS | Max number of attempts before expiry    | False    |


## Database Related Environment Variables
| Variable               | Description            | Required |
| ---                    | ---                    | ---      |
| PUBLIC_SITE_DBHOST     | Database host          | True     |
| PUBLIC_SITE_DBPORT     | Database port          | True     |
| PUBLIC_SITE_DBNAME     | Database name          | True     |
| PUBLIC_SITE_DBUSER     | Database user          | True     |
| PUBLIC_SITE_DBPASSWORD | Database user password | True     |

## Server Related Environment Variables
| Variable              | Description                    | Required |
| ---                   | ---                            | ---      |
| SESSION_PARSER_SECRET | Session Parser Secret          | True     |
| SESSION_ENCODE_SECRET | Session Encode Secret          | True     |
| SESSION_ENCODE_SECRET | Session Encode Secret          | True     |
| SESSION_TIMEOUT       | Session Timeout (MilliSeconds) | True     |
| COOKIE_SECURE_FLAG    | Set secure flag                | true     |
| GA_ID                 | Goggle Analytics tg Id         | true     |
