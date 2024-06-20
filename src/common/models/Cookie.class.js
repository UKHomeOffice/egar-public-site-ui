const logger = require("../utils/logger")(__filename);
const { isValidAirportCode } = require("../utils/validator");
const { trimToDecimalPlaces } = require("../utils/utils");

/*
 *
 */
class Cookie {
  /**
   *
   */
  constructor(request) {
    if (request == null) {
      throw new Error('Request required by cookie');
    }
    if (request.session == null) {
      throw new Error('Session required by cookie');
    }
    this.session = request.session;

    this.initialise();
    this.initialiseGar();
  }


  initialise() {
    // Initialise org
    if (this.session.org == null) {
      this.session.org = {
        id: null,
        name: null,
        users: null,
      };
    }

    // Initialise submission
    if (this.session.s == null) {
      this.session.s = [];
    }

    // Initialise user
    if (this.session.u == null) {
      this.session.u = {
        dbId: null,
        fn: null,
        ln: null,
        e: null,
        ip: null,
        vr: null,
        rl: null,
        orgId: null,
      };
    }

    // Initialise invite
    if (this.session.inv == null) {
      this.session.inv = {
        fn: null,
        ln: null,
        e: null,
        ip: null,
        rl: null,
        orgId: null,
        token: null,
      };
    }

    // Initialize savedcraft
    if (this.session.svc == null) {
      this.session.svc = [];
    }

    // Initialize savedperson
    if (this.session.svp == null) {
      this.session.svp = [];
    }

    if (this.session.editCraft == null) {
      this.session.editCraft = {};
    }

    if (this.session.editPerson == null) {
      this.session.editPerson = {};
    }
  }

  initialiseGar() {
    if (this.session.gar == null) {
      this.session.gar = {
        id: null,
        status: null,
        cbpId: null,
        craft: {
          registration: null,
          craftType: null,
          craftBase: null,
          freeCirculation: null,
          visitReason: null,
        },
        voyageArrival: {
          arrivalDate: null,
          arrivalTime: null,
          arrivalPort: null,
          arrivalLong: null,
          arrivalLat: null,
        },
        voyageDeparture: {
          departureDate: null,
          departureTime: null,
          departurePort: null,
          departureLong: null,
          departureLat: null,
        },
        manifest: [],
        tempAddPersonId: null,
        responsiblePerson: {
          responsibleGivenName: null,
          responsibleSurname: null,
          responsibleContactNo: null,
          responsibleEmail: null,
          responsibleAddressLine1: null,
          responsibleAddressLine2: null,
          responsibleTown: null,
          responsiblePostcode: null,
          responsibleCounty: null,
          fixedBasedOperator: null,
          fixedBasedOperatorAnswer: null
        },
        isMilitaryFlight: null,
        prohibitedGoods: null,
        goodsDeclaration: null,
        continentalShelf: null,
        continentalShelfDeclaration: null,
        prohibitedGoodsList: [],
        baggage: null,
        baggageDeclaration: null,
        baggageList: [],
        passengerTravellingReason: null,
        passengerTravellingReasonList: [],
        supportingInformation: null,
        supportingInformationList: [],
        supportingDocument: [],
        intentionValue: null,
        intentionValueList: [],
      };
    }
  }

  /**
   *
   */
  reset() {
    this.session.gar = null;
    this.session.s = null;
    this.session.u = null;
    this.session.org = null;
    this.session.inv = null;
    this.session.svc = null;
    this.session.svp = null;
    this.session.gar = null;
  }

  getGar() {
    return this.session.gar;
  }

  setGarId(id) {
    this.session.gar.id = id;
  }

  getCbpId() {
    return this.session.gar.cbpId;
  }

  setCbpId(cbpId) {
    this.session.gar.cbpId = cbpId;
  }

  getGarId() {
    return this.session.gar.id;
  }

  setAddPersonId(id) {
    this.session.gar.tempAddPersonId = id;
  }

  getAddPersonId() {
    return this.session.gar.tempAddPersonId;
  }

  getIsMilitaryFlight() {
    return Boolean(this.session.gar.isMilitaryFlight);
  }

  setIsMilitaryFlight(isMilitaryFlight) {
    this.session.gar.isMilitaryFlight = isMilitaryFlight;
  }

