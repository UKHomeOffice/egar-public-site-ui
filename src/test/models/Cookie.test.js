const { expect } = require('chai');
const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const proxyquire = require('proxyquire');
const moment = require('moment');
const CookieModel = require('../../common/models/Cookie.class')

/**
 * Unit tests for the Cookie.class.js
 *
 * Significantly more if coverage is priority, namely the boilerplate getter and setters.
 */
describe('Cookie Model', () => {

  const reqExampleData = {
    session: {
      org: {
        id: 1, name: 'exampleName', users: 'exampleUsers'
      },
      s: ['exampleSubmission1', 'exampleSubmission2'],
      gar: {
        id: 9000,
        tempAddPersonId: 1,
        status: 'Draft',
      }
    }
  }

  beforeEach(() => {
    chai.use(sinonChai);

    sinon.spy(CookieModel.prototype, 'initialise');
    sinon.spy(CookieModel.prototype, 'initialiseGar');
  });

  it('should throw an error with null parameter', () => {
    const nullConstructor = () => {
      new CookieModel(null);
    }
    expect(nullConstructor).to.throw('Request required by cookie')
  });

  it('should throw an error with null session', () => {
    req = {
      variableThatIsNotSession: "example"
    }
    const nullSessionConstructor = () => {
      new CookieModel(req);
    }
    expect(nullSessionConstructor).to.throw('Session required by cookie');
  });

  it('should run initialise with empty session, creating variables', () => {
    const req = {
      session: {

      }
    };
    const constructor = () => {
      return new CookieModel(req);
    }

    cookie = constructor();
    expect(cookie).to.not.be.undefined;
    expect(cookie.initialise).to.have.been.called;
    expect(cookie.initialiseGar).to.have.been.called;

    expect(req.session.org).to.eql({ id: null, name: null, users: null, });
    expect(req.session.s).to.eql([]);
    expect(req.session.u).to.eql({ kcId: null, dbId: null, fn: null, ln: null, e: null, ip: null, vr: null, rl: null, orgId: null, token: null, garop: null, })
    expect(req.session.inv).to.eql({ fn: null, ln: null, e: null, ip: null, rl: null, orgId: null, token: null, });
    expect(req.session.svc).to.eql([]);
    expect(req.session.svp).to.eql([]);
    expect(req.session.editCraft).to.eql({});
    expect(req.session.editPerson).to.eql({});
  });

  it('should run initialise using the variables in the session', () => {
    const req = JSON.parse(JSON.stringify(reqExampleData));
    const constructor = () => {
      return new CookieModel(req);
    }

    cookie = constructor();
    expect(cookie).to.not.be.undefined;
    expect(cookie.initialise).to.have.been.called;
    expect(cookie.initialiseGar).to.have.been.called;

    expect(req.session.org).to.eql({ id: 1, name: 'exampleName', users: 'exampleUsers', });
    expect(req.session.s).to.eql(['exampleSubmission1', 'exampleSubmission2']);
    expect(req.session.u).to.eql({ kcId: null, dbId: null, fn: null, ln: null, e: null, ip: null, vr: null, rl: null, orgId: null, token: null, garop: null, })
    expect(req.session.inv).to.eql({ fn: null, ln: null, e: null, ip: null, rl: null, orgId: null, token: null, });
    expect(req.session.svc).to.eql([]);
    expect(req.session.svp).to.eql([]);
    expect(req.session.editCraft).to.eql({});
    expect(req.session.editPerson).to.eql({});
  });

  it('should set properties to null when reset is called', () => {
    const req = JSON.parse(JSON.stringify(reqExampleData));
    const constructor = () => {
      return new CookieModel(req);
    }

    cookie = constructor();
    expect(cookie).to.not.be.undefined;
    expect(cookie.initialise).to.have.been.called;
    expect(cookie.initialiseGar).to.have.been.called;

    expect(req.session.org).to.eql({ id: 1, name: 'exampleName', users: 'exampleUsers', });
    expect(req.session.s).to.eql(['exampleSubmission1', 'exampleSubmission2']);
    expect(req.session.u).to.eql({ kcId: null, dbId: null, fn: null, ln: null, e: null, ip: null, vr: null, rl: null, orgId: null, token: null, garop: null, })
    expect(req.session.inv).to.eql({ fn: null, ln: null, e: null, ip: null, rl: null, orgId: null, token: null, });
    expect(req.session.svc).to.eql([]);
    expect(req.session.svp).to.eql([]);
    expect(req.session.editCraft).to.eql({});
    expect(req.session.editPerson).to.eql({});

    cookie.reset();

    expect(req.session.s).to.be.null;
    expect(req.session.u).to.be.null;
    expect(req.session.org).to.be.null;
    expect(req.session.inv).to.be.null;
    expect(req.session.svc).to.be.null;
    expect(req.session.svp).to.be.null;
    expect(req.session.gar).to.be.null;
  });

  it('should get and set as expected', () => {
    const req = JSON.parse(JSON.stringify(reqExampleData));
    const constructor = () => {
      return new CookieModel(req);
    }

    cookie = constructor();
    expect(cookie.getGar()).to.eql({ id: 9000, tempAddPersonId: 1, status: 'Draft'});

    expect(cookie.getGarId()).to.eq(9000);
    cookie.setGarId(9001);
    expect(cookie.getGarId()).to.eq(9001);

    expect(cookie.getAddPersonId()).to.eq(1);
    cookie.setAddPersonId(2);
    expect(cookie.getAddPersonId()).to.eq(2);

    expect(cookie.getGarStatus()).to.eq('Draft');
    cookie.setGarStatus('Submitted');
    expect(cookie.getGarStatus()).to.eq('Submitted');

    expect(cookie.getEditCraft()).to.eql({});
    cookie.setEditCraft({ registration: 1, craftBase: 'Example'});
    expect(cookie.getEditCraft()).to.eql({ registration: 1, craftBase: 'Example'});
    cookie.updateEditCraft('exampleReg', 'exampleType', 'exampleBase');
    expect(cookie.getEditCraft()).to.eql({ registration: 'exampleReg', craftType: 'exampleType', craftBase: 'exampleBase'});
    cookie.clearEditCraft();
    expect(cookie.getEditCraft()).to.eql({});
  });

  describe('date and time functions', () => {
    let cookie;
    beforeEach(() => {
      const req = JSON.parse(JSON.stringify(reqExampleData));
      cookie = new CookieModel(req);
    });

    it('should create a date calling generateDate', () => {
      expect(cookie.generateDate(1,1,1996)).to.eq('1996-1-1');
      expect(cookie.generateDate(31,12,2015)).to.eq('2015-12-31');
    });

    it('should return empty date string "--" when calling generateDate with undefined date', () => {
      expect(cookie.generateDate(undefined, undefined, undefined)).to.eq('--');
    });

    it('should create a time calling generateTime', () => {
      expect(cookie.generateTime(1,1)).to.eq('1:1');
      expect(cookie.generateTime(23,59)).to.eq('23:59');
    });

    it('should return empty time string ":" when calling generateTime with undefined time', () => {
      expect(cookie.generateTime(undefined, undefined, undefined)).to.eq(':');
    })

    it('should throw error when calling dateSlice with unexpected type', () => {
      const dateSliceFunction = () => {
        cookie.dateSlice('oranges', null)
      };
      expect(dateSliceFunction).to.throw('dateType must be day or month or year');
    });

    it('should return empty string when calling dateSlice with null date', () => {
      expect(cookie.dateSlice('day', null)).to.eq('');
      expect(cookie.dateSlice('DAY', null)).to.eq('');
      expect(cookie.dateSlice('month', null)).to.eq('');
      expect(cookie.dateSlice('MONTH', null)).to.eq('');
      expect(cookie.dateSlice('year', null)).to.eq('');
      expect(cookie.dateSlice('YEAR', null)).to.eq('');
    });

    it('should return appropriate slices when called with dateSlice', () => {
      expect(cookie.dateSlice('day', '1999-12-31')).to.eq('31');
      expect(cookie.dateSlice('DAY', '1999-12-31')).to.eq('31');
      expect(cookie.dateSlice('month', '1999-12-31')).to.eq('12');
      expect(cookie.dateSlice('MONTH', '1999-12-31')).to.eq('12');
      expect(cookie.dateSlice('year', '1999-12-31')).to.eq('1999');
      expect(cookie.dateSlice('YEAR', '1999-12-31')).to.eq('1999');
    });

    it('should throw error when calling timeSlice with unexpected type', () => {
      const timeSliceFunction = () => {
        cookie.timeSlice('bananas', null)
      };
      expect(timeSliceFunction).to.throw('timeType must be hour or minute');
    });

    it('should return empty string when calling timeSlice with null time', () => {
      expect(cookie.timeSlice('hour', null)).to.eq('');
      expect(cookie.timeSlice('HOUR', null)).to.eq('');
      expect(cookie.timeSlice('minute', null)).to.eq('');
      expect(cookie.timeSlice('MINUTE', null)).to.eq('');
    });

    it('should return appropriate slices when called with timeSlice', () => {
      expect(cookie.timeSlice('hour', '12:34')).to.eq('12');
      expect(cookie.timeSlice('HOUR', '12:34')).to.eq('12');
      expect(cookie.timeSlice('minute', '12:34')).to.eq('34');
      expect(cookie.timeSlice('MINUTE', '12:34')).to.eq('34');
    });
  });

  afterEach(() => {
    sinon.restore();
  });
});
