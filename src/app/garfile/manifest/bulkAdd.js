const personApi = require('../../../common/services/personApi');
const logger = require('../../../common/utils/logger')(__filename);

function getDetailsByIds(ids, userId, page) {
  return new Promise((resolve, reject) => {
    personApi.getPeople(userId, 'individual', page).then((peopleResponse) => {
      let people = JSON.parse(peopleResponse).items;
      people = people.filter(person => ids.includes(person.personId));
      people.forEach((person) => {
        const element = person;
        element.peopleType = person.peopleType.name;
      });

      resolve(people);
    }).catch((err) => {
      logger.error(err);
      reject(err);
    });
  });
}

module.exports.getDetailsByIds = getDetailsByIds;
