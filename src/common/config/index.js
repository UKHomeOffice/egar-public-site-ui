// Gov notify settings
exports.NOTIFY_API_KEY = process.env.NOTIFY_API_KEY;
exports.NOTIFY_TOKEN_TEMPLATE_ID = process.env.NOTIFY_TOKEN_TEMPLATE_ID;
exports.NOTIFY_RECEIPT_TEMPLATE_ID = '3bc1e2ab-59d4-438e-b896-499f9c811fd6';
exports.NOTIFY_INTERNAL_TEMPLATE_ID = '2bc9954d-e07f-44e7-a691-e53d8d1400fd';
exports.NOTIFY_INVITE_TEMPLATE_ID = process.env.NOTIFY_INVITE_TEMPLATE_ID;
exports.NOTIFY_TOKEN_SECRET = process.env.NOTIFY_TOKEN_SECRET;
exports.NOTIFY_GAR_CANCEL_TEMPLATE_ID = process.env.NOTIFY_GAR_CANCEL_TEMPLATE_ID;
exports.NOTIFY_GAR_SUBMISSION_TEMPLATE_ID = process.env.NOTIFY_GAR_SUBMISSION_TEMPLATE_ID;
exports.NOTIFY_MFA_TEMPLATE_ID = process.env.NOTIFY_MFA_TEMPLATE_ID;
exports.NOTIFY_ACCOUNT_DELETE_TEMPLATE_ID = process.env.NOTIFY_ACCOUNT_DELETE_TEMPLATE_ID;
exports.NOTIFY_ORGANISATION_DELETE_TEMPLATE_ID = process.env.NOTIFY_ORGANISATION_DELETE_TEMPLATE_ID;

exports.NOTIFY_NOT_REGISTERED_TEMPLATE_ID = process.env.NOTIFY_NOT_REGISTERED_TEMPLATE_ID;

// Server settings
exports.SESSION_ENCODE_SECRET = process.env.SESSION_ENCODE_SECRET || 'thisShouldBeLongAndSecret';
exports.SESSION_PARSER_SECRET = process.env.SESSION_PARSER_SECRET || '3169n$*INDUKFIN*s47y4917$p';

// API settings
exports.API_BASE = process.env.API_BASE || 'http://localhost:5000';
exports.API_VERSION = process.env.API_VERSION || 'v0.2.0';

// Misc settings
exports.CORRELATION_HEADER = process.env.CORRELATION_HEADER_NAME || 'x-request-id';
exports.CONNECTOR_URL = process.env.CONNECTOR_URL;
exports.CONTACT_EMAIL = process.env.CONTACT_URL || 'supportegar@homeoffice.gov.uk';
exports.WHITELIST_REQUIRED = process.env.WHITELIST_REQUIRED || 'true';

// Application settings
exports.NODE_ENV = process.env.NODE_ENV || 'DEV';
exports.FLAGPOLE_MAINTENANCE = process.env.FLAGPOLE_MAINTENANCE;
exports.LOG_LEVEL = process.env.LOG_LEVEL || 'info';
exports.BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
exports.SESSION_TIMEOUT = process.env.SESSION_TIMEOUT || '3600000';
exports.COOKIE_SECURE_FLAG = process.env.COOKIE_SECURE_FLAG || 'false';

// Application form validation settings
exports.MAX_STRING_LENGTH = 35;
exports.MAX_POSTCODE_LENGTH = 13;
exports.MAX_REGISTRATION_LENGTH = 15;
exports.MAX_EMAIL_LENGTH = 150;
exports.MAX_ADDRESS_LINE_LENGTH = 250;
exports.MAX_TEXT_BOX_LENGTH = 250;
exports.USER_FIRST_NAME_CHARACTER_COUNT = process.env.USER_FIRST_NAME_CHARACTER_COUNT || 25;
exports.USER_GIVEN_NAME_CHARACTER_COUNT = 50;
exports.USER_SURNAME_CHARACTER_COUNT = process.env.USER_SURNAME_CHARACTER_COUNT || 25;

