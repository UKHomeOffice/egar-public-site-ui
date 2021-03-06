const personApi = require('../../../common/services/personApi');
const logger = require('../../../common/utils/logger')(__filename);

function getDetailsByIds(ids, userId) {
  return new Promise((resolve, reject) => {
    personApi.getPeople(userId, 'individual').then((peopleResponse) => {
      let people = JSON.parse(peopleResponse);
      people = people.filter(person => ids.includes(person.personId));
      people.forEach((person) => {
        const element = person;
        element.peopleType = person.peopleType.name;
      });

      resolve(people);
    }).catch((err) => {
      logger.info(err);

      reject(err);
    });
  });
}

module.exports.getDetailsByIds = getDetailsByIds;
