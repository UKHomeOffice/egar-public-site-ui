
const savedPeople = () => {
    return [
        {
          dateOfBirth: '1994-06-22',
          documentExpiryDate: '2023-06-22',
          documentNumber: '1283',
          documentType: 'Identity Card',
          firstName: 'James',
          garPeopleId: '1ca90ecf-12f4-4ccb-815d-651aae449fbd',
          gender: 'Male',
          issuingState: 'PTA',
          lastName: 'Smith',
          nationality: 'GBR',
          peopleType: {
            name: 'Crew',
          },
          placeOfBirth: 'PTA',
        },
        {
          dateOfBirth: '1994-06-22',
          documentExpiryDate: '2023-06-22',
          documentNumber: '1283',
          documentType: 'Identity Card',
          firstName: 'James',
          garPeopleId: '1ca90ecf-12f4-4ccb-815d-651aae449fbd',
          gender: 'Male',
          issuingState: 'PTA',
          lastName: 'Smith',
          nationality: 'GBR',
          peopleType: {
            name: 'Crew',
          },
          placeOfBirth: 'PTA',
        },
      ]
}

const flaggedSavedPeople = () => {
  return [
    {
      dateOfBirth: '1994-06-22',
      documentExpiryDate: '2023-06-22',
      documentNumber: '1283',
      documentType: 'Identity Card',
      firstName: 'James',
      garPeopleId: '1ca90ecf-12f4-4ccb-815d-651aae449fbd',
      gender: 'Male',
      issuingState: 'PTA',
      lastName: 'Smith',
      nationality: 'GBR',
      peopleType: {
        name: 'Crew',
      },
      placeOfBirth: 'PTA',
      isDuplicate: false,
      isInvalid: false,
    },
    {
      dateOfBirth: '1994-06-22',
      documentExpiryDate: '2023-06-22',
      documentNumber: '1283',
      documentType: 'Identity Card',
      firstName: 'James',
      garPeopleId: '1ca90ecf-12f4-4ccb-815d-651aae449fbd',
      gender: 'Male',
      issuingState: 'PTA',
      lastName: 'Smith',
      nationality: 'GBR',
      peopleType: {
        name: 'Crew',
      },
      placeOfBirth: 'PTA',
      isDuplicate: false,
      isInvalid: false,
    },
  ]
}

const garPeople = () => {
    return [
        {
            dateOfBirth: '1994-06-22',
            documentExpiryDate: '2100-06-22',
            documentNumber: '1283',
            documentType: 'Passport',
            firstName: 'Montgomery',
            garPeopleId: 1,
            gender: 'Male',
            issuingState: 'PTA',
            lastName: 'Scott',
            nationality: 'GBR',
            peopleType: {
              name: 'Crew',
            },
            placeOfBirth: 'PTA',
        },
    ]
}

module.exports = {
    savedPeople,
    flaggedSavedPeople,
    garPeople
}