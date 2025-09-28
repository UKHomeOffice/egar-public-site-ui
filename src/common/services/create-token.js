import crypto from 'crypto';
import loggerFactory from '../utils/logger.js';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const logger = loggerFactory(__filename);
import config from '../config/index.js';

const exported = {
  /**
   * Generates a hash off an incoming token.
   *
   * @returns {String} a string token
   */
  generateHash(token) {
    logger.debug('Generating hash for token');
    // Replace secret string
    const hash = crypto.createHmac('sha256', config.NOTIFY_TOKEN_SECRET)
      .update(token)
      .digest('hex');
    return hash;
  },

  /**
   * Generates a numeric MFA token.
   *
   * @returns {String} a MFA token
   */
  genMfaToken() {
    logger.debug('Generating MFA token');
    const tokenLength = config.MFA_TOKEN_LENGTH;
    return Math.floor((10 ** (tokenLength - 1)) + Math.random() * 9 * (10 ** (tokenLength - 1)));
  }
};

export default exported;

export const {
  generateHash,
  genMfaToken
} = exported;
