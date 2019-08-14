module.exports = {
  forgienKeyConstrain: `ALTER TABLE public.accesstoken ADD CONSTRAINT accesstoken_user_id_fk FOREIGN KEY (userId) REFERENCES public.users (id) MATCH SIMPLE ON UPDATE NO ACTION ON DELETE NO ACTION;

 ALTER TABLE public.dealer_accessories ADD CONSTRAINT dealer_accessories_dealer_id_fk FOREIGN KEY (dealer_id) REFERENCES public.dealers (id) MATCH SIMPLE ON UPDATE NO ACTION ON DELETE NO ACTION;

 ALTER TABLE public.dealer_accessories ADD CONSTRAINT dealer_accessories_manufacturer_id_fk FOREIGN KEY (manufacturer_id) REFERENCES public.manufacturers (id) MATCH SIMPLE ON UPDATE NO ACTION ON DELETE NO ACTION;

 ALTER TABLE public.dealer_financiers ADD CONSTRAINT dealer_financiers_city_id_fk FOREIGN KEY (city_id) REFERENCES public.cities (id) MATCH SIMPLE ON UPDATE NO ACTION ON DELETE NO ACTION;

 ALTER TABLE public.dealer_financiers ADD CONSTRAINT dealer_financiers_state_id_fk FOREIGN KEY (state_id) REFERENCES public.states (id) MATCH SIMPLE ON UPDATE NO ACTION ON DELETE NO ACTION;

 ALTER TABLE public.dealer_financiers ADD CONSTRAINT dealer_financiers_zone_id_fk FOREIGN KEY (zone_id) REFERENCES public.zones (id) MATCH SIMPLE ON UPDATE NO ACTION ON DELETE NO ACTION;

 ALTER TABLE public.dealer_financiers ADD CONSTRAINT dealer_financiers_region_id_fk FOREIGN KEY (region_id) REFERENCES public.regions (id) MATCH SIMPLE ON UPDATE NO ACTION ON DELETE NO ACTION;

 ALTER TABLE public.dealer_financiers ADD CONSTRAINT dealer_financiers_manufacturer_id_fk FOREIGN KEY (manufacturer_id) REFERENCES public.manufacturers (id) MATCH SIMPLE ON UPDATE NO ACTION ON DELETE NO ACTION;

 ALTER TABLE public.dealer_inventories ADD CONSTRAINT dealer_inventories_vehicle_id_fk FOREIGN KEY (vehicle_id) REFERENCES public.vehicles (id) MATCH SIMPLE ON UPDATE NO ACTION ON DELETE NO ACTION;

 ALTER TABLE public.dealer_inventories ADD CONSTRAINT dealer_inventories_dealer_id_fk FOREIGN KEY (dealer_id) REFERENCES public.dealers (id) MATCH SIMPLE ON UPDATE NO ACTION ON DELETE NO ACTION;

 ALTER TABLE public.dealer_inventories ADD CONSTRAINT dealer_inventories_variant_id_fk FOREIGN KEY (variant_id) REFERENCES public.variants (id) MATCH SIMPLE ON UPDATE NO ACTION ON DELETE NO ACTION;

 ALTER TABLE public.dealer_inventories ADD CONSTRAINT dealer_inventories_variant_colours_id_fk FOREIGN KEY (variant_colours_id) REFERENCES public.variant_colours (id) MATCH SIMPLE ON UPDATE NO ACTION ON DELETE NO ACTION;

 ALTER TABLE public.dealer_inventories ADD CONSTRAINT dealer_inventories_dealer_manager_id_fk FOREIGN KEY (dealer_manager_id) REFERENCES public.users (id) MATCH SIMPLE ON UPDATE NO ACTION ON DELETE NO ACTION;

 ALTER TABLE public.dealer_metrics ADD CONSTRAINT dealer_metrics_dealer_id_fk FOREIGN KEY (dealer_id) REFERENCES public.dealers (id) MATCH SIMPLE ON UPDATE NO ACTION ON DELETE NO ACTION;

 ALTER TABLE public.dealer_metrics ADD CONSTRAINT dealer_metrics_manufacturer_id_fk FOREIGN KEY (manufacturer_id) REFERENCES public.manufacturers (id) MATCH SIMPLE ON UPDATE NO ACTION ON DELETE NO ACTION;

 ALTER TABLE public.dealer_sales_incentives ADD CONSTRAINT dealer_sales_incentives_vehicle_id_fk FOREIGN KEY (vehicle_id) REFERENCES public.vehicles (id) MATCH SIMPLE ON UPDATE NO ACTION ON DELETE NO ACTION;

 ALTER TABLE public.dealer_sales_incentives ADD CONSTRAINT dealer_sales_incentives_manufacturer_id_fk FOREIGN KEY (manufacturer_id) REFERENCES public.manufacturers (id) MATCH SIMPLE ON UPDATE NO ACTION ON DELETE NO ACTION;

 ALTER TABLE public.dealer_sales_incentives ADD CONSTRAINT dealer_sales_incentives_dealer_sales_id_fk FOREIGN KEY (dealer_sales_id) REFERENCES public.users (id) MATCH SIMPLE ON UPDATE NO ACTION ON DELETE NO ACTION;

 ALTER TABLE public.dealer_sales_incentives ADD CONSTRAINT dealer_sales_incentives_dealer_manager_id_fk FOREIGN KEY (dealer_manager_id) REFERENCES public.users (id) MATCH SIMPLE ON UPDATE NO ACTION ON DELETE NO ACTION;

 ALTER TABLE public.dealer_targets ADD CONSTRAINT dealer_targets_vehicle_id_fk FOREIGN KEY (vehicle_id) REFERENCES public.vehicles (id) MATCH SIMPLE ON UPDATE NO ACTION ON DELETE NO ACTION;

 ALTER TABLE public.dealer_targets ADD CONSTRAINT dealer_targets_dealer_id_fk FOREIGN KEY (dealer_id) REFERENCES public.dealers (id) MATCH SIMPLE ON UPDATE NO ACTION ON DELETE NO ACTION;

 ALTER TABLE public.dealer_targets ADD CONSTRAINT dealer_targets_manufacturer_id_fk FOREIGN KEY (manufacturer_id) REFERENCES public.manufacturers (id) MATCH SIMPLE ON UPDATE NO ACTION ON DELETE NO ACTION;

 ALTER TABLE public.dealer_vehicles ADD CONSTRAINT dealer_vehicles_vehicle_id_fk FOREIGN KEY (vehicle_id) REFERENCES public.vehicles (id) MATCH SIMPLE ON UPDATE NO ACTION ON DELETE NO ACTION;

 ALTER TABLE public.dealer_vehicles ADD CONSTRAINT dealer_vehicles_dealer_id_fk FOREIGN KEY (dealer_id) REFERENCES public.dealers (id) MATCH SIMPLE ON UPDATE NO ACTION ON DELETE NO ACTION;

 ALTER TABLE public.dealer_vehicles ADD CONSTRAINT dealer_vehicles_user_id_fk FOREIGN KEY (user_id) REFERENCES public.users (id) MATCH SIMPLE ON UPDATE NO ACTION ON DELETE NO ACTION;

 ALTER TABLE public.dealers ADD CONSTRAINT dealers_state_id_fk FOREIGN KEY (state_id) REFERENCES public.states (id) MATCH SIMPLE ON UPDATE NO ACTION ON DELETE NO ACTION;

 ALTER TABLE public.dealers ADD CONSTRAINT dealers_zone_id_fk FOREIGN KEY (zone_id) REFERENCES public.zones (id) MATCH SIMPLE ON UPDATE NO ACTION ON DELETE NO ACTION;

 ALTER TABLE public.dealers ADD CONSTRAINT dealers_region_id_fk FOREIGN KEY (region_id) REFERENCES public.regions (id) MATCH SIMPLE ON UPDATE NO ACTION ON DELETE NO ACTION;

 ALTER TABLE public.dealers ADD CONSTRAINT dealers_manufacturer_id_fk FOREIGN KEY (manufacturer_id) REFERENCES public.manufacturers (id) MATCH SIMPLE ON UPDATE NO ACTION ON DELETE NO ACTION;

 ALTER TABLE public.dealers ADD CONSTRAINT dealers_dealer_category_id_fk FOREIGN KEY (dealer_category_id) REFERENCES public.dealer_categories (id) MATCH SIMPLE ON UPDATE NO ACTION ON DELETE NO ACTION;

 ALTER TABLE public.exchange_vehicles ADD CONSTRAINT exchange_vehicles_dealer_id_fk FOREIGN KEY (dealer_id) REFERENCES public.dealers (id) MATCH SIMPLE ON UPDATE NO ACTION ON DELETE NO ACTION;

 ALTER TABLE public.exchange_vehicles ADD CONSTRAINT exchange_vehicles_dealer_sales_id_fk FOREIGN KEY (dealer_sales_id) REFERENCES public.users (id) MATCH SIMPLE ON UPDATE NO ACTION ON DELETE NO ACTION;

 ALTER TABLE public.exchange_vehicles ADD CONSTRAINT exchange_vehicles_proforma_invoice_id_fk FOREIGN KEY (proforma_invoice_id) REFERENCES public.proforma_invoices (id) MATCH SIMPLE ON UPDATE NO ACTION ON DELETE NO ACTION;

 ALTER TABLE public.inter_product_comparisons ADD CONSTRAINT inter_product_comparisons_vehicle_id_fk FOREIGN KEY (vehicle_id) REFERENCES public.vehicles (id) MATCH SIMPLE ON UPDATE NO ACTION ON DELETE NO ACTION;

 ALTER TABLE public.vehicles ADD CONSTRAINT vehicles_manufacturer_id_fk FOREIGN KEY (manufacturer_id) REFERENCES public.manufacturers (id) MATCH SIMPLE ON UPDATE NO ACTION ON DELETE NO ACTION;

 ALTER TABLE public.vehicle_reviews ADD CONSTRAINT vehicle_reviews_variant_id_fk FOREIGN KEY (variant_id) REFERENCES public.variants (id) MATCH SIMPLE ON UPDATE NO ACTION ON DELETE NO ACTION;

 ALTER TABLE public.vehicle_reviews ADD CONSTRAINT vehicle_reviews_user_id_fk FOREIGN KEY (user_id) REFERENCES public.users (id) MATCH SIMPLE ON UPDATE NO ACTION ON DELETE NO ACTION;

 ALTER TABLE public.vehicle_reviews ADD CONSTRAINT vehicle_reviews_vehicle_id_fk FOREIGN KEY (vehicle_id) REFERENCES public.vehicles (id) MATCH SIMPLE ON UPDATE NO ACTION ON DELETE NO ACTION;

 ALTER TABLE public.vehicle_prices ADD CONSTRAINT vehicle_prices_dealer_id_fk FOREIGN KEY (dealer_id) REFERENCES public.dealers (id) MATCH SIMPLE ON UPDATE NO ACTION ON DELETE NO ACTION;

 ALTER TABLE public.vehicle_prices ADD CONSTRAINT vehicle_prices_manufacturer_id_fk FOREIGN KEY (manufacturer_id) REFERENCES public.manufacturers (id) MATCH SIMPLE ON UPDATE NO ACTION ON DELETE NO ACTION;

 ALTER TABLE public.vehicle_prices ADD CONSTRAINT vehicle_prices_variant_id_fk FOREIGN KEY (variant_id) REFERENCES public.variants (id) MATCH SIMPLE ON UPDATE NO ACTION ON DELETE NO ACTION;

 ALTER TABLE public.vehicle_prices ADD CONSTRAINT vehicle_prices_variant_colours_id_fk FOREIGN KEY (variant_colours_id) REFERENCES public.variant_colours (id) MATCH SIMPLE ON UPDATE NO ACTION ON DELETE NO ACTION;

 ALTER TABLE public.vehicle_prices ADD CONSTRAINT vehicle_prices_vehicle_id_fk FOREIGN KEY (vehicle_id) REFERENCES public.vehicles (id) MATCH SIMPLE ON UPDATE NO ACTION ON DELETE NO ACTION;

 ALTER TABLE public.vehicle_galleries ADD CONSTRAINT vehicle_galleries_variant_id_fk FOREIGN KEY (variant_id) REFERENCES public.variants (id) MATCH SIMPLE ON UPDATE NO ACTION ON DELETE NO ACTION;

 ALTER TABLE public.vehicle_galleries ADD CONSTRAINT vehicle_galleries_variant_colour_id_fk FOREIGN KEY (variant_colour_id) REFERENCES public.variant_colours (id) MATCH SIMPLE ON UPDATE NO ACTION ON DELETE NO ACTION;

 ALTER TABLE public.vehicle_galleries ADD CONSTRAINT vehicle_galleries_vehicle_id_fk FOREIGN KEY (vehicle_id) REFERENCES public.vehicles (id) MATCH SIMPLE ON UPDATE NO ACTION ON DELETE NO ACTION;

 ALTER TABLE public.variants ADD CONSTRAINT variants_vehicle_id_fk FOREIGN KEY (vehicle_id) REFERENCES public.vehicles (id) MATCH SIMPLE ON UPDATE NO ACTION ON DELETE NO ACTION;

 ALTER TABLE public.variant_colours ADD CONSTRAINT variant_colours_variant_id_fk FOREIGN KEY (variant_id) REFERENCES public.variants (id) MATCH SIMPLE ON UPDATE NO ACTION ON DELETE NO ACTION;

 ALTER TABLE public.variant_colours ADD CONSTRAINT variant_colours_vehicle_id_fk FOREIGN KEY (vehicle_id) REFERENCES public.vehicles (id) MATCH SIMPLE ON UPDATE NO ACTION ON DELETE NO ACTION;

 ALTER TABLE public.users ADD CONSTRAINT users_manager_id_fk FOREIGN KEY (manager_id) REFERENCES public.users (id) MATCH SIMPLE ON UPDATE NO ACTION ON DELETE NO ACTION;

 ALTER TABLE public.user_role ADD CONSTRAINT user_role_user_id_fk FOREIGN KEY (user_id) REFERENCES public.users (id) MATCH SIMPLE ON UPDATE NO ACTION ON DELETE NO ACTION;

 ALTER TABLE public.user_role ADD CONSTRAINT user_role_role_id_fk FOREIGN KEY (role_id) REFERENCES public.roles (id) MATCH SIMPLE ON UPDATE NO ACTION ON DELETE NO ACTION;

 ALTER TABLE public.test_ride_vehicles ADD CONSTRAINT test_ride_vehicles_customer_user_id_fk FOREIGN KEY (customer_user_id) REFERENCES public.users (id) MATCH SIMPLE ON UPDATE NO ACTION ON DELETE NO ACTION;

 ALTER TABLE public.test_ride_vehicles ADD CONSTRAINT test_ride_vehicles_dealer_id_fk FOREIGN KEY (dealer_id) REFERENCES public.dealers (id) MATCH SIMPLE ON UPDATE NO ACTION ON DELETE NO ACTION;

 ALTER TABLE public.test_ride_vehicles ADD CONSTRAINT test_ride_vehicles_manufacturer_id_fk FOREIGN KEY (manufacturer_id) REFERENCES public.manufacturers (id) MATCH SIMPLE ON UPDATE NO ACTION ON DELETE NO ACTION;

 ALTER TABLE public.test_ride_vehicles ADD CONSTRAINT test_ride_vehicles_variant_id_fk FOREIGN KEY (variant_id) REFERENCES public.variants (id) MATCH SIMPLE ON UPDATE NO ACTION ON DELETE NO ACTION;

 ALTER TABLE public.test_ride_vehicles ADD CONSTRAINT test_ride_vehicles_vehicle_id_fk FOREIGN KEY (vehicle_id) REFERENCES public.vehicles (id) MATCH SIMPLE ON UPDATE NO ACTION ON DELETE NO ACTION;

 ALTER TABLE public.proforma_invoices ADD CONSTRAINT proforma_invoice_manufacturer_id_fk FOREIGN KEY (manufacturer_id) REFERENCES public.manufacturers (id) MATCH SIMPLE ON UPDATE NO ACTION ON DELETE NO ACTION;

 ALTER TABLE public.proforma_invoices ADD CONSTRAINT proforma_invoice_dealer_id_fk FOREIGN KEY (dealer_id) REFERENCES public.dealers (id) MATCH SIMPLE ON UPDATE NO ACTION ON DELETE NO ACTION;

 ALTER TABLE public.proforma_invoices ADD CONSTRAINT proforma_invoice_variant_id_fk FOREIGN KEY (variant_id) REFERENCES public.variants (id) MATCH SIMPLE ON UPDATE NO ACTION ON DELETE NO ACTION;

 ALTER TABLE public.proforma_invoices ADD CONSTRAINT proforma_invoice_vehicle_id_fk FOREIGN KEY (vehicle_id) REFERENCES public.vehicles (id) MATCH SIMPLE ON UPDATE NO ACTION ON DELETE NO ACTION;

 ALTER TABLE public.lead_details ADD CONSTRAINT lead_detail_lead_fk FOREIGN KEY (lead_id) REFERENCES public.leads (id) MATCH SIMPLE ON UPDATE NO ACTION ON DELETE NO ACTION;

 ALTER TABLE public.follow_ups ADD CONSTRAINT follow_up_lead_fk FOREIGN KEY (lead_id) REFERENCES public.leads (id) MATCH SIMPLE ON UPDATE NO ACTION ON DELETE NO ACTION;`,

  newConstraints: `ALTER TABLE public.leads ADD CONSTRAINT leads_user_id_fk FOREIGN KEY (user_id) REFERENCES public.users (id) MATCH SIMPLE ON UPDATE NO ACTION ON DELETE NO ACTION;

 ALTER TABLE public.leads ADD CONSTRAINT leads_owner_id_fk FOREIGN KEY (owner_id) REFERENCES public.users (id) MATCH SIMPLE ON UPDATE NO ACTION ON DELETE NO ACTION;

 ALTER TABLE public.leads ADD CONSTRAINT leads_assigned_to_fk FOREIGN KEY (assigned_to) REFERENCES public.users (id) MATCH SIMPLE ON UPDATE NO ACTION ON DELETE NO ACTION;

 ALTER TABLE public.leads ADD CONSTRAINT leads_dealer_id_fk FOREIGN KEY (dealer_id) REFERENCES public.dealers (id) MATCH SIMPLE ON UPDATE NO ACTION ON DELETE NO ACTION;

 ALTER TABLE public.lead_details ADD CONSTRAINT lead_details_dealer_id_fk FOREIGN KEY (dealer_id) REFERENCES public.dealers (id) MATCH SIMPLE ON UPDATE NO ACTION ON DELETE NO ACTION;

 ALTER TABLE public.lead_details ADD CONSTRAINT lead_details_manufacturer_id_fk FOREIGN KEY (manufacturer_id) REFERENCES public.manufacturers (id) MATCH SIMPLE ON UPDATE NO ACTION ON DELETE NO ACTION;

 ALTER TABLE public.lead_details ADD CONSTRAINT lead_details_vehicle_id_fk FOREIGN KEY (vehicle_id) REFERENCES public.vehicles (id) MATCH SIMPLE ON UPDATE NO ACTION ON DELETE NO ACTION;

 ALTER TABLE public.lead_details ADD CONSTRAINT lead_details_variant_id_fk FOREIGN KEY (variant_id) REFERENCES public.variants (id) MATCH SIMPLE ON UPDATE NO ACTION ON DELETE NO ACTION;

 ALTER TABLE public.lead_details ADD CONSTRAINT lead_details_proforma_invoice_id_fk FOREIGN KEY (proforma_invoice_id) REFERENCES public.proforma_invoices (id) MATCH SIMPLE ON UPDATE NO ACTION ON DELETE NO ACTION;

 ALTER TABLE public.lead_details ADD CONSTRAINT lead_details_lead_id_fk FOREIGN KEY (lead_id) REFERENCES public.leads (id) MATCH SIMPLE ON UPDATE NO ACTION ON DELETE NO ACTION;

 ALTER TABLE public.follow_ups ADD CONSTRAINT follow_ups_dealer_id_fk FOREIGN KEY (dealer_id) REFERENCES public.dealers (id) MATCH SIMPLE ON UPDATE NO ACTION ON DELETE NO ACTION;

 ALTER TABLE public.follow_ups ADD CONSTRAINT follow_ups_manufacturer_id_fk FOREIGN KEY (manufacturer_id) REFERENCES public.manufacturers (id) MATCH SIMPLE ON UPDATE NO ACTION ON DELETE NO ACTION;

 ALTER TABLE public.follow_ups ADD CONSTRAINT follow_ups_lead_id_fk FOREIGN KEY (lead_id) REFERENCES public.leads (id) MATCH SIMPLE ON UPDATE NO ACTION ON DELETE NO ACTION;

 ALTER TABLE public.lead_activities ADD CONSTRAINT lead_activities_lead_id_fk FOREIGN KEY (lead_id) REFERENCES public.leads (id) MATCH SIMPLE ON UPDATE NO ACTION ON DELETE NO ACTION;

 ALTER TABLE public.lead_activities ADD CONSTRAINT lead_activities_owner_id_fk FOREIGN KEY (done_by) REFERENCES public.users (id) MATCH SIMPLE ON UPDATE NO ACTION ON DELETE NO ACTION;

`,

  newConstraintsV2: `
    /* manufacturer_targets */

    ALTER TABLE public.manufacturer_targets ADD CONSTRAINT mt_manufacturer_id_fk FOREIGN KEY (manufacturer_id)
      REFERENCES public.manufacturers (id) MATCH SIMPLE ON UPDATE NO ACTION ON DELETE NO ACTION;

    ALTER TABLE public.manufacturer_targets ADD CONSTRAINT mt_vehicle_id_fk FOREIGN KEY (vehicle_id)
      REFERENCES public.vehicles (id) MATCH SIMPLE ON UPDATE NO ACTION ON DELETE NO ACTION;

    ALTER TABLE public.manufacturer_targets ADD CONSTRAINT mt_dealer_id_fk FOREIGN KEY (dealer_id)
      REFERENCES public.dealers (id) MATCH SIMPLE ON UPDATE NO ACTION ON DELETE NO ACTION;

    ALTER TABLE public.manufacturer_targets ADD CONSTRAINT mt_country_id_fk FOREIGN KEY (country_id)
      REFERENCES public.countries (id) MATCH SIMPLE ON UPDATE NO ACTION ON DELETE NO ACTION;

    ALTER TABLE public.manufacturer_targets ADD CONSTRAINT mt_zone_id_fk FOREIGN KEY (zone_id)
      REFERENCES public.zones (id) MATCH SIMPLE ON UPDATE NO ACTION ON DELETE NO ACTION;

    ALTER TABLE public.manufacturer_targets ADD CONSTRAINT mt_state_id_fk FOREIGN KEY (state_id)
      REFERENCES public.states (id) MATCH SIMPLE ON UPDATE NO ACTION ON DELETE NO ACTION;

    ALTER TABLE public.manufacturer_targets ADD CONSTRAINT mt_city_id_fk FOREIGN KEY (city_id)
      REFERENCES public.cities (id) MATCH SIMPLE ON UPDATE NO ACTION ON DELETE NO ACTION;

    ALTER TABLE public.manufacturer_targets ADD CONSTRAINT mt_dealer_category_id_fk FOREIGN KEY (dealer_category_id)
      REFERENCES public.dealer_categories (id) MATCH SIMPLE ON UPDATE NO ACTION ON DELETE NO ACTION;

    /* financier_interest_details */

    ALTER TABLE public.financier_interest_details ADD CONSTRAINT fid_financier_id_fk FOREIGN KEY (financier_id)
      REFERENCES public.financiers (id) MATCH SIMPLE ON UPDATE NO ACTION ON DELETE NO ACTION;

    ALTER TABLE public.financier_interest_details ADD CONSTRAINT fid_vehicle_id_fk FOREIGN KEY (vehicle_id)
      REFERENCES public.vehicles (id) MATCH SIMPLE ON UPDATE NO ACTION ON DELETE NO ACTION;

    ALTER TABLE public.financier_interest_details ADD CONSTRAINT fid_variant_id_fk FOREIGN KEY (variant_id)
      REFERENCES public.variants (id) MATCH SIMPLE ON UPDATE NO ACTION ON DELETE NO ACTION;

    ALTER TABLE public.financier_interest_details ADD CONSTRAINT fid_region_id_fk FOREIGN KEY (region_id)
      REFERENCES public.regions (id) MATCH SIMPLE ON UPDATE NO ACTION ON DELETE NO ACTION;

    ALTER TABLE public.financier_interest_details ADD CONSTRAINT fid_zone_id_fk FOREIGN KEY (zone_id)
      REFERENCES public.zones (id) MATCH SIMPLE ON UPDATE NO ACTION ON DELETE NO ACTION;

    ALTER TABLE public.financier_interest_details ADD CONSTRAINT fid_state_id_fk FOREIGN KEY (state_id)
      REFERENCES public.states (id) MATCH SIMPLE ON UPDATE NO ACTION ON DELETE NO ACTION;

    ALTER TABLE public.financier_interest_details ADD CONSTRAINT fid_city_id_fk FOREIGN KEY (city_id)
      REFERENCES public.cities (id) MATCH SIMPLE ON UPDATE NO ACTION ON DELETE NO ACTION;

    /* accessories */

    ALTER TABLE public.accessories ADD CONSTRAINT acc_dealer_id_fk FOREIGN KEY (dealer_id)
      REFERENCES public.dealers (id) MATCH SIMPLE ON UPDATE NO ACTION ON DELETE NO ACTION;

    ALTER TABLE public.accessories ADD CONSTRAINT acc_manufacturer_id_fk FOREIGN KEY (manufacturer_id)
      REFERENCES public.manufacturers (id) MATCH SIMPLE ON UPDATE NO ACTION ON DELETE NO ACTION;

    ALTER TABLE public.accessories ADD CONSTRAINT acc_vehicle_id_fk FOREIGN KEY (vehicle_id)
      REFERENCES public.vehicles (id) MATCH SIMPLE ON UPDATE NO ACTION ON DELETE NO ACTION;

    /* documents */

    ALTER TABLE public.documents ADD CONSTRAINT doc_user_id_fk FOREIGN KEY (customer_user_id)
      REFERENCES public.users (id) MATCH SIMPLE ON UPDATE NO ACTION ON DELETE NO ACTION;

    /* manufacturer_financier_orders */

    ALTER TABLE public.manufacturer_financier_orders ADD CONSTRAINT mfo_manufacturer_id_fk FOREIGN KEY (manufacturer_id)
      REFERENCES public.manufacturers (id) MATCH SIMPLE ON UPDATE NO ACTION ON DELETE NO ACTION;

    ALTER TABLE public.manufacturer_financier_orders ADD CONSTRAINT mfo_financier_id_fk FOREIGN KEY (financier_id)
      REFERENCES public.financiers (id) MATCH SIMPLE ON UPDATE NO ACTION ON DELETE NO ACTION;

    ALTER TABLE public.manufacturer_financier_orders ADD CONSTRAINT mfo_country_id_fk FOREIGN KEY (country_id)
      REFERENCES public.countries (id) MATCH SIMPLE ON UPDATE NO ACTION ON DELETE NO ACTION;

    ALTER TABLE public.manufacturer_financier_orders ADD CONSTRAINT mfo_zone_id_fk FOREIGN KEY (zone_id)
      REFERENCES public.zones (id) MATCH SIMPLE ON UPDATE NO ACTION ON DELETE NO ACTION;

    ALTER TABLE public.manufacturer_financier_orders ADD CONSTRAINT mfo_state_id_fk FOREIGN KEY (state_id)
      REFERENCES public.states (id) MATCH SIMPLE ON UPDATE NO ACTION ON DELETE NO ACTION;

    ALTER TABLE public.manufacturer_financier_orders ADD CONSTRAINT mfo_city_id_fk FOREIGN KEY (city_id)
      REFERENCES public.cities (id) MATCH SIMPLE ON UPDATE NO ACTION ON DELETE NO ACTION;

    /* financier_incentives */

    ALTER TABLE public.financier_incentives ADD CONSTRAINT fi_financier_id_fk FOREIGN KEY (financier_id)
      REFERENCES public.financiers (id) MATCH SIMPLE ON UPDATE NO ACTION ON DELETE NO ACTION;

    ALTER TABLE public.financier_incentives ADD CONSTRAINT fi_city_id_fk FOREIGN KEY (city_id)
      REFERENCES public.cities (id) MATCH SIMPLE ON UPDATE NO ACTION ON DELETE NO ACTION;

    /* dealer_offers */

    ALTER TABLE public.dealer_offers ADD CONSTRAINT do_dealer_id_fk FOREIGN KEY (dealer_id)
      REFERENCES public.dealers (id) MATCH SIMPLE ON UPDATE NO ACTION ON DELETE NO ACTION;

    ALTER TABLE public.dealer_offers ADD CONSTRAINT do_lead_id_fk FOREIGN KEY (lead_id)
      REFERENCES public.leads (id) MATCH SIMPLE ON UPDATE NO ACTION ON DELETE NO ACTION;

    ALTER TABLE public.dealer_offers ADD CONSTRAINT do_lead_detail_id_fk FOREIGN KEY (lead_detail_id)
      REFERENCES public.lead_details (id) MATCH SIMPLE ON UPDATE NO ACTION ON DELETE NO ACTION;

    ALTER TABLE public.dealer_offers ADD CONSTRAINT do_user_id_fk FOREIGN KEY (user_id)
      REFERENCES public.users (id) MATCH SIMPLE ON UPDATE NO ACTION ON DELETE NO ACTION;

    /* manufacturer_financiers */

    ALTER TABLE public.manufacturer_financiers ADD CONSTRAINT mf_manufacturer_id_fk FOREIGN KEY (manufacturer_id)
      REFERENCES public.manufacturers (id) MATCH SIMPLE ON UPDATE NO ACTION ON DELETE NO ACTION;

    ALTER TABLE public.manufacturer_financiers ADD CONSTRAINT mf_financier_id_fk FOREIGN KEY (financier_id)
      REFERENCES public.financiers (id) MATCH SIMPLE ON UPDATE NO ACTION ON DELETE NO ACTION;

    ALTER TABLE public.manufacturer_financiers ADD CONSTRAINT mf_country_id_fk FOREIGN KEY (country_id)
      REFERENCES public.countries (id) MATCH SIMPLE ON UPDATE NO ACTION ON DELETE NO ACTION;

    ALTER TABLE public.manufacturer_financiers ADD CONSTRAINT mf_zone_id_fk FOREIGN KEY (zone_id)
      REFERENCES public.zones (id) MATCH SIMPLE ON UPDATE NO ACTION ON DELETE NO ACTION;

    ALTER TABLE public.manufacturer_financiers ADD CONSTRAINT mf_state_id_fk FOREIGN KEY (state_id)
      REFERENCES public.states (id) MATCH SIMPLE ON UPDATE NO ACTION ON DELETE NO ACTION;

    ALTER TABLE public.manufacturer_financiers ADD CONSTRAINT mf_city_id_fk FOREIGN KEY (city_id)
      REFERENCES public.cities (id) MATCH SIMPLE ON UPDATE NO ACTION ON DELETE NO ACTION;

    /* proforma_invoice_offer */

    ALTER TABLE public.proforma_invoice_offers ADD CONSTRAINT pfo_proforma_invoice_id_fk FOREIGN KEY (proforma_invoice_id)
      REFERENCES public.proforma_invoices (id) MATCH SIMPLE ON UPDATE NO ACTION ON DELETE NO ACTION;

    /* proforma_invoice_other_charges */

    ALTER TABLE public.proforma_invoice_other_charges ADD CONSTRAINT pfoc_proforma_invoice_id_fk FOREIGN KEY (proforma_invoice_id)
      REFERENCES public.proforma_invoices (id) MATCH SIMPLE ON UPDATE NO ACTION ON DELETE NO ACTION;

    /* vehicle_insurances */

    ALTER TABLE public.vehicle_insurances ADD CONSTRAINT vi_vehicle_price_id_fk FOREIGN KEY (vehicle_price_id)
      REFERENCES public.vehicle_prices (id) MATCH SIMPLE ON UPDATE NO ACTION ON DELETE NO ACTION;

    /* compare_vehicle_lookup */

    ALTER TABLE public.compare_vehicle_lookup ADD CONSTRAINT cvl_manufacturer_id_fk FOREIGN KEY (manufacturer_id)
      REFERENCES public.manufacturers (id) MATCH SIMPLE ON UPDATE NO ACTION ON DELETE NO ACTION;

    /* leads */

    ALTER TABLE public.leads ADD CONSTRAINT lead_lost_reason_id_fk FOREIGN KEY (lost_reason_id)
      REFERENCES public.lost_reasons (id) MATCH SIMPLE ON UPDATE NO ACTION ON DELETE NO ACTION;

    /* similar_vehicles */

    ALTER TABLE public.similar_vehicles ADD CONSTRAINT sv_vehicle_id_fk FOREIGN KEY (vehicle_id)
      REFERENCES public.vehicles (id) MATCH SIMPLE ON UPDATE NO ACTION ON DELETE NO ACTION;

  `,

};
