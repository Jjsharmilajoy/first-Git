module.exports = {
  roleModules: `update roles set module = 'Customer' where name in ('CUSTOMER');
update roles set module = 'Dealer' where name in ('DEALER_SALES', 'DEALER_MANAGER', 'DEALER_TEAM_HEAD');
update roles set module = 'Financier' where name in ('FINANCIER_SALES', 'FINANCIER_CITY_HEAD', 'FINANCIER_TEAM_HEAD');
update roles set module = 'Manufacturer' where name in ('MANUFACTURER', 'MANUFACTURER_COUNTRY_HEAD', 'MANUFACTURER_ZONE_HEAD', 'MANUFACTURER_STATE_HEAD', 'MANUFACTURER_CITY_HEAD');`,
};
