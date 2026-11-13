const dataAccessApi = require('../services/dataAccessApi');
const logger = require('./logger')(__filename);

/**
 * For a supplied GAR object, check that the user id or organisation id
 * match the given parameters. Returns true if there is a match or false
 * otherwise.
 *
 * @param {Object} parsedGar The GAR to check
 * @param {String} userId The user id to check against
 * @param {String} organisationId The organisation to check against
 */

const checkGARUser = (parsedGar, userId, organisationId) => {
  if (parsedGar === undefined || parsedGar === null) return false;

  if (parsedGar.organisationId) {
    const isSameOrganisation = organisationId !== null && parsedGar.organisationId === organisationId;

    // if a gar has an org, then we can just check if the user and gar from the same Organisation
    if (!isSameOrganisation) {
      logger.warn('GAR Organisation does not match the organisation ID of user');
      return false;
    }
  }
  if (parsedGar.individualId) {
    const isIndividualUser = userId !== null && parsedGar.individualId === userId;

    // if a gar has an individual, then we can just check if the user and gar are the same individual
    if (!isIndividualUser) {
      logger.info('GAR Individual does not match the user ID of user');
      return false;
    }
  }

  // organisationId is null for individual users, so we check the userId match.
  // all organisation user's will have their organisationId set.
  return !(!organisationId && parsedGar.userId !== userId);
};

/**
 *
 * @param cookie  CookieModel
 * @param garId   string
 * @returns {Promise<{ok: boolean, gar: null}>}
 */
const hasGarOwnership = async (cookie, garId) => {
  if (!garId) return { ok: false, gar: null };

  try {
    const gar = await dataAccessApi.garApi.get(garId);
    const ok = checkGARUser(gar, cookie.getUserDbId(), cookie.getOrganisationId());
    return { ok, gar };
  } catch (err) {
    logger.error('Failed to verify GAR ownership', { garId, errorMessage: err?.message, stack: err?.stack });
    return { ok: false, gar: null };
  }
};

module.exports = { checkGARUser, hasGarOwnership };
