
const factory = require('factory-girl').factory;
const LoopbackAdapter = require('./loopback-adapter.js');
const faker = require('faker/locale/en_IND');
const app = require('../server/server.js');

factory.setAdapter(new LoopbackAdapter());

factory.define('Manufacturer', app.models.Manufacturer, {
  name:  () => faker.name.findName(),
  slug: () => faker.name.findName(),
  display_name: () => faker.name.findName().toLowerCase(),
  office_address:() => faker.address.city()
});

factory.define('Accessory', app.models.Accessory, {
  manufacturer_id: factory.assoc('Manufacturer', 'id'),
  name: () => faker.name.findName(),
  item_code: faker.lorem.words(),
  price: faker.random.number(),
  sgst_price: faker.random.number(),
  cgst_price: faker.random.number(),
  is_mandatory: false
});

factory.define('DealerAccessory', app.models.DealerAccessory, {
  name: () => faker.name.findName(),
  manufacturer_id: factory.assoc('Manufacturer', 'id'),
  accessory_id: factory.assoc('Accessory', 'id'),
  dealer_id: factory.assoc('Dealer', 'id'),
  price: faker.random.number(),
  sgst_price: faker.random.number(),
  cgst_price: faker.random.number()
});

factory.define('Lead', app.models.Lead, {
  name:  () => faker.name.findName(),
  mobile_number: () => faker.phone.phoneNumber(),
  gender: 'male',
  origin: () => faker.internet.domainWord(),
  type: () => faker.lorem.words(),
  category: 'NEW',
  status: 200,                   // status-code of new lead
  search_criteria_type: () => faker.lorem.words(),
  search_criteria_budget: () => faker.random.number(),
  location: () => faker.address.city(),
  country_id: factory.assoc('Country', 'id'),
  dealer_id :() => factory.assoc('Dealer', 'id'),
  manufacturer_id :() => factory.assoc('Manufacturer', 'id'),
  zone_id :() => factory.assoc('Zone', 'id'),
  state_id :() => factory.assoc('State', 'id'),
  city_id :() => factory.assoc('City', 'id'),
  dealer_category_id :() => factory.assoc('DealerCategory', 'id'),
});

factory.define('LeadDetail', app.models.LeadDetail, {
  test_ride_on: new Date(),
  vehicle_status: 200,
  manufacturer_id: factory.assoc('Manufacturer', 'id'),
  dealer_id: factory.assoc('Dealer', 'id'),
  lead_id: factory.assoc('Lead', 'id'),
  vehicle_id: factory.assoc('Vehicle', 'id'),
  variant_id: factory.assoc('Variant', 'id'),
  proforma_invoice_id: factory.assoc('ProformaInvoice', 'id'),
});

factory.define('User', app.models.Users, {
  first_name:  () => faker.name.firstName(),
  last_name: () => faker.name.lastName(),
  email: () => faker.internet.email(),
  username: () => faker.internet.userName(),
  mobile_no: () => faker.phone.phoneNumber(),
  gender: 'male',
  is_active: true,
  user_type_name: 'Dealer',
  password: "test1234",
  zone_id : factory.assoc('Zone', 'id'),
  state_id : factory.assoc('State', 'id'),
  city_id : factory.assoc('City', 'id'),
  country_id: factory.assoc('Country', 'id'),
});

factory.define('Region', app.models.Region, {
  name: () => faker.address.city(),
});

factory.define('DealerCategory', app.models.DealerCategory, {
  name: () => faker.name.title(),
  manufacturer_id: factory.assoc('Manufacturer', 'id'),
});

factory.define('Dealer', app.models.Dealer, {
  name: () => faker.name.findName(),
  dealer_code: () => faker.name.findName(),
  address_line_1: () => faker.address.streetAddress(),
  address_line_2: () => faker.address.secondaryAddress(),
  city: () => faker.address.city(),
  pincode: 600033,
  landline_no: () => faker.phone.phoneNumber(),
  mobile_no: () => faker.phone.phoneNumber(),
  gst_number: () => faker.random.number(),
  pan_number: () => faker.random.number(),
  external_id: 123456789,
  is_active: true,
  dealer_category_id: factory.assoc('DealerCategory', 'id'),
  manufacturer_id: factory.assoc('Manufacturer', 'id'),
  region_id: factory.assoc('Region', 'id'),
  state_id: factory.assoc('State', 'id'),
  zone_id: factory.assoc('Zone', 'id'),
  city_id: factory.assoc('City', 'id'),
  country_id: factory.assoc('Country', 'id'),
  monday_friday_start: "10:00",
  monday_friday_end: "18:00",
  saturday_start: "10:00",
  saturday_end: "16:00",
  sunday_start: "10:00",
  sunday_end: "12:00",
  weekly_holiday: 'Monday'
});

factory.define('Variant', app.models.Variant, {
  name: faker.name.firstName(),
  is_active: true,
});

factory.define('VehicleGallery', app.models.VehicleGallery, {
  variant_id: factory.assoc('Variant', 'id'),
});

