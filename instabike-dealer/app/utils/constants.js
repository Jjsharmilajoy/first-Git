const environment = 'local'; // 'stg' - staging or 'prod' - production
const manufacturer = 'Build'; // stg -> 'Hero' or 'Suzuki' or 'Flash' / prod -> 'Hero' or 'Suzuki'
let API_HOST;
let API_PORT;
let BASEURL;
let PROTOCOL;
let manufacturernew;

if (`${environment}${manufacturer}` === 'stgSuzuki') { // staging
  PROTOCOL = 'https://';
  API_HOST = 'stg-suzuki-dealer.instabike.in';
  API_PORT = '5005';
  BASEURL = 'http://stg-suzuki-dealer.instabike.in:5005/api';
  manufacturernew = 'suzuki';
} else if (`${environment}${manufacturer}` === 'stgHero') {
  PROTOCOL = 'https://';
  API_HOST = 'stg-hero-dealer.instabike.in';
  API_PORT = '5000';
  BASEURL = 'http://stg-hero-dealer.instabike.in:5000/api';
  manufacturernew = 'hero';
} else if (`${environment}${manufacturer}` === 'stgFlash') {
  PROTOCOL = 'https://';
  API_HOST = 'stg-dealer.instabike.in';
  API_PORT = '443';
  BASEURL = 'http://stg-dealer.instabike.in:443/api';
  manufacturernew = 'flash';
} else if (`${environment}${manufacturer}` === 'prodSuzuki') { // production
  PROTOCOL = 'https://';
  API_HOST = 'suzuki-dealer.instabike.in';
  API_PORT = '5005';
  BASEURL = 'http://suzuki-dealer.instabike.in:5005/api';
  manufacturernew = 'suzuki';
} else if (`${environment}${manufacturer}` === 'prodHero') {
  PROTOCOL = 'https://';
  API_HOST = 'hero-dealer.instabike.in';
  API_PORT = '5000';
  BASEURL = 'http://hero-dealer.instabike.in:5000/api';
  manufacturernew = 'hero';
} else if (`${environment}${manufacturer}` === 'localBuild') {
  PROTOCOL = 'http://';
  API_HOST = '192.168.9.77';
  API_PORT = '3000';
  BASEURL = 'http://192.168.9.77:3000/api';
  manufacturernew = 'flash';
}

