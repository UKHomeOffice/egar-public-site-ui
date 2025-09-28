import notify from 'notifications-node-client';
import loggerFactory from '../utils/logger.js';
const logger = loggerFactory(import.meta.url);
import config from '../config/index.js';

if (config.NOTIFY_API_KEY === null) {
  throw new Error('Mandatory environment variable for GOV.UK Notify not set');
}

// Instantiate a new Notify client
const notifyClient = new notify.NotifyClient(config.NOTIFY_API_KEY);

const exported = {
  /**
   * @param {String} user
   * @param {String} token
   * @returns {Boolean}
   */
  send(firstName, email, notifyToken) {
    return new Promise((resolve, reject) => {
      notifyClient
        .sendEmail(config.NOTIFY_TOKEN_TEMPLATE_ID, email, {
          personalisation: {
            first_name: firstName,
            token: notifyToken,
            base_url: config.BASE_URL,
          },
        })
        .then(response => resolve(response))
        .catch((err) => {
          logger.error(err);
          reject(err);
        });
    });
  }
};

export default exported;

export const {
  send
} = exported;
