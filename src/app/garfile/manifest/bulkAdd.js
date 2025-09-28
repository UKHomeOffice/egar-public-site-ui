import personApi from '../../../common/services/personApi.js';
import garApi from '../../../common/services/garApi.js';
import loggerFactory from '../../../common/utils/logger.js';
const logger = loggerFactory(import.meta.url);

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
   }).catch((err) => {
     logger.info(err);
     reject(err);
   });
 });
}

export default { getgarPeopleIds, getDetailsByIds };