module.exports = {
  PROTOCOL,
  API_BASE: '/api',
  API_HOST,
  API_PORT,
  BASEURL,
  SUPPORT_EMAIL: 'support@camsonline.com',
  SUPPORT_MOBILE_NUMBER: '+91-9600057688',

  TOAST_SHOW_LENGTH: 2600,
  SESSION_EXPIRED: 'Session Expired',
  MANAGER: 'DEALER_MANAGER',
  TEAM_HEAD: 'DEALER_HEAD',
  DEALER_TEAM_HEAD: 'DEALER_TEAM_HEAD',
  SALES_EXECUTIVE: 'DEALER_SALES',
  RUPEE: '₹',

  OD_PREMIUM: 'OD Premium',
  ZERO_DEPRECIATION: 'Zero Depreciation',
  COMPULSORY_PA_COVER: 'Compulsory PA Cover',
  TP_PREMIUM: 'TP Premium',

  OD_PREMIUM_TYPE: 'od_premium',
  ZERO_DEPRECIATION_TYPE: 'zero_depreciation',
  COMPULSORY_PA_COVER_TYPE: 'compulsory_pa_cover',
  TP_PREMIUM_TYPE: 'tp_premium',
  TOTAL_AMOUNT: 'total_amount',
  REMOVE_MOBILE_NUMBER_VALIDATION: false,

  HttpMethdosArray: ['get', 'post', 'put', 'delete', 'patch'],
  hideMileage: false,
  vehicleToHideMileage: 'suzuki',
  buttonDisabledDuration: 1000,
  manufacturer: manufacturernew,

  LeadCategories: [
    { id: '1', type: 'new', tabName: 'NEW' },
    { id: '2', type: 'hot', tabName: 'HOT' },
    { id: '3', type: 'cold', tabName: 'COLD' },
    { id: '4', type: 'warm', tabName: 'WARM' },
    { id: '5', type: 'lost', tabName: 'LOST' },
    { id: '6', type: 'invoiced', tabName: 'INVOICED' },
    { id: '7', type: 'booked', tabName: 'BOOKED' }
  ],

  SalaryRange: [
    {
      id: '1',
      salary_from: '5000',
      salary_To: '15000',
      name: '₹ 5,000 - ₹ 15,000'
    },
    {
      id: '2',
      salary_from: '15000',
      salary_To: '25000',
      name: '₹ 15,000 - ₹ 25,000'
    },
    {
      id: '3',
      salary_from: '25000',
      salary_To: '45000',
      name: '₹ 25,000 - ₹ 45,000'
    },
    {
      id: '4',
      salary_from: '45000',
      salary_To: 'above',
      name: '₹ 45,000 - Others'
    }
  ],
  salaryCategoryArray: [
    {
      id: '0',
      type: 'Salaried',
      salary_from: '5000',
      salary_To: '15000',
      salary: '5000 - 15000',
      name: 'Salaried | 5k - 15k p.m.'
    },
    {
      id: '1',
      type: 'Salaried',
      salary_from: '15000',
      salary_To: '25000',
      salary: '15000 - 25000',
      name: 'Salaried | 15k - 25k p.m.'
    },
    {
      id: '2',
      type: 'Salaried',
      salary_from: '25000',
      salary_To: '45000',
      salary: '25000 - 45000',
      name: 'Salaried | 25k - 45k p.m.'
    },
    {
      id: '3',
      type: 'Salaried',
      salary_from: '45000',
      salary_To: 'above',
      salary: '45000 - above',
      name: 'Salaried | 45k - above'
    },
    {
      id: '4',
      salary: null,
      type: 'self employed',
      name: 'Self employed'
    }
  ],
  AdvanceEmiArray: [
    {
      id: '0',
      name: '0'
    },
    {
      id: '1',
      name: '1'
    },
    {
      id: '2',
      name: '2'
    }],
  TenureArray: [
    {
      id: '0',
      tenure_from: 0,
      tenure_to: 6,
      name: ' 0 - 6'
    },
    {
      id: '1',
      tenure_from: 7,
      tenure_to: 12,
      name: '7 - 12'
    },
    {
      id: '2',
      tenure_from: 13,
      tenure_to: 18,
      name: '13 - 18'
    },
    {
      id: '3',
      tenure_from: 19,
      tenure_to: 24,
      name: '19 - 24'
    },
    {
      id: '4',
      tenure_from: 25,
      tenure_to: 30,
      name: '25 - 30'
    },
    {
      id: '5',
      tenure_from: 30,
      tenure_to: 36,
      name: '30 - 36'
    },
    {
      id: '6',
      tenure_from: 0,
      tenure_to: 0,
      name: 'None'
    },
  ],
  domicileStatusArray: [
    {
      id: '0',
      name: 'Own House'
    },
    {
      id: '1',
      name: 'Rented House'
    }
  ],

  // Modal names in bike price screen
  OFFER_POPUPVIEW: 'Offer PopupView',
  REFERENCE_POPUPVIEW: 'Reference PopupView',
  EMAIL_POPUPVIEW: 'Email PopupView',
  OTHERCHARGES_POPUPVIEW: 'OtherCharges PopupView',
  INSURANCE_POPVIEW: 'Insurance PopupView',
  REMOVEFINANCE_POPUPVIEW: 'RemoveFinance PopupView',
  EXCHANGE_POPUPVIEW: 'Exchange PopupView',
  UPDATE_EMI_POPUPVIEW: 'Update Emi PopupView',
  FOLLOWUP_POPUPVIEW: 'Followup PopupView',
  ACCESSORIES_POPUPVIEW: 'Accessories PopupView'
};