factory.define('TestRideVehicle', app.models.TestRideVehicle, {
  variant_id: factory.assoc('Variant', 'id'),
  manufacturer_id: factory.assoc('Manufacturer', 'id'),
});

factory.define('Vehicle', app.models.Vehicle, {
  name: () => faker.commerce.productName(),
  slug: () => faker.commerce.productName().toLowerCase(),
  type: 0,
  slug: () => faker.name.findName(),
  dealer_id: factory.assoc('Dealer', 'id'),
  manufacturer_id: factory.assoc('Manufacturer', 'id'),
});

factory.define('UserRole', app.models.UserRole, {
  principalType: 'USER',
});

factory.define('Role', app.models.Roles, {
  description: 'Role assigned to a financier-manager',
});

factory.define('AccessToken', app.models.AccessToken, {
  userId: factory.assoc('User', 'id'),
  ttl: 129600,
});

factory.define('Country', app.models.Country, {
  name:  () => faker.name.firstName(),
});

factory.define('Zone', app.models.Zone, {
  name:  () => faker.name.firstName(),
  country_id: factory.assoc('Country', 'id'),
  manufacturer_id: factory.assoc('Manufacturer', 'id'),
});

factory.define('State', app.models.State, {
  name: () => faker.address.state(),
  zone_id: factory.assoc('Zone', 'id'),
  country_id: factory.assoc('Country', 'id'),
});

factory.define('City', app.models.City, {
  name: () => faker.address.city(),
  state_id: factory.assoc('State', 'id'),
  zone_id: factory.assoc('Zone', 'id'),
  country_id: factory.assoc('Country', 'id'),
});

factory.define('Financier', app.models.Financier, {
  name: () => faker.name.firstName(),
  email_id: () => faker.internet.email(),
  slug: () => faker.name.firstName().toLowerCase(),
  email_id: () => faker.internet.email(),
  office_address: () => faker.address.city()
});

factory.define('FinancierInterestDetail', app.models.FinancierInterestDetail, {
  vehicle_type: 0,
  income_status: 0,
  domicile_status: 0,
  vehicle_value_range: 0,
  loan_to_value: 85,
  down_payment_value: 15,
  tenure: 12,
  advance_emi: 0,
  rate_of_interest: 15.5
})

factory.define('ManufacturerFinancier', app.models.ManufacturerFinancier, {
  order: 1,
  manufacturer_id: factory.assoc('Manufacturer', 'id'),
  financier_id: factory.assoc('Financier', 'id')
});

factory.define('ManufacturerFinancierOrder', app.models.ManufacturerFinancierOrder, {
  order: 1,
  manufacturer_id: factory.assoc('Manufacturer', 'id'),
  financier_id: factory.assoc('Financier', 'id')
});

factory.define('VariantColor', app.models.VariantColour, {
  color: () => faker.commerce.color(),
  color_code: () => faker.commerce.color(),
});

factory.define('DealerInventory', app.models.DealerInventory, {
  stock_available: 2,
  vehicle_id: factory.assoc('Vehicle', 'id'),
  variant_id: factory.assoc('Variant', 'id'),
  variant_colours_id: factory.assoc('VariantColor', 'id'),
  dealer_id: factory.assoc('Dealer', 'id')
});

factory.define('DealerVehicle', app.models.DealerVehicle, {
  dealer_id: factory.assoc('Dealer', 'id'),
  vehicle_id: factory.assoc('Vehicle', 'id'),
  incentive_amount: () => faker.random.number(),
  offer: () => faker.lorem.words(),
  test_ride_vehicle: () => faker.random.number(),
});

factory.define('DealerFinancier', app.models.DealerFinancier, {
  dealer_id: factory.assoc('Dealer', 'id'),
  financier_id: factory.assoc('Financier', 'id'),
  manufacturer_id: factory.assoc('Manufacturer', 'id'),
});

factory.define('ProformaInvoice', app.models.ProformaInvoice, {
  dealer_id: factory.assoc('Dealer', 'id'),
  lead_id: factory.assoc('Lead', 'id'),
  vehicle_id: factory.assoc('Vehicle', 'id'),
});

factory.define('VehiclePrice', app.models.VehiclePrice, {
  vehicle_id: factory.assoc('Vehicle', 'id'),
  variant_id: factory.assoc('Variant', 'id'),
  variant_colours_id: factory.assoc('VariantColor', 'id'),
  manufacturer_id: factory.assoc('Manufacturer', 'id'),
  dealer_id: factory.assoc('Dealer', 'id'),
  ex_showroom_price: "405.00",
  rto_charges: () => faker.commerce.price(),
  onroad_price: () => faker.commerce.price(),
});

