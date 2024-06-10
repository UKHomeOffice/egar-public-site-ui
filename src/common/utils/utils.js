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

module.exports = {
    trimToDecimalPlaces,
    documentTypes
}