// ClamAv settings
exports.CLAMAV_BASE = process.env.CLAMAV_BASE;
exports.CLAMAV_PORT = process.env.CLAMAV_PORT;

// DB settings
exports.PUBLIC_SITE_DBHOST = process.env.PUBLIC_SITE_DBHOST;
exports.PUBLIC_SITE_DBPORT = process.env.PUBLIC_SITE_DBPORT;
exports.PUBLIC_SITE_DBNAME = process.env.PUBLIC_SITE_DBNAME;
exports.PUBLIC_SITE_DBUSER = process.env.PUBLIC_SITE_DBUSER;
exports.PUBLIC_SITE_DBPASSWORD = process.env.PUBLIC_SITE_DBPASSWORD;
exports.DATABASE_DIALECT = 'postgres';
exports.PUBLIC_SITE_DB_CONNSTR = `postgres://${process.env.PUBLIC_SITE_DBUSER}:${process.env.PUBLIC_SITE_DBPASSWORD}@${process.env.PUBLIC_SITE_DBHOST}:${process.env.PUBLIC_SITE_DBPORT}/${process.env.PUBLIC_SITE_DBNAME}`;

// TLS settings
exports.NODE_TLS_REJECT_UNAUTHORIZED = 1;

// Token settings
exports.MFA_TOKEN_LENGTH = parseInt(process.env.NOTIFY_MFA_TOKEN_LENGTH, 10) || 8;
exports.MFA_TOKEN_EXPIRY = parseInt(process.env.NOTIFY_MFA_TOKEN_TTL, 10) || 5;
exports.MFA_TOKEN_MAX_ATTEMPTS = parseInt(process.env.NOTIFY_MFA_TOKEN_MAX_ATTEMPTS, 10) || 5;

//MAX NUMBER OF FILES
exports.MAX_NUM_FILES = parseInt(process.env.MAX_NUM_FILES, 10) || 8;

//Homepage banner message
exports.HOMEPAGE_MESSAGE = process.env.HOMEPAGE_MESSAGE;

// Max allowed cancellation to CBP - 2 weeks
exports.MAX_ALLOWED_CANCELLATION_TIME_TO_CBP = 2 * 7 * 24 * 60 * 60 * 1000

exports.CARRIER_SUPPORT_HUB_UK_NUMBER = process.env.CARRIER_SUPPORT_HUB_UK_NUMBER;
exports.CARRIER_SUPPORT_HUB_INTERNATIONAL_NUMBER = process.env.CARRIER_SUPPORT_HUB_INTERNATIONAL_NUMBER;

//One Login
exports.ONE_LOGIN_PRIVATE_KEY = process.env.ONE_LOGIN_PRIVATE_KEY;
exports.ONE_LOGIN_CLIENT_ID = process.env.ONE_LOGIN_CLIENT_ID;
exports.ONE_LOGIN_INTEGRATION_URL = process.env.ONE_LOGIN_INTEGRATION_URL;
exports.ONE_LOGIN_REDIRECT_URI = process.env.ONE_LOGIN_REDIRECT_URI;
exports.ONE_LOGIN_LOGOUT_URL = process.env.ONE_LOGIN_LOGOUT_URL;
exports.ONE_LOGIN_PUBLIC_KEY = process.env.ONE_LOGIN_PUBLIC_KEY;
exports.ONE_LOGIN_POST_MIGRATION = process.env.ONE_LOGIN_POST_MIGRATION;
exports.ONE_LOGIN_SHOW_ONE_LOGIN = process.env.ONE_LOGIN_SHOW_ONE_LOGIN;
exports.ONE_LOGIN_ACCOUNT_URL = process.env.ONE_LOGIN_ACCOUNT_URL;
exports.IS_HTTPS_SERVER = process.env.BASE_URL ? !process.env.BASE_URL.startsWith("http://localhost") : true;
exports.SAME_SITE_VALUE = this.IS_HTTPS_SERVER ? 'none' : 'lax';
exports.NOTIFY_ONELOGIN_NEW_USER_REGISTERED_EMAIL = process.env.NOTIFY_ONELOGIN_NEW_USER_REGISTERED_EMAIL;
