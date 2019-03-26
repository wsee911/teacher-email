const pool = require('./sqlPool');
const {validEmail, existUser, formatDBOutput} = require('./miscFn');

/**
 * validates student email
 * @param {string} stuEmail 
 */
const validateStudentParam = (stuEmail) => {
  if(!stuEmail) {
    throw new Error(`Missing student emails`);
  }
  if(!validEmail(stuEmail)) {
    throw new Error(`${stuEmail} incorrect email format`);
  }
}

/**
 * Inserts a new student
 * @param {object} req 
 * @param {object} res 
 */
const createStudent = async (req, res) => {
  try {
    const {student} = req.body;
    await validateStudentParam(student);

    let studentUsr = await existUser(student, `student`);
    if(studentUsr !== false) {
      throw new Error(`Student's email already exists`);
    } 
    const sql = `INSERT INTO student (email) VALUES ('${student}')`;
    const dbRes = await pool.query(sql);  
    res.status(200).send(`Student ${student} created`);
  } catch(err) {
    console.log(err)
    res.status(500).send({message:err.message})
  }
}

/**
 * Suspends a specified student
 * @param {object} req 
 * @param {object} res 
 */
const suspendStudent = async (req, res) => {
  try {
    const {student} = req.body;
    if(typeof student === `string`) {
      await validateStudentParam(student);
    } else {
      student.forEach(async email => {
        await validateStudentParam(email);
      });
    }
    let studentUsr = await existUser(student, `student`);
    if(studentUsr === false) {
      throw new Error(`Student ${student} not found`);
    } 
    const sql = `UPDATE student SET suspend = ? WHERE email = ?`;
    const dbRes = await pool.query(sql, [true, student]);  
    res.status(204).send(`Student ${student} suspended`);
  } catch(err) {
    res.status(500).send({message: err.message});
  }
}

/**
 * If student is suspended
 * @param {int} studentid 
 */
const isSuspend = async (studentid) => {
  const sql = `SELECT email, suspend FROM student WHERE studentid = ?`;
  const dbRes = await pool.query(sql, studentid);
  if(dbRes.length > 0) {
    return formatDBOutput(dbRes)[0];
  }
}

module.exports = {validateStudentParam, createStudent, suspendStudent, isSuspend};