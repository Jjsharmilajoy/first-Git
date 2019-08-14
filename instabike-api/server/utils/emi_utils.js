module.exports = class EMIUtils {
  static getEMI(principal, intrest, tenure) {
    const r = intrest / 12 / 100;
    const emi = principal * r * (((1 + r) ** tenure) / (((1 + r) ** tenure) - 1));
    return parseInt(emi, 10);
  }
};
