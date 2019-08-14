module.exports = {
  updateForgienKeyConstrain: `
  ALTER TABLE public.lead_details DROP CONSTRAINT lead_details_proforma_invoice_id_fk;
`,
};
