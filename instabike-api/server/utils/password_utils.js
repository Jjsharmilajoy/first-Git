/**
 * password Utility
 * @author shahul hameed b
 */
module.exports = class Password {
  static generatePassword() {
    let text = '';
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    for (let i = 0; i < 9; i += 1) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
  }
};
