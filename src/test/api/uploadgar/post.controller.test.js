/* eslint-disable no-unused-expressions */
/* eslint-disable no-undef */

const sinon = require('sinon');
const { expect } = require('chai');
const chai = require('chai');
const sinonChai = require('sinon-chai');
const i18n = require('i18n');
const XLSX = require('xlsx');

require('../../global.test');
const validator = require('../../../common/utils/validator');
const ValidationRule = require('../../../common/models/ValidationRule.class');
const createGarApi = require('../../../common/services/createGarApi.js');
const garApi = require('../../../common/services/garApi');

const path = require('path');

i18n.configure({
  locales: ['en'],
  directory: path.join(__dirname, '../../../locales'),
  objectNotation: true,
  defaultLocale: 'en',
  register: global,
});

const controller = require('../../../app/api/uploadgar/post.controller');
const { getInvalidWorkbook, getValidWorkbook } = require('./workbook-data');
const logger = require('../../../common/utils/logger');

describe('API upload GAR post controller', () => {
  let req; let res;
  let incorrectWorkbook;
  let clock;

  beforeEach(() => {
    chai.use(sinonChai);

    clock = sinon.useFakeTimers({
      now: new Date('2022-05-11 GMT'),
      shouldAdvanceTime: false,
      toFake: ["Date"],
    });

    incorrectWorkbook = {
      SheetNames: ['Sheet1'],
      Sheets: {
        Sheet1: {
          C1: {
            v: '     NOT EXPECTED VALUE HERE     ',
          },
        },
      },
    };

    req = {
      file: {
        originalname: 'test-gar.xls',
        buffer: Buffer.alloc(8),
      },
      session: {
        u: {
          dbId: 'khan@augmented.com',
        },
        save: callback => callback(),
      },
    };
    res = {
      redirect: sinon.stub(),
      render: sinon.stub(),
    };

    sinon.stub(i18n, '__').callsFake((key, params) => {
      if (key.phrase) {
        if (key.phrase === 'upload_gar_file_header' && key.locale === 'en') {
          return 'GENERAL AVIATION REPORT (GAR) -  January 2015';
        }
      }
      switch (key) {
        case 'validator_api_uploadgar_person_type_person_name':
          return `${params.peopleType} ${params.firstName} ${params.lastName}`;
        case 'validator_api_uploadgar_no_file':
          return 'Provide a file';
        case 'validator_api_uploadgar_incorrect_type':
          return 'Incorrect file type';
        case 'validator_api_uploadgar_incorrect_gar_file':
          return 'Incorrect xls or xlsx file';
        case 'validator_api_uploadgar_people_type_crew':
          return 'crew member';
        case 'validator_api_uploadgar_people_type_passenger':
          return 'passenger';
        default:
          return 'Unexpected Key';
      }
    });
  });

  afterEach(() => {
    sinon.restore();
    clock.restore();
  });

  it('return message if not file sent', async () => {
    delete req.file;

    await controller(req, res);

    expect(req.session.failureMsg).to.eq('Provide a file');
    expect(req.session.failureIdentifier).to.eq('file');
    expect(res.redirect).to.have.been.calledWith('/garfile/garupload?query=0');
  });

  describe('file type check', () => {
    it('return message if no file name', async () => {
      req.file.originalname = '';

      await controller(req, res);

      expect(req.session.failureMsg).to.eq('Incorrect file type');
      expect(req.session.failureIdentifier).to.eq('file');
      expect(res.redirect).to.have.been.calledWith('garfile/garupload');
    });

    it('return message if no file extension', async () => {
      req.file.originalname = 'noextension';

      await controller(req, res);

      expect(req.session.failureMsg).to.eq('Incorrect file type');
      expect(req.session.failureIdentifier).to.eq('file');
      expect(res.redirect).to.have.been.calledWith('garfile/garupload');
    });

    it('return message if unexpected extension', async () => {
      req.file.originalname = 'somedocument.docx';

      await controller(req, res);

      expect(req.session.failureMsg).to.eq('Incorrect file type');
      expect(req.session.failureIdentifier).to.eq('file');
      expect(res.redirect).to.have.been.calledWith('garfile/garupload');
    });
  });

  describe('incorrect files', () => {
    it('return message if not expected spreadsheet', async () => {
      sinon.stub(XLSX, 'read').returns(incorrectWorkbook);
      req.file.originalname = 'incorrect.xls';

      await controller(req, res);

      expect(req.session.failureMsg).to.eq('Incorrect xls or xlsx file');
      expect(req.session.failureIdentifier).to.eq('file');
      expect(res.redirect).to.have.been.calledWith('garfile/garupload');
    });

    it('return message if cell C1 is undefined', async () => {
      delete incorrectWorkbook.Sheets.Sheet1.C1;
      sinon.stub(XLSX, 'read').returns(incorrectWorkbook);
      req.file.originalname = 'incorrect.xls';

      await controller(req, res);

      expect(req.session.failureMsg).to.eq('Incorrect xls or xlsx file');
      expect(req.session.failureIdentifier).to.eq('file');
      expect(res.redirect).to.have.been.calledWith('garfile/garupload');
    });
  });

  describe('validations', () => {
    it('return message if one thing invalid', async () => {
      const data = getInvalidWorkbook();
      data.Sheets.Sheet1.C9.v = 'USA';
      data.Sheets.Sheet1.J9.v = 'USA';
      data.Sheets.Sheet1.C20.v = 'USA';
      data.Sheets.Sheet1.G20.v = 'Male';
      data.Sheets.Sheet1.J20.v = 'RUS';
      sinon.spy(req.session, 'save');
      sinon.stub(XLSX, 'read').returns(data);

      const callController = async () => {
        await controller(req, res);
      };

      callController().then(() => {
        expect(req.session.save).to.have.been.called;
        expect(req.session.failureMsg).to.eql([
          new ValidationRule(validator.validGender, '', 'Gender', 'Enter a valid sex for crew member James Kirk')
        ]);
        expect(res.redirect).to.have.been.calledWith('/garfile/garupload');
      });
    });

    it('should return message if invalid', async () => {
      sinon.spy(req.session, 'save');
      sinon.stub(XLSX, 'read').returns(getInvalidWorkbook());

      const callController = async () => {
        await controller(req, res);
      };

      callController().then(() => {
        expect(req.session.save).to.have.been.called;
        expect(req.session.failureMsg).to.eql([
          new ValidationRule(validator.validISOCountryLength, '', 'ISSUING STATE', 'Enter a valid document issuing state for crew member James Kirk. Must be a ISO 3166 country code'),
          new ValidationRule(validator.validGender, '', 'Gender', 'Enter a valid sex for crew member James Kirk'),
          new ValidationRule(validator.validISOCountryLength, '', 'NATIONALITY', 'Enter a valid nationality for crew member James Kirk. Must be a ISO 3166 country code'),
          new ValidationRule(validator.validISOCountryLength, '', 'ISSUING STATE', 'Enter a valid document issuing state for passenger Pavel Chekov. Must be a ISO 3166 country code'),
          new ValidationRule(validator.validGender, '', 'Gender', 'Enter a valid sex for passenger Pavel Chekov'),
          new ValidationRule(validator.validISOCountryLength, '', 'NATIONALITY', 'Enter a valid nationality for passenger Pavel Chekov. Must be a ISO 3166 country code'),
        ]);
        expect(res.redirect).to.have.been.calledWith('/garfile/garupload');
      });
    });

    it('should return error if departure date too far in advance', async () => {
      sinon.spy(req.session, 'save');
      const data = getValidWorkbook();
      data.Sheets.Valid1.D4.v = '2022-07-30';

      sinon.stub(XLSX, 'read').returns(data);

      const callController = async () => {
        await controller(req, res);
      };

      callController().then(() => {
        expect(req.session.save).to.have.been.called;
        expect(req.session.failureMsg).to.eql([
          new ValidationRule(validator.dateNotMoreThanMonthInFuture, '', '2022-07-30', 'Departure date must be today and cannot be more than 1 month in the future'),
        ]);
        expect(res.redirect).to.have.been.calledWith('/garfile/garupload');
      });
    });

    it('should return error if arrival date too far in advance', async () => {
      sinon.spy(req.session, 'save');
      const data = getValidWorkbook();
      data.Sheets.Valid1.D3.v = '2022-07-30';

      sinon.stub(XLSX, 'read').returns(data);

      const callController = async () => {
        await controller(req, res);
      };

      callController().then(() => {
        expect(req.session.save).to.have.been.called;
        expect(req.session.failureMsg).to.eql([
          new ValidationRule(validator.dateNotMoreThanMonthInFuture, '', '2022-07-30', 'Arrival date must be today and cannot be more than 1 month in the future'),
        ]);
        expect(res.redirect).to.have.been.calledWith('/garfile/garupload');
      });
    });

    it('should not throw error if arrival port is empty', async () => {
      sinon.spy(req.session, 'save');
      const data = getValidWorkbook();
      data.Sheets.Valid1.B3.v = null;

      sinon.stub(XLSX, 'read').returns(data);

      const callController = async () => {
        await controller(req, res);
      };

      callController().then(() => {

        expect(req.session.save).to.have.been.called;
        expect(req.session.failureMsg).to.eql([
          new ValidationRule(validator.isValidAirportCode, '', null, 'Arrival port should be an ICAO or IATA code'),
          new ValidationRule(validator.notEmpty, '', null,  'Enter a value for the arrival port'),
        ]);
      });
    });

    it('should return error if arrival date in the past', async () => {
      sinon.spy(req.session, 'save');
      const data = getValidWorkbook();
      data.Sheets.Valid1.D3.v = '2010-07-30';

      sinon.stub(XLSX, 'read').returns(data);

      const callController = async () => {
        await controller(req, res);
      };

      callController().then(() => {
        expect(req.session.save).to.have.been.called;
        expect(req.session.failureMsg).to.eql([
          new ValidationRule(validator.dateNotInPast, '', '2010-07-30',  'Arrival date must be today and cannot be more than 1 month in the future'),
        ]);
        expect(res.redirect).to.have.been.calledWith('/garfile/garupload');
      });
    });
  });

  describe('api calls', () => {
    it('should return when createGarApi rejects', () => {
      const data = getValidWorkbook();

      sinon.stub(createGarApi, 'createGar').rejects('createGarApi.createGar Example Reject');
      sinon.stub(garApi);
      sinon.spy(req.session, 'save');
      sinon.stub(XLSX, 'read').returns(data);

      const callController = async () => {
        await controller(req, res);
      };

      callController().then().then(() => {
        expect(createGarApi.createGar).to.have.been.calledWith('khan@augmented.com');
        expect(req.session.save).to.not.have.been.called;
        expect(req.session.failureMsg).to.eq('Failed to create GAR. Try again');
        expect(req.session.failureIdentifier).to.eq('file');
        expect(res.redirect).to.have.been.calledWith('garfile/garupload');
      });
    });

    it('should return with an error when api returns a message', () => {
      const data = getValidWorkbook();

      sinon.stub(createGarApi, 'createGar').resolves(JSON.stringify({
        message: 'User does not exist',
      }));
      sinon.stub(garApi, 'patch');
      sinon.spy(req.session, 'save');
      sinon.stub(XLSX, 'read').returns(data);

      const callController = async () => {
        await controller(req, res);
      };

      callController().then(() => {
        expect(createGarApi.createGar).to.have.been.calledWith('khan@augmented.com');
        expect(garApi.patch).to.not.have.been.called;
        expect(req.session.save).to.have.been.called;
        expect(res.redirect).to.have.been.calledWith('garfile/garupload');
      });
    });

    // TODO: Error message informs the GAR could not be updated, but one was created anyways?
    // TODO: There are three calls to update the GAR, but payload could be combined into one? Maybe?
    it('should mention when on of the update steps rejects', () => {
      const data = getValidWorkbook();

      sinon.stub(createGarApi, 'createGar').resolves(JSON.stringify({
        garId: 'ABCD-1234',
      }));
      const garApiPatch = sinon.stub(garApi, 'patch').onCall(0).resolves();
      garApiPatch.onCall(1).resolves();
      garApiPatch.onCall(2).rejects('garApi.patch for voyageUpdate Example Reject');
      sinon.spy(req.session, 'save');
      sinon.stub(XLSX, 'read').returns(data);

      const callController = async () => {
        await controller(req, res);
      };

      // Promise.all for three Promises...
      callController().then().then().then()
        .then(() => {
          expect(createGarApi.createGar).to.have.been.calledWith('khan@augmented.com');
          expect(garApi.patch).to.have.been.calledWith('ABCD-1234');
          expect(req.session.failureMsg).to.eq('Failed to update GAR. Try again');
          expect(req.session.failureIdentifier).to.eq('file');
          expect(req.session.save).to.not.have.been.called;
          expect(res.redirect).to.have.been.calledWith('garfile/garupload');
        });
    });

    // TODO: Should it just go to the departure page?
    // TODO: Should there be some success message?
    it('should go to the departure screen on success', () => {
      const data = getValidWorkbook();

      sinon.stub(createGarApi, 'createGar').resolves(JSON.stringify({
        garId: 'ABCD-1234',
      }));
      const garApiPatch = sinon.stub(garApi, 'patch').resolves();
      sinon.spy(req.session, 'save');
      sinon.stub(XLSX, 'read').returns(data);

      const callController = async () => {
        await controller(req, res);
      };

      // Promise.all for three Promises...
      callController().then().then().then()
        .then(() => {
          expect(createGarApi.createGar).to.have.been.calledWith('khan@augmented.com');
          expect(garApiPatch).to.have.been.calledWith('ABCD-1234');
          expect(req.session.failureMsg).to.be.undefined;
          expect(req.session.failureIdentifier).to.be.undefined;
          expect(req.session.save).to.have.been.called;
          expect(res.redirect).to.have.been.calledWith('/garfile/review');
        });
    });

    it('should succeed and set document type other correctly', () => {
      const data = getValidWorkbook();
      delete data.Sheets.Valid1.A9.v;
      data.Sheets.Valid1.B9.v = 'Biochip';
      delete data.Sheets.Valid1.A20.v;
      data.Sheets.Valid1.B20.v = 'Federation Card';

      sinon.stub(createGarApi, 'createGar').resolves(JSON.stringify({
        garId: 'ABCD-1234',
      }));
      const garApiPatch = sinon.stub(garApi, 'patch').resolves();
      sinon.spy(req.session, 'save');
      sinon.stub(XLSX, 'read').returns(data);

      const callController = async () => {
        await controller(req, res);
      };

      // Promise.all for three Promises...
      callController().then().then().then()
        .then(() => {
          expect(createGarApi.createGar).to.have.been.calledWith('khan@augmented.com');
          expect(garApiPatch).to.have.been.calledWith('ABCD-1234', 'Draft', {
            people: [{
              dateOfBirth: '1965-10-13',
              documentDesc: 'Biochip',
              documentExpiryDate: '2033-02-28',
              documentNumber: 'DocumentNumber',
              documentType: 'Other',
              firstName: 'James',
              gender: 'Male',
              issuingState: 'USA',
              lastName: 'Kirk',
              nationality: 'USA',
              peopleType: 'Crew',
              placeOfBirth: 'Place of Birth',
            }],
          });
          expect(garApiPatch).to.have.been.calledWith('ABCD-1234', 'Draft', {
            arrivalPort: 'BFS',
            arrivalDate: '2022-05-31',
            arrivalTime: 'Arrival Time',
            departurePort: 'LGW',
            departureDate: '2022-05-30',
            departureTime: 'Departure Time',
            registration: 'Registration',
            craftType: 'Craft Type',
            craftBase: 'Craft Base',
            freeCirculation: 'FreeCirculation',
            visitReason: 'VisitReason',
          });
          expect(garApiPatch).to.have.been.calledWith('ABCD-1234', 'Draft', {
            people: [{
              dateOfBirth: '1975-10-31',
              documentDesc: 'Federation Card',
              documentExpiryDate: '2023-06-01',
              documentNumber: 'DocumentNumber',
              documentType: 'Other',
              firstName: 'Pavel',
              gender: 'Male',
              issuingState: 'USA',
              lastName: 'Chekov',
              nationality: 'RUS',
              peopleType: 'Passenger',
              placeOfBirth: 'Place of Birth',
            }],
          });
          expect(req.session.failureMsg).to.be.undefined;
          expect(req.session.failureIdentifier).to.be.undefined;
          expect(req.session.save).to.have.been.called;
          expect(res.redirect).to.have.been.calledWith('/garfile/review');
        });
    });
  });
});
