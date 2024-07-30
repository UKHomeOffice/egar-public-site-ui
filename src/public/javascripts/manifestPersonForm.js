const isIsleOfManFlight = document.getElementById('isIsleOfManFlight');
const travelDocumentDetails = document.getElementById('travelDocumentDetails');
const nationality = document.getElementById('nationality');
// nationality-select id regards the "nationality".
// id select element, see docs on accessible autocomplete
// https://github.com/alphagov/accessible-autocomplete
const nationalitySelect = () => document.getElementById('nationality-select');

const UK_COUNTRY_CODE = 'GBR';
const IRELAND_COUNTRY_CODE = 'IRL';

function hideTravelDocumentDetails(nationalityCountryCode) {
  return  isIsleOfManFlight.value === 'true' && (
    nationalityCountryCode === ''
        || nationalityCountryCode === UK_COUNTRY_CODE
        || nationalityCountryCode === IRELAND_COUNTRY_CODE
  );
}

travelDocumentDetails.hidden = hideTravelDocumentDetails(nationalitySelect().value);

nationality.addEventListener("change", (e) => {
    travelDocumentDetails.hidden = hideTravelDocumentDetails(nationalitySelect().value);
})

nationality.addEventListener("blur", (e) => {
    travelDocumentDetails.hidden = hideTravelDocumentDetails(nationalitySelect().value);
})