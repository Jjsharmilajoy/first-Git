// import statements
const InstabikeError = require('../error/instabike_error');
const constants = require('../utils/constants/userConstants');
const Mailjet = require('node-mailjet').connect(process.env.MJ_API_KEY, process.env.MJ_API_SECRET);
const needle = require('needle');

module.exports = class ExternalServiceProviders {
  /**
   * Send message to users
   * @param  {Integer}   number
   * @param {String} msg
   * @param  {function} callback
   * @return {String} message status
   * @author Ponnuvel G
   */
  static async sendSms(details) {
    return new Promise(async (resolve, reject) => {
      const messageObj = {};
      messageObj.messages = [];
      details.map((detail) => {
        // to ensure the mobile number starts between 6 and 9
        if (['1', '2', '3', '4', '5'].indexOf(detail.mobile.substring(0, 1)) < 0) {
          const message = {};
          message.from = process.env.INFOBIP_SEND;
          message.destinations = [{ to: `+91${detail.mobile}` }];
          message.text = detail.message;
          messageObj.messages.push(message);
        }
        return messageObj;
      });
      const options = {
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: `${process.env.INFOBIP_AUTH} ${process.env.INFOBIP_API_KEY}`,
        },
      };
      if (process.env.ENVIRONMENT !== 'dev' && process.env.NODE_ENV !== 'test' &&
          process.env.NODE_ENV !== 'dev') {
        await needle('post', `${process.env.INFOBIP_URL}/sms/1/text/advanced`, messageObj, options)
          .then((resp) => {
            if (resp.statusCode === 200) {
              return resolve({ message: constants.MESSAGE.SUCCESS });
            }
            return resolve({ message: constants.MESSAGE.FAIL });
          })
          .catch(err => reject(err));
      }
      return resolve({});
    });
  }

  /**
   * Send OTP
   * @param  {number}  number
   * @return {Object} if success, return pinId, it is used to validate or resend OTP
   */
  static async sendOtp(number) {
    return new Promise(async (resolve, reject) => {
      const otpObject = {
        applicationId: process.env.INFOBIP_TFA_APP_ID,
        messageId: process.env.INFOBIP_TFA_MSG_ID,
        from: process.env.INFOBIP_SEND,
        to: `91${number}`,
      };
      const options = {
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: `${process.env.INFOBIP_AUTH} ${process.env.INFOBIP_TFA_API_KEY}`,
        },
      };
      if (process.env.ENVIRONMENT !== 'dev' && process.env.NODE_ENV !== 'test' &&
          process.env.NODE_ENV !== 'dev' &&
          // to ensure the mobile number starts between 6 and 9
          ['1', '2', '3', '4', '5'].indexOf(number.substring(0, 1)) < 0) {
        await needle(
          'post',
          `${process.env.INFOBIP_URL}/2fa/1/pin?ncNeeded=false`,
          otpObject, options,
        ).then((resp) => {
          if (resp.statusCode === 200) {
            return resolve({ pinId: resp.body.pinId });
          }
          return resolve({ message: constants.MESSAGE.FAIL });
        }).catch(err => reject(err));
      }
      return resolve({});
    });
  }

  /**
   * Validate OTP
   * @param  {string}  pinId
   * @param  {string}  pin
   * @return {Objcet} validated status
   */
  static async validateOtp(pinId, pin) {
    return new Promise(async (resolve, reject) => {
      const pinObj = { pin };
      const options = {
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: `${process.env.INFOBIP_AUTH} ${process.env.INFOBIP_TFA_API_KEY}`,
        },
      };
      if (process.env.ENVIRONMENT !== 'dev' && process.env.NODE_ENV !== 'test' &&
          process.env.NODE_ENV !== 'dev') {
        await needle('post', `${process.env.INFOBIP_URL}/2fa/1/pin/${pinId}/verify`, pinObj, options)
          .then(resp => resolve({ verified: resp.body.verified }))
          .catch(err => reject(err));
      }
      return resolve({});
    });
  }

  /**
   * Resend OTP
   * @param  {string}  pinId
   * @return {Object} if success, return pinId to validate OTP
   */
  static async resendOtp(pinId) {
    return new Promise(async (resolve, reject) => {
      const options = {
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: `${process.env.INFOBIP_AUTH} ${process.env.INFOBIP_TFA_API_KEY}`,
        },
      };
      if (process.env.ENVIRONMENT !== 'dev' && process.env.NODE_ENV !== 'test' &&
          process.env.NODE_ENV !== 'dev') {
        await needle('post', `${process.env.INFOBIP_URL}/2fa/1/pin/${pinId}/resend`, {}, options)
          .then((resp) => {
            if (resp.statusCode === 200) {
              return resolve({ pinId: resp.body.pinId });
            }
            return resolve({ message: constants.MESSAGE.FAIL });
          })
          .catch(err => reject(err));
      }
      return resolve({});
    });
  }

  /**
   * Send By Email
   * @param  {Object}  credentials
   * @return {String} sending status
   * @author Ponnuvel G
   */
  static async sendByEmail(mailTo, content, subject) {
    try {
      if (process.env.NODE_ENV !== 'test' && process.env.NODE_ENV !== 'dev') {
        const sendEmail = Mailjet.post('send');
        const emailData = {
          FromEmail: process.env.SUPPORT_EMAIL,
          FromName: process.env.EMAIL_NAME,
          Subject: subject || constants.MESSAGE.EMAIL_SUBJECT,
          'Html-part': content,
          Recipients: [{ Email: mailTo }],
        };
        const result = await sendEmail.request(emailData);
        if (result.response.ok) {
          return constants.MESSAGE.SUCCESS;
        }
        return constants.MESSAGE.FAIL;
      }
      return constants.MESSAGE.SUCCESS;
    } catch (error) {
      throw new InstabikeError(error);
    }
  }

  /**
   * Send Report as Attachment by Mail
   * @param  {String}  mailTo
   * @param  {String}  content
   * @param  {String}  contentType
   * @param  {String}  fileName
   * @param  {String}  attachment
   * @return {Promise} Email status
   */
  static async sendReportByEmail(mailTo, content, attachments, subject) {
    try {
      if (process.env.NODE_ENV !== 'test' && process.env.NODE_ENV !== 'dev') {
        const bcc = [];
        if (process.env.BCC_REPORT_MAIL_ID) {
          bcc.push({ Email: process.env.BCC_REPORT_MAIL_ID });
        }
        const sendEmail = Mailjet.post('send', { version: 'v3.1' });
        const emailData = {
          From: { Email: process.env.SUPPORT_EMAIL, Name: process.env.EMAIL_NAME },
          Subject: subject || constants.MESSAGE.EMAIL_SUBJECT,
          HTMLPart: content,
          To: [{ Email: mailTo }],
          Bcc: bcc,
          Attachments: attachments,
        };
        const result = await sendEmail.request({ Messages: [emailData] });
        if (result.response.ok) {
          return constants.MESSAGE.SUCCESS;
        }
        return constants.MESSAGE.FAIL;
      }
      return constants.MESSAGE.SUCCESS;
    } catch (error) {
      throw new InstabikeError(error);
    }
  }

  /**
   * Send file as Attachment by Mail
   * @param  {String}  mailTo
   * @param  {String}  content
   * @param  {String}  contentType
   * @param  {String}  fileName
   * @param  {String}  attachment
   * @return {Promise} Email status
   */
  static async sendFileByEmail(mailTo, content, attachments, subject) {
    try {
      if (process.env.NODE_ENV !== 'test' && process.env.NODE_ENV !== 'dev') {
        const sendEmail = Mailjet.post('send');
        const emailData = {
          FromEmail: process.env.SUPPORT_EMAIL,
          FromName: process.env.EMAIL_NAME,
          Subject: subject || constants.MESSAGE.EMAIL_SUBJECT,
          'Html-part': content,
          Recipients: [{ Email: mailTo }],
          Attachments: attachments,
        };
        const result = await sendEmail.request(emailData);
        if (result.response.ok) {
          return constants.MESSAGE.SUCCESS;
        }
        return constants.MESSAGE.FAIL;
      }
      return constants.MESSAGE.SUCCESS;
    } catch (error) {
      throw new InstabikeError(error);
    }
  }
};
