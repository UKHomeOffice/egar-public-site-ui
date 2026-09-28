const sinon = require('sinon');
const { expect } = require('chai');
const chai = require('chai');
const sinonChai = require('sinon-chai');
const proxyquire = require('proxyquire');

require('./global.test');

chai.use(sinonChai);

describe('Server request logging', () => {
  afterEach(() => {
    sinon.restore();
  });

  it('configures request logging middleware to log as soon as the request is received', () => {
    const loggerMethods = {
      error: sinon.spy(),
      warn: sinon.spy(),
      debug: sinon.spy(),
      info: sinon.spy(),
    };
    const app = {
      use: sinon.spy(),
      disable: sinon.spy(),
      enable: sinon.spy(),
      set: sinon.spy(),
      listen: sinon.spy(),
    };

    const requestLoggingMiddleware = sinon.spy();

    const server = proxyquire('../server', {
      express: Object.assign(() => app, {
        static: sinon.stub().returns(sinon.spy()),
      }),
      'express-session': sinon.stub().returns(sinon.spy()),
      'serve-favicon': sinon.stub().returns(sinon.spy()),
      'body-parser': {
        json: sinon.stub().returns(sinon.spy()),
        urlencoded: sinon.stub().returns(sinon.spy()),
      },
      i18n: {
        configure: sinon.stub(),
        init: sinon.spy(),
      },
      compression: sinon.stub().returns(sinon.spy()),
      nunjucks: {
        configure: sinon.stub().returns({
          addGlobal: sinon.spy(),
          addFilter: sinon.spy(),
        }),
      },
      helmet: Object.assign(sinon.stub().returns(sinon.spy()), {
        noCache: sinon.stub().returns(sinon.spy()),
        frameguard: sinon.stub().returns(sinon.spy()),
      }),
      'cookie-parser': sinon.stub().returns(sinon.spy()),
      uuid: { v4: sinon.stub().returns('uuid') },
      csurf: sinon.stub().returns(sinon.spy()),
      'connect-pg-simple': sinon.stub().returns(function PgSession() {}),
      './common/utils/correlationContext': {
        correlationIdMiddleware: sinon.spy(),
        getCorrelationId: sinon.stub().returns('corr-123'),
      },
      './common/utils/requestLogging': requestLoggingMiddleware,
      './common/utils/logger': sinon.stub().returns(loggerMethods),
      './common/config/index': {
        PUBLIC_SITE_DB_CONNSTR: 'postgres://example',
        SESSION_ENCODE_SECRET: 'secret',
        LOG_LEVEL: 'info',
        MAX_STRING_LENGTH: 50,
        MAX_POSTCODE_LENGTH: 10,
        MAX_REGISTRATION_LENGTH: 20,
        MAX_EMAIL_LENGTH: 40,
        MAX_ADDRESS_LINE_LENGTH: 35,
        MAX_TEXT_BOX_LENGTH: 100,
        CARRIER_SUPPORT_HUB_UK_NUMBER: '0800 000 000',
        CARRIER_SUPPORT_HUB_INTERNATIONAL_NUMBER: '+44 800 000 000',
      },
      './common/config': {
        IS_HTTPS_SERVER: true,
        SAME_SITE_VALUE: 'lax',
      },
      './common/config/availability': {
        ENABLE_UNAVAILABLE_PAGE: 'false',
        IS_PLANNED_MAINTENANCE: 'false',
        MAINTENANCE_START_DATETIME: '',
        MAINTENANCE_END_DATETIME: '',
      },
      './app/router': {
        bind: sinon.spy(),
      },
      './common/utils/autocomplete': {
        nationalityList: [],
        countryList: [],
        airportList: [],
      },
      './common/utils/templateFilters.js': {
        uncamelCase: sinon.spy(),
        containsError: sinon.spy(),
        expiryDate: sinon.spy(),
        formatGdsDate: sinon.spy(),
      },
      './common/utils/travel_permission_codes.json': {},
      './common/utils/airports': {
        findByCode: sinon.spy(),
      },
    });
    server.getApp();

    expect(app.use.getCalls().some((call) => call.args[0] === requestLoggingMiddleware)).to.equal(true);

    loggerMethods.info.resetHistory();
    const fallbackHandler = app.use.lastCall.args[0];
    const res = {
      status: sinon.stub().returnsThis(),
      render: sinon.spy(),
      redirect: sinon.spy(),
      sendStatus: sinon.spy(),
    };

    fallbackHandler(
      {
        method: 'GET',
        originalUrl: '/welcome/index',
        accepts: sinon.stub().withArgs('html').returns(true),
      },
      res
    );
    expect(loggerMethods.info).to.have.been.calledOnceWithExactly('404 fallback for request', {
      method: 'GET',
      url: '/welcome/index',
    });
    expect(res.status).to.have.been.calledOnceWithExactly(404);
    expect(res.render).to.have.been.calledOnceWithExactly('app/error/404');
  });

  it('returns a plain 404 for non-html requests', () => {
    const app = {
      use: sinon.spy(),
      disable: sinon.spy(),
      enable: sinon.spy(),
      set: sinon.spy(),
      listen: sinon.spy(),
    };

    const loggerMethods = {
      error: sinon.spy(),
      warn: sinon.spy(),
      debug: sinon.spy(),
      info: sinon.spy(),
    };

    const server = proxyquire('../server', {
      express: Object.assign(() => app, {
        static: sinon.stub().returns(sinon.spy()),
      }),
      'express-session': sinon.stub().returns(sinon.spy()),
      'serve-favicon': sinon.stub().returns(sinon.spy()),
      'body-parser': {
        json: sinon.stub().returns(sinon.spy()),
        urlencoded: sinon.stub().returns(sinon.spy()),
      },
      i18n: {
        configure: sinon.stub(),
        init: sinon.spy(),
      },
      compression: sinon.stub().returns(sinon.spy()),
      nunjucks: {
        configure: sinon.stub().returns({
          addGlobal: sinon.spy(),
          addFilter: sinon.spy(),
        }),
      },
      helmet: Object.assign(sinon.stub().returns(sinon.spy()), {
        noCache: sinon.stub().returns(sinon.spy()),
        frameguard: sinon.stub().returns(sinon.spy()),
      }),
      'cookie-parser': sinon.stub().returns(sinon.spy()),
      uuid: { v4: sinon.stub().returns('uuid') },
      csurf: sinon.stub().returns(sinon.spy()),
      'connect-pg-simple': sinon.stub().returns(function PgSession() {}),
      './common/utils/correlationContext': {
        correlationIdMiddleware: sinon.spy(),
        getCorrelationId: sinon.stub().returns('corr-123'),
      },
      './common/utils/requestLogging': sinon.spy(),
      './common/utils/logger': sinon.stub().returns(loggerMethods),
      './common/config/index': {
        PUBLIC_SITE_DB_CONNSTR: 'postgres://example',
        SESSION_ENCODE_SECRET: 'secret',
        LOG_LEVEL: 'info',
        MAX_STRING_LENGTH: 50,
        MAX_POSTCODE_LENGTH: 10,
        MAX_REGISTRATION_LENGTH: 20,
        MAX_EMAIL_LENGTH: 40,
        MAX_ADDRESS_LINE_LENGTH: 35,
        MAX_TEXT_BOX_LENGTH: 100,
        CARRIER_SUPPORT_HUB_UK_NUMBER: '0800 000 000',
        CARRIER_SUPPORT_HUB_INTERNATIONAL_NUMBER: '+44 800 000 000',
      },
      './common/config': {
        IS_HTTPS_SERVER: true,
        SAME_SITE_VALUE: 'lax',
      },
      './common/config/availability': {
        ENABLE_UNAVAILABLE_PAGE: 'false',
        IS_PLANNED_MAINTENANCE: 'false',
        MAINTENANCE_START_DATETIME: '',
        MAINTENANCE_END_DATETIME: '',
      },
      './app/router': {
        bind: sinon.spy(),
      },
      './common/utils/autocomplete': {
        nationalityList: [],
        countryList: [],
        airportList: [],
      },
      './common/utils/templateFilters.js': {
        uncamelCase: sinon.spy(),
        containsError: sinon.spy(),
        expiryDate: sinon.spy(),
      },
      './common/utils/travel_permission_codes.json': {},
      './common/utils/airports': {
        findByCode: sinon.spy(),
      },
    });
    server.getApp();

    const fallbackHandler = app.use.lastCall.args[0];
    const res = {
      sendStatus: sinon.spy(),
      status: sinon.spy(),
      render: sinon.spy(),
      redirect: sinon.spy(),
    };

    fallbackHandler(
      {
        method: 'GET',
        originalUrl: '/stylesheets/govuk-frontend.min.css.map',
        accepts: sinon.stub().withArgs('html').returns(false),
      },
      res
    );

    expect(loggerMethods.info).to.not.have.been.called;
    expect(res.sendStatus).to.have.been.calledOnceWithExactly(404);
  });
});
