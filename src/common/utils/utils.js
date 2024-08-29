const documenttype = require('../../common/seeddata/egar_saved_people_travel_document_type.json');

function trimToDecimalPlaces(input, places) {

    input ||= '';
    input = input.trim();

    const parts = input.split('.');
    if (parts.length == 2) {
        parts[1] = parts[1].slice(0, places);
    }

    return parts.join('.')
}

const documentTypes = documenttype
    .map(documentType => documentType.documenttype)
    .filter(documentType => Boolean(documentType));

function getResponsiblePersonFromReq(req) {
    return {
        responsibleGivenName: req.body.responsibleGivenName,
        responsibleSurname: req.body.responsibleSurname,
        responsibleContactNo: req.body.responsibleContactNo,
        responsibleEmail: req.body.responsibleEmail,
        responsibleAddressLine1: req.body.responsibleAddressLine1,
        responsibleAddressLine2: req.body.responsibleAddressLine2,
        responsibleTown: req.body.responsibleTown,
        responsibleCountry: req.body.responsibleCountry,
        responsiblePostcode: req.body.responsiblePostcode,
        fixedBasedOperator: req.body.fixedBasedOperator,
        fixedBasedOperatorAnswer: (req.body.fixedBasedOperator === 'Other' ? req.body.fixedBasedOperatorAnswer : '')
    };
}

function getResponsiblePersonFromGar(gar) {
    return {
        responsibleGivenName: gar.responsibleGivenName,
        responsibleSurname: gar.responsibleSurname,
        responsibleContactNo: gar.responsibleContactNo,
        responsibleEmail: gar.responsibleEmail,
        responsibleAddressLine1: gar.responsibleAddressLine1,
        responsibleAddressLine2: gar.responsibleAddressLine2,
        responsibleTown: gar.responsibleTown,
        responsibleCountry: gar.responsibleCountry,
        responsiblePostcode: gar.responsiblePostcode,
        fixedBasedOperator: gar.fixedBasedOperator,
        fixedBasedOperatorAnswer: gar.fixedBasedOperatorAnswer
    };
}

const UK_COUNTRY_CODE = 'GBR';
const IRELAND_COUNTRY_CODE = 'IRL';

function isBristishOrIrishIsleOfManPassenger(nationality, isIsleOfManFlight) {
    return isIsleOfManFlight && (
        nationality === UK_COUNTRY_CODE 
        || nationality === IRELAND_COUNTRY_CODE 
      );
} 

function getPersonFromRequest(req, isIsleOfManFlight) {
    
    const passengerInformation = {
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        gender: req.body.gender,
        dateOfBirth: req.body.dateOfBirth,
        placeOfBirth: req.body.birthplace,
        nationality: req.body.nationality.toUpperCase(),
        peopleType: req.body.personType,
    };

    const travelInformation = isBristishOrIrishIsleOfManPassenger(req.body.nationality, isIsleOfManFlight) ? {} : {
        documentNumber: req.body.travelDocumentNumber,
        documentType: req.body.travelDocumentType,
        documentDesc: req.body.travelDocumentOther,
        issuingState: req.body.issuingState.toUpperCase(),
        documentExpiryDate: req.body.documentExpiryDate,
    };

    return {
        ...passengerInformation,
        ...travelInformation
      };
}


module.exports = {
    trimToDecimalPlaces,
    documentTypes,
    getResponsiblePersonFromReq,
    getResponsiblePersonFromGar,
    getPersonFromRequest,
    isBristishOrIrishIsleOfManPassenger
}