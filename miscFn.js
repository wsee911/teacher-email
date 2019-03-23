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
  email && !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(email.trim())
    ? true : false
)

module.exports = {formatDBOutput, validEmail};