  setGarCraft(registration, craftType, craftBase, portChoice) {
    this.session.gar.craft.registration = registration;
    this.session.gar.craft.craftType = craftType;
    this.session.gar.craft.craftBase = craftBase;
    this.session.gar.craft.portChoice = portChoice
    this.parseCraftBase(this.session.gar.craft);
  }

  getGarCraft() {
    logger.info(JSON.stringify(this.session.gar.craft));
    return this.session.gar.craft;
  }

  setGarArrivalVoyage(voyageObj) {
    if (!voyageObj.arrivalDate) {
      this.session.gar.voyageArrival.arrivalDate = this.generateDate(voyageObj.arrivalDay,
        voyageObj.arrivalMonth, voyageObj.arrivalYear);

      this.session.gar.voyageArrival.arrivalTime = this.generateTime(voyageObj.arrivalHour,
        voyageObj.arrivalMinute);
    } else {
      // Set voyage from API response, so dates and times are already built
      this.session.gar.voyageArrival.arrivalDate = voyageObj.arrivalDate;
      this.session.gar.voyageArrival.arrivalTime = voyageObj.arrivalTime;
    }
    this.session.gar.voyageArrival.arrivalPort = voyageObj.arrivalPort;
    this.session.gar.voyageArrival.arrivalLong = trimToDecimalPlaces(voyageObj.arrivalLong, 6);
    this.session.gar.voyageArrival.arrivalLat = trimToDecimalPlaces(voyageObj.arrivalLat, 6);
    
    const defaultPortChoice = (voyageObj.arrivalLat || voyageObj.arrivalLong) ? 'No' : 'Yes';
    this.session.gar.voyageArrival.arrivalPortChoice = voyageObj.portChoice || defaultPortChoice;
  }

  getGarArrivalVoyage() {
    return this.session.gar.voyageArrival;
  }

  setGarDepartureVoyage(voyageObj) {
    if (!voyageObj.departureDate) {
      this.session.gar.voyageDeparture.departureDate = this.generateDate(voyageObj.departureDay,
        voyageObj.departureMonth, voyageObj.departureYear);
      this.session.gar.voyageDeparture.departureTime = this.generateTime(voyageObj.departureHour,
        voyageObj.departureMinute);
    } else {
      // get it from the api
      this.session.gar.voyageDeparture.departureDate = voyageObj.departureDate;
      this.session.gar.voyageDeparture.departureTime = voyageObj.departureTime;
    }
    this.session.gar.voyageDeparture.departurePort = voyageObj.departurePort;
    this.session.gar.voyageDeparture.departureLat = trimToDecimalPlaces(voyageObj.departureLat, 6);
    this.session.gar.voyageDeparture.departureLong = trimToDecimalPlaces(voyageObj.departureLong, 6);

    const defaultPortChoice = (voyageObj.departureLat || voyageObj.departureLong) ? 'No' : 'Yes';
    this.session.gar.voyageDeparture.departurePortChoice = voyageObj.portChoice || defaultPortChoice;

  }

  getGarDepartureVoyage() {
    return this.session.gar.voyageDeparture;
  }

  setGarManifest(manifest) {
    this.session.gar.manifest = manifest;
  }

  garManifestAddPerson(person) {
    if (typeof person.peopleType === 'object') {
      // Un-nest persontype
      person.peopleType = person.peopleType.name;
    }
    this.session.gar.manifest.push(person);
  }

  getGarManifest() {
    return this.session.gar.manifest;
  }

  getGarfixedBasedOperator() {
    return this.session.gar.fixedBasedOperator;
  }

  setGarfixedBasedOperator(fbo) {
    this.session.gar.fixedBasedOperator = fbo;
  }

  getfixedBasedOperatorAnswer() {
    return this.session.gar.fixedBasedOperatorAnswer;
  }

  setfixedBasedOperatorAnswer(fboa) {
    this.session.gar.fixedBasedOperatorAnswer = fboa;
  }

  getGarfixedBasedOperatorList() {
    return this.session.gar.OperatorList;
  }

  setGarfixedBasedOperatorList(fbol) {
    this.session.gar.manifest.push(fbol);
  }

  getGarProhibitedGoods() {
    return this.session.gar.prohibitedGoods;
  }

