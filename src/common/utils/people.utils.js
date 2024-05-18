function flagDuplicatePeopleIn(peopleToReturn, peopleToCheckAgainst) {
    if (peopleToCheckAgainst === undefined) return peopleToReturn;
  
    const result = peopleToReturn.map((returnPerson) => {
      const duplicatePersonInGar = peopleToCheckAgainst.filter((personToCheck) => {
        return (
          personToCheck.firstName === returnPerson.firstName
          && personToCheck.lastName === returnPerson.lastName
          && personToCheck.documentNumber === returnPerson.documentNumber
          && personToCheck.issuingState === returnPerson.issuingState
        )
      });
  
      return { 
        ...returnPerson,
        isDuplicate: duplicatePersonInGar.length > 0 
      };
    })
  
    return result;
}
  
function flagInvalidPeopleIn(people, manifestInvalidPeople) {
    return people.map((person, index) => {
        return {
            ...person,
            isInvalid: manifestInvalidPeople.includes(`person-${index}`)
        }
    })
}

function isAllPeopleUnableToAdd(people) {
    const peopleUnableToAdd = people.filter((person) => {
        return person.isDuplicate || person.isInvalid;
    })

    return people.length === peopleUnableToAdd.length;
}

module.exports = {
    flagDuplicatePeopleIn,
    flagInvalidPeopleIn,
    isAllPeopleUnableToAdd
}
