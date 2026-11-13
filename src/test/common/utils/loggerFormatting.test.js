const { expect } = require('chai');
const sinon = require('sinon');

require('../../global.test');

// Uses the real pino pipeline (unlike logger.test.js, which mocks pino
// entirely) because level-uppercasing and email-masking are real logger
// transforms that only a real pipeline can catch regressions in.
describe('Logger formatting (real pino pipeline)', () => {
  let writeStub;
  let chunks;

  const freshLogger = () => {
    delete require.cache[require.resolve('../../../common/utils/logger')];
    return require('../../../common/utils/logger')(__filename);
  };

  const lastJsonLine = () => {
    for (let i = chunks.length - 1; i >= 0; i -= 1) {
      const trimmed = chunks[i].trim();
      if (trimmed.startsWith('{')) {
        try {
          return JSON.parse(trimmed);
        } catch {
          // not our log line, keep looking
        }
      }
    }
    throw new Error('No JSON log line captured');
  };

  beforeEach(() => {
    chunks = [];
    writeStub = sinon.stub(process.stdout, 'write').callsFake((chunk) => {
      chunks.push(chunk.toString());
      return true;
    });
  });

  afterEach(() => {
    writeStub.restore();
  });

  it('uppercases the level, mapping warn to WARNING specifically', () => {
    const logger = freshLogger();
    logger.warn('Validation failed');
    expect(lastJsonLine().level).to.equal('WARNING');

    const logger2 = freshLogger();
    logger2.error('Something broke');
    expect(lastJsonLine().level).to.equal('ERROR');
  });

  it('masks an email address in the message exactly once', () => {
    const logger = freshLogger();
    logger.error('Failed to send email to john.smith@example.com');
    expect(lastJsonLine().message).to.equal('Failed to send email to j***h@example.com');
  });

  it('masks a short local-part without corrupting the output', () => {
    const logger = freshLogger();
    logger.info('Short email test for jo@example.com');
    expect(lastJsonLine().message).to.equal('Short email test for j***@example.com');
  });

  it('masks multiple email addresses in the same message', () => {
    const logger = freshLogger();
    logger.warn('Multiple emails: alice@test.com and bob.jones@example.co.uk');
    expect(lastJsonLine().message).to.equal('Multiple emails: a***e@test.com and b***s@example.co.uk');
  });
});
