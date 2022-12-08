const personApi = require('../../../common/services/personApi');
const garApi = require('../../../common/services/garApi');
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

function getgarPeopleIds(garPeopleId, garId) {
  return new Promise((resolve, reject) => {
    garApi.getPeople(garId).then((peopleResponse) => {
    let garPeople = JSON.parse(peopleResponse);
     garPeople = garPeople.items;
     garPeople = garPeople.filter(person => garPeopleId.includes(person.garPeopleId)); 
     garPeople.forEach((person) => {
      const element = person;
      element.peopleType = person.peopleType.name;
    });
    resolve(garPeople);
    console.log(garPeople);
   }).catch((err) => {
     logger.info(err);
     reject(err);
   });
 });
}

module.exports.getgarPeopleIds = getgarPeopleIds;
module.exports.getDetailsByIds = getDetailsByIds;
