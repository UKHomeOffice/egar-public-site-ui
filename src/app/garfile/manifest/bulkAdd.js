const dataAccessApi = require('../../../common/services/dataAccessApi');
const garApi = require('../../../common/services/data-access/garApi');

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
  return new Promise((resolve, reject) => {
    garApi
      .getPeople(garId)
      .then((peopleResponse) => {
        let garPeople = JSON.parse(peopleResponse);
        garPeople = garPeople.items;
        garPeople = garPeople.filter((person) => garPeopleId.includes(person.garPeopleId));
        garPeople.forEach((person) => {
          const element = person;
          element.peopleType = person.peopleType.name;
        });
        resolve(garPeople);
      })
      .catch((err) => {
        reject(err);
      });
  });
}

module.exports.getgarPeopleIds = getgarPeopleIds;
module.exports.getDetailsByIds = getDetailsByIds;
