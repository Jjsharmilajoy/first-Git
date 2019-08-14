const leadReportQuery = `
  select
    ROW_NUMBER () OVER (ORDER BY "Date of Visit") as "S.No", * from (
  select
    to_char(l.created_at + interval '5 hours 30 min', 'DD-MM-YYYY') as "Date of Visit",
    to_char(l.created_at + interval '5 hours 30 min', 'HH:MI:SSAM') as "Time of Visit",
    u.first_name "Executive Name",
    l.source_of_enquiry as "Source of Enquiry",
    l.pincode as "Pincode",
    (case when l.gender = 'male' then 'Mr.' ELSE 'Ms.' end) as "Title",
    l.name "Prospect Name",
    l.mobile_number "Mobile Number",
    v.name "Vehicle",
    vr.name "Variant",
    c.color "Color",
    ( case
      when ld.booked_on IS NOT NULL and l.status < 600 then 'Booked'
      when l.status < 600 then INITCAP(l.category)
      when l.status = 600 then 'Invoiced'
      when ( l.status = 610 and ld.invoiced_on IS NOT NULL ) then 'Insurance'
      when ( l.status = 700 and ld.invoiced_on IS NOT NULL ) then 'RTO'
      when ( l.status = 750 and ld.invoiced_on IS NOT NULL ) then 'Registered'
      when ( l.status = 800 and ld.invoiced_on IS NOT NULL ) then 'Delivered'
      when l.status > 800 then 'Lost' end) "Status",
    ( case WHEN is_invoiced = true THEN
      to_char(ld.invoiced_on + interval '5 hours 30 min', 'DD-MM-YYYY') end) as "Date of Invoice",
    ( CASE WHEN (l.lost_reason_text is NULL OR l.lost_reason_text = '' )
      THEN ( select reason from lost_reasons where id = l.lost_reason_id )
      ELSE l.lost_reason_text END ) as "Lost Reason",
    (CASE WHEN ld.test_ride_on IS NOT NULL THEN 'Yes' ELSE 'No' end ) as "Test Ride Opted",
    to_char(ld.test_ride_on + interval '5 hours 30 min', 'DD-MM-YYYY') "Test Ride Date",
    to_char(ld.test_ride_on + interval '5 hours 30 min', 'HH:MI:SSAM') "Test Ride Time",
    (case ld.test_ride_status when 200 then 'Booked'
      when 300 then 'Ongoing' when 400 then 'Completed'
      when 500 then 'Cancelled' end) "Test Ride Status",
    ( CASE WHEN ( (select count(1) from exchange_vehicles where lead_id = l.id ) = 0)
          THEN 'no' ELSE 'yes' END ) as "Exchange Vehicle Opted",
      ( select manufacturer from exchange_vehicles where lead_id = l.id order by created_at DESC limit 1)
          as "Vehicle Make",
      ( select vehicle from exchange_vehicles where lead_id = l.id order by created_at DESC limit 1)
          as "Vehicle Model",
      ( select variant_year from exchange_vehicles where lead_id = l.id order by created_at DESC limit 1)
          as "Year of Manufacturer",
      ( select condition from exchange_vehicles where lead_id = l.id order by created_at DESC limit 1)
          as "Vehicle Condition",
      ( select remarks from exchange_vehicles where lead_id = l.id order by created_at DESC limit 1)
          as "Vehicle Remarks",
      ( select quoted_value from exchange_vehicles where lead_id = l.id order by created_at DESC limit 1)
          as "Exchange Value",
    ( CASE WHEN (fl.id is not null) THEN 'yes' ELSE 'no' END ) as finance_opted,
      ( select name from financiers f where f.id = fl.financier_id ) as financier_name,
      fl.loan_amount as loan_amount,
      fl.tenure as tenure,
    ( CASE WHEN ( (select count(1) from follow_ups where lead_id = l.id ) = 0) THEN 'no' ELSE 'yes' END )
          as "Follow-up Scheduled",
    ( select
        to_char(follow_up_at + interval '5 hours 30 min', 'DD-MM-YYYY')
        from follow_ups where lead_id = l.id
          order by created_at DESC limit 1 ) as "Follow_up_date",
    ( select
        to_char(follow_up_at + interval '5 hours 30 min', 'HH:MI:SSAM')
        from follow_ups where lead_id = l.id
          order by created_at DESC limit 1 ) as "Follow_up_time",
    (  select comment from lead_activities where type = 'Comments Added'
        and lead_id = l.id order by created_at DESC LIMIT 1
      ) as "Comments"
    from leads l
    left join lead_details ld on l.id = ld.lead_id and ld.is_deleted = false
    left join financier_leads fl ON fl.lead_detail_id = ld.id
      and fl.created_at=(select max(created_at) from financier_leads fl_temp
      where fl_temp.lead_detail_id = ld.id)
    left join vehicles v on ld.vehicle_id = v.id
    left join variants vr on ld.variant_id = vr.id
    left join variant_colours c on ld.variant_colour_id = c.id
    left join users u on l.assigned_to = u.id
    where l.dealer_id = $1 and l.created_at::timestamp::date between $2 and $3
    order by l.created_at asc ) temp order by "S.No"
`;

