const pool = require('./sqlPool');
/**
 * To reformat default mysql output
 * @param {array} arr 
 */
const formatDBOutput = (arr) => {
  return arr.map(row => ({...row}));
}

/**
 * Check for valid email format
 * @param {string} email 
 */
const validEmail = (email) => (
  email && /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(email.trim())
    ? true : false
)

/**
 * Check if user exists
 * @param {string} email 
 * @param {string} table 
 */
const existUser = async (email, table = ``) => {
  if(table === ``) {
    throw new Error(`Missing table name`);
  }
  const sql = `SELECT * FROM ${table} WHERE email = ?`;
  const dbRes = await pool.query(sql, email);
  if(dbRes.length > 0) {
    return formatDBOutput(dbRes)[0];
  }
  return false;
}

/**
 * Formats and extracts message and emails
 * @param {string} notification 
 */
const formatNotification = (notification) => {
  const getEmailRegex = /@[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}/gi;
  const frontSymbol = /^@/gi;
  let emails = notification.match(getEmailRegex);
  let message = notification;
  let formatEmails = [];
  if(emails !== null) {
    formatEmails = emails.map(email => {
      message = message.replace(email, '').trim();
      return email.replace(frontSymbol, '');
    })
  }
  return {
    message,
    students: formatEmails
  }
}

module.exports = {formatDBOutput, validEmail, existUser, formatNotification};