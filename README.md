# Submit a GAR Public Site UI

## Docker Usage
The following depends on a .env file in the root of this project with the required environment variables. This will start a local test instance of keycloak for local testing.

```
docker-compose down -t 1
docker-compose build
docker-compose up -d
```

These steps will create 4 endpoints:
- https://127.0.0.1:10443 -> main site secured with unverified TLS certificate (ignore CERT INVALID errors)
- http://127.0.0.1:3000 -> node site
- http://127.0.0.1:3310 -> ClamAV endpoint


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
| Variable                          | Description                       | Required |
| ---                               | ---                               | ---      |
| NOTIFY_TOKEN_SECRET               | Token secret for gov notify       | True     |
| NOTIFY_API_KEY                    | API Key for gov notify            | True     |
| NOTIFY_GAR_CANCEL_TEMPLATE_ID     | Template id for GAR cancellation  | True     |
| NOTIFY_GAR_SUBMISSION_TEMPLATE_ID | Template id for GAR submission    | True     |
| NOTIFY_MFA_TEMPLATE_ID            | Template id for sending MFA token | True     |
| NOTIFY_ACCOUNT_DELETE_TEMPLATE_ID | Template id for account deletion  | True     |
| NOTIFY_NOT_REGISTERED_TEMPLATE_ID | Template id for user not registered  | True     |


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