const followupReportQuery = `
  select ROW_NUMBER () OVER (ORDER BY "Date of Creation") as "S.No", * from (
    select
    to_char(fu.follow_up_at + interval '5 hours 30 min', 'DD-MM-YYYY') "Date of Followup",
    to_char(fu.completed_at + interval '5 hours 30 min', 'DD-MM-YYYY') "Completed on Date",
    ( CASE WHEN (fu.is_completed = true) THEN 'yes' ELSE 'no' END ) as "Followup Completed",
    to_char(lead.created_at + interval '5 hours 30 min', 'DD-MM-YYYY') as "Date of Creation",
    to_char(lead.created_at + interval '5 hours 30 min', 'HH:MI:SSAM') as "Time of Creation",
    ( select first_name from users where id = lead.assigned_to ) as "Name of DSE",
    lead.source_of_enquiry as "Source of Enquiry",
    lead.pincode as "Pincode",
    ( CASE WHEN (lead.gender = 'male') THEN 'Mr.' ELSE 'Ms.' END ) as "Title of theProspect",
    lead.name as "Name of the Prospect",
    lead.mobile_number as "Mobile Number",
    ( select count(1) from lead_details where lead_id = lead.id ) as "Number of Enquiries",
    ( select name from vehicles where id = ld.vehicle_id ) as "Product Enquired",
    ( select name from variants where id = ld.variant_id ) as "Variant",
    ( select color from variant_colours where id = ld.variant_colour_id ) as "Color",
    ( CASE WHEN (ld.invoiced_on IS NULL and
      ld.booked_on IS NULL and lead.is_lost = false) THEN lead.category
       ELSE (
        CASE WHEN (ld.invoiced_on IS NOT NULL) THEN 'Invoiced' ELSE (
          CASE WHEN (ld.booked_on IS NOT NULL and lead.is_lost = false) THEN 'Booked' ELSE (
            CASE WHEN (lead.is_lost= True) THEN 'Lost' END
          ) END
        ) END
       ) END ) as "Lead Status",
    fu.comment as "Remarks",
    ( CASE WHEN (lead.next_followup_on IS NOT NULL) THEN 'yes' ELSE 'no' END) as "Next Follow-up Scheduled",
    to_char(lead.next_followup_on + interval '5 hours 30 min', 'DD-MM-YYYY') as "Date of Next Follow-up",
    to_char(lead.next_followup_on + interval '5 hours 30 min', 'HH:MI:SSAM') as "Time of Next Follow-up",
    (select count(1) from follow_ups where lead_id = lead.id and is_completed = true) as "No of follow-up done"
    from leads lead
    left join lead_details ld ON ld.lead_id = lead.id and ld.is_deleted = false
    left join follow_ups fu ON fu.lead_id = lead.id and (
      fu.follow_up_at::timestamp::date between $2 and $3 or
      fu.completed_at::timestamp::date between $2 and $3 )
    where lead.dealer_id = $1
    and (
      fu.follow_up_at::timestamp::date between $2 and $3 or
      fu.completed_at::timestamp::date between $2 and $3 or
      lead.last_followup_on::timestamp::date between $2 and $3 )
    order by lead.created_at asc ) temp
  order by "S.No" ASC
`;

// export default constants;
Object.defineProperty(module.exports, '__esModule', {
  value: true,
});

module.exports = {
  LEAD_REPORT_QUERY: leadReportQuery,
  FOLLOWUP_REPORT_QUERY: followupReportQuery,
};
