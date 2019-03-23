const pool = require('./sqlPool');
const {validateTeacherParam, insertTeacher} = require('./teacherFn');
const {validateStudentParam, insertStudent} = require('./studentFn');

const commonStudents = async (req, res) => {
  try {
    const {teacher} = req.query;
    if(typeof teacher === `string`) {
      validateTeacherParam(teacher);
    } else {
      teacher.forEach(email => {
        validateTeacherParam(email);
      });
    }
    const sql = `SELECT s.email FROM assigned_ts assign JOIN student s ON s.studentid = assign.studentid JOIN teacher t ON t.teacherid = assign.teacherid WHERE t.email IN ?`;
    const dbRes = await pool.query(sql, teacher);
    console.log(dbRes);
    res.status(200).send()
  } catch(err) {
    console.log(err)
    res.status(500).send(err.message);
  }
}

const isAssigned = async (teacherid, studentid) => {
  const sql = `SELECT assignid FROM assigned_ts WHERE teacherid = ? AND studentid = ?`;
  const dbRes = await pool.query(sql, [teacherid, studentid]);
  if(dbRes.length > 0) {
    return true;
  }
  return false;
}

const registerStudents = async (req, res) => {
  try {
    const {teacher, students} = req.body;
    await validateTeacherParam(teacher);
    await validateStudentParam(students);
    const teacherId = await insertTeacher(teacher);
    const studentIds = await insertStudent(students);
    
    await studentIds.map(async student => {
      if(!await isAssigned(teacherId, student)) {
        const sql = `INSERT INTO assigned_ts (teacherid, studentid) VALUES (${teacherId}, ${student})`;
        const dbRes = await pool.query(sql);
        return dbRes.insertId
      }
    });
    res.status(204).send();
  } catch (err) {
    console.log(err)
    res.status(500).send(err.message);
  }
}

module.exports = {registerStudents, commonStudents};