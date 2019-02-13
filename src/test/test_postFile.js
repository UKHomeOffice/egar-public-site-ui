
const nock = require('nock');
const chai = require('chai');
const userApi = require('../common/services/fileUploadApi');
const fileUploadApi = require('../common/services/fileUploadApi')
const { describe, it } = require('mocha');
const endpoints = require('../common/config/endpoints');
const BASE_URL = endpoints.baseUrl();

// Local dependencies

let should = chai.should();

describe('FileUploadService',() => {
    const userId = '38e89192-5a92-4c42-bbd6-fa141af117ee';
    const garId = 'a640641f-18b1-47b4-ba12-7d512de7e0c7';
    const file = 'file';

    beforeEach(() => {
        nock(BASE_URL) 
          .post(`user/${userId}/gar/${garId}`, file)
          .reply(201, { garId: "string",
          status: {
            "name": "string"}
          }); 
        });

        it('Should post the supporting file document', (done) => {
    
                done();
              });
        
})
