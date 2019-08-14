module.exports = {
  indexConstrain: `create index on public.financier_leads (created_at);
    create index on public.financier_leads (next_follow_up_on);
    create index on public.financier_leads (last_follow_up_done_on);
    create index on public.financier_leads (converted_on);
    create index on public.financier_leads (lost_on);

    create index on public.lead_details (test_ride_on);
    create index on public.lead_details (dealer_id, lead_id, vehicle_id);

    create index on public.leads (next_followup_on);
    create index on public.leads (invoiced_on);
    create index on public.leads (lost_on);
    create index on public.leads (created_at);

    create index on public.proforma_invoices (dealer_id, lead_id, vehicle_id, lead_detail_id);
    
    ALTER TABLE public.lead_details ALTER COLUMN manufacturer_id SET NOT NULL;
    ALTER TABLE public.lead_details ALTER COLUMN dealer_id SET NOT NULL;
    ALTER TABLE public.lead_details ALTER COLUMN lead_id SET NOT NULL;
    ALTER TABLE public.lead_details ALTER COLUMN vehicle_id SET NOT NULL;
    ALTER TABLE public.lead_details ALTER COLUMN variant_id SET NOT NULL;
    ALTER TABLE public.lead_details ALTER COLUMN variant_colour_id SET NOT NULL;

    CREATE UNIQUE INDEX dealer_vehicles_unique ON public.dealer_vehicles (dealer_id, vehicle_id);
    CREATE UNIQUE INDEX unique_enquiry_vehicles ON public.lead_details (lead_id, vehicle_id) WHERE is_deleted = false;
    CREATE UNIQUE INDEX unique_dealer_accessories ON public.dealer_accessories (dealer_id, vehicle_id, accessory_id);
    CREATE UNIQUE INDEX unique_dealer_inventory_vehicle ON public.dealer_inventories (dealer_id, vehicle_id, variant_id, variant_colours_id);
    CREATE UNIQUE INDEX unique_dealer_financier ON public.dealer_financiers (dealer_id, financier_id);`,
};
