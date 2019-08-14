module.exports = {
  foreignKey: `
    /* financier_branches */

    ALTER TABLE public.financier_branches ADD CONSTRAINT financier_branches_financier_id_fk FOREIGN KEY (financier_id)
    REFERENCES public.financiers (id) MATCH SIMPLE ON UPDATE NO ACTION ON DELETE NO ACTION;

    ALTER TABLE public.financier_branches ADD CONSTRAINT financier_branches_financier_city_head_id_fk FOREIGN KEY (financier_city_head_id)
    REFERENCES public.users (id) MATCH SIMPLE ON UPDATE NO ACTION ON DELETE NO ACTION;

    ALTER TABLE public.financier_branches ADD CONSTRAINT financier_branches_zone_id_fk FOREIGN KEY (zone_id)
    REFERENCES public.zones (id) MATCH SIMPLE ON UPDATE NO ACTION ON DELETE NO ACTION;

    ALTER TABLE public.financier_branches ADD CONSTRAINT financier_branches_state_id_fk FOREIGN KEY (state_id)
    REFERENCES public.states (id) MATCH SIMPLE ON UPDATE NO ACTION ON DELETE NO ACTION;

    ALTER TABLE public.financier_branches ADD CONSTRAINT financier_branches_city_id_fk FOREIGN KEY (city_id)
    REFERENCES public.cities (id) MATCH SIMPLE ON UPDATE NO ACTION ON DELETE NO ACTION;

    /* financier_dealers */

    ALTER TABLE public.financier_dealers ADD CONSTRAINT financier_dealer_financier_id_fk FOREIGN KEY (financier_id)
    REFERENCES public.financiers (id) MATCH SIMPLE ON UPDATE NO ACTION ON DELETE NO ACTION;

    ALTER TABLE public.financier_dealers ADD CONSTRAINT financier_dealer_user_id_fk FOREIGN KEY (user_id)
    REFERENCES public.users (id) MATCH SIMPLE ON UPDATE NO ACTION ON DELETE NO ACTION;

    ALTER TABLE public.financier_dealers ADD CONSTRAINT financier_dealer_dealer_id_fk FOREIGN KEY (dealer_id)
    REFERENCES public.dealers (id) MATCH SIMPLE ON UPDATE NO ACTION ON DELETE NO ACTION;

    ALTER TABLE public.financier_dealers ADD CONSTRAINT financier_dealer_financier_team_id_fk FOREIGN KEY (financier_team_id)
    REFERENCES public.financier_teams (id) MATCH SIMPLE ON UPDATE NO ACTION ON DELETE NO ACTION;

    /* financier_leads */

    ALTER TABLE public.financier_leads ADD CONSTRAINT financier_lead_financier_id_fk FOREIGN KEY (financier_id)
    REFERENCES public.financiers (id) MATCH SIMPLE ON UPDATE NO ACTION ON DELETE NO ACTION;

    ALTER TABLE public.financier_leads ADD CONSTRAINT financier_lead_user_id_fk FOREIGN KEY (user_id)
    REFERENCES public.users (id) MATCH SIMPLE ON UPDATE NO ACTION ON DELETE NO ACTION;

    ALTER TABLE public.financier_leads ADD CONSTRAINT financier_lead_dealer_id_fk FOREIGN KEY (dealer_id)
    REFERENCES public.dealers (id) MATCH SIMPLE ON UPDATE NO ACTION ON DELETE NO ACTION;

    ALTER TABLE public.financier_leads ADD CONSTRAINT financier_lead_financier_team_id_fk FOREIGN KEY (financier_team_id)
    REFERENCES public.financier_teams (id) MATCH SIMPLE ON UPDATE NO ACTION ON DELETE NO ACTION;

    ALTER TABLE public.financier_leads ADD CONSTRAINT financier_lead_assigned_to_fk FOREIGN KEY (assigned_to)
    REFERENCES public.users (id) MATCH SIMPLE ON UPDATE NO ACTION ON DELETE NO ACTION;

    ALTER TABLE public.financier_leads ADD CONSTRAINT financier_lead_lead_id_fk FOREIGN KEY (lead_id)
    REFERENCES public.leads (id) MATCH SIMPLE ON UPDATE NO ACTION ON DELETE NO ACTION;

    ALTER TABLE public.financier_leads ADD CONSTRAINT financier_lead_lead_detail_id_fk FOREIGN KEY (lead_detail_id)
    REFERENCES public.lead_details (id) MATCH SIMPLE ON UPDATE NO ACTION ON DELETE NO ACTION;

    ALTER TABLE public.financier_leads ADD CONSTRAINT financier_lead_zone_id_fk FOREIGN KEY (zone_id)
    REFERENCES public.zones (id) MATCH SIMPLE ON UPDATE NO ACTION ON DELETE NO ACTION;

    ALTER TABLE public.financier_leads ADD CONSTRAINT financier_lead_state_id_fk FOREIGN KEY (state_id)
    REFERENCES public.states (id) MATCH SIMPLE ON UPDATE NO ACTION ON DELETE NO ACTION;

    ALTER TABLE public.financier_leads ADD CONSTRAINT financier_lead_city_id_fk FOREIGN KEY (city_id)
    REFERENCES public.cities (id) MATCH SIMPLE ON UPDATE NO ACTION ON DELETE NO ACTION;

    /* financier_targets*/

    ALTER TABLE public.financier_targets ADD CONSTRAINT financier_target_financier_id_fk FOREIGN KEY (financier_id)
    REFERENCES public.financiers (id) MATCH SIMPLE ON UPDATE NO ACTION ON DELETE NO ACTION;

    ALTER TABLE public.financier_targets ADD CONSTRAINT financier_target_user_id_fk FOREIGN KEY (user_id)
    REFERENCES public.users (id) MATCH SIMPLE ON UPDATE NO ACTION ON DELETE NO ACTION;

    ALTER TABLE public.financier_targets ADD CONSTRAINT financier_target_financier_team_id_fk FOREIGN KEY (financier_team_id)
    REFERENCES public.financier_teams (id) MATCH SIMPLE ON UPDATE NO ACTION ON DELETE NO ACTION;

    /* financier_team_members*/

    ALTER TABLE public.financier_team_members ADD CONSTRAINT financier_team_member_financier_id_fk FOREIGN KEY (financier_id)
    REFERENCES public.financiers (id) MATCH SIMPLE ON UPDATE NO ACTION ON DELETE NO ACTION;

    ALTER TABLE public.financier_team_members ADD CONSTRAINT financier_team_member_user_id_fk FOREIGN KEY (user_id)
    REFERENCES public.users (id) MATCH SIMPLE ON UPDATE NO ACTION ON DELETE NO ACTION;

    ALTER TABLE public.financier_team_members ADD CONSTRAINT financier_team_member_financier_team_id_fk FOREIGN KEY (financier_team_id)
    REFERENCES public.financier_teams (id) MATCH SIMPLE ON UPDATE NO ACTION ON DELETE NO ACTION;

    /* financier_teams*/

    ALTER TABLE public.financier_teams ADD CONSTRAINT financier_team_financier_id_fk FOREIGN KEY (financier_id)
    REFERENCES public.financiers (id) MATCH SIMPLE ON UPDATE NO ACTION ON DELETE NO ACTION;

    ALTER TABLE public.financier_teams ADD CONSTRAINT financier_team_owned_by_fk FOREIGN KEY (owned_by)
    REFERENCES public.users (id) MATCH SIMPLE ON UPDATE NO ACTION ON DELETE NO ACTION;

    ALTER TABLE public.financier_teams ADD CONSTRAINT financier_team_zone_id_fk FOREIGN KEY (zone_id)
    REFERENCES public.zones (id) MATCH SIMPLE ON UPDATE NO ACTION ON DELETE NO ACTION;

    ALTER TABLE public.financier_teams ADD CONSTRAINT financier_team_state_id_fk FOREIGN KEY (state_id)
    REFERENCES public.states (id) MATCH SIMPLE ON UPDATE NO ACTION ON DELETE NO ACTION;

    ALTER TABLE public.financier_teams ADD CONSTRAINT financier_team_city_id_fk FOREIGN KEY (city_id)
    REFERENCES public.cities (id) MATCH SIMPLE ON UPDATE NO ACTION ON DELETE NO ACTION;

  `,

  financierDealerConstraint: `
    DROP INDEX public.financier_dealer_key;
    DROP INDEX public.financier_user_dealer_key;
    CREATE UNIQUE INDEX financier_user_dealer_key ON public.financier_dealers using btree
      (financier_id, dealer_id, COALESCE(to_date, '0001-01-01 01:01:01.503+00'))
      WHERE user_id IS NOT NULL;
    CREATE UNIQUE INDEX financier_dealer_key ON public.financier_dealers using btree
      (financier_id, dealer_id, COALESCE(to_date, '0001-01-01 01:01:01.503+00'))
      WHERE user_id IS NULL;
  `,

  financierTargetConstraint: `
    DROP INDEX public.financier_team_target_key;
    DROP INDEX public.financier_team_member_target_key;
    CREATE UNIQUE INDEX financier_team_target_key ON public.financier_targets using btree
      (financier_id, financier_team_id, "from", "to")
      WHERE user_id IS NULL;
    CREATE UNIQUE INDEX financier_team_member_target_key ON public.financier_targets using btree
      (financier_id, financier_team_id, user_id, "from", "to")
      WHERE user_id IS NOT NULL;
  `,
};
