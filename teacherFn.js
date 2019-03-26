const pool = require('./sqlPool');
const {validEmail, existUser} = require('./miscFn');

/**
 * validates teacher email
 * @param {string} teachEmail 
 */
const validateTeacherParam = async (teachEmail) => {
  if(!teachEmail) {
    throw new Error(`Missing teacher's email`);
  }  
  if(!validEmail(teachEmail)) {
    throw new Error(`${teachEmail} incorrect email format`);
  }
}

/**
 * Inserts a new teacher 
 * @param {object} req 
 * @param {object} res 
 */
const createTeacher = async (req, res) => {
  try {
    const {teacher} = req.body;
    await validateTeacherParam(teacher);
    const teacherUsr = await existUser(teacher, `teacher`)
    if(teacherUsr !== false) {
      throw new Error(`Teacher's email already exists`);
    } 
    const sql = `INSERT INTO teacher (email) VALUES ('${teacher}')`;
    const dbRes = await pool.query(sql);
    res.status(200).send(`Teacher ${teacher} created.`)
  } catch(err) {
    console.log(err)
    res.status(500).send({message: err.message});
  }
}

module.exports = {validateTeacherParam, createTeacher};