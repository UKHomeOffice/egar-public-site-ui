/* eslint-disable no-underscore-dangle */
/* eslint-disable no-unused-expressions */
/* eslint-disable no-undef */
const sinon = require('sinon');
const { expect } = require('chai');
const chai = require('chai');
const sinonChai = require('sinon-chai');
const rewire = require('rewire');

const pagination = require('../../../common/utils/pagination');

describe('Pagination Module', () => {
  let req; let saveSessionStub;
  process.on('unhandledRejection', (error) => {
    chai.assert.fail(`Unhandled rejection encountered: ${error}`);
  });

  beforeEach(() => {
    chai.use(sinonChai);
    saveSessionStub = sinon.stub();
    req = {
      session: {
        save: saveSessionStub,
      },
    };
  });

  describe('getCurrentPage', () => {
    it('should return 1 and create a currentPage variable for a new page url', () => {
      expect(req.session.currentPage).to.be.undefined;
      const result = pagination.getCurrentPage(req, '/test');
      expect(req.session.currentPage).to.eql({ '/test': 1 });
      expect(saveSessionStub).to.have.been.called;
      expect(result).to.eq(1);
    });

    it('should return 1 for a new page url', () => {
      req.session.currentPage = {};
      const result = pagination.getCurrentPage(req, '/test');
      expect(req.session.currentPage).to.eql({ '/test': 1 });
      expect(saveSessionStub).to.have.been.called;
      expect(result).to.eq(1);
    });

    it('should return the page for a stored page url', () => {
      req.session.currentPage = { '/test': 6, '/second': 8 };
      const result1 = pagination.getCurrentPage(req, '/test');
      expect(result1).to.eq(6);
      const result2 = pagination.getCurrentPage(req, '/second');
      expect(saveSessionStub).to.not.have.been.called;
      expect(result2).to.eq(8);
    });
  });

  describe('setCurrentPage', () => {
    it('should set and create a currentPage variable for a new page url', () => {
      expect(req.session.currentPage).to.be.undefined;
      pagination.setCurrentPage(req, '/test', 3);
      expect(req.session.currentPage).to.eql({ '/test': 3 });
      expect(saveSessionStub).to.have.been.called;
    });

    it('should set and create variable for a new page url', () => {
      req.session.currentPage = {};
      pagination.setCurrentPage(req, '/test', 4);
      expect(req.session.currentPage).to.eql({ '/test': 4 });
      expect(saveSessionStub).to.have.been.called;
    });

    it('should set and create variable for a new page url if string', () => {
      req.session.currentPage = {};
      pagination.setCurrentPage(req, '/test', '2');
      expect(req.session.currentPage).to.eql({ '/test': 2 });
      expect(saveSessionStub).to.have.been.called;
    });

    it('should set as normal', () => {
      req.session.currentPage = { '/test': 4, '/another': 3 };
      pagination.setCurrentPage(req, '/test', 2);
      expect(req.session.currentPage).to.eql({ '/test': 2, '/another': 3 });
      expect(saveSessionStub).to.have.been.calledOnce;

      pagination.setCurrentPage(req, '/another', '4');
      expect(req.session.currentPage).to.eql({ '/test': 2, '/another': 4 });
      expect(saveSessionStub).to.have.been.calledTwice;

      pagination.setCurrentPage(req, '/third', '10');
      expect(req.session.currentPage).to.eql({ '/test': 2, '/another': 4, '/third': 10 });
      expect(saveSessionStub).to.have.been.calledThrice;
    });
  });

  describe('getPages', () => {
    let rewiredPagination;
    let getPages;

    beforeEach(() => {
      rewiredPagination = rewire('../../../common/utils/pagination');
      getPages = rewiredPagination.__get__('getPages');
    });

    it('should return null if limit is 0', () => {
      expect(getPages(0, 5, 1)).to.be.null;
    });

    it('should return an array of 3 numbers', () => {
      expect(getPages(3, 5, 1)).to.eql([1, 2, 3]);
      expect(getPages(3, 5, 2)).to.eql([1, 2, 3]);
      expect(getPages(3, 5, 3)).to.eql([2, 3, 4]);
      expect(getPages(3, 5, 4)).to.eql([3, 4, 5]);
    });

    it('should return an array of 4 numbers', () => {
      expect(getPages(4, 5, 1)).to.eql([1, 2, 3, 4]);
      expect(getPages(4, 5, 2)).to.eql([1, 2, 3, 4]);
      expect(getPages(4, 5, 3)).to.eql([2, 3, 4, 5]);
      expect(getPages(4, 5, 4)).to.eql([2, 3, 4, 5]);
      expect(getPages(4, 5, 5)).to.eql([2, 3, 4, 5]);
    });
  });

  describe('build', () => {
    beforeEach(() => {
      req.originalUrl = 'http://example.com/examplepath';
      req.session.currentPage = { '/examplepath': 2 };
    });

    it('should return a dummy object if totalPages parameter is 0', () => {
      const result = pagination.build(req, 0, 0);
      expect(result).to.eql({
        startItem: 0,
        endItem: 0,
        currentPage: 2,
        totalItems: 0,
        totalPages: 0,
        items: [],
      });
    });

    // throw an error if current > total
    it('should throw an error if the current greater than totalPages', () => {
      try {
        pagination.build(req, 1, 3);
        sinon.assert.fail('Should not reach here');
      } catch (err) {
        expect(err).to.eq(1);
      }
    });

    it('should return a block of paging data', () => {
      const result = pagination.build(req, 4, 17);
      expect(result).to.eql({
        startItem: 6,
        endItem: 10,
        currentPage: 2,
        totalItems: 17,
        totalPages: 4,
        items: [1, 2, 3],
      });
    });
  });
});
