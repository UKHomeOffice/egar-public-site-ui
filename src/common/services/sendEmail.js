const notify = require('notifications-node-client');
const logger = require('../utils/logger')(__filename);

const config = require('../config/index');

if (config.NOTIFY_API_KEY === null) {
  throw new Error('Mandatory environment variable for GOV.UK Notify not set');
}

// Instantiate a new Notify client
const notifyClient = new notify.NotifyClient(config.NOTIFY_API_KEY);

const networkErrorCodes = new Set([
  'ECONNABORTED',
  'ECONNREFUSED',
  'ECONNRESET',
  'EAI_AGAIN',
  'ENOTFOUND',
  'ETIMEDOUT',
]);

const notifyErrorReason = (error) => {
  const message = typeof error?.message === 'string' ? error.message : '';

  if (/^can't send to this recipient using a team-only api key$/i.test(message)) {
    return 'recipient_not_allowed_team_key';
  }
  if (/^can't send to this recipient when service is in trial mode(?:\s|$)/i.test(message)) {
    return 'recipient_not_allowed_trial_mode';
  }
  if (/^missing personalisation:/i.test(message)) {
    return 'missing_personalisation';
  }

  switch (error?.error) {
    case 'AuthError':
      return 'notify_auth_error';
    case 'BadRequestError':
      return 'notify_bad_request';
    case 'ValidationError':
      return 'notify_validation_error';
    case 'RateLimitError':
      return 'notify_rate_limited';
    case 'TooManyRequestsError':
      return 'notify_send_limit_exceeded';
    default:
      return 'unknown_notify_error';
  }
};

module.exports = {
  /**
   *
   * @param {String} template notify template id to use
   * @param {String} email Email address to send to
   * @param {Object} personalisation key value pairs to replace strings in notify template
   */
  send(templateId, email, personalisation) {
    return new Promise((resolve, reject) => {
      notifyClient
        .sendEmail(templateId, email, { personalisation })
        .then((response) => resolve(response))
        .catch((err) => {
          const status = err?.response?.status;
          const errors = err?.response?.data?.errors;
          logger.error(`Failed to send email templateId=${templateId}`, {
            statusCode: Number.isInteger(status) && status >= 100 && status <= 599 ? status : undefined,
            notifyErrorReasons: Array.isArray(errors) ? errors.slice(0, 10).map(notifyErrorReason) : [],
            errorCode: networkErrorCodes.has(err?.code) ? err.code : undefined,
          });
          reject(err);
        });
    });
  },
};
