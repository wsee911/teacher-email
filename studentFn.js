const pool = require('./sqlPool');
const {validEmail, existUser} = require('./miscFn');

const validateStudentParam = (stuEmail) => {
  if(!stuEmail) {
    throw new Error(`Missing student emails`);
  }
  if(validEmail(stuEmail)) {
    throw new Error(`${stuEmail} incorrect email format`);
  }
}

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

module.exports = {validateStudentParam, createStudent, suspendStudent};