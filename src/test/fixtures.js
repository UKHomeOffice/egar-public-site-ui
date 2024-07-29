
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

const invalidPassengersAndCrew = () => {
  return [
      {
          dateOfBirth: '1994-06-22',
          documentExpiryDate: '2100-06-22',
          documentNumber: '1283',
          documentType: 'Passport',
          firstName: 'Montgomery2',
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
      {
        dateOfBirth: '1994-06-22',
        documentExpiryDate: '2100-06-22',
        documentNumber: '1283',
        documentType: 'Passport',
        firstName: 'Montgomery1',
        garPeopleId: 1,
        gender: 'Male',
        issuingState: 'PTA',
        lastName: 'Scott',
        nationality: 'GBR',
        peopleType: {
          name: 'Passenger',
        },
        placeOfBirth: 'PTA',
    },
  ]
}

const outboundGar = () => {
  return { 
    garId: 'GAR-ID-EXAMPLE-1-API', 
    status: { name: 'Submitted' }, 
    departurePort: 'LGW', 
    arrivalPort: 'LAX',
    departureDate: '2023-04-11',
    departureTime: '11:30:15'
  };
}

const reqExampleData = () => {
  return {
    session: {
      org: {
        id: 1, name: 'exampleName', users: 'exampleUsers',
      },
      s: ['exampleSubmission1', 'exampleSubmission2'],
      gar: {
        id: 9000,
        tempAddPersonId: 1,
        status: 'Draft',
        voyageDeparture: {
          departureDate: null,
          departureTime: null,
          departurePort: null,
          departureLong: null,
          departureLat: null,
          isIsleOfManFlight: null
        }
      },
    },
  }
}

const departurePortVoyage = () => {
  return {
    departureDay: '05',
    departureMonth: '10',
    departureYear: '2024',
    departureHour: '10',
    departureMinute: '15',
    departurePort: 'LHR',
    departureLong: '',
    departureLat: '',
    departurePortChoice: 'Yes'
  }
}

const departureCoordinateVoyage = () => {
  return {
    departureDay: '05',
    departureMonth: '10',
    departureYear: '2024',
    departureHour: '10',
    departureMinute: '15',
    departurePort: '',
    departureLong: '-77.371323',
    departureLat: '39.088531',
    departurePortChoice: 'No'
  }
}

module.exports = {
    savedPeople,
    flaggedSavedPeople,
    garPeople,
    invalidPassengersAndCrew,
    outboundGar,
    reqExampleData,
    departurePortVoyage,
    departureCoordinateVoyage
}