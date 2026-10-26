const dataAccessApi = require('../../../common/services/dataAccessApi');

function getDetailsByIds(ids, userId) {
  return new Promise((resolve, reject) => {
    dataAccessApi.personApi
      .getPeople(userId, 'individual')
      .then((peopleResponse) => {
        const people = peopleResponse
          .filter((person) => ids.includes(person.personId))
          .map((person) => ({ ...person, peopleType: person.peopleType.name }));
        resolve(people);
      })
      .catch((err) => {
        reject(err);
      });
  });
}

function getgarPeopleIds(garPeopleId, garId) {
  return dataAccessApi.garApi.getPeople(garId).then((peopleResponse) => {
    return peopleResponse.items
      .filter((person) => garPeopleId.includes(person.garPeopleId))
      .map((person) => ({ ...person, peopleType: person.peopleType.name }));
  });
}

module.exports.getgarPeopleIds = getgarPeopleIds;
module.exports.getDetailsByIds = getDetailsByIds;
