const personApi = require('../../../common/services/personApi');

function bulkAdd(ids, userId) {
  return new Promise((resolve, reject) => {
    personApi.getPeople(userId, 'individual')
      .then((peopleResponse) => {
        let people = JSON.parse(peopleResponse);
        people = people.filter(person => ids.includes(person.personId));
        people.forEach(person => person.peopleType = person.peopleType.name);
        resolve(people);
      })
      .catch((err) => {
        reject(err);
      });
  });
}

module.exports.bulkAdd = bulkAdd;
