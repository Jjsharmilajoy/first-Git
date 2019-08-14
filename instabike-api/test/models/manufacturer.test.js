const loopback = require('../../server/server.js');
const request = require('supertest');
const chai = require('chai');
const expect = chai.expect;
const assert = chai.assert;
const factory = require('../factory.js');
const faker = require('faker/locale/en_IND');

const app = loopback.dataSources.postgres.models;

describe('Manufacturer', async() => {
  let accessToken = {};

  before(async () => {
    const manufacturer = await factory.create('Manufacturer');
    const manufacturerUser = await factory.create('User', {user_type_id : manufacturer.id});
    accessToken = await factory.create('AccessToken', {userId: manufacturerUser.id});
    const role = await app.Roles.findOne({ where: { name: 'MANUFACTURER_COUNTRY_HEAD' } });
    const userRole = await factory.create('UserRole', {
      user_id: accessToken.userId,
      principalId: accessToken.userId,
      role_id: role.id,
    });
    return accessToken;
  });

  describe('POST /api/Manufacturers/{manufacturerId}/dealers/targetCompletion', () => {
    it('return target completion based on the dealer category', async () => {
      const monthNames = ["jan", "feb", "mar", "apr", "may", "jun","jul", "aug", "sep", "oct", "nov", "dec"];
      const date = new Date();
      let startDate, endDate;
      if (date.getMonth() < 4) {
        startDate = new Date(date.getFullYear() - 1, 3, 1);
        endDate = new Date(date.getFullYear(), 2, 1);
      } else {
        startDate = new Date(date.getFullYear(), 3, 1);
        endDate = new Date(date.getFullYear() + 1, 2, 1);
      }
      const dealerTarget = await factory.create('ManufacturerTarget',
        {target_name:monthNames[date.getMonth()], target_from_date:startDate, target_to_date:endDate, financial_year:startDate.getFullYear()+'-'+endDate.getFullYear()});
      const filter = { "manufacturerId": dealerTarget.manufacturer_id, "fromDate": startDate.toISOString(), "toDate": endDate.toISOString(),
        "zoneIds": [dealerTarget.zone_id], "stateIds": [dealerTarget.state_id],
        "cityIds": [dealerTarget.city_id], "vehicleIds":[dealerTarget.vehicle_id]};
      request(loopback)
      .post('/api/Manufacturers/' + dealerTarget.manufacturer_id + '/dealers/targetCompletion?access_token=' + accessToken.id)
      .set('Accept', 'application/json')
      .set('Authorization', accessToken.id)
      .send(filter)
      .expect(200)
      .end((err, res) => {
        expect(res.body.length).to.not.equal(0);
      });
    });
  });

  describe('POST /api/Manufacturers/{manufacturerId}/dealerShip/count', () => {
    it('Get Leads count by status', async () => {
      const manufacturer = await factory.create('Manufacturer');
      const city = await factory.create('City');
      const dealerCategories = await factory.createMany('DealerCategory', 4, { manufacturer_id : manufacturer.id });
      const dealers = await factory.create('Dealer', {
        manufacturer_id : manufacturer.id,
        dealer_category_id: dealerCategories[0].id,
        city_id: city.id,
      });
      const filter = {cityIds: [city.id]};
      request(loopback)
        .post('/api/Manufacturers/' + manufacturer.id + '/dealerShip/count')
        .set('Accept', 'application/json')
        .set('Authorization', accessToken.id)
        .send(filter)
        .expect(200)
        .end((err, res) => {
          expect(res.body.length).to.equal(4);
        });
    });
  });

  describe('POST /api/Manufacturers/{manufacturerId}/dealer/{dealerId}/salesEffectiveness', () => {
    it('Get list of sales sales-effectiveness by product for a dealer', async () => {
      const manufacturer = await factory.create('Manufacturer');
      const dealer = await factory.create('Dealer', {manufacturer_id: manufacturer.id});
      const vehicle = await factory.create('Vehicle', {manufacturer_id: manufacturer.id});
      const leadDetails = await factory.createMany('LeadDetail', 5, {
        manufacturer_id: manufacturer.id,
        vehicle_id: vehicle.id,
        dealer_id: dealer.id
      });
      const filter = {
        "fromDate": "2018-04-01",
        "toDate": "2018-07-31",
        "orderField": "vehicle_name",
        "orderBy": "ASC",
        "limit": 10,
        "pageNo": 1
      };
      request(loopback)
        .post('/api/Manufacturers/' + manufacturer.id + '/dealer/' + dealer.id + '/salesEffectiveness')
        .set('Accept', 'application/json')
        .set('Authorization', accessToken.id)
        .send(filter)
        .expect(200)
        .end((err, res) => {
          expect(res.body.count).to.equal(1);
        });
    });
  });

  describe('POST /api/Manufacturers/{manufacturerId}/activeLeads', () => {
    it('Get list of active leads for a manufacturer', async () => {
      const manufacturer = await factory.create('Manufacturer');
      const manufacturerUser = await factory.create('User', {user_type_id : manufacturer.id});
      const accesstoken = await factory.create('AccessToken', {userId: manufacturerUser.id});
      const role = await app.Roles.findOne({ where: { name: 'MANUFACTURER_COUNTRY_HEAD' } });
      const userRole = await factory.create('UserRole', {
        user_id: accesstoken.userId,
        principalId: accesstoken.userId,
        role_id: role.id,
      });
      const dealer = await factory.create('Dealer', {manufacturer_id: manufacturer.id});
      const vehicle = await factory.create('Vehicle', {manufacturer_id: manufacturer.id});
      const lead = await factory.create('Lead', {manufacturer_id: manufacturer.id, dealer_id: dealer.id,
        is_lost:false,is_invoiced:false});
      const leadDetails = await factory.createMany('LeadDetail', 5, {
        manufacturer_id: manufacturer.id,
        vehicle_id: vehicle.id,
        dealer_id: dealer.id,
        lead_id: lead.id
      });
      const filter = {
        "orderField" : "tab_value",
        "orderBy" : "ASC",
        "limit": 10,
        "pageNo": 1,
        "tabGroup": "zone"
      };
      request(loopback)
        .post('/api/Manufacturers/' + manufacturer.id + '/activeLeads')
        .set('Accept', 'application/json')
        .set('Authorization', accesstoken.id)
        .send(filter)
        .expect(200)
        .end((err, res) => {
          expect(res.body.count).to.not.equal(0);
        });
    });
  });

  describe('POST /api/Manufacturers/{manufacturerId}/vehicles/sales', () => {
    it('returns product sales count for the current financial year', async() => {
      const country = await factory.create('Country');
      const manufacturer = await factory.create('Manufacturer');
      const manufacturerUser = await factory.create('User', {
        user_type_id : manufacturer.id, user_type_name: 'Manufacturer', country_id: country.id
      });
      const accesstoken = await factory.create('AccessToken', {userId: manufacturerUser.id});
      const role = await app.Roles.findOne({ where: { name: 'MANUFACTURER_COUNTRY_HEAD' } });
      const userRole = await factory.create('UserRole', {
        user_id: accesstoken.userId,
        principalId: accesstoken.userId,
        role_id: role.id,
      });
      const vehicleBike = await factory.create('Vehicle', {type: 0, manufacturer_id: manufacturer.id});
      const vehicleScooter = await factory.create('Vehicle', {type: 1, manufacturer_id: manufacturer.id});
      const dealer = await factory.create('Dealer', {manufacturer_id: manufacturer.id});
      const lead = await factory.create('Lead', {manufacturer_id: manufacturer.id, dealer_id: dealer.id,
        is_lost:false,is_invoiced:false, country_id: country.id})
      const bike = await factory.create('LeadDetail', {
        manufacturer_id: manufacturer.id,
        vehicle_id: vehicleBike.id,
        vehicle_status : 600,
        lead_id: lead.id
      });
      const scooter = await factory.create('LeadDetail', {
        manufacturer_id: manufacturer.id,
        vehicle_id: vehicleScooter.id,
        vehicle_status : 600,
        lead_id: lead.id
      });
      request(loopback)
        .post('/api/Manufacturers/' + manufacturer.id + '/vehicles/sales')
        .set('Authorization', accesstoken.id)
        .set('Accept', 'application/json')
        .send({"date": new Date()})
        .expect(200)
        .end((err, res) => {
          expect(res.body.length).to.not.equal(0);
        });
    });
  });

  describe('POST /api/Manufacturers/{manufacturerId}/dealers/nearBy', () => {
    it('returns all dealers near the location based on radius', async() => {
      const manufacturer = await factory.create('Manufacturer', {location: {"lat":13.02248 , "lng":80.203187}});
      const dealer = await factory.create('Dealer', {manufacturer_id: manufacturer.id,
        location: {"lat":13.0266396 , "lng":80.2055819}})
      request(loopback)
        .post('/api/Manufacturers/' + manufacturer.id + '/dealers/nearBy')
        .set('Accept', 'application/json')
        .set('Authorization', accessToken.id)
        .send({location:manufacturer.location, radius:5})
        .expect(200)
        .end((err, res) => {
          expect(res.body.length).to.not.equal(0);
        });
    });
  });

  describe('GET /api/Manufacturers/{manufacturerId}/financier/{financierId}/dealershipCount', () => {
    it('return total count of the dealer and dealer associated with financier', async() => {
      const manufacturer = await factory.create('Manufacturer');
      const dealers =  await factory.createMany('Dealer', 5, {manufacturer_id: manufacturer.id});
      const dealerFinancier = await factory.create('DealerFinancier', {manufacturer_id: manufacturer.id, dealer_id: dealers[0].id});
      request(loopback)
        .get('/api/Manufacturers/' + manufacturer.id + '/financier/'+ dealerFinancier.financier_id + '/dealershipCount')
        .set('Accept', 'application/json')
        .set('Authorization', accessToken.id)
        .expect(200)
        .end((err, res) => {
          expect(res.body.total).to.not.equal(0);
        });
    });
  })

  describe('POST /api/Manufacturers/{manufacturerId}/dealers/topDealers', () => {
    it('return top performing dealers', async() => {
      const country = await factory.create('Country');
      const manufacturer = await factory.create('Manufacturer');
      const manufacturerUser = await factory.create('User', {
        user_type_id : manufacturer.id, user_type_name: 'Manufacturer', country_id: country.id
      });
      const accesstoken = await factory.create('AccessToken', {userId: manufacturerUser.id});
      const role = await app.Roles.findOne({ where: { name: 'MANUFACTURER_COUNTRY_HEAD' } });
      const userRole = await factory.create('UserRole', {
        user_id: accesstoken.userId,
        principalId: accesstoken.userId,
        role_id: role.id,
      });
      const dealer = await factory.create('Dealer', {manufacturer_id: manufacturer.id, country_id: country.id});
      const lead = await factory.create('Lead', {dealer_id: dealer.id, country_id: country.id});
      const filter = { "manufacturerId": dealer.manufacturer_id, "date": "2018-06-04",
        "zoneIds": [dealer.zone_id], "stateIds": [dealer.state_id],"order_field": "MTD_conversion_percentage",
        "order_by": "DESC","limit": 10, 'pageNo' : 1};
      request(loopback)
        .post('/api/Manufacturers/' + dealer.manufacturer_id + '/dealers/topDealers')
        .set('Accept', 'application/json')
        .set('Authorization', accessToken.id)
        .send(filter)
        .expect(200)
        .end((err, res) => {
          expect(res.body.dealers.length).to.not.equal(0);
        });
    });
  });

  describe('POST /api/Manufacturers/{manufacturerId}/lostAnalysis', () => {
    it('Get list lead-count based on lost-reason', async () => {
      const manufacturer = await factory.create('Manufacturer');
      const manufacturerUser = await factory.create('User', {user_type_id : manufacturer.id});
      const accesstoken = await factory.create('AccessToken', {userId: manufacturerUser.id});
      const role = await app.Roles.findOne({ where: { name: 'MANUFACTURER_COUNTRY_HEAD' } });
      const userRole = await factory.create('UserRole', {
        user_id: accesstoken.userId,
        principalId: accesstoken.userId,
        role_id: role.id,
      });
      const dealer = await factory.create('Dealer', {manufacturer_id: manufacturer.id});
      const vehicle = await factory.create('Vehicle', {manufacturer_id: manufacturer.id});
      const lostReason = await factory.create('LostReason');
      const lead = await factory.create('Lead', {
        manufacturer_id: manufacturer.id,
        dealer_id: dealer.id,
        status: 900,
        lost_on: new Date(),
        lost_reason_id: lostReason.id
      });
      const leadDetails = await factory.createMany('LeadDetail', 5, {
        manufacturer_id: manufacturer.id,
        vehicle_id: vehicle.id,
        dealer_id: dealer.id,
        lead_id: lead.id
      });
      const filter = {
        "orderField" : "tab_value",
        "orderBy" : "ASC",
        "limit": 10,
        "pageNo": 1,
        "tabGroup": "zone"
      };
      request(loopback)
        .post('/api/Manufacturers/' + manufacturer.id + '/lostAnalysis')
        .set('Accept', 'application/json')
        .set('Authorization', accesstoken.id)
        .send(filter)
        .expect(200)
        .end((err, res) => {
          expect(res.body.count).to.not.equal(0);
        });
    });
  });

  describe('POST /api/Manufacturers/{manufacturerId}/dealers', () => {
    it('return top performing dealers', async() => {
      const manufacturer = await factory.create('Manufacturer');
      const zone = await factory.create('Zone', {manufacturer_id: manufacturer.id});
      const state = await factory.create('State', {manufacturer_id: manufacturer.id, zone_id: zone.id});
      const city = await factory.create('City', {manufacturer_id: manufacturer.id, zone_id: zone.id, state_id: state.id});
      const dealer = await factory.create('Dealer', {manufacturer_id: manufacturer.id, zone_id: zone.id, state_id: state.id, city_id: city.id});
      const searchFilter = {
        zoneIds: [zone.id],
        orderField: 'name',
        orderBy: 'ASC',
        pageNo: 1,
        limit: 10,
      };
      request(loopback)
        .post('/api/Manufacturers/' + dealer.manufacturer_id + '/dealers')
        .set('Accept', 'application/json')
        .set('Authorization', accessToken.id)
        .send(searchFilter)
        .expect(200)
        .end((err, res) => {
          expect(res.body.dealers[0].zone_id).to.equal(zone.id);
        });
    });
  });

  describe('POST /api/Manufacturers/login', () => {
    it('return top performing dealers', async() => {
      const manufacturer = await factory.create('Manufacturer');
      const role = await app.Roles.findOne({ where: { name: 'MANUFACTURER_COUNTRY_HEAD' } });
      const manufacturerUser = await factory.create('User', {
        user_type_id : manufacturer.id,
        mobile_no: '1237896540',
        user_type_name: 'Manufacturer',
      });
      const userRole = await factory.create('UserRole', {
        user_id: manufacturerUser.id, role_id: role.id, principalId: manufacturerUser.id,
      });
      request(loopback)
        .post('/api/Manufacturers/login')
        .set('Accept', 'application/json')
        .set('Authorization', accessToken.id)
        .send({'mobile_no': '1237896540', 'password': 'test1234'})
        .expect(200)
        .end((err, res) => {
          expect(res.body.result).to.not.equal(null);
        });
    });
  });

  describe('POST /api/Manufacturers/resetPassword', () => {
    it('return top performing dealers', async() => {
      const user = await factory.create('User');
      const newPassword = 'test12345';
      request(loopback)
        .post('/api/Manufacturers/resetPassword')
        .set('Accept', 'application/json')
        .set('Authorization', accessToken.id)
        .send({ newPassword: 'test12345' })
        .expect(200)
        .end((err, res) => {
          expect(res.body.success).to.not.equal(null);
        });
    });
  });

  describe('POST /api/Manufacturers/{manufacturerId}/updateDetail', () => {
    it('return updated Detail', async() => {
      const manufacturerUser = {};
      manufacturerUser.manufacturerObj = await factory.create('Manufacturer');
      manufacturerUser.userObj = await factory.create('User', {
        user_type_id : manufacturerUser.manufacturerObj.id,
        user_type_name: 'MANUFACTURER',
      });
      const role = await app.Roles.findOne({ where: { name: 'MANUFACTURER_COUNTRY_HEAD' } });
      manufacturerUser.userObj.first_name = 'new firstName';
      const userRole = await factory.create('UserRole', {
        user_id: manufacturerUser.userObj.id, role_id: role.id, principalId: manufacturerUser.userObj.id,
      });
      accessToken = await factory.create('AccessToken', {userId: manufacturerUser.userObj.id});
      request(loopback)
        .post('/api/Manufacturers/' + manufacturerUser.manufacturerObj.id + '/updateDetail')
        .set('Accept', 'application/json')
        .set('Authorization', accessToken.id)
        .send(manufacturerUser)
        .expect(200)
        .end((err, res) => {
          expect(res.body.user.first_name).to.equal(manufacturerUser.userObj.first_name);
        });
    });
  });

  describe('GET /api/Manufacturers/{manufacturerId}/financiers', () => {
    it('returns manufacturer-financier list', async() => {
      const manufacturer = await factory.create('Manufacturer');
      const financier = await factory.createMany('Financier', 5);
      const userObj = await factory.create('User', {
        user_type_id : manufacturer.id,
        user_type_name: 'MANUFACTURER',
      });
      const manufacturerFinancier = await factory.create('ManufacturerFinancier', {
        manufacturer_id : manufacturer.id,
        financier_id: financier[0].id,
        country_id: userObj.country_id,
      });
      const manufacturerFinancierOrder = await factory.create('ManufacturerFinancierOrder', {
        manufacturer_id : manufacturer.id,
        financier_id: financier[0].id,
        country_id: userObj.country_id,
      });
      const role = await app.Roles.findOne({ where: { name: 'MANUFACTURER_COUNTRY_HEAD' } });
      const userRole = await factory.create('UserRole', {
        user_id: userObj.id, role_id: role.id, principalId: userObj.id,
      });
      accessToken = await factory.create('AccessToken', {userId: userObj.id});
      request(loopback)
        .get('/api/Manufacturers/' + manufacturer.id + '/financiers')
        .set('Accept', 'application/json')
        .set('Authorization', accessToken.id)
        .expect(200)
        .end((err, res) => {
          expect(res.body.manufacturerFinanciers.length).to.not.equal(0);
        });
    });
  });

  describe('GET /api/Manufacturers/{manufacturerId}/updateFinancier', () => {
    it('returns manufacturer-financier list', async() => {
      const manufacturer = await factory.create('Manufacturer');
      const financier = await factory.create('Financier');
      const userObj = await factory.create('User', {
        user_type_id : manufacturer.id,
        user_type_name: 'MANUFACTURER',
      });
      const manufacturerFinancier = {
        manufacturer_id : manufacturer.id, financier_id: financier.id,
        order: 1, country_id: userObj.country_id
      };
      const role = await app.Roles.findOne({ where: { name: 'MANUFACTURER_COUNTRY_HEAD' } });
      const userRole = await factory.create('UserRole', {
        user_id: userObj.id, role_id: role.id, principalId: userObj.id,
      });
      const input = {
        updateList: [manufacturerFinancier],
        deleteList: [],
      };
      accessToken = await factory.create('AccessToken', {userId: userObj.id});
      request(loopback)
        .get('/api/Manufacturers/' + manufacturer.id + '/updateFinancier')
        .set('Accept', 'application/json')
        .set('Authorization', accessToken.id)
        .send(input)
        .expect(200)
        .end((err, res) => {
          expect(res.body.length).to.not.equal(0);
        });
    });
  });

  describe('GET /api/Manufacturers/{manufacturerId}/detail', () => {
    it('returns manufacturer-financier list', async() => {
      const manufacturer = await factory.create('Manufacturer');
      const manufacturerUser = await factory.create('User', {
        user_type_id : manufacturer.id,
        user_type_name: 'Manufacturer',
      });
      const role = await app.Roles.findOne({ where: { name: 'MANUFACTURER_COUNTRY_HEAD' } });
      const userRole = await factory.create('UserRole', {
        user_id: manufacturerUser.id, role_id: role.id, principalId: manufacturerUser.id,
      });
      const accesstoken = await factory.create('AccessToken', {userId: manufacturerUser.id});
      request(loopback)
        .get('/api/Manufacturers/' + manufacturer.id + '/detail')
        .set('Accept', 'application/json')
        .set('Authorization', accesstoken.id)
        .expect(200)
        .end((err, res) => {
          expect(res.body.manufacturer.id).to.equal(manufacturer.id);
        });
    });
  });

  describe('POST /api/Manufacturers/{manufacturerId}/leads', () => {
    it('returns manufacturer-financier list', async() => {
      const manufacturer = await factory.create('Manufacturer');
      const dealer = await factory.create('Dealer', {manufacturer_id: manufacturer.id});
      const vehicle = await factory.create('Vehicle', {manufacturer_id: manufacturer.id});
      const lead = await factory.create('Lead', {manufacturer_id: manufacturer.id, dealer_id: dealer.id});
      const leadDetails = await factory.create('LeadDetail', {
        manufacturer_id: manufacturer.id,
        vehicle_id: vehicle.id,
        dealer_id: dealer.id,
        lead_id: lead.id
      });
      const filter = {
        "orderField" : "created_at",
        "orderBy" : "ASC",
        "limit": 10,
        "pageNo": 1,
        "is_lost": false,
      };
      const userObj = await factory.create('User', {
        user_type_id : manufacturer.id,
        user_type_name: 'MANUFACTURER',
      });
      const role = await app.Roles.findOne({ where: { name: 'MANUFACTURER_COUNTRY_HEAD' } });
      const userRole = await factory.create('UserRole', {
        user_id: userObj.id, role_id: role.id, principalId: userObj.id,
      });
      accessToken = await factory.create('AccessToken', {userId: userObj.id});
      request(loopback)
        .post('/api/Manufacturers/' + manufacturer.id + '/leads')
        .set('Accept', 'application/json')
        .set('Authorization', accessToken.id)
        .send(filter)
        .expect(200)
        .end((err, res) => {
          expect(res.body.count).to.not.equal(0);
        });
    });
  });
});
