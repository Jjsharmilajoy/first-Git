const chai = require('chai');
const expect = chai.expect;
const assert = chai.assert;
const sinon = require('sinon');
const factory = require('../factory.js');
const InstabikeError = require('../../server/error/instabike_error');
const DealerInventoryService = require('../../server/services/dealer_inventory_service.js');

describe('DealerInventoryService', () => {
  describe('fetchDealerInventoryDetails', () => {
    it('returns the list of dealers inventory based on the vehicles', async() => {
      const manufacturer = await factory.create('Manufacturer');
      const vehicle = await factory.create('Vehicle', {manufacturer_id: manufacturer.id});
      const variant = await factory.create('Variant', {vehicle_id: vehicle.id});
      const vehicleColor = await factory.create('VehiclePrice', {vehicle_id: vehicle.id, variant_id: variant.id});
      const dealer = await factory.create('Dealer', {manufacturer_id: manufacturer.id});
      const managerUser = await factory.create('User', { user_type_id: dealer.id });
      const managerRole = await factory.create('Role', { name: 'DEALER_MANAGER' });
      const managerUserRole = await factory.create('UserRole', { user_id: managerUser.id, role_id: managerRole.id });
      const dealerInventory = await factory.create('DealerInventory', {vehicle_id: vehicle.id, dealer_id: dealer.id});
      const dealerVehicle = await factory.create('DealerVehicle', {vehicle_id: vehicle.id, dealer_id: dealer.id});
      const dealerInventoryService = new DealerInventoryService(dealer.id);
      dealerInventoryService.getInventoryDetails(managerUser, (fetchError, dealerInventory) => {
        expect(dealerInventory).to.not.be.null;
      });
    });

    it('returns error, coz dealer id not set', async () => {
      const dealer =  await factory.create('Dealer');
      const managerUser = await factory.create('User', { user_type_id: dealer.id });
      const managerRole = await factory.create('Role', { name: 'DEALER_MANAGER' });
      const managerUserRole = await factory.create('UserRole', { user_id: managerUser.id, role_id: managerRole.id });
      const dealerInventoryService = new DealerInventoryService();
      dealerInventoryService.getInventoryDetails(managerUser, (fetchError, dealerInventory) => {
        expect(fetchError).to.not.be.null;
      });
    });
  });

  describe('getStocks', () => {
    it('returns vehicle stock details', async () => {
      const dealerInventory = await factory.create('DealerInventory');
      const dealerInventoryService = new DealerInventoryService(dealerInventory.dealer_id);
      dealerInventoryService.getStocks(dealerInventory.variant_id, (err, result) => {
        assert.isNotNull(result, 'Vehicle stock found');
      });
    });
    it('returns empty vehicle stock details without vehicle id', async () => {
      const dealerInventory = await factory.create('DealerInventory');
      const dealerInventoryService = new DealerInventoryService();
      dealerInventoryService.getStocks(dealerInventory.variant_id, (err, result) => {
        assert.isNotNull(err, 'Dealer id not found');
      });
    });
    it('returns empty vehicle stock details with vehicle id', async () => {
      const dealerInventory = await factory.create('DealerInventory');
      const dealerInventoryService = new DealerInventoryService(dealerInventory.id);
      dealerInventoryService.getStocks(dealerInventory.variant_id, (err, result) => {
        assert.isNotNull(err, 'Vehicle stock not found');
      });
    });
  });

  describe('fetchDealerVehicleDetails', () => {
    it('returns the dealer vehicles based on dealer id and vehicle id', async() => {
      const manufacturer = await factory.create('Manufacturer');
      const vehicle = await factory.create('Vehicle', {manufacturer_id: manufacturer.id});
      const dealer = await factory.create('Dealer', {manufacturer_id: manufacturer.id});
      const managerUser = await factory.create('User', { user_type_id: dealer.id });
      const managerRole = await factory.create('Role', { name: 'DEALER_MANAGER' });
      const managerUserRole = await factory.create('UserRole', { user_id: managerUser.id, role_id: managerRole.id });
      const dealerVehicle = await factory.create('DealerVehicle', {vehicle_id: vehicle.id, dealer_id: dealer.id});

      const dealerInventoryService = new DealerInventoryService(dealer.id);
      dealerInventoryService.getVehicleInventoryDetails(vehicle.id, managerUser, (fetchError, dealerVehicle) => {
        expect(dealerVehicle).to.not.be.null;
      });
    });

    it('returns error, coz vehicle id not set', async () => {
      const dealer =  await factory.create('Dealer');
      const managerUser = await factory.create('User', { user_type_id: dealer.id });
      const dealerInventoryService = new DealerInventoryService(dealer.id);
      dealerInventoryService.getVehicleInventoryDetails(null, managerUser, (fetchError, dealerInventory) => {
        expect(fetchError).to.not.be.null;
      });
    });
  });

  describe('updateStocks', () => {
    it('returns updated vehicle stocks', async () => {
      const dealerInventory = await factory.create('DealerInventory');
      const variantColor = await factory.create('VariantColor');
      const dealerInventoryService = new DealerInventoryService();
      const data = [{"stock_available": "10", "dealer_id":dealerInventory.dealer_id,
      "variant_id": dealerInventory.variant_id,"variant_colours_id":dealerInventory.variant_colours_id},
      {"stock_available": "100", "dealer_id":dealerInventory.dealer_id,
      "variant_id": dealerInventory.variant_id,"variant_colours_id":variantColor.id}];
      dealerInventoryService.updateStocks(data, (err, result) => {
        assert.equal(result[0].dealer_id, dealerInventory.dealer_id, 'Vehicle stock updated');
      });
    });
    it('returns updated vehicle stocks', async () => {
      const dealerInventory = await factory.create('DealerInventory');
      const dealerInventoryService = new DealerInventoryService();
      const data = [{"stock_available": "10", "dealer_id":dealerInventory.dealer_id,
      "variant_id": dealerInventory.dealer_id,"variant_colours_id":dealerInventory.variant_colours_id},
      {"stock_available": "100", "dealer_id":dealerInventory.dealer_id,
      "variant_id": dealerInventory.variant_id,"variant_colours_id":dealerInventory.variant_id}];
      dealerInventoryService.updateStocks(data, (err, result) => {
        assert.isNotNull(err, 'Vehicle stock not updated');
      });
    });
    it('returns empty vehicle stock details with vehicle id', async () => {
      const dealerInventory = await factory.create('DealerInventory');
      const dealerInventoryService = new DealerInventoryService();
      const data = [{"stock_available": "10"}, {"stock_available": "100"}];
      dealerInventoryService.updateStocks(data, (err, result) => {
        assert.isNotNull(err, 'Vehicle stock not updated');
      });
    });
  });

  describe('getPriceAndStock', () => {
    it('returns stocks and price based on variant and dealer id', async () => {
      const dealer =  await factory.create('Dealer');
      const managerUser = await factory.create('User', { user_type_id: dealer.id });
      const managerRole = await factory.create('Role', { name: 'DEALER_MANAGER' });
      const managerUserRole = await factory.create('UserRole', { user_id: managerUser.id, role_id: managerRole.id });
      const dealerInventory = await factory.create('DealerInventory', { dealer_id: dealer.id });
      const variantColor = await factory.create('VariantColor');
      const dealerInventoryService = new DealerInventoryService(dealerInventory.dealer_id);
      const data = [{"stock_available": "10", "dealer_id":dealerInventory.dealer_id,
      "variant_id": dealerInventory.variant_id,"variant_colours_id":dealerInventory.variant_colours_id},
      {"stock_available": "100", "dealer_id":dealerInventory.dealer_id,
      "variant_id": dealerInventory.variant_id,"variant_colours_id":variantColor.id}];
      dealerInventoryService.updateStocks(data, (err, result) => {
        dealerInventoryService.getVariantInventoryDetail(managerUser, dealerInventory.vehicle_id, dealerInventory.variant_id, (fetchError, dealerInventory) => {
          expect(fetchError).to.not.be.null;
        });
      });
    });
  });
});
