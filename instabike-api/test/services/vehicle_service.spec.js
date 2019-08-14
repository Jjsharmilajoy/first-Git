const chai = require('chai');
const assert = chai.assert;
const factory = require('../factory.js');

const VehicleService = require('../../server/services/vehicle_service.js');

describe('Vehicleservice', () => {
  describe('getThreeSixtyDegree', () => {
    it('returns list of vehicle gallery', async () => {
      const vehicle = await factory.create('Vehicle');
      const variant = await factory.create('Variant', { id: vehicle.id});
      const variantColors = await factory.create('VariantColor', { vehicle_id: vehicle.id, variant_id: variant.id });
      const vehicleGallery = await factory.createMany('VehicleGallery', 15, {is_three_sixty: true, vehicle_id: vehicle.id, variant_id: variant.id, variant_colour_id: variantColors.id});
      const vehicleService = new VehicleService(vehicle.id);
      vehicleService.getThreeSixtyDegree((err, result) => {
        assert.equal(result[0].vehicle_id,vehicle.id,'Three sixty images found');
      });
    });
    it('returns empty vehicle gallery list', async () => {
      const vehicle = await factory.create('Vehicle');
      const variant = await factory.create('Variant', { id: vehicle.id});
      const variantColors = await factory.create('VariantColor', { vehicle_id: vehicle.id, variant_id: variant.id });
      const vehicleGallery = await factory.createMany('VehicleGallery', 15, {is_three_sixty: false, vehicle_id: vehicle.id, variant_id: variant.id, variant_colour_id: variantColors.id});
      const vehicleService = new VehicleService(vehicle.id);
      vehicleService.getThreeSixtyDegree((err, result) => {
          assert.notInclude(vehicleGallery,result,'Three sixty images not found');
      });
    });
  })
  describe('getVariantDetail', async() => {
    it('1.variant detail along with price and color details', async() => {
      const manufacture = await factory.create('Manufacturer');
      const dealer = await factory.create('Dealer');
      const vehicle = await factory.create('Vehicle');
      const variant = await factory.create('Variant', { vehicle_id: vehicle.id });
      const variantColor = await factory.create('VariantColor', { vehicle_id: vehicle.id, variant_id: variant.id });
      const VehiclePrice = await factory.create('VehiclePrice', { dealer_id: dealer.id, vehicle_id: vehicle.id, variant_id: variant.id })
      const vehicleService = new VehicleService(vehicle.id, null, variant.id);
      vehicleService.getVariantDetail(dealer.id, (err,result) => {
        assert.equal(result[0].vehicle_id, vehicle.id,'vehicle found');
      });
    });
    it('2.variant detail not available for the respective input', async() => {
      const manufacture = await factory.create('Manufacturer');
      const dealer = await factory.create('Dealer');
      const vehicle = await factory.create('Vehicle');
      const variant = await factory.create('Variant', { vehicle_id: vehicle.id });
      const variantColor = await factory.create('VariantColor', { vehicle_id: vehicle.id, variant_id: variant.id });
      const VehiclePrice = await factory.create('VehiclePrice', { dealer_id: dealer.id, vehicle_id: vehicle.id, variant_id: variant.id })
      const vehicleService = new VehicleService(null, null, variant.id);
      vehicleService.getVariantDetail(dealer.id, (err,result) => {
        assert.equal(result.length,0,'vehicle not found');
      });
    });
  });

  describe('getVehiclePrice', () => {
    it('returns vehicle price details', async () => {
      const vehiclePrice = await factory.create('VehiclePrice');
      const vehicleService = new VehicleService(vehiclePrice.vehicle_id);
      vehicleService.getVehiclePrice(vehiclePrice.dealer_id, vehiclePrice.variant_id, (err, result) => {
        assert.equal(result.variant_id, vehiclePrice.variant_id, 'Vehicle price found');
      });
    });
    it('returns empty vehicle price details without vehicle id', async () => {
      const vehiclePrice = await factory.create('VehiclePrice');
      const vehicleService = new VehicleService();
      vehicleService.getVehiclePrice(vehiclePrice.dealer_id, vehiclePrice.variant_id, (err, result) => {
        assert.isNotNull(err, 'Vehicle id not found');
      });
    });
    it('returns empty vehicle price details with vehicle id', async () => {
      const vehiclePrice = await factory.create('VehiclePrice');
      const vehicleService = new VehicleService(vehiclePrice.id);
      vehicleService.getVehiclePrice(vehiclePrice.dealer_id, vehiclePrice.variant_id, (err, result) => {
        assert.isNotNull(err, 'Vehicle price not found');
      });
    });
  });

  describe('getVehicleDetail', () => {
    it('returns vehicle details including price, feature, variant and colors', async () => {
      const dealer = await factory.create('Dealer');
      const vehicle = await factory.create('Vehicle', { dealer_id: dealer.id });
      const managerUser = await factory.create('User', { user_type_id: dealer.id });
      const managerRole = await factory.create('Role', { name: 'DEALER_MANAGER' });
      const managerUserRole = await factory.create('UserRole', { user_id: managerUser.id, role_id: managerRole.id });
      const vehicleService = new VehicleService(vehicle.id);
      vehicleService.getVehicleDetail(managerUser, (err, result) => {
        assert.isNotNull(result, 'Vehicle details found');
      });
    });
    it('returns vehicle not found error', async () => {
      const dealer = await factory.create('Dealer');
      const vehicle = await factory.create('Vehicle', { dealer_id: dealer.id });
      const managerUser = await factory.create('User', { user_type_id: dealer.id });
      const managerRole = await factory.create('Role', { name: 'DEALER_MANAGER' });
      const managerUserRole = await factory.create('UserRole', { user_id: managerUser.id, role_id: managerRole.id });
      const vehicleService = new VehicleService(vehicle.manufacturer_id);
      vehicleService.getVehicleDetail(managerUser, (err, result) => {
        assert.isNotNull(err, 'Vehicle not found error');
      });
    });
  });

  describe('searchVehicle', () => {
    it('returns vehicle details via search option', async () => {
      const manufacturer = await factory.create('Manufacturer');
      const vehicle = await factory.create('Vehicle', {manufacturer_id: manufacturer.id, type: 1});
      const variant = await factory.create('Variant', {vehicle_id: vehicle.id});
      const vehicleColor = await factory.create('VehiclePrice', {vehicle_id: vehicle.id, variant_id: variant.id});
      const dealer = await factory.create('Dealer', {manufacturer_id: manufacturer.id});
      const managerUser = await factory.create('User', { user_type_id: dealer.id });
      const managerRole = await factory.create('Role', { name: 'DEALER_MANAGER' });
      const managerUserRole = await factory.create('UserRole', { user_id: managerUser.id, role_id: managerRole.id });
      const dealerInventory = await factory.create('DealerInventory', {vehicle_id: vehicle.id, dealer_id: dealer.id});
      const dealerVehicle = await factory.create('DealerVehicle', {vehicle_id: vehicle.id, dealer_id: dealer.id});
      const searchOption = {"type": "1"};
      const vehicleService = new VehicleService(vehicle.manufacturer_id);
      vehicleService.searchVehicle(manufacturer.id, dealer.id, searchOption, managerUser, (err, result) => {
        assert.isNotNull(result, 'Vehicle not found error');
      });
    });
  });
});
