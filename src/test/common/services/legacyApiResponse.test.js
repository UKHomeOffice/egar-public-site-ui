const { expect } = require('chai');
const { parseJsonResponse, unwrapResponse } = require('../../../common/services/data-access/legacyApiResponse');

describe('legacyApiResponse', () => {
  describe('unwrapResponse', () => {
    it('removes the transport ok flag without changing the original response', () => {
      const response = { ok: true, userId: 'user-1' };

      expect(unwrapResponse(response)).to.deep.equal({ userId: 'user-1' });
      expect(response).to.deep.equal({ ok: true, userId: 'user-1' });
    });

    it('leaves arrays, primitives, and objects without a transport flag unchanged', () => {
      [null, undefined, false, 0, '{"ok":true}', [{ ok: true }], { userId: 'user-1' }].forEach((response) => {
        expect(unwrapResponse(response)).to.equal(response);
      });
    });
  });

  describe('parseJsonResponse', () => {
    it('parses JSON strings without stripping fields from their decoded body', () => {
      expect(parseJsonResponse('{"ok":true,"userId":"user-1"}')).to.deep.equal({
        ok: true,
        userId: 'user-1',
      });
    });

    it('unwraps already decoded responses', () => {
      expect(parseJsonResponse({ ok: true, userId: 'user-1' })).to.deep.equal({ userId: 'user-1' });
    });

    it('preserves non-string values without a transport flag', () => {
      [null, undefined, false, 0, [], { userId: 'user-1' }].forEach((response) => {
        expect(parseJsonResponse(response)).to.equal(response);
      });
    });

    it('rejects invalid JSON strings', () => {
      expect(() => parseJsonResponse('invalid JSON')).to.throw(SyntaxError);
    });
  });
});
