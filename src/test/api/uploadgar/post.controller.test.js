const sinon = require('sinon');
const { expect } = require('chai');
const chai = require('chai');
const sinonChai = require('sinon-chai');
const i18n = require('i18n');
const XLSX = require('xlsx');

require('../../global.test');
const validator = require('../../../common/utils/validator');
const ValidationRule = require('../../../common/models/ValidationRule.class');
const { garApi } = require('../../../common/services/dataAccessApi');
const clamAVService = require('../../../common/services/clamAVService');

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

describe('API upload GAR post controller', () => {
  let req;
  let res;
  let incorrectWorkbook;
  let clock;
  let clamAVServiceStub;

  beforeEach(() => {
    chai.use(sinonChai);

    clock = sinon.useFakeTimers({
      now: new Date('2022-05-29 GMT'),
      shouldAdvanceTime: false,
      toFake: ['Date'],
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
        save: (callback) => callback(),
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
        case 'validator_api_uploadgar_duplicate_document_number':
          return 'The file contains duplicate travel document numbers.';
        case 'validator_api_uploadgar_duplicate_row':
          return `Duplicate row found for ${params.name}. Remove the duplicate row from the Excel template and upload it again.`;
        default:
          return 'Unexpected Key';
      }
    });
    clamAVServiceStub = sinon.stub(clamAVService, 'scanFile');
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
      clamAVServiceStub.resolves(true);
      req.file.originalname = 'incorrect.xls';

      await controller(req, res);

      expect(req.session.failureMsg).to.eq('Incorrect xls or xlsx file');
      expect(req.session.failureIdentifier).to.eq('file');
      expect(res.redirect).to.have.been.calledWith('garfile/garupload');
    });

    it('return message if cell C1 is undefined', async () => {
      delete incorrectWorkbook.Sheets.Sheet1.C1;
      sinon.stub(XLSX, 'read').returns(incorrectWorkbook);
      clamAVServiceStub.resolves(true);
      req.file.originalname = 'incorrect.xls';

      await controller(req, res);

      expect(req.session.failureMsg).to.eq('Incorrect xls or xlsx file');
      expect(req.session.failureIdentifier).to.eq('file');
      expect(res.redirect).to.have.been.calledWith('garfile/garupload');
    });
  });

  describe('workbook virus scanning', () => {
    [
      ['clean', 'ok : true'], // Confirmed clean: allow the workbook import.
      ['infected', 'ok : false'], // Virus detected: block the workbook import.
      ['unexpected', 'unrecognised scan response'], // No confirmed clean result: block the workbook import.
      ['failed', null], // Simulate a rejected scanner request below: block the workbook import.
    ].forEach(([outcome, response]) => {
      it(`scans the original workbook and ${outcome === 'clean' ? 'imports' : 'blocks'} it when the scan is ${outcome}`, async () => {
        const workbook = getValidWorkbook();
        const worksheet = workbook.Sheets.Valid1;
        // Add cell types, raw values, and a sheet range so the fixture can round-trip through a real XLS file.
        Object.values(worksheet).forEach((cell) => {
          cell.t = 's';
          if (cell.v === undefined) {
            cell.v = cell.w;
          }
        });
        worksheet['!ref'] = 'A1:L40';
        req.file.buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xls' });
        const client = { post: sinon.stub() };
        if (outcome === 'failed') {
          client.post.rejects(new Error('Scanner unavailable'));
        } else {
          client.post.resolves(response);
        }
        // Keep the real controller-to-scanner boundary; only the scanner's HTTP transport is stubbed.
        const scanner = new clamAVService.ClamAVService(client);
        clamAVServiceStub.callsFake((file) => scanner.scanFile(file));
        const createGarStub = sinon.stub(garApi, 'createGar').resolves({ garId: 'SCANNED-GAR' });
        const patchStub = sinon.stub(garApi, 'patch').resolves();
        await controller(req, res);

        expect(client.post).to.have.been.calledOnce;
        const [endpoint, formData] = client.post.firstCall.args;
        const scannedFile = formData.get('file');
        expect(endpoint).to.equal('/scan');
        expect(formData.get('name')).to.equal(req.file.originalname);
        expect(scannedFile.name).to.equal(req.file.originalname);
        // The old multipart argument shape scanned the string "undefined" instead of these workbook bytes.
        expect(Buffer.from(await scannedFile.arrayBuffer())).to.deep.equal(req.file.buffer);
        if (outcome === 'clean') {
          expect(req.session.failureMsg).to.be.undefined;
          expect(createGarStub).to.have.been.calledOnceWithExactly('khan@augmented.com');
          expect(patchStub).to.have.been.calledThrice;
          expect(res.redirect).to.have.been.calledOnceWithExactly('/garfile/review?from=uploadGar');
        } else {
          expect(createGarStub).to.not.have.been.called;
          expect(patchStub).to.not.have.been.called;
          expect(res.redirect).to.have.been.calledOnceWithExactly('/garfile/garupload?query=v');
        }
      });
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

      // Stub session.save to execute callback immediately
      sinon.stub(req.session, 'save').callsFake((callback) => {
        if (callback) callback();
      });
      sinon.stub(XLSX, 'read').returns(data);
      clamAVServiceStub.resolves(true);
      await controller(req, res);
      expect(req.session.save).to.have.been.called;
      expect(req.session.failureMsg[0]).to.eql(
        new ValidationRule(validator.validGender, '', 'Gender', 'Enter a valid sex for crew member James Kirk')
      );
      expect(res.redirect).to.have.been.calledWith('/garfile/garupload');
    });

    it('should return message if invalid', async () => {
      sinon.spy(req.session, 'save');
      sinon.stub(XLSX, 'read').returns(getInvalidWorkbook());
      clamAVServiceStub.resolves(true);
      const callController = async () => {
        await controller(req, res);
      };

      await callController().then(() => {
        expect(req.session.save).to.have.been.called;
        expect(req.session.failureMsg).to.contain.deep.members([
          new ValidationRule(
            validator.validISOCountryLength,
            '',
            'ISSUING STATE',
            'Enter a valid document issuing state for crew member James Kirk. Must be a ISO 3166 country code'
          ),
          new ValidationRule(validator.validGender, '', 'Gender', 'Enter a valid sex for crew member James Kirk'),
          new ValidationRule(
            validator.validISOCountryLength,
            '',
            'NATIONALITY',
            'Enter a valid nationality for crew member James Kirk. Must be a ISO 3166 country code'
          ),
          new ValidationRule(Boolean, 'file', false, 'The file contains duplicate travel document numbers.'),
          new ValidationRule(
            validator.validISOCountryLength,
            '',
            'ISSUING STATE',
            'Enter a valid document issuing state for passenger Pavel Chekov. Must be a ISO 3166 country code'
          ),
          new ValidationRule(validator.validGender, '', 'Gender', 'Enter a valid sex for passenger Pavel Chekov'),
          new ValidationRule(
            validator.validISOCountryLength,
            '',
            'NATIONALITY',
            'Enter a valid nationality for passenger Pavel Chekov. Must be a ISO 3166 country code'
          ),
        ]);
        expect(res.redirect).to.have.been.calledWith('/garfile/garupload');
      });
    });

    it('should return error if duplicate travel document numbers', async () => {
      sinon.spy(req.session, 'save');
      sinon.stub(XLSX, 'read').returns(getInvalidWorkbook());
      clamAVServiceStub.resolves(true);
      const callController = async () => {
        await controller(req, res);
      };

      await callController().then(() => {
        expect(req.session.save).to.have.been.called;
        expect(req.session.failureMsg).to.contain.deep.members([
          new ValidationRule(Boolean, 'file', false, 'The file contains duplicate travel document numbers.'),
        ]);
      });
    });

    it('should return error if duplicate row', async () => {
      sinon.spy(req.session, 'save');
      sinon.stub(XLSX, 'read').returns(getInvalidWorkbook());
      clamAVServiceStub.resolves(true);
      const callController = async () => {
        await controller(req, res);
      };

      await callController().then(() => {
        expect(req.session.save).to.have.been.called;
        expect(req.session.failureMsg).to.contain.deep.members([
          new ValidationRule(
            Boolean,
            'file',
            false,
            'Duplicate row found for crew member James Kirk. Remove the duplicate row from the Excel template and upload it again.'
          ),
        ]);
      });
    });

    it('should return error if arrival date too far in advance', async () => {
      // Stub session.save to execute callback immediately
      sinon.stub(req.session, 'save').callsFake((callback) => {
        if (callback) callback();
      });

      const data = getValidWorkbook();
      data.Sheets.Valid1.D3.v = '2022-07-30';

      sinon.stub(XLSX, 'read').returns(data);
      clamAVServiceStub.resolves(true);

      await controller(req, res);

      expect(req.session.save).to.have.been.called;
      expect(req.session.failureMsg[0]).to.eql(
        new ValidationRule(
          validator.dateNotMoreThanMonthInFuture,
          '',
          '2022-07-30',
          'Arrival date must be in the future and within a month from now'
        )
      );
      expect(res.redirect).to.have.been.calledWith('/garfile/garupload');
    });

    it('should not throw error if arrival port is empty', async () => {
      sinon.spy(req.session, 'save');
      const data = getValidWorkbook();
      data.Sheets.Valid1.B3.v = null;

      sinon.stub(XLSX, 'read').returns(data);
      clamAVServiceStub.resolves(true);
      const callController = async () => {
        await controller(req, res);
      };

      await callController().then(() => {
        expect(req.session.save).to.have.been.called;
        expect(req.session.failureMsg).to.contain.deep.members([
          new ValidationRule(validator.isValidAirportCode, '', null, 'Arrival port should be an ICAO or IATA code'),
          new ValidationRule(validator.notEmpty, '', null, 'Enter a value for the arrival port'),
        ]);
      });
    });

    it('should return error if arrival date in the past', async () => {
      sinon.spy(req.session, 'save');
      const data = getValidWorkbook();
      data.Sheets.Valid1.D3.v = '2010-07-30';

      sinon.stub(XLSX, 'read').returns(data);
      clamAVServiceStub.resolves(true);
      const callController = async () => {
        await controller(req, res);
      };

      await callController().then(() => {
        expect(req.session.save).to.have.been.called;
        expect(req.session.failureMsg[0]).to.eql(
          new ValidationRule(
            validator.dateNotInPast,
            '',
            '2010-07-30',
            'Arrival date must be in the future and within a month from now'
          )
        );
        expect(res.redirect).to.have.been.calledWith('/garfile/garupload');
      });
    });
  });

  it('rejects duplicate Excel rows before creating a GAR', async () => {
    const data = getValidWorkbook();
    const worksheet = data.Sheets.Valid1;
    'ABCDEFGHIJK'.split('').forEach((column) => {
      worksheet[`${column}10`] = { ...worksheet[`${column}9`] };
    });
    sinon.stub(XLSX, 'read').returns(data);
    clamAVServiceStub.resolves(true);
    const createGarStub = sinon.stub(garApi, 'createGar');
    const patchStub = sinon.stub(garApi, 'patch');
    sinon.spy(req.session, 'save');

    await controller(req, res);

    expect(createGarStub).to.not.have.been.called;
    expect(patchStub).to.not.have.been.called;
    expect(req.session.failureMsg).to.contain.deep.members([
      new ValidationRule(Boolean, 'file', false, 'The file contains duplicate travel document numbers.'),
      new ValidationRule(
        Boolean,
        'file',
        false,
        'Duplicate row found for crew member James Kirk. Remove the duplicate row from the Excel template and upload it again.'
      ),
      new ValidationRule(Boolean, 'file', false, 'The file contains duplicate travel document numbers.'),
    ]);
    expect(req.session.save).to.have.been.calledOnce;
    expect(res.redirect).to.have.been.calledOnceWithExactly('/garfile/garupload');
  });

  describe('api calls', () => {
    it('redirects without updating a GAR when creation rejects', async () => {
      const data = getValidWorkbook();

      sinon.stub(garApi, 'createGar').rejects(new Error('Creation unavailable'));
      const patchStub = sinon.stub(garApi, 'patch');
      sinon.spy(req.session, 'save');
      sinon.stub(XLSX, 'read').returns(data);
      clamAVServiceStub.resolves(true);
      await controller(req, res);

      expect(garApi.createGar).to.have.been.calledOnceWithExactly('khan@augmented.com');
      expect(patchStub).not.to.have.been.called;
      expect(req.session.save).to.not.have.been.called;
      expect(req.session.failureMsg).to.eq('Failed to create GAR. Try again');
      expect(req.session.failureIdentifier).to.eq('file');
      expect(res.redirect).to.have.been.calledOnceWithExactly('garfile/garupload');
    });

    it('preserves the creation-failure journey for an HTTP rejection without updating a GAR', async () => {
      sinon.stub(XLSX, 'read').returns(getValidWorkbook());
      clamAVServiceStub.resolves(true);
      sinon.stub(garApi, 'createGar').rejects(
        Object.assign(new Error('Bad Request'), {
          type: 'http_error',
          status: 400,
          body: { message: 'User cannot create GAR' },
        })
      );
      const patchStub = sinon.stub(garApi, 'patch');
      sinon.spy(req.session, 'save');

      await controller(req, res);

      expect(patchStub).not.to.have.been.called;
      expect(req.session.gar.id).not.to.exist;
      expect(req.session.failureMsg).to.equal('Failed to create GAR');
      expect(req.session.save).to.have.been.calledOnce;
      expect(res.redirect).to.have.been.calledOnceWithExactly('garfile/garupload');
    });

    it('should return with an error when api returns a message', async () => {
      const data = getValidWorkbook();

      sinon.stub(garApi, 'createGar').resolves({
        message: 'User does not exist',
      });
      sinon.stub(garApi, 'patch');
      sinon.spy(req.session, 'save');
      sinon.stub(XLSX, 'read').returns(data);
      clamAVServiceStub.resolves(true);
      await controller(req, res);

      expect(garApi.createGar).to.have.been.calledOnceWithExactly('khan@augmented.com');
      expect(garApi.patch).to.not.have.been.called;
      expect(req.session.save).to.have.been.called;
      expect(res.redirect).to.have.been.calledOnceWithExactly('garfile/garupload');
    });

    // TODO: Error message informs the GAR could not be updated, but one was created anyways?
    // TODO: There are three calls to update the GAR, but payload could be combined into one? Maybe?
    it('reports an update failure rather than success when an import update rejects', async () => {
      const data = getValidWorkbook();

      sinon.stub(garApi, 'createGar').resolves({
        garId: 'ABCD-1234',
      });
      const garApiPatch = sinon.stub(garApi, 'patch').onCall(0).resolves();
      garApiPatch.onCall(1).resolves();
      garApiPatch.onCall(2).rejects(
        Object.assign(new Error('Bad Request'), {
          type: 'http_error',
          status: 400,
          body: { message: 'Voyage update rejected' },
        })
      );
      sinon.spy(req.session, 'save');
      sinon.stub(XLSX, 'read').returns(data);
      clamAVServiceStub.resolves(true);

      await controller(req, res);
      expect(garApi.createGar).to.have.been.calledOnceWithExactly('khan@augmented.com');
      expect(garApi.patch).to.have.been.calledWith('ABCD-1234');
      expect(req.session.failureMsg).to.eq('Failed to update GAR. Try again');
      expect(req.session.failureIdentifier).to.eq('file');
      expect(req.session.save).to.not.have.been.called;
      expect(res.redirect).to.have.been.calledOnceWithExactly('garfile/garupload');
    });

    it('stores the created draft and redirects to review after all import updates finish', async () => {
      const data = getValidWorkbook();

      sinon.stub(garApi, 'createGar').resolves({
        garId: 'ABCD-1234',
      });
      const garApiPatch = sinon.stub(garApi, 'patch').resolves();
      sinon.spy(req.session, 'save');
      sinon.stub(XLSX, 'read').returns(data);
      clamAVServiceStub.resolves(true);

      await controller(req, res);
      expect(garApi.createGar).to.have.been.calledOnceWithExactly('khan@augmented.com');
      expect(garApiPatch).to.have.been.calledWith('ABCD-1234');
      expect(garApiPatch).to.have.been.calledThrice;
      garApiPatch.getCalls().forEach((call) => {
        expect(call.args.slice(0, 2)).to.deep.equal(['ABCD-1234', 'Draft']);
      });
      expect(garApiPatch.firstCall.args[2].people).not.to.be.empty;
      expect(garApiPatch.firstCall.args[2].people.every((person) => person.peopleType === 'Crew')).to.equal(true);
      expect(garApiPatch.secondCall.args[2].people).not.to.be.empty;
      expect(garApiPatch.secondCall.args[2].people.every((person) => person.peopleType === 'Passenger')).to.equal(true);
      expect(garApiPatch.thirdCall.args[2]).to.include.keys('departurePort', 'arrivalPort', 'isInbound');
      expect(req.session.gar.id).to.equal('ABCD-1234');
      expect(req.session.gar.status).to.equal('Draft');
      expect(req.session.failureMsg).to.be.undefined;
      expect(req.session.failureIdentifier).to.be.undefined;
      expect(req.session.save).to.have.been.called;
      expect(res.redirect).to.have.been.calledOnceWithExactly('/garfile/review?from=uploadGar');
    });

    it('Phoney document type shoudl be disallowed', async () => {
      const data = getValidWorkbook();

      data.Sheets.Valid1.A9.v = 'Cipher';
      data.Sheets.Valid1.B9.v = undefined;

      sinon.stub(XLSX, 'read').returns(data);
      sinon.spy(req.session, 'save');
      clamAVServiceStub.resolves(true);

      const callController = async () => {
        await controller(req, res);
      };

      await callController().then(() => {
        expect(req.session.save).to.have.been.called;
        expect(req.session.failureMsg).to.eql([
          new ValidationRule(
            validator.isValidDocumentType,
            '',
            'Cipher',
            'Enter a valid document type for crew member James Kirk, it should be "Passport", "National Identity Card", "Other", not "Cipher"'
          ),
        ]);
        expect(res.redirect).to.have.been.calledWith('/garfile/garupload');
      });
    });

    it('Phoney document type should be disallowed', async () => {
      const data = getValidWorkbook();

      data.Sheets.Valid1.A9.v = 'Passport';
      data.Sheets.Valid1.B9.v = 'UN document';

      sinon.stub(XLSX, 'read').returns(data);
      sinon.spy(req.session, 'save');
      clamAVServiceStub.resolves(true);

      const callController = async () => {
        await controller(req, res);
      };

      await callController().then(() => {
        expect(req.session.save).to.have.been.called;
        expect(req.session.failureMsg).to.eql([
          new ValidationRule(
            validator.isOtherDocumentWithDocumentDesc,
            '',
            ['Passport', 'UN document'],
            'For crew member James Kirk, "Passport" document type should be "Other" or remove "UN document" value from document description'
          ),
        ]);
        expect(res.redirect).to.have.been.calledWith('/garfile/garupload');
      });
    });

    it('document desc should not be other and raise a validation error', async () => {
      const data = getValidWorkbook();

      data.Sheets.Valid1.A20.v = 'Other';
      data.Sheets.Valid1.B20.v = undefined;

      sinon.stub(XLSX, 'read').returns(data);
      sinon.spy(req.session, 'save');
      clamAVServiceStub.resolves(true);

      const callController = async () => {
        await controller(req, res);
      };

      await callController().then(() => {
        expect(req.session.save).to.have.been.called;
        expect(req.session.failureMsg).to.eql([
          new ValidationRule(
            validator.notEmpty,
            'travelDocumentOther',
            undefined,
            'For passenger Pavel Chekov enter the document description you are using'
          ),
        ]);
        expect(res.redirect).to.have.been.calledWith('/garfile/garupload');
      });
    });

    it('document description should be a valid text and not symbols', async () => {
      const data = getValidWorkbook();

      data.Sheets.Valid1.A20.v = 'Other';
      data.Sheets.Valid1.B20.v = '$a$a$';

      sinon.stub(XLSX, 'read').returns(data);
      sinon.spy(req.session, 'save');
      clamAVServiceStub.resolves(true);

      const callController = async () => {
        await controller(req, res);
      };

      await callController().then(() => {
        expect(req.session.save).to.have.been.called;
        expect(req.session.failureMsg).to.eql([
          new ValidationRule(
            validator.validName,
            'travelDocumentOther',
            '$a$a$',
            'For passenger Pavel Chekov enter a real document description'
          ),
        ]);
        expect(res.redirect).to.have.been.calledWith('/garfile/garupload');
      });
    });
  });
});
