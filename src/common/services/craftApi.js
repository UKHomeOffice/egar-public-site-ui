import request from 'request';
import loggerFactory from '../utils/logger.js';
const logger = loggerFactory(import.meta.url);
import endpoints from '../config/endpoints.js';

const exported = {
  /**
   * Calls create craft API endpoint.
   *
   * @param {String} registration Registration of the craft
   * @param {String} craftType Type of craft
   * @param {String} craftBase Base of craft
   * @param {String} userId id of user registering craft
   * @returns {Promise} returns API response when resolved
   */
  create(registration, craftType, craftBase, userId) {
    return new Promise((resolve, reject) => {
      request.post({
        headers: { 'content-type': 'application/json' },
        url: endpoints.createCraft(userId),
        body: JSON.stringify({
          registration,
          craftType,
          craftBase,
        }),
      }, (error, _response, body) => {
        if (error) {
          logger.error('Failed to call craft creation API');
          reject(error);
          return;
        }
        logger.debug('Successfully called craft creation endpoint');
        resolve(body);
      });
    });
  },

  /**
   * Gets the details of a craft.
   *
   * @param {String} userId id of user doing the search
   * @param {String} craftId id of craft to be searched for
   * @returns {Promise} resolves with API response
   */
  getDetails(userId, craftId) {
    return new Promise((resolve, reject) => {
      request.get({
        headers: { 'content-type': 'application/json' },
        url: endpoints.getCraftData(userId, craftId),
      },
      (error, _response, body) => {
        if (error) {
          logger.error('Failed to call get craft details endpoint');
          reject(error);
          return;
        }
        logger.debug('Successfully called get craft details API endpoint');
        resolve(body);
      });
    });
  },

  /**
   * Lists all crafts a user is able to see.
   *
   * @param {String} userId id of user trying to list crafts
   * @returns {Promise} resolves with API response
   */
  getCrafts(userId, pageNumber) {
    return new Promise((resolve, reject) => {
      request.get({
        headers: { 'content-type': 'application/json' },
        url: `${endpoints.getCrafts(userId)}?per_page=5&page=${pageNumber}`, // ?per_page=10&page=2`, or via qs
      },
      (error, _response, body) => {
        if (error) {
          logger.error('Failed to call get crafts API endpoint');
          reject(error);
          return;
        }
        logger.debug('Successfully called get crafts API endpoint');
        resolve(body);
      });
    });
  },

  /**
   * Lists all crafts a user is able to see.
   *
   * @param {String} orgid id of organisation trying to list crafts
   * @returns {Promise} resolves with API response
   */
  getOrgCrafts(orgId, pageNumber) {
    return new Promise((resolve, reject) => {
      request.get({
        headers: { 'content-type': 'application/json' },
        url: endpoints.getOrgCrafts(orgId),
        qs: {
          per_page: 5,
          page: pageNumber,
        },
      },
      (error, _response, body) => {
        if (error) {
          logger.error('Failed to call get org crafts API endpoint');
          reject(error);
          return;
        }
        logger.debug('Successfully called get org crafts API endpoint');
        resolve(body);
      });
    });
  },

  /**
   * Updates a given craft.
   *
   * @param {String} registration new registration number of craft
   * @param {String} craftType new type of craft
   * @param {String} craftBase new base of craft
   * @param {String} userId user who is attempting to perform update
   * @param {String} craftId id of craft attempting to be updated
   * @returns {Promise} resolves with API response
   */
  update(registration, craftType, craftBase, userId, craftId) {
    return new Promise((resolve, reject) => {
      request.put({
        headers: { 'content-type': 'application/json' },
        url: endpoints.updateCraft(userId, craftId),
        body: JSON.stringify({
          registration,
          craftType,
          craftBase,
        }),
      }, (error, _response, body) => {
        if (error) {
          logger.error('Failed to call update craft endpoint');
          reject(error);
          return;
        }
        logger.debug('Successfully called update craft API');
        resolve(body);
      });
    });
  },

  /**
   * Delete an individual user's craft.
   *
   * @param {String} userId id of user trying to delete craft
   * @param {String} craftId id of the craft to be deleted
   * @returns {Promise} resolves with API response
   */
  deleteCraft(requesterId, craftId) {
    return new Promise((resolve, reject) => {
      request.delete({
        headers: { 'content-type': 'application/json' },
        url: endpoints.deleteCraft(requesterId, craftId),
        body: JSON.stringify({
          requesterId,
          crafts: [{ craftId }],
        }),
      },
      (error, _response, body) => {
        if (error) {
          logger.error('Failed to call delete crafts API endpoint');
          reject(error);
          return;
        }
        logger.debug('Successfully called delete crafts API endpoint');
        resolve(body);
      });
    });
  },

  /**
   * Delete an organisation's craft.
   *
   * @param {String} orgId id of the organisation the craft belongs to
   * @param {String} userId id of user trying to delete craft
   * @param {String} craftId if of the craft to be deleted
   * @returns {Promise} resolves with API response
   */
  deleteOrgCraft(orgId, requesterId, craftId) {
    return new Promise((resolve, reject) => {
      request.delete({
        headers: { 'content-type': 'application/json' },
        url: endpoints.getOrgCrafts(orgId),
        body: JSON.stringify({
          requesterId,
          crafts: [{ craftId }],
        }),
      },
      (error, _response, body) => {
        if (error) {
          logger.error('Failed to call delete org crafts endpoint');
          reject(error);
          return;
        }
        logger.debug('Successfully called delete org crafts endpoint');
        resolve(body);
      });
    });
  }
};

export default exported;

export const {
  create,
  getDetails,
  getCrafts,
  getOrgCrafts,
  update,
  deleteCraft,
  deleteOrgCraft
} = exported;
