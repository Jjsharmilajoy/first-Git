const loopback = require('../../server/server.js');
const request = require('supertest');
const chai = require('chai');
const expect = chai.expect;
const assert = chai.assert;
const factory = require('../factory.js');
const faker = require('faker/locale/en_IND');

const app = loopback.dataSources.postgres.models;

describe('ProformaInvoice', () => {

  describe('POST /api/ProformaInvoices/{proformaInvoiceId}/proformaInvoiceOffer/create', () => {
    it('save proforma invoice offer', async () => {
      const dealer =  await factory.create('Dealer');
      const customerRole = await app.Roles.findOne( { where: { name: 'CUSTOMER' } });
      const customerUser = await factory.create('User', { user_type_id: dealer.id, user_type_name: 'Customer', mobile_no: '9876541238', password: 'test1234'});
      const customerUserRole = await factory.create('UserRole', { user_id: customerUser.id, role_id: customerRole.id  });
      const vehicle = await factory.create('Vehicle', { manufacturer_id: dealer.manufacturer_id});
      const variant = await factory.create('Variant', { vehicle_id: vehicle.id});
      const variantColour = await factory.create('VariantColor', { variant_id: variant.id, vehicle_id: vehicle.id});
      const vehiclePrice = await factory.create('VehiclePrice', {manufacturer_id: dealer.manufacturer_id, dealer_id: dealer.id, variant_id: variant.id, vehicle_id: vehicle.id, variant_colours_id: variantColour.id})
      const lead = await factory.create('Lead', { mobile_number: '9876541238', dealer_id: dealer.id, user_id: customerUser.id});
      const leadDetail = await factory.create('LeadDetail', {manufacturer_id: dealer.manufacturer_id,dealer_id: dealer.id, lead_id: lead.id, vehicle_id: vehicle.id, variant_id: variant.id});
      const proforomaInvoiceObj = await factory.create('ProformaInvoice',{manufacturer_id: dealer.manufacturer_id,dealer_id: dealer.id, lead_id: lead.id, vehicle_id: vehicle.id, variant_id: variant.id, variant_colour_id: variantColour.id, lead_detail_id:leadDetail.id});
      leadDetail.proforma_invoice_id = proforomaInvoiceObj.id;
      await app.LeadDetail.upsert(leadDetail);
      const proformaInvoiceOffer = await factory.build('ProformaInvoiceOffer', { proforma_invoice_id: proforomaInvoiceObj.id});
      const accesstoken = await factory.create('AccessToken');
      request(loopback)
        .post('/api/ProformaInvoices/'+proforomaInvoiceObj.id+'/proformaInvoiceOffer/create')
        .set('Accept', 'application/json')
        .set('Authorization', accesstoken.id)
        .send(proformaInvoiceOffer)
        .expect(200)
        .end((err, res) => {
          assert.equal(res.body.proformaInvoice.proforma_invoice_offer[0].proforma_invoice_id, proforomaInvoiceObj.id, 'offer added');
        });
    });
  });

  describe('delete /ProformaInvoices/{proformaInvoiceId}/proformaInvoiceOffer/{proformaInvoiceOfferId}/delete', () => {
    it('delete proforma invoice offer', async () => {
      const dealer =  await factory.create('Dealer');
      const customerRole = await app.Roles.findOne( { where: { name: 'CUSTOMER' } });
      const customerUser = await factory.create('User', { user_type_id: dealer.id, user_type_name: 'Customer', mobile_no: '9876541230', password: 'test1234'});
      const customerUserRole = await factory.create('UserRole', { user_id: customerUser.id, role_id: customerRole.id  });
      const vehicle = await factory.create('Vehicle', { manufacturer_id: dealer.manufacturer_id});
      const variant = await factory.create('Variant', { vehicle_id: vehicle.id});
      const variantColour = await factory.create('VariantColor', { variant_id: variant.id, vehicle_id: vehicle.id});
      const vehiclePrice = await factory.create('VehiclePrice', {manufacturer_id: dealer.manufacturer_id, dealer_id: dealer.id, variant_id: variant.id, vehicle_id: vehicle.id, variant_colours_id: variantColour.id})
      const lead = await factory.create('Lead', { mobile_number: '9876541230', dealer_id: dealer.id, user_id: customerUser.id});
      const leadDetail = await factory.create('LeadDetail', {manufacturer_id: dealer.manufacturer_id,dealer_id: dealer.id, lead_id: lead.id, vehicle_id: vehicle.id, variant_id: variant.id});
      const proforomaInvoiceObj = await factory.create('ProformaInvoice',{manufacturer_id: dealer.manufacturer_id,dealer_id: dealer.id, lead_id: lead.id, vehicle_id: vehicle.id, variant_id: variant.id, variant_colour_id: variantColour.id, lead_detail_id:leadDetail.id});
      leadDetail.proforma_invoice_id = proforomaInvoiceObj.id;
      await app.LeadDetail.upsert(leadDetail);
      const proformaInvoiceOffer = await factory.create('ProformaInvoiceOffer', { proforma_invoice_id: proforomaInvoiceObj.id});
      const accesstoken = await factory.create('AccessToken');
      request(loopback)
        .del('/api/ProformaInvoices/'+proforomaInvoiceObj.id+'/proformaInvoiceOffer/'+proformaInvoiceOffer.id+'/delete')
        .set('Accept', 'application/json')
        .set('Authorization', accesstoken.id)
        .send(proformaInvoiceOffer)
        .expect(200)
        .end((err, res) => {
          assert.equal(res.body.proformaInvoice.proforma_invoice_offer.length, 0, 'offer deleted');
        });
    });
  });

  describe('put /api/ProformaInvoices/{proformainvoiceid}/proformaInvoiceAccessories', () => {
    it('save proforma invoice accessories', async () => {
      const dealer =  await factory.create('Dealer');
      const customerRole = await app.Roles.findOne( { where: { name: 'CUSTOMER' } });
      const customerUser = await factory.create('User', { user_type_id: dealer.id, user_type_name: 'Customer', mobile_no: '9876541230', password: 'test1234'});
      const customerUserRole = await factory.create('UserRole', { user_id: customerUser.id, role_id: customerRole.id  });
      const vehicle = await factory.create('Vehicle', { manufacturer_id: dealer.manufacturer_id});
      const variant = await factory.create('Variant', { vehicle_id: vehicle.id});
      const variantColour = await factory.create('VariantColor', { variant_id: variant.id, vehicle_id: vehicle.id});
      const vehiclePrice = await factory.create('VehiclePrice', {manufacturer_id: dealer.manufacturer_id, dealer_id: dealer.id, variant_id: variant.id, vehicle_id: vehicle.id, variant_colours_id: variantColour.id})
      const lead = await factory.create('Lead', { mobile_number: '9876541230', dealer_id: dealer.id, user_id: customerUser.id});
      const leadDetail = await factory.create('LeadDetail', {manufacturer_id: dealer.manufacturer_id,dealer_id: dealer.id, lead_id: lead.id, vehicle_id: vehicle.id, variant_id: variant.id});
      const proforomaInvoiceObj = await factory.create('ProformaInvoice',{manufacturer_id: dealer.manufacturer_id,dealer_id: dealer.id, lead_id: lead.id, vehicle_id: vehicle.id, variant_id: variant.id, variant_colour_id: variantColour.id, lead_detail_id:leadDetail.id});
      const proformaInvoiceOffer = await factory.create('ProformaInvoiceOffer', { proforma_invoice_id: proforomaInvoiceObj.id});
      leadDetail.proforma_invoice_id = proforomaInvoiceObj.id;
      await app.LeadDetail.upsert(leadDetail);
      const accessories = await factory.create('Accessory', {dealer_id: dealer.id, manufacturer_id: dealer.manufacturer_id, vehicle_id: vehicle.id,});
      const dealerAccesory = await factory.create('DealerAccessory',{dealer_id: dealer.id, manufacturer_id: dealer.manufacturer_id, vehicle_id: vehicle.id, accessory_id:accessories.id});
      const accesstoken = await factory.create('AccessToken');
      request(loopback)
        .put('/api/ProformaInvoices/'+proforomaInvoiceObj.id+'/proformaInvoiceAccessories')
        .set('Accept', 'application/json')
        .set('Authorization', accesstoken.id)
        .send([dealerAccesory])
        .expect(200)
        .end((err, res) => {
          assert.equal(res.body.proformaInvoice.proforma_invoice_accessory.length, 1, 'offer deleted');
        });
    });
  });

  describe('put /api/ProformaInvoices/{proformainvoiceid}/proformaInvoice', () => {
    it('update proforma invoice', async () => {
      const dealer =  await factory.create('Dealer');
      const customerRole = await app.Roles.findOne( { where: { name: 'CUSTOMER' } });
      const customerUser = await factory.create('User', { user_type_id: dealer.id, user_type_name: 'Customer', mobile_no: '9876541230', password: 'test1234'});
      const customerUserRole = await factory.create('UserRole', { user_id: customerUser.id, role_id: customerRole.id  });
      const vehicle = await factory.create('Vehicle', { manufacturer_id: dealer.manufacturer_id});
      const variant = await factory.create('Variant', { vehicle_id: vehicle.id});
      const variantColour = await factory.create('VariantColor', { variant_id: variant.id, vehicle_id: vehicle.id});
      const vehiclePrice = await factory.create('VehiclePrice', {manufacturer_id: dealer.manufacturer_id, dealer_id: dealer.id, variant_id: variant.id, vehicle_id: vehicle.id, variant_colours_id: variantColour.id})
      const lead = await factory.create('Lead', { mobile_number: '9876541230', dealer_id: dealer.id, user_id: customerUser.id});
      const leadDetail = await factory.create('LeadDetail', {manufacturer_id: dealer.manufacturer_id,dealer_id: dealer.id, lead_id: lead.id, vehicle_id: vehicle.id, variant_id: variant.id});
      const proforomaInvoiceObj = await factory.create('ProformaInvoice',{manufacturer_id: dealer.manufacturer_id,dealer_id: dealer.id, lead_id: lead.id, vehicle_id: vehicle.id, variant_id: variant.id, variant_colour_id: variantColour.id, lead_detail_id:leadDetail.id});
      const proformaInvoiceOffer = await factory.create('ProformaInvoiceOffer', { proforma_invoice_id: proforomaInvoiceObj.id});
      leadDetail.proforma_invoice_id = proforomaInvoiceObj.id;
      await app.LeadDetail.upsert(leadDetail);
      const accessories = await factory.create('Accessory', {dealer_id: dealer.id, manufacturer_id: dealer.manufacturer_id, vehicle_id: vehicle.id,});
      const dealerAccesory = await factory.create('DealerAccessory',{dealer_id: dealer.id, manufacturer_id: dealer.manufacturer_id, vehicle_id: vehicle.id, accessory_id:accessories.id});
      const customObj = {};
      customObj.dealer_id = dealer.id;
      customObj.vehicle_id = vehicle.id;
      customObj.variant_id = variant.id;
      customObj.variant_colour_id = variantColour.id;
      const accesstoken = await factory.create('AccessToken');
      request(loopback)
        .put('/api/ProformaInvoices/'+proforomaInvoiceObj.id+'/proformaInvoice')
        .set('Accept', 'application/json')
        .set('Authorization', accesstoken.id)
        .send(customObj)
        .expect(200)
        .end((err, res) => {
          assert.equal(res.body.proformaInvoice.variant_colour_id, customObj.variant_colour_id, 'proforma invoice updated');
        });
    });
  });
});