factory.define('ManufacturerTarget', app.models.ManufacturerTarget, {
 vehicle_id: factory.assoc('Vehicle', 'id'),
 dealer_category_id: factory.assoc('DealerCategory', 'id'),
 manufacturer_id: factory.assoc('Manufacturer', 'id'),
 dealer_id: factory.assoc('Dealer', 'id'),
 state_id: factory.assoc('State', 'id'),
 zone_id: factory.assoc('Zone', 'id'),
 city_id: factory.assoc('City', 'id'),
 country_id: factory.assoc('Country', 'id'),
 total_count: 10,
 target: 20
});

factory.define('ProformaInvoiceOffer', app.models.ProformaInvoiceOffer, {
  name:  () => faker.name.firstName(),
  type: () => faker.lorem.words(),
  amount: () => faker.random.number(),
});

factory.define('ProformaInvoiceAccessory', app.models.ProformaInvoiceAccessory, {
  name:  () => faker.name.firstName(),
  price: () => faker.commerce.price(),
  sgst_price: () => faker.commerce.price(),
  cgst_price: () => faker.commerce.price(),
  is_mandatory: false,
  is_available: true,
});

factory.define('DealerTarget', app.models.DealerTarget, {
 achieved_value: 10,
 target_value: 20
});

factory.define('LostReason', app.models.LostReason, {
  category:  () => faker.name.firstName(),
  reason: faker.lorem.words(),
});

factory.define('FollowUp', app.models.FollowUp, {
  comment: faker.lorem.words(),
});

factory.define('FinancierBranch', app.models.FinancierBranch, {
  financier_id: factory.assoc('Financier', 'id'),
  state_id: factory.assoc('State', 'id'),
  zone_id: factory.assoc('Zone', 'id'),
  city_id: factory.assoc('City', 'id'),
  financier_city_head_id: factory.assoc('User', 'id'),
  name:  () => faker.name.findName(),
  contact: () => faker.phone.phoneNumber(),
  address: () => faker.address.city(),
});

factory.define('FinancierDealer', app.models.FinancierDealer, {
  financier_id: factory.assoc('Financier', 'id'),
  state_id: factory.assoc('State', 'id'),
  zone_id: factory.assoc('Zone', 'id'),
  city_id: factory.assoc('City', 'id'),
  owned_by: factory.assoc('User', 'id'),
  dealer_id: factory.assoc('Dealer', 'id'),
  from_date: new Date(),
});

factory.define('FinancierTeam', app.models.FinancierTeam, {
  name:  () => faker.name.findName(),
  from_date: new Date(),
  to_date: null,
  financier_id: factory.assoc('Financier', 'id'),
  state_id: factory.assoc('State', 'id'),
  zone_id: factory.assoc('Zone', 'id'),
  city_id: factory.assoc('City', 'id'),
  user_id: factory.assoc('User', 'id'),
});

factory.define('FinancierTeamMember', app.models.FinancierTeamMember, {
  name:  () => faker.name.findName(),
  financier_id: factory.assoc('Financier', 'id'),
  financier_team_id: factory.assoc('FinancierTeam', 'id'),
  state_id: factory.assoc('State', 'id'),
  zone_id: factory.assoc('Zone', 'id'),
  city_id: factory.assoc('City', 'id'),
  user_id: factory.assoc('User', 'id'),
});

factory.define('FinancierLead', app.models.FinancierLead, {
  name:  () => faker.name.findName(),
  gender: 'male',
  status: 200,
  tenure: 12,
  mobile_number: faker.phone.phoneNumber(),
  emi: 120,               // status-code of new lead
  dealer_id: factory.assoc('Dealer', 'id'),
  financier_id: factory.assoc('Financier', 'id'),
  financier_team_id: factory.assoc('FinancierTeam', 'id'),
  state_id: factory.assoc('State', 'id'),
  zone_id: factory.assoc('Zone', 'id'),
  city_id: factory.assoc('City', 'id'),
  user_id: factory.assoc('User', 'id'),
  assigned_to: factory.assoc('User', 'id'),
  lead_id: factory.assoc('Lead', 'id'),
});

factory.define('FinancierTarget', app.models.FinancierTarget, {
  name:  () => faker.name.findName(),
  from: new Date(),
  to: null,
  target_value: 10,
  incentive_eligibility: 10,
  incentive_earned: 0,
  financier_id: factory.assoc('Financier', 'id'),
  financier_team_id: factory.assoc('FinancierTeam', 'id'),
  user_id: factory.assoc('User', 'id'),
});

factory.define('FinancierIncentive', app.models.FinancierIncentive, {
  name:  () => faker.name.findName(),
  from_date: new Date(),
  to_date: null,
  incentive_amount: 100,
  financier_id: factory.assoc('Financier', 'id'),
  city_id: factory.assoc('City', 'id'),
});

factory.define('LeadActivity', app.models.LeadActivity, {
  comment: faker.lorem.words(),
});

factory.define('Document', app.models.Document, {
  name: 'pan-card',
  url: faker.internet.url(),
  is_osv_verified: false,
});

factory.define('ExchangeVehicle', app.models.ExchangeVehicle, {
  status: 'Active',
});

module.exports = factory;
