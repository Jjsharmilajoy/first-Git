const loopback = require('../../server/server.js');
const chai = require('chai');
const assert = chai.assert;
const factory = require('../factory.js');
const ProformaInvoiceService = require('../../server/services/proforma_invoice_service.js');

const app = loopback.dataSources.postgres.models;

describe('ProformaInvoiceService',  () => {
  describe('getPriceBreakDown', () => {
    it('get vehicle price break down', async() => {
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
      const proformainvoiceService = new ProformaInvoiceService(null, lead.id, leadDetail.id);
      proformainvoiceService.getPriceBreakDown((err, result) => {
        assert.equal(result.proformaInvoice.lead_id, lead.id, 'price break down');
      });
    });
  });
  describe('createProformaInvoiceOffer', () => {
    it('add proforma invoice offer to proformaInvoice', async() => {
      const dealer =  await factory.create('Dealer');
      const customerRole = await app.Roles.findOne( { where: { name: 'CUSTOMER' } });
      const customerUser = await factory.create('User', { user_type_id: dealer.id, user_type_name: 'Customer', mobile_no: '7876541230', password: 'test1234'});
      const customerUserRole = await factory.create('UserRole', { user_id: customerUser.id, role_id: customerRole.id  });
      const vehicle = await factory.create('Vehicle', { manufacturer_id: dealer.manufacturer_id});
      const variant = await factory.create('Variant', { vehicle_id: vehicle.id});
      const variantColour = await factory.create('VariantColor', { variant_id: variant.id, vehicle_id: vehicle.id});
      const vehiclePrice = await factory.create('VehiclePrice', {manufacturer_id: dealer.manufacturer_id, dealer_id: dealer.id, variant_id: variant.id, vehicle_id: vehicle.id, variant_colours_id: variantColour.id})
      const lead = await factory.create('Lead', { mobile_number: '7876541230', dealer_id: dealer.id, user_id: customerUser.id});
      const leadDetail = await factory.create('LeadDetail', {manufacturer_id: dealer.manufacturer_id,dealer_id: dealer.id, lead_id: lead.id, vehicle_id: vehicle.id, variant_id: variant.id});
      const proforomaInvoiceObj = await factory.create('ProformaInvoice',{manufacturer_id: dealer.manufacturer_id,dealer_id: dealer.id, lead_id: lead.id, vehicle_id: vehicle.id, variant_id: variant.id, variant_colour_id: variantColour.id, lead_detail_id:leadDetail.id});
      const proformaInvoiceOffer = await factory.build('ProformaInvoiceOffer', { proforma_invoice_id: proforomaInvoiceObj.id});
      const proformaInvoiceService = new ProformaInvoiceService(proforomaInvoiceObj.id);
      proformaInvoiceService.createProformaInvoiceOffer(proformaInvoiceOffer, (err, result) => {
        assert.equal(result.proformaInvoice.lead_id, lead.id, 'offer created');
      });
    });
  });
  describe('deleteProformaInvoiceOffer', () => {
    it('delete proforma invoice offer to proformaInvoice', async() => {
      const dealer =  await factory.create('Dealer');
      const customerRole = await app.Roles.findOne( { where: { name: 'CUSTOMER' } });
      const customerUser = await factory.create('User', { user_type_id: dealer.id, user_type_name: 'Customer', mobile_no: '7876541230', password: 'test1234'});
      const customerUserRole = await factory.create('UserRole', { user_id: customerUser.id, role_id: customerRole.id  });
      const vehicle = await factory.create('Vehicle', { manufacturer_id: dealer.manufacturer_id});
      const variant = await factory.create('Variant', { vehicle_id: vehicle.id});
      const variantColour = await factory.create('VariantColor', { variant_id: variant.id, vehicle_id: vehicle.id});
      const vehiclePrice = await factory.create('VehiclePrice', {manufacturer_id: dealer.manufacturer_id, dealer_id: dealer.id, variant_id: variant.id, vehicle_id: vehicle.id, variant_colours_id: variantColour.id})
      const lead = await factory.create('Lead', { mobile_number: '7876541230', dealer_id: dealer.id, user_id: customerUser.id});
      const leadDetail = await factory.create('LeadDetail', {manufacturer_id: dealer.manufacturer_id,dealer_id: dealer.id, lead_id: lead.id, vehicle_id: vehicle.id, variant_id: variant.id});
      const proforomaInvoiceObj = await factory.create('ProformaInvoice',{manufacturer_id: dealer.manufacturer_id,dealer_id: dealer.id, lead_id: lead.id, vehicle_id: vehicle.id, variant_id: variant.id, variant_colour_id: variantColour.id, lead_detail_id:leadDetail.id});
      const proformaInvoiceOffer = await factory.build('ProformaInvoiceOffer', { proforma_invoice_id: proforomaInvoiceObj.id});
      const proformaInvoiceService = new ProformaInvoiceService(proforomaInvoiceObj.id);
      const proformInvoiceOffer = await factory.create('ProformaInvoiceOffer',{ proforma_invoice_id: proforomaInvoiceObj.id });
      proformaInvoiceService.deleteProformaInvoiceOffer(proformInvoiceOffer.id, (err, result) => {
        assert.equal(result.proformaInvoice.lead_id, lead.id, 'offer deleted');
      });
    });
  });
  describe('updateProformaInvoiceAccessories', () => {
    it('add non mandatory accessories to proforma invoice', async() => {
      const dealer =  await factory.create('Dealer');
      const customerRole = await app.Roles.findOne( { where: { name: 'CUSTOMER' } });
      const customerUser = await factory.create('User', { user_type_id: dealer.id, user_type_name: 'Customer', mobile_no: '7876541230', password: 'test1234'});
      const customerUserRole = await factory.create('UserRole', { user_id: customerUser.id, role_id: customerRole.id  });
      const vehicle = await factory.create('Vehicle', { manufacturer_id: dealer.manufacturer_id});
      const variant = await factory.create('Variant', { vehicle_id: vehicle.id});
      const variantColour = await factory.create('VariantColor', { variant_id: variant.id, vehicle_id: vehicle.id});
      const vehiclePrice = await factory.create('VehiclePrice', {manufacturer_id: dealer.manufacturer_id, dealer_id: dealer.id, variant_id: variant.id, vehicle_id: vehicle.id, variant_colours_id: variantColour.id})
      const lead = await factory.create('Lead', { mobile_number: '7876541230', dealer_id: dealer.id, user_id: customerUser.id});
      const leadDetail = await factory.create('LeadDetail', {manufacturer_id: dealer.manufacturer_id,dealer_id: dealer.id, lead_id: lead.id, vehicle_id: vehicle.id, variant_id: variant.id});
      const proforomaInvoiceObj = await factory.create('ProformaInvoice',{manufacturer_id: dealer.manufacturer_id,dealer_id: dealer.id, lead_id: lead.id, vehicle_id: vehicle.id, variant_id: variant.id, variant_colour_id: variantColour.id, lead_detail_id:leadDetail.id});
      const proformaInvoiceService = new ProformaInvoiceService(proforomaInvoiceObj.id,lead.id, leadDetail.id);
      const accessories = await factory.create('Accessory', {dealer_id: dealer.id, manufacturer_id: dealer.manufacturer_id, vehicle_id: vehicle.id,});
      const dealerAccesory = await factory.create('DealerAccessory',{dealer_id: dealer.id, manufacturer_id: dealer.manufacturer_id, vehicle_id: vehicle.id, accessory_id:accessories.id});
      proformaInvoiceService.updateProformaInvoiceAccessories([dealerAccesory], (err, result) => {
        assert.equal(result.proformaInvoice.id, proforomaInvoiceObj.id, 'accessories  created');
      });
    });
  });
  describe('updateProformaInvoice', () => {
    it('update proforma invoice', async() => {
      const dealer =  await factory.create('Dealer');
      const customerRole = await app.Roles.findOne( { where: { name: 'CUSTOMER' } });
      const customerUser = await factory.create('User', { user_type_id: dealer.id, user_type_name: 'Customer', mobile_no: '7876541230', password: 'test1234'});
      const customerUserRole = await factory.create('UserRole', { user_id: customerUser.id, role_id: customerRole.id  });
      const vehicle = await factory.create('Vehicle', { manufacturer_id: dealer.manufacturer_id});
      const variant = await factory.create('Variant', { vehicle_id: vehicle.id});
      const variantColour = await factory.create('VariantColor', { variant_id: variant.id, vehicle_id: vehicle.id});
      const vehiclePrice = await factory.create('VehiclePrice', {manufacturer_id: dealer.manufacturer_id, dealer_id: dealer.id, variant_id: variant.id, vehicle_id: vehicle.id, variant_colours_id: variantColour.id})
      const lead = await factory.create('Lead', { mobile_number: '7876541230', dealer_id: dealer.id, user_id: customerUser.id});
      const leadDetail = await factory.create('LeadDetail', {manufacturer_id: dealer.manufacturer_id,dealer_id: dealer.id, lead_id: lead.id, vehicle_id: vehicle.id, variant_id: variant.id});
      const proforomaInvoiceObj = await factory.create('ProformaInvoice',{manufacturer_id: dealer.manufacturer_id,dealer_id: dealer.id, lead_id: lead.id, vehicle_id: vehicle.id, variant_id: variant.id, variant_colour_id: variantColour.id, lead_detail_id:leadDetail.id});
      leadDetail.proforma_invoice_id = proforomaInvoiceObj.id;
      await app.LeadDetail.upsert(leadDetail);
      const proformaInvoiceService = new ProformaInvoiceService(proforomaInvoiceObj.id,lead.id, leadDetail.id);
      const customObj = {};
      customObj.dealer_id = dealer.id;
      customObj.vehicle_id = vehicle.id;
      customObj.variant_id = variant.id;
      customObj.variant_colour_id = variantColour.id;
      proformaInvoiceService.updateProformaInvoice(customObj, (err, result) => {
        assert.equal(result.proformaInvoice.id, proforomaInvoiceObj.id, 'proforma invoice updated');
      });
    });
  });
});