  setGarProhibitedGoods(pg) {
    this.session.gar.prohibitedGoods = pg;
  }

  getGoodsDeclaration() {
    return this.session.gar.goodsDeclaration;
  }

  setGoodsDeclaration(dd) {
    this.session.gar.goodsDeclaration = dd;
  }

  getContinentalShelf() {
    return this.session.gar.continentalShelf;
  }

  setContinentalShelf(continentalShelf) {
    this.session.gar.continentalShelf = continentalShelf;
  }

  getContinentalShelfDeclaration() {
    return this.session.gar.continentalShelfDeclaration;
  }

  setContinentalShelfDeclaration(continentalShelfDeclaration) {
    this.session.gar.continentalShelfDeclaration = continentalShelfDeclaration;
  }

  getGarProhibitedGoodsList() {
    return this.session.gar.prohibitedGoodsList;
  }

  setGarProhibitedGoodsList(pgl) {
    this.session.gar.manifest.push(pgl);
  }

  getGarBaggage() {
    return this.session.gar.baggage;
  }

  setGarBaggage(b) {
    this.session.gar.baggage = b;
  }

  getBaggageDeclaration() {
    return this.session.gar.baggageDeclaration;
  }

  setBaggageDeclaration(bd) {
    this.session.gar.baggageDeclaration = bd;
  }

  getGarBaggageList() {
    return this.session.gar.baggageList;
  }

  setGarBaggageList(bl) {
    this.session.gar.manifest.push(bl);
  }

  getGarpassengerTravellingReason() {
    return this.session.gar.passengerTravellingReason;
  }

  setGarpassengerTravellingReason(ptr) {
    this.session.gar.passengerTravellingReason = ptr;
  }

  getGarpassengerTravellingReasonList() {
    return this.session.gar.passengerTravellingReasonList;
  }

  setGarpassengerTravellingReasonList(ptrl) {
    this.session.gar.manifest.push(ptrl);
  }

  getGarSupportingInformation() {
    return this.session.gar.supportingInformation;
  }

  setGarSupportingInformation(si) {
    this.session.gar.supportingInformation = si;
  }

  getGarSupportingInformationList() {
    return this.session.gar.supportingInformationList;
  }

  setGarSupportingInformationList(sil) {
    this.session.gar.manifest.push(sil);
  }

  getGarIntentionValue() {
    return this.session.gar.intentionValue;
  }

  setGarIntentionValue(iv) {
    this.session.gar.intentionValue = iv;
  }

  getGarIntentionValueList() {
    return this.session.gar.intentionValueList;
  }

  setGarIntentionValueList(ivl) {
    this.session.gar.manifest.push(ivl);
  }

  setGarResponsiblePerson(person) {
    this.session.gar.responsiblePerson.responsibleGivenName = person.responsibleGivenName;
    this.session.gar.responsiblePerson.responsibleSurname = person.responsibleSurname;
    this.session.gar.responsiblePerson.responsibleAddressLine1 = person.responsibleAddressLine1;
    this.session.gar.responsiblePerson.responsibleAddressLine2 = person.responsibleAddressLine2;
    this.session.gar.responsiblePerson.responsibleTown = person.responsibleTown;
    this.session.gar.responsiblePerson.responsiblePostcode = person.responsiblePostcode;
    this.session.gar.responsiblePerson.responsibleCounty = person.responsibleCounty;
    this.session.gar.responsiblePerson.responsibleContactNo = person.responsibleContactNo;
    this.session.gar.responsiblePerson.responsibleEmail = person.responsibleEmail;
    this.session.gar.responsiblePerson.fixedBasedOperator = person.fixedBasedOperator;
    this.session.gar.responsiblePerson.fixedBasedOperatorAnswer = person.fixedBasedOperatorAnswer;
  }

  getGarResponsiblePerson() {
    return this.session.gar.responsiblePerson;
  }

  getGarSupportingDocument() {
    return this.session.gar.supportingDocument;
  }

  setGarSupportingDocument(sdl) {
    this.session.gar.supportingDocument.push(sdl);
  }

  /**
   *
   */
  setUserDbId(id) {
    this.session.u.dbId = id;
  }

