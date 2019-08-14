'use strict';

const chai = require('chai');
const expect = chai.expect;
const chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);

const XlsxUtils = require('../../server/utils/xlsx_utils.js');

const sample_json_data = [ { Sno: '1',
                            Manufacturer: 'Suzuki',
                            'Vehicle | Type': 'Intruder 150 | Bike',
                            Variant: 'Standard',
                            'Feature Name': 'SPORTY GRAPHIC',
                            Description: 'Sporty Graphic',
                            'Image Url': 'https://d1xq83t889f8oi.cloudfront.net/ecommerce/gixxer/specification/sport-graphics.png'
                          } ];
const INVALID_FILE_PATH = process.cwd() +'/test/fixtures/importer/variant_features.txt';
const VALID_FILE_PATH = process.cwd() +'/test/fixtures/importer/variant_features.xlsx';
const VALID_SHEET_NAME = 'features';
const INVALID_SHEET_NAME = 'abc';

describe('XlsxUtils', function() {
  describe('sheetToJSON', function() {
    it('return as json for a valid excel file and valid config', async() => {
      const sheetAsJson = await XlsxUtils.sheetToJSON(VALID_FILE_PATH, VALID_SHEET_NAME);
      expect(sheetAsJson).to.deep.equal(sample_json_data);
    });

    it('throw an File Format exception while file extension is not xlsx', async() => {
      expect(XlsxUtils.sheetToJSON(INVALID_FILE_PATH, VALID_SHEET_NAME)).to.be.rejected;
    });

    it('throw an Error If the given sheet name is not presnt in the sheet', async() => {
      expect(XlsxUtils.sheetToJSON(VALID_FILE_PATH, INVALID_SHEET_NAME)).to.be.rejected;
    });
  });
});
