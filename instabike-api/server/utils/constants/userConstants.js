const USER_TYPE_NAMES = {
  CUSTOMER: 'Customer',
  DEALER: 'Dealer',
  MANUACTURER: 'Manufacturer',
  FINANCIER: 'Financier',
};
const MESSAGE = {
  UPDATE: 'Updated Successfully',
  SUCCESS: 'Sent Successfully',
  FAIL: 'Sending Failed',
  EMAIL_SUBJECT: 'Notification from Instabike',
};
const LEAD_TYPES = {
  ONLINE: 'online',
  OFFLINE: 'offline',
};
const LEAD_STATUS = {
  NEW: 200,
  PRE_BOOKING: 450,
  PROFORMA_INVOICED: 400,
  FINANCIAL_STATUS: 500,
  INVOICED: 600,
  INSURANCE: 610,
  RTO: 700,
  REGISTERED: 750,
  DELIVERED: 800,
  NEW_LOST: 900,
  PROFORMA_INVOICE_LOST: 910,
  PRE_BOOKING_LOST: 920,
  FINANCIAL_LOST: 930,
  INVOICED_LOST: 940,
};
const LEAD_CATEGORIES = {
  NEW: 'NEW',
  HOT: 'HOT',
  WARM: 'WARM',
  COLD: 'COLD',
};
const GENERAL_CONSTANTS = {
  DEFAULT_MOBILE_NUMBER: '0000000000',
};
const GALLERY = {
  SIZES: {
    small: 200,
    medium: 400,
    large: 600,
  },
  ORIGINAL: 'original',
};
const ACTIVITY = {
  LEAD_CREATED: 'Lead Created',
  LEAD_TRANSFERED: 'Lead Transfered',
  COMMENTS_ADDED: 'Comments Added',
  COMMENTS_DELETED: 'Comments Deleted',
  FOLLOWUP_SCHEDULED: 'Followup Scheduled',
  FOLLOWUP_DONE: 'Followup Done',
  CHANGE_CATEGORY: 'Change Category',
  INVOICED: 'Invoiced',
  LOST: 'Lost',
  DISBURSEMENT_PENDING: 'Disbursement Pending',
  CONVERSION: 'Converted',
  CHANGE_STATUS: 'Change Status',
  ACTIVE: 'Active',
  FINANCE_SELECTED: 'Finance Selected',
  TEST_RIDE_SCHEDULED: 'Test Ride Scheduled',
  TEST_RIDE_RESCHEDULED: 'Test Ride Rescheduled',
  TEST_RIDE_STARTED: 'Test Ride Started',
  TEST_RIDE_COMPLETED: 'Test Ride Completed',
  TEST_RIDE_CANCELLED: 'Test Ride Cancelled',
  LEAD_ASSIGNED: 'Lead Assigned',
  FINANCE_LEAD_LOST: 'Finance Lost',
  FINANCE_APPROVED: 'Finance Approved',
  VEHICLE_BOOKED: 'Booked',
};
const BOOKING_STATUS = {
  BOOKED: 200,
  IN_PROGRESS: 300,
  COMPLETED: 400,
  CANCELLED: 500,
};
const FINANCIER_LEAD_STATUS = {
  ACTIVE: 500,
  DISBURSEMENT_PENDING: 510,
  CONVERSION: 520,
  LOST: 930,
};
const STATUS = {
  ACTIVE: 'Active',
  INACTIVE: 'Inactive',
};
const NOTIFICATION = {
  OTP: `{{=it.token}} is your one time password for the lead {{=it.lead}}. Please use this password to complete
    the verification. Do not share it with anyone.`,
  PASSWORD: 'Welcome to Instabike. {{=it.password}} is the password for your instabike account',
  WELCOME: `Thank you for your visit to {{=it.name}}. It was a pleasure serving you.
    Looking forward to having you on board as our customer.
    Please call {{=it.sales_executive}} at {{=it.official_contact_number}} for further assistance.`,
  CREDENTIALS: `<p>Hi {{=it.name}},</p>
    <p>Welcome to Instabike. Your log in credentials are as below :</p>
    <p><strong>Username: {{=it.user_name}}</strong></p>
    <p><strong>Password: {{=it.password}}</strong></p>
    <p>Thanks,</p><p>Instabike Team</p>`,
  FIN_CREDENTIALS: `<p>Hi {{=it.name}},</p>
    <p>Welcome to Instabike. Your log in credentials are as below :</p>
    <p><strong>Username: {{=it.user_name}}</strong></p>
    <p><strong>Password: {{=it.password}}</strong></p>
    <p>Click <a href="{{=it.site_url}}">here</a> to login.</p>
    <p>Thanks,</p><p>Instabike Team</p>`,
  PASSWORD_RESET: `<p>Hi {{=it.name}},</p>
    <p>Kindly click on the below link to reset your password for Instabike.</p>
    <p>Click <a href={{=it.url}}> here </a> </strong></p>
    <p>Thanks,</p><p>Instabike Team</p>`,
  TRANSFERRED_SALES: `Ms/Mr.{{=it.assignee}} has assigned Ms/Mr.{{=it.lead_name}} -
    ({{=it.lead_status}} Lead) to you - Instabike`,
  TRANSFERRED_LEAD: `Dear customer, You have been assigned to Ms/Mr.{{=it.dealer_sales}}
    (Mob: {{=it.dealer_mobile}}) by Ms/Mr.{{=it.assignee}} - Instabike`,
  TEST_RIDE_LEAD: `Thank you for your interest in {{=it.vehicle_name}}.
    Your test ride has been scheduled on {{=it.date}} between {{=it.from}} - {{=it.to}}.
    Please call {{=it.sales_name}} at {{=it.official_contact_number}} for further assistance.`,
  RETEST_RIDE_LEAD: `Your test ride scheduled on {{=it.previous_date}}
    between {{=it.previous_from}} - {{=it.previous_to}} for the vehicle {{=it.vehicle_name}}
    stands re-scheduled to {{=it.date}} between {{=it.from}} - {{=it.to}}.
    Please call {{=it.sales_name}} at {{=it.official_contact_number}} for further assistance.`,
  TEST_RIDE_SALES: `Test ride for your lead (Ms/Mr.{{=it.lead_name}}) has been scheduled on
    {{=it.date}} between {{=it.from}} - {{=it.to}}.`,
  RETEST_RIDE_SALES: `Test ride for your lead (Ms/Mr.{{=it.lead_name}}) has been rescheduled on
    {{=it.date}} between {{=it.from}} - {{=it.to}}.`,
  TEST_RIDE_CANCEL_LEAD: `Your test ride scheduled on {{=it.date}} between {{=it.from}} -
    {{=it.to}} stands cancelled. To schedule afresh, please call
    Ms/Mr.{{=it.sales_name}} at {{=it.official_contact_number}}.`,
  TEST_RIDE_CANCEL_SALES: `Your lead (Ms/Mr.{{=it.lead_name}}) test ride at {{=it.date}} between
    {{=it.from}} - {{=it.to}} stands cancelled.`,
  TEST_RIDE_COMPLETE_LEAD: `We hope you enjoyed riding the {{=it.vehicle_name}}.
    Looking forward to having you on board as a customer.
    Please call {{=it.sales_name}} at {{=it.official_contact_number}} for further assistance.`,
  TEST_RIDE_COMPLETE_SALES: `Your lead (Ms/Mr.{{=it.lead_name}}) test ride at {{=it.date}} between
    {{=it.from}} - {{=it.to}} has been completed.`,
  INVOICED: `Congratulations on your purchase of {{=it.vehicle_name}} from {{=it.dealer}}.
    Happy and safe riding...
    Please call {{=it.sales_name}} at {{=it.official_contact_number}} for further assistance.`,
  BOOKED: `Congratulations on booking a {{=it.vehicle_name}} from {{=it.dealer}}.
    Happy and safe riding...`,
  DISBURSEMENT_PENDING: `Your loan application with {{=it.financier}} has
    been received and is under process.`,
  LOAN_CONVERTED: `Dear Customer, Your loan application with {{=it.financier}}
    has been approved. Thank you for choosing us to fulfil your needs.`,
  LOAN_REJECT_WITHOUT_LOANID: `We regret to inform you that your loan application with {{=it.financier}} has not
    been approved. Kindly contact Ms/Mr.{{=it.executive}} of {{=it.financier}} at {{=it.financier_mobile}}
    for further details. We hope to serve you again in the near future.`,
  LOAN_REJECT_WITH_LOANID: `We regret to inform you that your loan application with
    {{=it.financier}} has not been approved. Kindly contact
    Ms/Mr.{{=it.executive}} of {{=it.financier}} at {{=it.financier_mobile}} for further details.
    We hope to serve you again in near feature.`,
  EMAIL_RESET: `<p>Hi {{=it.name}},</p>
    <p>Kindly click on the below link to reset your email-id for Instabike.</p>
    <p>Click <a href={{=it.url}}> here </a> </strong></p>
    <p>Thanks,</p><p>Instabike Team</p>`,
  DEALER_REPORT: `<p>Hi {{=it.first_name}},</p>
    <p>Please find attached the consolidated lead report for {{=it.today}}.</p>
    <p>Thanks,</p><p>Instabike</p>`,
  DEALER_INSTANT_REPORT: `<p>Hi,</p>
    <p>Please find attached the lead report from {{=it.date}} {{=it.from}}
      to {{=it.till}} {{=it.to}}.</p>
    <p>Thanks,</p><p>Instabike</p>`,
  NO_LEADS_AND_FOLLOWUP: `<p>Hi {{=it.first_name}},</p>
    <p>No leads were created and no follow-ups fall on {{=it.today}}.</p>
    <p>Thanks,</p><p>Instabike</p>`,
  NO_LEADS: `<p>Hi {{=it.first_name}},</p>
    <p>No leads were created on {{=it.today}}.</p>
    <p>Please find attached the consolidated follow-up report for {{=it.today}}.</p>
    <p>Thanks,</p><p>Instabike</p>`,
  NO_FOLLOWUP: `<p>Hi {{=it.first_name}},</p>
    <p>No follow-up scheduled on {{=it.today}}.</p>
    <p>Please find attached the consolidated lead report for {{=it.today}}.</p>
    <p>Thanks,</p><p>Instabike</p>`,
  PROFORMA_INVOICE: `<p>Hi,</p>
  <p>Thank you for your enquiry of {{=it.name}} at {{=it.dealershipName}}.
    Please find attached the proforma invoice & e-brochure for the same.
    Looking forward to having you onboard as our customer.
  </p>
  <p>Thanks,</p><p>Instabike</p>`,
  BROCHER_SEND: `<p>Dear Customer,</p>
  <p>Thank you for your visit to {{=it.dealershipName}} enquiring about {{=it.name}}
    Please find attached the brochure of the product for your kind reference.
    Looking forward to having you onboard as our customer.
  </p>
  <p>Thanks,</p><p>Team Instabike</p>`,
  TEST_RIDE_REMINDER: `Dear Ms/Mr.{{=it.lead_name}}, A gentle reminder for your test ride on
    {{=it.date}} between {{=it.from}} - {{=it.to}} for {{=it.vehicle_name}} at {{=it.dealer}}.
    To re-schedule, please call {{=it.dealer_sales_name}} at {{=it.official_contact_number}}.`,
  MISSED_TEST_RIDE: `Dear Ms/Mr.{{=it.lead_name}}, You missed your test-ride scheduled between
    {{=it.from}} - {{=it.to}} yesterday for {{=it.vehicle_name}} at {{=it.dealer}}.
    To schedule afresh, please call, {{=it.sales_executive}} at {{=it.official_contact_number}}.`,
  TARGET_SET: `<p>Hi {{=it.name}},</p>
    <p>Your target for the month of {{=it.month}}, {{=it.year}} is {{=it.target_value}}
    and your incentive eligibility is {{=it.incentive_eligibility}} loans.</p>
    <p>Thanks,</p><p>Instabike Team</p>`,
  TARGET_UPDATED: `<p>Hi {{=it.name}},</p>
    <p>Your target has been reset to {{=it.updatedValue}} for the month of {{=it.month}}.</p>
    <p>Thanks,</p><p>Instabike Team</p>`,
  INCENTIVE_UPDATED: `<p>Hi {{=it.name}},</p>
    <p>Your incentive eligibility has been revised to {{=it.updatedValue}} loans.
    You would be eligible for incentive upon exceeding {{=it.updatedValue}} loans.</p>
    <p>Thanks,</p><p>Instabike Team</p>`,
  PROFORMA_SMS: `Thank you for your interest in {{=it.vehicleName}}, {{=it.variantName}}.
    Ex SR Price- Rs.{{=it.exShowroomPrice}}, RTO-Rs.{{=it.rtoCharges}},
    Total-Rs.{{=it.grandTotal}} (excl taxes).`,
  FOLLOWUPS_REMINDER: `Leads to follow up today : `,
};

