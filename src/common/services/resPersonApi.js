import request from 'request';
import loggerFactory from '../utils/logger.js';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const logger = loggerFactory(__filename);
import endpoints from '../config/endpoints.js';

const exported = {
    create(userId, resPerson) {
        return new Promise((resolve, reject) => {
            request.post({
                headers: { 'content-type': 'application/json' },
                url: endpoints.createResPerson(userId),
                body: JSON.stringify(resPerson),
            }, (error, _response, body) => {
                if (error) {
                    logger.error('Failed to call responsible person creation API endpoint');
                    reject(error);
                    return;
                }
                logger.debug('Successfully called responsible person creation endpoint');
                resolve(body);
            });
        });
    },

    getResPersons(id) {
        return new Promise((resolve, reject) => {
            const url = endpoints.getResPersons(id);
            request.get({
                headers: { 'content-type': 'application/json' },
                url: url,
            },
                (error, _response, body) => {
                    if (error) {
                        logger.error('Failed to call get responsible person details endpoint');
                        reject(error);
                        return;
                    }
                    logger.debug('Successfully called get responsible details API endpoint');
                    resolve(body);
                });
        });
    },

    getResPersonDetails(userId, responsiblePersonId) {
        return new Promise((resolve, reject) => {
            request.get({
                headers: { 'content-type': 'application/json' },
                url: endpoints.getResPersonDetail(userId, responsiblePersonId),
            },
                (error, _response, body) => {
                    if (error) {
                        logger.error('Failed to call get responsible person details endpoint');
                        reject(error);
                        return;
                    }
                    logger.debug('Successfully called get person details API endpoint');
                    resolve(body);
                });
        });
    },

    updateResPerson(userId, responsiblePersonId, resPerson) {
        return new Promise((resolve, reject) => {
            request.put({
                headers: { 'content-type': 'application/json' },
                url: endpoints.getResPersonDetail(userId, responsiblePersonId),
                body: JSON.stringify(resPerson),
                
            },
                (error, _response, body) => {
                    if (error) {
                        logger.error('Failed to call update person details endpoint');
                        logger.error(error);
                        reject(error);
                        return;
                    }
                    logger.debug('Successfully called update person details API endpoint');
                    resolve(body);
                });
        });
    },

    deleteResponsiblePerson(userId, responsiblePersonId) {
        return new Promise((resolve, reject) => {
            request.delete({
                headers: { 'content-type': 'application/json' },
                url: endpoints.deleteResPerson(userId, responsiblePersonId),
            }, (error, _response, body) => {
                if (error) {
                    logger.error('Failed to call delete responsible person endpoint');
                    reject(error);
                    return;
                }
                logger.debug('Successfully called delete responsible person endpoint');
                resolve(body);
            });
        });
    }
};

export default exported;

export const {
    create,
    getResPersons,
    getResPersonDetails,
    updateResPerson,
    deleteResponsiblePerson
} = exported;