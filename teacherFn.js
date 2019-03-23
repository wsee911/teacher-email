const pool = require('./sqlPool');
const {validEmail, formatDBOutput} = require('./miscFn');

const validateTeacherParam = async (teachEmail) => {
  if(!teachEmail) {
    throw new Error(`Error: Missing teacher's email`);
  }  
  if(validEmail(teachEmail)) {
    throw new Error(`Error: ${teachEmail} incorrect email format`);
  }  
}

const existTeacher = async (teachEmail) => {
  const sql = `SELECT teacherid FROM teacher WHERE email = ?`;
  const dbRes = await pool.query(sql, teachEmail);
  if(dbRes.length > 0) {
    return dbRes[0].teacherid;
  }
  return false;
}

const insertTeacher = async (teachEmail) => {
  const teacherid = await existTeacher(teachEmail)
  if(teacherid) {
    return teacherid;
  } 
  const sql = `INSERT INTO teacher (email) VALUES ('${teachEmail}')`;
  const dbRes = await pool.query(sql);
  return dbRes.insertId;
}

module.exports = {validateTeacherParam, insertTeacher};