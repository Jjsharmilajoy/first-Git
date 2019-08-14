module.exports = class DateUtils {
  static getMonthName(date) {
    const currentMonth = date.getMonth();
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'];
    return monthNames[currentMonth];
  }

  static getFinancialYearDates(date) {
    const currentMonth = date.getMonth();
    const currentYear = date.getFullYear();
    const start = `${currentMonth < 4 ? currentYear - 1 : currentYear}-04-01`;
    const end = `${currentMonth < 4 ? currentYear : currentYear + 1}-03-31`;
    return { from_date: start, to_date: end };
  }

  static getCurrentMonthDates(date) {
    const month = date.getMonth();
    const year = date.getFullYear();
    const start = `${year}-${month + 1}-01`;
    const eom = new Date(year, month + 1, 0);
    const end = `${year}-${month + 1}-${eom.getDate()}`;
    return { from_date: start, to_date: end };
  }

  static getLastMonthDates(date) {
    const lastMonth = date;
    lastMonth.setDate(0);
    const year = lastMonth.getFullYear();
    const month = lastMonth.getMonth();
    const start = `${year}-${month + 1}-01`;
    const end = `${year}-${month + 1}-${lastMonth.getDate()}`;
    return { from_date: start, to_date: end };
  }

  static getNextMonthDates(date) {
    const month = date.getMonth();
    const year = date.getFullYear();
    const resultMonth = month + 2 > 12 ? 1 : month + 2;
    const resultYear = month + 2 > 12 ? year + 1 : year;
    const start = `${resultYear}-${resultMonth}-01`;
    const eom = new Date(resultYear, resultMonth, 0);
    const end = `${resultYear}-${resultMonth}-${eom.getDate()}`;
    return { from_date: start, to_date: end };
  }

  static getPreviousYearDates(date) {
    const eom = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    const end = `${date.getFullYear()}-${date.getMonth() + 1}-${eom.getDate()}`;
    const start = `${date.getFullYear() - 1}-${date.getMonth() + 1}-01`;
    return { from_date: start, to_date: end };
  }

  /**
   * Convert hours to minutes
   * @param {Object} m
   */
  static minutesOfDay(m) {
    return (m.minutes() + (m.hours() * 60));
  }
};
