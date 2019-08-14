module.exports = {
  forgienKeyConstrain: `DROP TABLE IF EXISTS public.proforma_invoice_detail;

  ALTER TABLE public.proforma_invoices ADD CONSTRAINT proforma_invoices_lead_id_fk FOREIGN KEY (lead_id) REFERENCES public.leads (id) MATCH SIMPLE ON UPDATE NO ACTION ON DELETE NO ACTION;

  ALTER TABLE public.proforma_invoices ADD CONSTRAINT proforma_invoices_lead_detail_id_fk FOREIGN KEY (lead_detail_id) REFERENCES public.lead_details (id) MATCH SIMPLE ON UPDATE NO ACTION ON DELETE NO ACTION;

  ALTER TABLE public.proforma_invoices ADD CONSTRAINT proforma_invoices_vehicle_price_id_fk FOREIGN KEY (vehicle_price_id) REFERENCES public.vehicle_prices (id) MATCH SIMPLE ON UPDATE NO ACTION ON DELETE NO ACTION;

  ALTER TABLE public.proforma_invoice_accessories ADD CONSTRAINT proforma_invoice_accessories_dealer_id_fk FOREIGN KEY (dealer_id) REFERENCES public.dealers (id) MATCH SIMPLE ON UPDATE NO ACTION ON DELETE NO ACTION;

  ALTER TABLE public.proforma_invoices ADD CONSTRAINT proforma_invoice_variant_colour_id_fk FOREIGN KEY (variant_colour_id) REFERENCES public.variant_colours (id) MATCH SIMPLE ON UPDATE NO ACTION ON DELETE NO ACTION;

`,
};