  /**
   *
   */
  getUserDbId() {
    return this.session.u.dbId;
  }

  /**
   *
   */
  getUserRole() {
    return this.session.u.rl;
  }

  /**
   * Sets a user's role.
   * @param {String} role the role of a user (Individual, User, Manager, Admin)
   * @returns {Undefined} No explicit return
   */
  setUserRole(role) {
    this.session.u.rl = role;
  }

  /**
   *
   */
  setUserVerified(flag) {
    this.session.u.vr = flag;
  }

  /**
   *
   */
  getUserVerified() {
    return this.session.u.vr;
  }

  /**
   *
   */
  getOrganisationName() {
    return this.session.org.name;
  }

  /**
   *
   */
  setOrganisationName(name) {
    this.session.org.name = name;
  }

  getOrganisationId() {
    return this.session.org.i;
  }

  setOrganisationId(id) {
    this.session.org.i = id;
  }

  setOrganisationUsers(users) {
    this.session.org.users = users.items;
  }

  getOrganisationUsers() {
    return this.session.org.users;
  }

  /**
   *
   */
  getUserFirstName() {
    return this.session.u.fn;
  }

  /**
   *
   */
  setUserFirstName(firstName) {
    this.session.u.fn = firstName;
  }

  /**
   *
   */
  setUserLastName(lastName) {
    this.session.u.ln = lastName;
  }

  getUserLastName() {
    return this.session.u.ln;
  }

  /**
   *
   */
  getInviteUserLastName() {
    return this.session.inv.ln;
  }

  /**
   *
   */
  getUserEmail() {
    return this.session.u.e;
  }

  /**
   *
   */
  setUserEmail(email) {
    this.session.u.e = email;
  }

  /**
   *
   */
  setInviteUserLastName(lastName) {
    this.session.inv.ln = lastName;
  }

  /**
   *
   */
  getInviteUserFirstName() {
    return this.session.inv.fn;
  }


  /**
   *
   */
  setInviteUserFirstName(firstName) {
    this.session.inv.fn = firstName;
  }

  setInviteUserToken(token) {
    this.session.inv.token = token;
  }

  getInviteUserToken() {
    return this.session.inv.token;
  }

  /**
   *
   */
  setInviteUserEmail(email) {
    this.session.inv.e = email;
  }

  /**
   *
   */
  getInviteUserEmail() {
    return this.session.inv.e;
  }

  /**
   *
   */
  getInviteUserRole() {
    return this.session.inv.rl;
  }

  /**
   *
   */
  setInviteUserRole(role) {
    this.session.inv.rl = role;
  }

  /**
   * Records neccessary login information
   * @param {Object} kcAuth keycloak grant object
   * @param {Object} apiResponse datalayer response object
   * @param {String} userName username of user logging in
   * @returns {undefined}
   */
  setLoginInfo(apiResponse) {
    // Set user details
    this.setUserFirstName(apiResponse.firstName);
    this.setUserLastName(apiResponse.lastName);

    // Set user ids
    this.setUserDbId(apiResponse.userId);

    // Set role
    this.setUserRole(apiResponse.role.name);

    // Set organisation information if it exists
    this.setUserVerified(apiResponse.state);

    if (apiResponse.organisation !== null) {
      this.setOrganisationName(apiResponse.organisation.organisationName);
      this.setOrganisationId(apiResponse.organisation.organisationId);
    }
  }

  // set savedcraft
  setSavedCraft(svc) {
    this.session.svc = svc;
  }

  // get savedcraft
  getSavedCraft() {
    return this.session.svc;
  }

  setEditPerson(person) {
    this.session.editPerson = person;
  }

  getEditPerson() {
    return this.session.editPerson;
  }

  getEditPersonDocExpiry(timeType) {
    switch (timeType.toLowerCase()) {
      case 'day':
        return this.getEditPerson().documentExpiryDate.split('-')[2];
      case 'month':
        return this.getEditPerson().documentExpiryDate.split('-')[1];
      case 'year':
        return this.getEditPerson().documentExpiryDate.split('-')[0];
      default:
        throw new Error('timeType must be day month or year');
    }
  }

