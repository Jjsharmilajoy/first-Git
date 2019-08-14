module.exports = {
  forgienKeyConstrain: `DROP TABLE IF EXISTS public.variant_features;

  ALTER TABLE public.vehicle_features ADD CONSTRAINT vehicle_features_manufacturer_id_fk FOREIGN KEY (manufacturer_id) REFERENCES public.manufacturers (id) MATCH SIMPLE ON UPDATE NO ACTION ON DELETE NO ACTION;

  ALTER TABLE public.vehicle_features ADD CONSTRAINT vehicle_features_variant_id_fk FOREIGN KEY (variant_id) REFERENCES public.variants (id) MATCH SIMPLE ON UPDATE NO ACTION ON DELETE NO ACTION;

  ALTER TABLE public.vehicle_features ADD CONSTRAINT vehicle_features_vehicle_id_fk FOREIGN KEY (vehicle_id) REFERENCES public.vehicles (id) MATCH SIMPLE ON UPDATE NO ACTION ON DELETE NO ACTION;

`,
};