const SUBJECT = {
  CREDENTIALS: 'Instabike Credentials',
  PASSWORD_RESET: 'Reset of Instabike Password',
  EMAIL_RESET: 'Reset of EMail',
  DEALER_REPORT: 'Lead Report',
  DEALER_INSTANT_REPORT: 'Lead Report',
  NO_LEADS: 'No Leads',
  NO_LEADS_AND_FOLLOWUP: 'No Leads and FollowUp',
  NO_FOLLOWUP: 'No FollowUp',
  PROFORMA_INVOICE: 'Proforma Invoice',
  BROCHER_SEND:"e-Brochure",
  TARGET_SET: 'Target Assigned',
  TARGET_UPDATED: 'Target Updated',
  INCENTIVE_UPDATED: 'Incentive Updated',
};
const CONTENT_TYPE = {
  TEXT_PLAIN: 'text-plain',
  APPLICATION_PDF: 'application/pdf',
};

const MIS_REPORT = {
  DEFAULT_TITLE: 'date,name_of_the_dse,title_of_the_prospect,name_of_the_prospect' +
    'phone_number,number_of_enquiries,product_enquired,new,hot,warm,cold,booked_or_invoiced,lost,' +
    'lost_reason,test_ride_availed,exchange_vehicle_opted,vehicle_make,vehicle_model,' +
    'year_of_manufacturer,exchange_value,income_status,finance_opted,financier_name,' +
    'loan_amount,tenure,finance_status,follow_up_scheduled,follow_up_date,number_of_follow_up_done',
};
// export default constants;
Object.defineProperty(module.exports, '__esModule', {
  value: true,
});

module.exports = {
  USER_TYPE_NAMES,
  MESSAGE,
  LEAD_TYPES,
  GALLERY,
  GENERAL_CONSTANTS,
  LEAD_CATEGORIES,
  LEAD_STATUS,
  ACTIVITY,
  BOOKING_STATUS,
  FINANCIER_LEAD_STATUS,
  STATUS,
  NOTIFICATION,
  CONTENT_TYPE,
  SUBJECT,
  MIS_REPORT,
};
