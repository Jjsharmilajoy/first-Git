const chai = require('chai');
const expect = chai.expect;
const assert = chai.assert;
const factory = require('../factory.js');
const faker = require('faker/locale/en_IND');
// const chaiAsPromised = require("chai-as-promised");
// chai.use(chaiAsPromised);
const loopback = require('../../server/server.js');
const app = loopback.dataSources.postgres.models;

const CustomerService = require('../../server/services/customer_service.js');

describe('CustomerServices', () => {

  describe('updatePassword', () => {
    it('Update password on user onboarding', async () => {
      const user = await factory.create('User');
      const customerService = new CustomerService(user.id, user);
      const password = 'test12345';
      customerService.updatePassword(password, (err, success) => {
        assert.isNotNull(success, "Updated Successfully");
      });
    });
    it('Update password with same password', async () => {
      const user = await factory.create('User');
      const customerService = new CustomerService(user.id, user);
      const password = 'test1234';
      customerService.updatePassword(password, (err, success) => {
        assert.isNotNull(err, 'Same Password');
      });
    });
    it('Update password for old user', async () => {
      const user = await factory.create('User', {is_new: false});
      const customerService = new CustomerService(user.id, user);
      const password = 'test12345';
      customerService.updatePassword(password, (err, success) => {
        assert.isNotNull(err, 'Password alread updated');
      });
    });
  });

  const INVALID_PHONE_NO = '1234567890';
  const VALID_PHONE_N0 = '9876543210'

  describe('getUserByPhoneNo', function() {
    it('should return empty array when given phone number is not found in the customer user type', function(done) {
      const customerService = new CustomerService();
      customerService.customerMobExists(INVALID_PHONE_NO, (err, users) => {
        expect(users.exist).to.be.false;
        done();
      });
    });
  });

  describe('updateCustomer', () => {
    it('update Customer', async () => {
      const user = await factory.create('User',{user_type_name: 'Customer',user_type_id: null});
      user.email = faker.internet.email();
      const customerService = new CustomerService(user.id, user);
      customerService.updateCustomer((err, result) => {
        assert.equal(result.email, user.email, 'Customer updated Successfully');
      });
    })
  });

  describe('resetPassword', () => {
    it('returns password success update', (done) => {
      factory.create('User').then(user => {
        const password = 'test12345';
        const customerService = new CustomerService(user.id, user);
        customerService.updatePassword(password, (fetchError, success) => {
          if(fetchError) {
            assert.isNotNull(fetchError, 'Error while updating password')
            done();
          } else {
            assert.equal(success.message, "Updated Successfully", 'Success');
            done();
          }
        });
      });
    });
  });
  describe('sendCredentials', () => {
    it('credentials are sent Successfully', async() => {
      const user = await factory.create('User');
      const customerService = new CustomerService(user.id, user);
      customerService.sendCredentials((fetchError, success) => {
        assert.equal(success.emailStatus, 'Sent Successfully');
      })
    })
  });

  describe('One Time Password', () => {
    it('Return invalid user', async () => {
      const user = await factory.create('User');
      const lead = await factory.create('Lead', { user_id: user.id });
      const customerService = new CustomerService(lead.id, user);
      const mobileObj = { mobile_no: '7888899995'};
      customerService.sendOtp(mobileObj, (err, res) => {
        assert.isNotNull(err, 'OTP not Sent');
      });
    });
    it('OTP sent', async () => {
      const user = await factory.create('User');
      const customerService = new CustomerService(user.id, user);
      const mobileObj = { mobile_no: '7888899995'};
      customerService.sendOtp(mobileObj, (err, res) => {
        assert.isNotNull(err, 'OTP not Sent');
      });
    });
    it('OTP sent', async () => {
      const user = await factory.create('User');
      const customerService = new CustomerService(user.id, user);
      customerService.sendOtp({}, (err, res) => {
        assert.isNotNull(res, 'OTP Sent');
      });
    });
    it('OTP Validate', async () => {
      const customerService = new CustomerService();
      const otpObj = { pinId: "", pin: "" };
      customerService.validateOtp(otpObj, (err, res) => {
        assert.isNotNull(res, 'OTP Validated');
      });
    });
    it('OTP resend', async () => {
      const customerService = new CustomerService();
      const pinObj = { pinId: "" };
      customerService.resendOtp(pinObj, (err, res) => {
        assert.isNotNull(res, 'OTP resent');
      });
    });
  });

  describe('resetEmail', () => {
    it('request to reset-Email is success', async() => {
      const user = await factory.create('User',{user_type_name: 'Customer',user_type_id: null});
      const accessToken = await app.AccessToken.create({
        userId: user.id,
        ttl: 3600,
      });
      const req = { accessToken: accessToken };
      const customerService = new CustomerService(user.id);
      customerService.resetEmail(req, user.email_id, ( err, result ) => {
        assert.isNotNull(result, 'Forgot Password mail sent successfully');
      });
    });
    it('Invalid user error', async() => {
      const user = await factory.create('User',{user_type_name: 'Customer',user_type_id: null});
      const accessToken = await app.AccessToken.create({
        userId: user.id,
        ttl: 3600,
      });
      const req = { accessToken: accessToken };
      const customerService = new CustomerService(user.country_id);
      customerService.resetEmail(req, user.email_id, ( err, result ) => {
        assert.isNotNull(err, 'Invalid user error');
      });
    });
  });

  describe('resetEmail', () => {
    it('request to reset-Email is success', async() => {
      const user = await factory.create('User',{user_type_name: 'Customer',user_type_id: null});
      const accessToken = await app.AccessToken.create({
        userId: user.id,
        ttl: 3600,
      });
      const req = { accessToken: accessToken };
      const customerService = new CustomerService(user.id);
      customerService.resetEmail(req, user.email_id, ( err, result ) => {
        assert.isNotNull(result, 'reset-email link sent successfully');
      });
    });
    it('Invalid user error', async() => {
      const user = await factory.create('User',{user_type_name: 'Customer',user_type_id: null});
      const accessToken = await app.AccessToken.create({
        userId: user.id,
        ttl: 3600,
      });
      const req = { accessToken: accessToken };
      const customerService = new CustomerService(user.country_id);
      customerService.resetEmail(req, user.email_id, ( err, result ) => {
        assert.isNotNull(err, 'Invalid user error');
      });
    });
  });

  describe('updateEmail', () => {
    it('request to update-Email is success', async() => {
      const user = await factory.create('User',{user_type_name: 'Customer', user_type_id: null,
        temp_email: faker.internet.email()});
      const accessToken = await app.AccessToken.create({
        userId: user.id,
        ttl: 3600,
      });
      const header = { authorization: accessToken.id };
      const customerService = new CustomerService(user.id);
      customerService.updateEmail(header, ( err, result ) => {
        assert.isNotNull(result, 'Email updated successfully');
      });
    });
    it('Invalid token error', async() => {
      const user = await factory.create('User',{user_type_name: 'Customer',user_type_id: null});
      const accessToken = await app.AccessToken.create({
        userId: user.id,
        ttl: 3600,
      });
      const header = { authorization: accessToken.userId };
      const customerService = new CustomerService();
      customerService.updateEmail(header, ( err, result ) => {
        assert.isNotNull(err, 'Invalid user error');
      });
    });
    it('Invalid user error', async() => {
      const user = await factory.create('User',{user_type_name: 'Customer',user_type_id: null});
      const accessToken = await app.AccessToken.create({
        userId: null,
        ttl: 3600,
      });
      const header = { authorization: accessToken.id };
      const customerService = new CustomerService();
      customerService.updateEmail(header, ( err, result ) => {
        assert.isNotNull(err, 'Invalid user error');
      });
    });
  });
});
