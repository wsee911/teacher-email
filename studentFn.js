const pool = require('./sqlPool');
const {validEmail, formatDBOutput} = require('./miscFn');

const validateStudentParam = (stuEmail) => {
  if(typeof stuEmail !== `object`) {
    throw new Error(`Error: Malformed student email parameter`);
  }
  if(stuEmail.length < 0) {
    throw new Error(`Error: Missing student emails`);
  }
  stuEmail.forEach(email => {
    if(validEmail(email)) {
      throw new Error(`Error: ${email} incorrect email format`);
    }
  });    
}

const existStudent = async (stuEmail) => {
  const sql = `SELECT studentid FROM student WHERE email = ?`;
  const dbRes = await pool.query(sql, stuEmail);
  if(dbRes.length > 0) {
    return dbRes[0].studentid;
  }
  return false;
}

const insertStudent = async (stuEmail) => {
  let studentIds = await stuEmail.map(async email => {
    let studentid = await existStudent(email);
    if(studentid) { 
      return studentid; 
    }
    const sql = `INSERT INTO student (email) VALUES ('${email}')`;
    const dbRes = await pool.query(sql);
    return dbRes.insertId;
  })
  return await Promise.all(studentIds)
}

module.exports = {validateStudentParam, insertStudent};