const ERRORS = {
  COMMMON: {
    AUTHORIZATION_REQUIRED: { message: 'Authorization Required', status: 401 },
  },
  VEHICLE: {
    NOT_FOUND: { message: 'Vehicle not found', status: 404 },
    NOT_ASSOCIATE: { message: 'Vehicle is not associated with Manufacturer', status: 406 },
    PRICE_NOT_FOUND: { message: 'Vehicle Price not found', status: 404 },
    NO_STOCK: { message: 'No Stock Available, Please update stock details', status: 400 },
    ALREADY_EXISTS: { message: 'Vehicle Details already exists', status: 403 },
  },
  GEOLOCATION: {
    INVALID_PINCODE: { message: 'Invalid Pincode', status: 404 },
  },
  USER: {
    INVALID: { message: 'Invalid Username/Password', status: 406 },
    INVALID_PASSWORD: { message: 'Invalid Password', status: 406 },
    NOT_EXIST: { message: 'User doesnot exist', status: 400 },
    MULTPLE_USERS_FOUND: { message: 'Multiple user instance found', status: 406 },
    EXIST: { message: 'User Exist', status: 400 },
    EMAIL_MOBILE_ALREADY_EXIST: { message: 'Mobile number or email already Exist', status: 400 },
    EMAIL_ALREADY_EXIST: { message: 'Email already Exist', status: 400 },
    UNAUTHORIZED: { message: 'User not authorized', status: 401 },
    SAME_PASSWORD: { message: 'Old and New passwords are same. Please try new password.', status: 406 },
    NOT_NEW: { message: 'Its not new User', status: 406 },
    SEND_CREDENTIALS_FAILED: { message: 'credentials failed to send', status: 406 },
    MANAGER_DELETE: { message: 'Manager cannot be deleted', status: 406 },
    USER_IS_MAPPED: { message: 'Before deleting, please reassign the reporting sales executives to a different team lead', status: 406 },
    USER_HAS_LEADS: { message: 'Before deleting, please reassign the leads to a different sales person', status: 406 },
    TRY_AGAIN: { message: 'Please Try Again', status: 403 },
    NAME_SPL_CHARS: { message: 'Name should not contain special characters', status: 400 },
    SESSION_EXIST: { message: 'Session already exists', status: 400 },
  },
  ROLE: {
    NOT_FOUND: { message: 'Role not found', status: 404 },
  },
  TOKEN: {
    NOT_FOUND: { message: 'Token not found', status: 406 },
  },
  DEALER: {
    SALES_NOT_FOUND: { message: 'No such dealer-sales user', status: 404 },
    MANAGER_NOT_FOUND: { message: 'No such dealer-manager user', status: 404 },
    NOT_FOUND: { message: 'Dealer not found', status: 404 },
    ZONE_NOT_FOUND: { message: 'Zone not found', status: 404 },
    STATE_NOT_FOUND: { message: 'State not found', status: 404 },
  },
  LEAD: {
    NOT_FOUND: { message: 'Lead not found', status: 404 },
    TYPE_NOT_FOUND: { message: 'Type not found', status: 404 },
    DETAIL_NOT_FOUND: { message: 'Lead Detail not found', status: 404 },
    EXIST: { message: 'Lead already exists', status: 404 },
    COMMENT_NOT_FOUND: { message: 'comments are mandatory', status: 404 },
    ALREADY_INVOICED: { message: 'Lead already invoiced', status: 409 },
    ALREADY_LOST: { message: 'Lead already lost', status: 409 },
  },
  IMPORT_XLSX: {
    INVALID_TYPE: { message: 'Incompatible file type found. Required .xlsx', status: 400 },
    SHEET_NOT_FOUND: { message: 'Given sheet name not found', status: 404 },
    SHEET_EXIST: { message: 'Given sheet already exists', status: 400 },
    EMPTY_INPUT: { message: 'The required input data is empty', status: 404 },
  },
  VALIDATION: {
    USER_NAME: { message: 'User name is required', status: 400 },
    MOBILE_NUMBER: { message: 'Mobile number is not valid', status: 400 },
    GENDER: { message: 'User gender is required', status: 400 },
    EMAIL: { message: 'Email is not valid', status: 400 },
  },
  FINANCIER: {
    NOT_FOUND: { message: 'Fianancier not found', status: 404 },
    TEAM_NOT_FOUND: { message: 'Fianancier-Team not found', status: 404 },
    DEALER_NOT_FOUND: { message: 'Fianancier-Dealer not found', status: 404 },
    NO_HOME_BRANCH_FOUND: { message: 'Fianancier home-branch not found', status: 404 },
    TENURE_INVALID: { message: 'Invalid Tenure Value', status: 400 },
    LEAD_EXIST: { message: 'Lead Exist', status: 400 },
    TEAM_NAME_EXIST: { message: 'Team-name Already Exist', status: 400 },
    CAN_NOT_ASSIGN: { message: 'Can\'t assign leads for this executive', status: 400 },
    LOAN_ID_EXIST: { message: 'Loan application number already exists', status: 400 },
    ASSIGNED_TO_TEAM: { message: 'Cannot delete member before unassigning from a team', status: 400 },
    MEMBER_HAS_DEALERS: { message: 'Cannot delete member with active dealership', status: 400 },
    INVALID_ACCESS: { message: 'Invalid Access', status: 401 },
    ROLE_NOT_FOUND: { message: 'Fianancier Role not found', status: 404 },
    ASSIGNED_TO_SALES: { message: 'Cannot delete team-head with active sales-executive', status: 400 },
  },
  MANUFACTURER: {
    MANAGER_NOT_FOUND: { message: 'No such manufacturer-manager user', status: 404 },
    NOT_FOUND: { message: 'Dealer not found', status: 404 },
  },
  INVOICE: {
    NOT_FOUND: { message: 'ProformaInvoice not found', status: 404 },
    OFFER_NOT_FOUND: { message: 'ProformaInvoiceOffer not found', status: 404 },
    CHARGE_NOT_FOUND: { message: 'This charge is not included', status: 404 },
  },
  EXCHANGE_VEHICLE: {
    LIMIT_EXCEED: { message: 'User can exchange one vehicle only', status: 400 },
    NOT_FOUND: { message: 'Exchange vehicle not found', status: 404 },
  },
  TEST_RIDE: {
    SLOT_NOT_AVAILABLE: { message: 'Slot not available. Choose other slot', status: 404 },
    VEHICLE_NOT_AVAILABLE: { message: 'Testride vehicle not available', status: 404 },
  },
  DOCUMENT: {
    NOT_FOUND: { message: 'Document Not Found', status: 404 },
  },
  OTP: {
    NOT_SEND: { message: 'Error while sending OTP', status: 404 },
  },
  JOB: {
    INVALID_ARGUMENTS: { message: 'Please specify valid argumants', status: 404 },
    NOT_RUNNING: { message: 'Job is not running', status: 404 },
  },
};

// export default constants;
Object.defineProperty(module.exports, '__esModule', {
  value: true,
});

module.exports = { ERRORS };