  updateEditPerson(person) {
    this.session.editPerson.firstName = person.firstName;
    this.session.editPerson.lastName = person.lastName;
    this.session.editPerson.documentType = person.documentType;
    this.session.editPerson.documentNumber = person.documentNumber;
    this.session.editPerson.documentExpiryDate = person.documentExpiryDate;
    this.session.editPerson.peopleType = person.peopleType;
    this.session.editPerson.nationality = person.nationality;
    this.session.editPerson.placeOfBirth = person.placeOfBirth;
    this.session.editPerson.dateOfBirth = person.dateOfBirth;
    this.session.editPerson.gender = person.gender;
    this.session.editPerson.issuingState = person.issuingState;
    this.session.editPerson.documentDesc = person.documentDesc;
  }

  parseCraftBase(destination) {

    /*
    - accept a craft object from session with a craftBase property that can either be an airfield code or lat/long
    - if it matches an airfield code, assign this value to the craftBasePort property of session object, and set portChoice property to 'Yes'
    - if it matches lat/long extract lat/long values to craftBaseLat, craftBaseLong, set portChoice to 'No'
    - if neither of above: if session object has a portChoice use that, otherwise default to 'Yes'
    */

    //avoid null and undefined issues
    destination.craftBase ||= '';

    if (isValidAirportCode(destination.craftBase)) {
      destination.craftBasePort = destination.craftBase;
      destination.portChoice = 'Yes';
      return;
    }

    const craftBaseLatLong = destination.craftBase.match(/^[\+\-]?[\d.]+ [\+\-]?[\d.]+$/);
    if (craftBaseLatLong) {
      const [craftBaseLat, craftBaseLong] = craftBaseLatLong[0].split(' ');
      destination.craftBaseLat = trimToDecimalPlaces(craftBaseLat, 6);
      destination.craftBaseLong = trimToDecimalPlaces(craftBaseLong, 6);
      destination.portChoice = 'No';
      return;
    }

    destination.portChoice ||= 'Yes';
  };

  reduceCraftBase(craftBasePort, craftBaseLat, craftBaseLong) {

    if (craftBasePort && (craftBaseLat || craftBaseLong)) {
      throw 'Both port and lat/long supplied for craft base. Supply port or lat/long'
    }

    if (craftBasePort) {
      return craftBasePort;
    }

    return `${craftBaseLat} ${craftBaseLong}`;
  };

  setEditCraft(craft) {
    this.session.editCraft = craft;
    this.parseCraftBase(this.session.editCraft);
  }

  updateEditCraft(reg, type, base) {
    this.session.editCraft.registration = reg;
    this.session.editCraft.craftType = type;
    this.session.editCraft.craftBase = base;
    this.parseCraftBase(this.session.editCraft);
  }

  clearEditCraft() {
    this.session.editCraft = {};
  }

  getEditCraft() {
    return this.session.editCraft;
  }

  setGarStatus(status) {
    this.session.gar.status = status;
  }

  getGarStatus() {
    return this.session.gar.status;
  }

  generateDate(day, month, year) {
    const d = day == null ? '' : day;
    const m = month == null ? '' : month;
    const y = year == null ? '' : year;
    return `${y}-${m}-${d}`;
  }

  generateTime(hour, minute) {
    const h = hour == null ? '' : hour;
    const m = minute == null ? '' : minute;
    return `${h}:${m}`;
  }

  dateSlice(dateType, date) {
    let dateValue = '';
    switch (dateType.toLowerCase()) {
      case 'day':
        dateValue = date == null ? '' : date.split('-')[2];
        break;
      case 'month':
        dateValue = date == null ? '' : date.split('-')[1];
        break;
      case 'year':
        dateValue = date == null ? '' : date.split('-')[0];
        break;
      default:
        throw new Error('dateType must be day or month or year');
    }
    if (dateValue === 'undefined') {
      return '';
    }
    return dateValue;
  }

  timeSlice(timeType, time) {
    let timeValue = '';
    switch (timeType.toLowerCase()) {
      case 'hour':
        timeValue = time == null ? '' : time.split(':')[0];
        break;
      case 'minute':
        timeValue = time == null ? '' : time.split(':')[1];
        break;
      default:
        throw new Error('timeType must be hour or minute');
    }
    if (timeValue === 'undefined') {
      return '';
    }
    return timeValue;
  }

}



module.exports = Cookie;
